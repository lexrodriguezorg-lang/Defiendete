"""
Rutas de autenticación — Defiéndete
POST /api/auth/register   — registro de ciudadano o abogado
POST /api/auth/login      — login con email + password + role
GET  /api/auth/me         — devuelve el usuario de la sesión activa
"""

from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import JWTError, jwt

import sqlite3
from db.workspace import get_user, create_user
from config import get_settings

settings = get_settings()
router = APIRouter()

# ── Crypto ──────────────────────────────────────────────────────────────────
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer = HTTPBearer()

ALGORITHM = "HS256"


# ── Schemas ──────────────────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    nombre: str
    email: EmailStr
    password: str
    role: str  # 'ciudadano' | 'abogado'
    tp: Optional[str] = None  # Tarjeta Profesional (solo abogados)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    role: str


class UserOut(BaseModel):
    nombre: str
    email: str
    role: str
    tp: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ── Helpers ──────────────────────────────────────────────────────────────────
def hash_password(plain: str) -> str:
    return pwd_ctx.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_ctx.verify(plain, hashed)


def create_token(data: dict, expires_delta: timedelta = timedelta(days=7)) -> str:
    require_session_key()
    payload = data.copy()
    payload["exp"] = datetime.now(timezone.utc) + expires_delta
    return jwt.encode(payload, settings.secret_key, algorithm=ALGORITHM)


def require_session_key():
    if settings.secret_key == "cambiar-en-produccion" or len(settings.secret_key) < 32:
        raise HTTPException(503, "Configura una clave de sesión segura")


def decode_token(token: str) -> dict:
    require_session_key()
    return jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])


# ── Dependencia: usuario actual ───────────────────────────────────────────────
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer)):
    try:
        payload = decode_token(credentials.credentials)
        email: str = payload.get("sub")
        if not email or not get_user(email):
            raise HTTPException(status_code=401, detail="Token inválido.")
        return get_user(email)
    except JWTError:
        raise HTTPException(status_code=401, detail="Token expirado o inválido.")


# ── Endpoints ─────────────────────────────────────────────────────────────────
@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(body: RegisterRequest):
    require_session_key()
    if not 10 <= len(body.password.encode("utf-8")) <= 72:
        raise HTTPException(422, "Usa una contraseña de entre 10 y 72 bytes")
    if get_user(body.email):
        raise HTTPException(
            status_code=409, detail="Ya existe una cuenta con ese correo."
        )

    if body.role not in ("ciudadano", "abogado"):
        raise HTTPException(
            status_code=422, detail="Rol inválido. Usa 'ciudadano' o 'abogado'."
        )

    if body.role == "abogado" and not body.tp:
        raise HTTPException(
            status_code=422,
            detail="Los abogados deben proporcionar su Tarjeta Profesional.",
        )

    user_data = {
        "nombre": body.nombre,
        "email": body.email,
        "role": body.role,
        "tp": body.tp,
        "hashed_password": hash_password(body.password),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    try:
        create_user(user_data)
    except sqlite3.IntegrityError:
        raise HTTPException(
            status_code=409, detail="Ya existe una cuenta con ese correo."
        )

    token = create_token({"sub": body.email, "role": body.role})
    return TokenResponse(
        access_token=token,
        user=UserOut(nombre=body.nombre, email=body.email, role=body.role, tp=body.tp),
    )


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest):
    user = get_user(body.email)

    if not user or not verify_password(body.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Correo o contraseña incorrectos.")

    if user["role"] != body.role:
        raise HTTPException(
            status_code=403,
            detail=f"Esta cuenta es de tipo '{user['role']}', no '{body.role}'.",
        )

    token = create_token({"sub": body.email, "role": user["role"]})
    return TokenResponse(
        access_token=token,
        user=UserOut(
            nombre=user["nombre"],
            email=body.email,
            role=user["role"],
            tp=user.get("tp"),
        ),
    )


@router.get("/me", response_model=UserOut)
async def me(current_user: dict = Depends(get_current_user)):
    return UserOut(
        nombre=current_user["nombre"],
        email=current_user["email"],
        role=current_user["role"],
        tp=current_user.get("tp"),
    )
