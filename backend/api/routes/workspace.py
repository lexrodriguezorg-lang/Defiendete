"""Authenticated case preparation and explicit professional review."""

import hashlib
import os
import uuid
from datetime import datetime, timezone
from typing import Literal
from urllib.parse import quote
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Response
from pydantic import BaseModel, Field
from api.routes.auth import get_current_user
from db.workspace import database, seal, unseal, cipher, get_user

router = APIRouter()


def now():
    return datetime.now(timezone.utc).isoformat()


def authorize(owner, user, edit=False):
    if user["email"] == owner:
        return
    if not edit and user["role"] == "abogado":
        with database() as db:
            grant = db.execute(
                "SELECT 1 FROM grants WHERE owner=? AND lawyer=?",
                (owner, user["email"]),
            ).fetchone()
        if grant:
            return
    raise HTTPException(404, "Expediente no disponible")


class Action(BaseModel):
    id: str
    title: str = Field(max_length=300)
    actor: str = "Ciudadano"
    status: Literal["preparar", "listo", "radicado", "respuesta"] = "preparar"
    receipt: str = ""
    submitted_at: str = ""
    deadline: str = ""
    deadline_source: str = ""


class Process(BaseModel):
    id: str
    title: str = Field(max_length=300)
    authority: str = ""
    reference: str = ""
    verification: str = "Por verificar"
    role: str = "Por confirmar"
    summary: str = Field(default="", max_length=15000)
    sources: list[str] = Field(default_factory=list, max_length=100)
    pending: list[str] = Field(default_factory=list, max_length=100)
    actions: list[Action] = Field(default_factory=list, max_length=100)


class Workspace(BaseModel):
    revision: int = 0
    title: str = "Mi expediente"
    processes: list[Process] = Field(default_factory=list, max_length=100)


@router.get("")
def read_workspace(owner: str = "", user=Depends(get_current_user)):
    owner = owner or user["email"]
    authorize(owner, user)
    with database() as db:
        row = db.execute("SELECT * FROM workspaces WHERE owner=?", (owner,)).fetchone()
        files = db.execute(
            "SELECT metadata FROM files WHERE owner=?", (owner,)
        ).fetchall()
        reviews = db.execute(
            "SELECT * FROM reviews WHERE owner=? ORDER BY created", (owner,)
        ).fetchall()
        grants = db.execute(
            "SELECT lawyer FROM grants WHERE owner=?", (owner,)
        ).fetchall()
    value = unseal(row["payload"]) if row else Workspace().model_dump()
    value["revision"] = row["revision"] if row else 0
    return {
        **value,
        "owner": owner,
        "files": [unseal(f["metadata"]) for f in files],
        "lawyers": [g["lawyer"] for g in grants],
        "reviews": [
            {
                **unseal(r["payload"]),
                "actor": r["actor"],
                "created": r["created"],
                "id": r["id"],
            }
            for r in reviews
        ],
    }


@router.put("")
def save_workspace(body: Workspace, user=Depends(get_current_user)):
    owner = user["email"]
    if user["role"] != "ciudadano":
        raise HTTPException(
            403, "Las observaciones profesionales se registran en revisión"
        )
    process_ids = [p.id for p in body.processes]
    action_ids = [a.id for p in body.processes for a in p.actions]
    if len(set(process_ids)) != len(process_ids) or len(set(action_ids)) != len(
        action_ids
    ):
        raise HTTPException(422, "Identificadores repetidos")
    with database() as db:
        db.execute("BEGIN IMMEDIATE")
        row = db.execute(
            "SELECT revision FROM workspaces WHERE owner=?", (owner,)
        ).fetchone()
        revision = row["revision"] if row else 0
        if body.revision != revision:
            raise HTTPException(
                409, "Hay cambios más recientes. Recarga antes de guardar."
            )
        for process in body.processes:
            for action in process.actions:
                if action.status in ("radicado", "respuesta"):
                    receipt = db.execute(
                        "SELECT 1 FROM files WHERE id=? AND owner=?",
                        (action.receipt, owner),
                    ).fetchone()
                    if not receipt or not action.submitted_at:
                        raise HTTPException(
                            422, "Adjunta la constancia y fecha de radicación"
                        )
                if action.deadline and not action.deadline_source:
                    raise HTTPException(422, "Indica la fuente del plazo")
        payload = body.model_dump()
        payload["revision"] = revision + 1
        encrypted = seal(payload)
        db.execute(
            "INSERT INTO workspaces VALUES (?,?,?) ON CONFLICT(owner) DO UPDATE SET revision=excluded.revision,payload=excluded.payload",
            (owner, revision + 1, encrypted),
        )
        db.execute(
            "INSERT INTO versions VALUES (?,?,?,?,?)",
            (owner, revision + 1, owner, now(), encrypted),
        )
    return read_workspace(user=user)


@router.post("/files", status_code=201)
async def upload_file(file: UploadFile = File(...), user=Depends(get_current_user)):
    data = await file.read(25 * 1024 * 1024 + 1)
    if not data or len(data) > 25 * 1024 * 1024:
        raise HTTPException(413, "Adjunta un archivo de hasta 25 MB")
    file_id = str(uuid.uuid4())
    metadata = {
        "id": file_id,
        "name": (file.filename or "archivo")[:240],
        "size": len(data),
        "sha256": hashlib.sha256(data).hexdigest(),
        "created": now(),
    }
    with database() as db:
        db.execute(
            "INSERT INTO files VALUES (?,?,?,?)",
            (file_id, user["email"], seal(metadata), cipher().encrypt(data)),
        )
    return metadata


@router.get("/files/{file_id}")
def download_file(file_id: str, user=Depends(get_current_user)):
    with database() as db:
        row = db.execute("SELECT * FROM files WHERE id=?", (file_id,)).fetchone()
    if not row:
        raise HTTPException(404, "Archivo no disponible")
    authorize(row["owner"], user)
    metadata = unseal(row["metadata"])
    return Response(
        cipher().decrypt(row["content"]),
        media_type="application/octet-stream",
        headers={
            "Content-Disposition": "attachment; filename*=UTF-8''"
            + quote(metadata["name"], safe=""),
            "Cache-Control": "no-store",
            "X-Content-Type-Options": "nosniff",
        },
    )


class Grant(BaseModel):
    email: str


@router.post("/grants")
def grant_access(body: Grant, user=Depends(get_current_user)):
    lawyer = get_user(body.email)
    verified = {
        email.strip() for email in os.environ.get("DEF_VERIFIED_LAWYERS", "").split(",")
    }
    if (
        user["role"] != "ciudadano"
        or not lawyer
        or lawyer["role"] != "abogado"
        or body.email not in verified
    ):
        raise HTTPException(
            422,
            "El profesional debe tener cuenta y tarjeta profesional verificada por el operador",
        )
    with database() as db:
        db.execute(
            "INSERT OR IGNORE INTO grants VALUES (?,?)", (user["email"], body.email)
        )
    return {"granted": True}


@router.delete("/grants/{email}")
def revoke_access(email: str, user=Depends(get_current_user)):
    with database() as db:
        db.execute(
            "DELETE FROM grants WHERE owner=? AND lawyer=?", (user["email"], email)
        )
    return {"revoked": True}


@router.get("/assigned")
def assigned(user=Depends(get_current_user)):
    with database() as db:
        rows = db.execute(
            "SELECT owner FROM grants WHERE lawyer=?", (user["email"],)
        ).fetchall()
    return [row["owner"] for row in rows]


class Review(BaseModel):
    owner: str
    process_id: str
    text: str = Field(min_length=5, max_length=10000)
    decision: Literal["observacion", "aceptar", "pedir_aclaracion"] = "observacion"


@router.post("/reviews", status_code=201)
def review(body: Review, user=Depends(get_current_user)):
    authorize(body.owner, user)
    if body.decision != "observacion" and user["email"] != body.owner:
        raise HTTPException(403, "La decisión sobre un ajuste corresponde al titular")
    with database() as db:
        record = db.execute(
            "SELECT payload FROM workspaces WHERE owner=?", (body.owner,)
        ).fetchone()
        if not record or body.process_id not in {
            p["id"] for p in unseal(record["payload"])["processes"]
        }:
            raise HTTPException(404, "Actuación no disponible")
        db.execute(
            "INSERT INTO reviews VALUES (?,?,?,?,?)",
            (
                str(uuid.uuid4()),
                body.owner,
                user["email"],
                now(),
                seal(body.model_dump()),
            ),
        )
    return {"saved": True}
