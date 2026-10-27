#!/bin/bash
cd "$(dirname "$0")"
if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi
while true; do
  python3 server.py
  status=$?
  echo "server.py saiu com status ${status}; reiniciando em 1s"
  sleep 1
done
