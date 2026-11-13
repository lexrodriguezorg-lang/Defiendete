import os, tempfile, unittest, importlib
from cryptography.fernet import Fernet
from fastapi import FastAPI
from fastapi.testclient import TestClient


class WorkspaceTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        os.environ["DEF_DATA_DIR"] = self.tmp.name
        os.environ["DEF_DATA_KEY"] = Fernet.generate_key().decode()
        os.environ["SECRET_KEY"] = "test-session-key-" * 4
        from api.routes import auth, workspace

        self.auth = auth
        app = FastAPI()
        app.include_router(auth.router, prefix="/api/auth")
        app.include_router(workspace.router, prefix="/api/workspace")
        self.c = TestClient(app)
        self.h = {}
        for email, role in [
            ("owner@example.org", "ciudadano"),
            ("other@example.org", "ciudadano"),
            ("lawyer@example.org", "abogado"),
        ]:
            r = self.c.post(
                "/api/auth/register",
                json={
                    "nombre": "Test",
                    "email": email,
                    "password": "test-password-918",
                    "role": role,
                    "tp": "1234" if role == "abogado" else None,
                },
            )
            self.assertEqual(r.status_code, 201, r.text)
            self.h[email] = {"Authorization": "Bearer " + r.json()["access_token"]}
        self.owner = self.h["owner@example.org"]
        self.record = {
            "revision": 0,
            "title": "Private test",
            "processes": [
                {
                    "id": "p",
                    "title": "Test proceeding",
                    "actions": [{"id": "a", "title": "Present request"}],
                }
            ],
        }

    def tearDown(self):
        self.tmp.cleanup()
        os.environ.pop("DEF_VERIFIED_LAWYERS", None)

    def test_isolation_receipts_versions_encryption(self):
        c = self.c
        self.assertIn(c.get("/api/workspace").status_code, (401, 403))
        self.assertEqual(
            c.put("/api/workspace", headers=self.owner, json=self.record).status_code,
            200,
        )
        self.assertEqual(
            c.put("/api/workspace", headers=self.owner, json=self.record).status_code,
            409,
        )
        self.assertEqual(
            c.get(
                "/api/workspace?owner=owner@example.org",
                headers=self.h["other@example.org"],
            ).status_code,
            404,
        )
        self.record["revision"] = 1
        action = self.record["processes"][0]["actions"][0]
        action["status"] = "radicado"
        self.assertEqual(
            c.put("/api/workspace", headers=self.owner, json=self.record).status_code,
            422,
        )
        f = c.post(
            "/api/workspace/files",
            headers=self.owner,
            files={"file": ("receipt.txt", b"Private original")},
        ).json()
        self.assertEqual(
            c.get(
                "/api/workspace/files/" + f["id"], headers=self.h["other@example.org"]
            ).status_code,
            404,
        )
        action.update(receipt=f["id"], submitted_at="2026-11-13")
        self.assertEqual(
            c.put("/api/workspace", headers=self.owner, json=self.record).status_code,
            200,
        )
        self.assertEqual(
            c.get("/api/workspace/files/" + f["id"], headers=self.owner).content,
            b"Private original",
        )
        with open(self.tmp.name + "/workspace.sqlite3", "rb") as stream:
            stored = stream.read()
        self.assertNotIn(b"Private original", stored)
        self.assertNotIn(b"Private test", stored)
        importlib.reload(self.auth)
        self.assertEqual(c.get("/api/auth/me", headers=self.owner).status_code, 200)

    def test_verified_assignment_and_revocation(self):
        c = self.c
        c.put("/api/workspace", headers=self.owner, json=self.record)
        self.assertEqual(
            c.post(
                "/api/workspace/grants",
                headers=self.owner,
                json={"email": "lawyer@example.org"},
            ).status_code,
            422,
        )
        os.environ["DEF_VERIFIED_LAWYERS"] = "lawyer@example.org"
        self.assertEqual(
            c.post(
                "/api/workspace/grants",
                headers=self.owner,
                json={"email": "lawyer@example.org"},
            ).status_code,
            200,
        )
        self.assertEqual(
            c.get(
                "/api/workspace?owner=owner@example.org",
                headers=self.h["lawyer@example.org"],
            ).status_code,
            200,
        )
        self.assertEqual(
            c.post(
                "/api/workspace/reviews",
                headers=self.h["lawyer@example.org"],
                json={
                    "owner": "owner@example.org",
                    "process_id": "p",
                    "text": "Please confirm source",
                },
            ).status_code,
            201,
        )
        self.assertEqual(
            c.post(
                "/api/workspace/reviews",
                headers=self.h["lawyer@example.org"],
                json={
                    "owner": "owner@example.org",
                    "process_id": "p",
                    "text": "Accept without owner",
                    "decision": "aceptar",
                },
            ).status_code,
            403,
        )
        self.assertEqual(
            c.post(
                "/api/workspace/reviews",
                headers=self.owner,
                json={
                    "owner": "owner@example.org",
                    "process_id": "missing",
                    "text": "Review unavailable process",
                },
            ).status_code,
            404,
        )
        c.delete("/api/workspace/grants/lawyer@example.org", headers=self.owner)
        self.assertEqual(
            c.get(
                "/api/workspace?owner=owner@example.org",
                headers=self.h["lawyer@example.org"],
            ).status_code,
            404,
        )


if __name__ == "__main__":
    unittest.main()
