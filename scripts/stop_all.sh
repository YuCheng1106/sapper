#!/usr/bin/env bash
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR" || exit 1

SERVICES=(sapper_web sapper_backend sapper_server)
PORTS=(8008 8007 8006)

for service in "${SERVICES[@]}"; do
    if screen -list 2>/dev/null | grep -q "[.]$service[[:space:]]"; then
        screen -S "$service" -X stuff $'\003'
        echo "STOP: sent SIGINT to $service"
    fi
done

for _ in $(seq 1 15); do
    active=0
    for port in "${PORTS[@]}"; do
        if ss -ltnH "sport = :$port" 2>/dev/null | grep -q .; then
            active=1
        fi
    done
    (( active == 0 )) && break
    sleep 1
done

for service in "${SERVICES[@]}"; do
    screen -S "$service" -X quit >/dev/null 2>&1 || true
done

for port in "${PORTS[@]}"; do
    if ss -ltnH "sport = :$port" 2>/dev/null | grep -q .; then
        if command -v fuser >/dev/null 2>&1; then
            fuser -k "${port}/tcp" >/dev/null 2>&1 || true
            echo "FORCE STOP: port $port"
        else
            echo "WARNING: port $port is still active and fuser is unavailable" >&2
        fi
    fi
done

sleep 1

failed=0
for port in "${PORTS[@]}"; do
    if ss -ltnH "sport = :$port" 2>/dev/null | grep -q .; then
        echo "ERROR: port $port is still listening" >&2
        failed=1
    else
        echo "OK: port $port stopped"
    fi
done

exit "$failed"
