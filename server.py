#!/usr/bin/env python3
"""Serve a página de consulta em / e /consulta na porta 6060."""

import hashlib
import os
import json
import re
import urllib.error
import urllib.request
import uuid
from datetime import datetime
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlsplit
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parent
PORT = 6060
SAO_PAULO = ZoneInfo("America/Sao_Paulo")
WEBHOOK_URL = "https://n8n-n8n-start.1u8ncb.easypanel.host/webhook/2f62ec84-cc37-4fc3-8cb1-0cf92758fba8"
META_PIXEL_ID = "1191390800509949"
CAPI_TOKEN = os.environ.get("META_CAPI_TOKEN", "")
CAPI_URL = f"https://graph.facebook.com/v21.0/{META_PIXEL_ID}/events"
SENSITIVE = {"/server.py", "/serve.sh"}
QUALIFIED_CONSULTAS = {
    "Sim, de 4 a 10 consultas mensais",
    "Sim, mais de 10 consultas mensais",
}
UTM_KEYS = ("utm_source", "utm_campaign", "utm_medium", "utm_content", "utm_term", "fbclid", "gclid")


def format_person_name(raw):
    kept = []
    for char in str(raw):
        if char.isalpha() or char in " '’-":
            kept.append(char)
    text = re.sub(r"\s{2,}", " ", "".join(kept)).strip()
    chars = []
    new_word = True
    for char in text:
        if char.isalpha():
            chars.append(char.upper() if new_word else char.lower())
            new_word = False
        else:
            chars.append(char)
            new_word = char in " '’-"
    return "".join(chars)


def digits_only(value):
    return re.sub(r"\D", "", str(value))


def first_query(params, key):
    values = params.get(key)
    if not values:
        return ""
    return values[0]


def build_fbc(cookie_fbc, fbclid, now_ms):
    if cookie_fbc:
        return cookie_fbc
    if fbclid:
        return f"fb.1.{now_ms}.{fbclid}"
    return ""


def post_json(url, payload, timeout=8):
    data = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json", "Accept": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=timeout) as response:
        body = response.read(4000).decode("utf-8", "replace")
        return response.status, body


def redact(text):
    value = str(text)
    if CAPI_TOKEN:
        value = value.replace(CAPI_TOKEN, "[redacted]")
    return value


EVENTOS = {"registro completo", "desqualificado", "registro em andamento"}
VISITOR_ID = re.compile(r"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$")


def name_parts(full_name):
    parts = [part for part in full_name.split(" ") if part]
    if not parts:
        return "", ""
    return parts[0], " ".join(parts[1:])


def deliver_lead(incoming, client_ip, user_agent):
    evento = str(incoming.get("evento") or "").strip()
    if evento not in EVENTOS:
        return 400, {"ok": False, "error": "Evento inválido"}

    consultas = str(incoming.get("consultas") or "").strip()
    full_name = format_person_name(incoming.get("nome") or "")
    first_name, surname = name_parts(full_name)
    phone = digits_only(incoming.get("telefone") or "")
    if evento == "registro completo":
        if consultas not in QUALIFIED_CONSULTAS or not surname or not 8 <= len(phone) <= 15:
            return 400, {"ok": False, "error": "Lead não qualificado"}
    elif phone and len(phone) > 15:
        phone = phone[:15]

    supplied_id = str(incoming.get("id") or "").strip()
    event_id = supplied_id if VISITOR_ID.fullmatch(supplied_id) else str(uuid.uuid4())

    page_url = str(incoming.get("url") or "").strip()
    split = urlsplit(page_url)
    if split.scheme and split.netloc:
        bare_url = f"{split.scheme}://{split.netloc}{split.path}"
    else:
        bare_url = page_url.split("?", 1)[0]
    query = split.query
    params = parse_qs(query, keep_blank_values=False)
    utm = {key: first_query(params, key) for key in UTM_KEYS}

    now = datetime.now(SAO_PAULO)
    now_ms = int(now.timestamp() * 1000)
    fbc = build_fbc(str(incoming.get("fbc") or "").strip(), utm["fbclid"], now_ms)
    fbp = str(incoming.get("fbp") or "").strip()

    webhook_body = {
        "Data e hora": now.strftime("%d/%m/%Y %H:%M:%S"),
        "Data": now.strftime("%d/%m/%Y"),
        "Hora": now.strftime("%H:%M:%S"),
        "Nome completo": full_name,
        "Primeiro nome": first_name,
        "Sobrenome": surname,
        "Consultas": consultas,
        "Telefone": phone,
        "URL Completa": page_url,
        "URL": bare_url,
        "Parâmetros": query,
        "utm_source": utm["utm_source"],
        "utm_campaign": utm["utm_campaign"],
        "utm_medium": utm["utm_medium"],
        "utm_content": utm["utm_content"],
        "utm_term": utm["utm_term"],
        "fbclid": utm["fbclid"],
        "gclid": utm["gclid"],
        "fbc": fbc,
        "fbp": fbp,
        "IP": client_ip,
        "Id Único": event_id,
        "Evento": evento,
    }

    webhook_ok = False
    webhook_error = ""
    try:
        status, _body = post_json(WEBHOOK_URL, webhook_body)
        webhook_ok = 200 <= status < 300
        if not webhook_ok:
            webhook_error = f"HTTP {status}"
    except urllib.error.HTTPError as error:
        webhook_error = f"HTTP {error.code}"
    except Exception as error:
        webhook_error = redact(error)

    capi_ok = False
    capi_error = ""
    if evento == "registro completo" and not CAPI_TOKEN:
        capi_error = "META_CAPI_TOKEN ausente"
    elif evento == "registro completo":
        user_data = {
            "ph": [hashlib.sha256(phone.encode("utf-8")).hexdigest()],
            "client_ip_address": client_ip,
            "client_user_agent": user_agent,
        }
        if fbc:
            user_data["fbc"] = fbc
        if fbp:
            user_data["fbp"] = fbp
        capi_body = {
            "data": [
                {
                    "event_name": "Lead",
                    "event_time": int(now.timestamp()),
                    "event_id": event_id,
                    "action_source": "website",
                    "event_source_url": page_url,
                    "user_data": user_data,
                }
            ]
        }
        try:
            status, body = post_json(f"{CAPI_URL}?access_token={CAPI_TOKEN}", capi_body)
            capi_ok = 200 <= status < 300
            if not capi_ok:
                capi_error = f"HTTP {status}"
            else:
                parsed = json.loads(body) if body else {}
                if parsed.get("events_received") != 1:
                    capi_ok = False
                    capi_error = "events_received diferente de 1"
        except urllib.error.HTTPError as error:
            detail = error.read(500).decode("utf-8", "replace")
            capi_error = redact(f"HTTP {error.code} {detail}")
        except Exception as error:
            capi_error = redact(error)

    print(
        f"lead {event_id} evento={evento} webhook={'ok' if webhook_ok else 'fail'} capi={'ok' if capi_ok else 'skip' if evento != 'registro completo' else 'fail'}",
        flush=True,
    )
    return 200, {
        "ok": True,
        "eventId": event_id,
        "webhookOk": webhook_ok,
        "webhookError": webhook_error,
        "capiOk": capi_ok,
        "capiError": capi_error,
    }


class ConsultaHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def _path(self):
        return urlsplit(self.path).path

    def send_head(self):
        if self._path() in SENSITIVE:
            self.send_error(404)
            return None
        return super().send_head()

    def do_GET(self):
        if self._path() in SENSITIVE:
            self.send_error(404)
            return
        path = self._path()
        if path in ("/consulta", "/consulta/"):
            self.path = "/index.html"
        return super().do_GET()

    def do_POST(self):
        if self._path() != "/api/lead":
            self.send_error(404)
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            length = 0
        if length < 0 or length > 100_000:
            self.send_error(413)
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
            self.client_address[0],
            self.headers.get("User-Agent", ""),
        )
        self._json(status, payload)

    def _json(self, status, payload):
        body = json.dumps(payload).encode("utf-8")
        try:
            self.send_response(status)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        except (BrokenPipeError, ConnectionResetError):
            return

    def end_headers(self):
        path = self._path()
        if path.startswith("/assets/"):
            self.send_header("Cache-Control", "public, max-age=604800")
        else:
            self.send_header("Cache-Control", "no-cache")
        super().end_headers()


class ConsultaServer(ThreadingHTTPServer):
    allow_reuse_address = True


def main():
    server = ConsultaServer(("0.0.0.0", PORT), ConsultaHandler)
    print(f"Consulta SCC Check em http://127.0.0.1:{PORT}/ e /consulta", flush=True)
    server.serve_forever()


if __name__ == "__main__":
    main()
