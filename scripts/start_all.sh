#!/usr/bin/env bash
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG_DIR="$ROOT_DIR/logs"
CONDA_BIN="${CONDA_BIN:-/root/miniconda3/bin/conda}"
SSL_DIR="$ROOT_DIR/ssl/sapperapi"

mkdir -p "$LOG_DIR"

if [[ ! -x "$CONDA_BIN" ]]; then
    echo "ERROR: conda not found: $CONDA_BIN" >&2
    exit 1
fi

for command_name in screen curl ss; do
    if ! command -v "$command_name" >/dev/null 2>&1; then
        echo "ERROR: required command not found: $command_name" >&2
        exit 1
    fi
done

for certificate_file in "$SSL_DIR/privkey.key" "$SSL_DIR/fullchain.pem"; do
    if [[ ! -s "$certificate_file" ]]; then
        echo "ERROR: SSL file not found or empty: $certificate_file" >&2
        exit 1
    fi
done

is_listening() {
    local port="$1"
    ss -ltnH "sport = :$port" 2>/dev/null | grep -q .
}

wait_for_service() {
    local name="$1"
    local port="$2"
    local url="$3"
    local log_file="$4"

    for _ in $(seq 1 45); do
        if curl --noproxy '*' -kfsS --max-time 3 "$url" >/dev/null 2>&1; then
            echo "OK: $name is ready on port $port"
            return 0
        fi

        if ! screen -list 2>/dev/null | grep -q "[.]$name[[:space:]]"; then
            echo "ERROR: $name exited during startup" >&2
            tail -n 40 "$log_file" 2>/dev/null || true
            return 1
        fi

        sleep 1
    done

    echo "ERROR: $name did not become ready on port $port" >&2
    tail -n 40 "$log_file" 2>/dev/null || true
    return 1
}

start_screen_service() {
    local name="$1"
    local port="$2"
    local work_dir="$3"
    local log_file="$4"
    local command="$5"

    if is_listening "$port"; then
        echo "SKIP: $name is already listening on port $port"
        return 0
    fi

    screen -S "$name" -X quit >/dev/null 2>&1 || true
    : > "$log_file"
    screen -dmS "$name" bash -lc "cd '$work_dir' && exec $command >> '$log_file' 2>&1"
    echo "START: $name (port $port)"
}

PNPM_BIN="$(command -v pnpm || true)"
if [[ -z "$PNPM_BIN" ]]; then
    echo "ERROR: pnpm not found in PATH" >&2
    exit 1
fi

start_screen_service \
    "sapper_server" \
    8006 \
    "$ROOT_DIR/sapper_server" \
    "$LOG_DIR/sapper_server.log" \
    "'$CONDA_BIN' run --no-capture-output -n sapper_server uvicorn main:app --host 0.0.0.0 --port 8006 --ssl-keyfile '$SSL_DIR/privkey.key' --ssl-certfile '$SSL_DIR/fullchain.pem'"

start_screen_service \
    "sapper_backend" \
    8007 \
    "$ROOT_DIR/sapper_backend" \
    "$LOG_DIR/sapper_backend.log" \
    "'$CONDA_BIN' run --no-capture-output -n sapper_backend uvicorn main:app --host 0.0.0.0 --port 8007 --ssl-keyfile '$SSL_DIR/privkey.key' --ssl-certfile '$SSL_DIR/fullchain.pem'"

start_screen_service \
    "sapper_web" \
    8008 \
    "$ROOT_DIR/sapper_web" \
    "$LOG_DIR/sapper_web.log" \
    "'$PNPM_BIN' exec vite --host 0.0.0.0 --port 8008"

failed=0
wait_for_service "sapper_server" 8006 "https://127.0.0.1:8006/docs" "$LOG_DIR/sapper_server.log" || failed=1
wait_for_service "sapper_backend" 8007 "https://127.0.0.1:8007/docs" "$LOG_DIR/sapper_backend.log" || failed=1
wait_for_service "sapper_web" 8008 "http://127.0.0.1:8008/" "$LOG_DIR/sapper_web.log" || failed=1

echo
ss -ltnp | grep -E ':8006|:8007|:8008' || true

if (( failed != 0 )); then
    echo "One or more services failed to start. Check $LOG_DIR." >&2
    exit 1
fi

echo "All Sapper services are running."
