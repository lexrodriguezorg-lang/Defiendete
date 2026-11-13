"""Private encrypted records. Mount DEF_DATA_DIR on a persistent private volume."""

import json
import os
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from cryptography.fernet import Fernet


def cipher():
    key = os.environ.get("DEF_DATA_KEY")
    if not key:
        raise RuntimeError("Configure DEF_DATA_KEY before storing private records")
    return Fernet(key.encode())


def seal(value):
    return cipher().encrypt(json.dumps(value, ensure_ascii=False).encode())


def unseal(value):
    return json.loads(cipher().decrypt(value))


@contextmanager
def database():
    directory = Path(os.environ.get("DEF_DATA_DIR", "./private-data"))
    directory.mkdir(mode=0o700, parents=True, exist_ok=True)
    path = directory / "workspace.sqlite3"
    connection = sqlite3.connect(path, timeout=15)
    os.chmod(path, 0o600)
    connection.row_factory = sqlite3.Row
    connection.executescript("""
        CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, payload BLOB NOT NULL);
        CREATE TABLE IF NOT EXISTS workspaces (
            owner TEXT PRIMARY KEY, revision INTEGER NOT NULL, payload BLOB NOT NULL);
        CREATE TABLE IF NOT EXISTS versions (
            owner TEXT, revision INTEGER, actor TEXT, created TEXT, payload BLOB NOT NULL,
            PRIMARY KEY(owner, revision));
        CREATE TABLE IF NOT EXISTS files (
            id TEXT PRIMARY KEY, owner TEXT NOT NULL, metadata BLOB NOT NULL, content BLOB NOT NULL);
        CREATE TABLE IF NOT EXISTS grants (
            owner TEXT, lawyer TEXT, PRIMARY KEY(owner, lawyer));
        CREATE TABLE IF NOT EXISTS reviews (
            id TEXT PRIMARY KEY, owner TEXT, actor TEXT, created TEXT, payload BLOB NOT NULL);
    """)
    try:
        with connection:
            yield connection
    finally:
        connection.close()


def get_user(email):
    with database() as connection:
        row = connection.execute(
            "SELECT payload FROM users WHERE email=?", (email,)
        ).fetchone()
    return unseal(row["payload"]) if row else None


def create_user(user):
    with database() as connection:
        connection.execute(
            "INSERT INTO users VALUES (?,?)", (user["email"], seal(user))
        )
