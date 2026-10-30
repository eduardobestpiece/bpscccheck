"""Rota /api/lead na Vercel. Reusa o mesmo envio do servidor local."""

import json
import sys
from http.server import BaseHTTPRequestHandler
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from server import deliver_lead


def visitor_ip(headers):
    forwarded = headers.get("x-forwarded-for", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    real_ip = headers.get("x-real-ip", "")
    if real_ip:
        return real_ip.strip()
    return ""


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            length = 0
        if length < 0 or length > 100_000:
            self._json(413, {"ok": False, "error": "Payload grande demais"})
            return
        try:
            incoming = json.loads(self.rfile.read(length).decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            self._json(400, {"ok": False, "error": "JSON inválido"})
            return
        if not isinstance(incoming, dict):
            self._json(400, {"ok": False, "error": "JSON inválido"})
            return
        status, payload = deliver_lead(
            incoming,
            visitor_ip(self.headers),
            self.headers.get("User-Agent", ""),
        )
        self._json(status, payload)

    def _json(self, status, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)
