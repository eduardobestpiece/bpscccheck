#!/usr/bin/env python3
"""Serve a página de consulta em / e /consulta na porta 6060."""

from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PORT = 6060


class ConsultaHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        path = self.path.split("?", 1)[0]
        if path in ("/consulta", "/consulta/"):
            self.path = "/index.html"
        return super().do_GET()


def main():
    server = ThreadingHTTPServer(("0.0.0.0", PORT), ConsultaHandler)
    print(f"Consulta SCC Check em http://127.0.0.1:{PORT}/ e /consulta")
    server.serve_forever()


if __name__ == "__main__":
    main()
