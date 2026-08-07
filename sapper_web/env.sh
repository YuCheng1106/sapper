#!/bin/sh
set -eu

VITE_API_BASE_URL=${VITE_API_BASE_URL:-http://localhost:8007/}
VITE_RUNTIME_API_BASE_URL=${VITE_RUNTIME_API_BASE_URL:-http://localhost:8006/server/}
VITE_AGENT_API_BASE_URL=${VITE_AGENT_API_BASE_URL:-http://localhost:8007/api/v1/sapper/sapperchain/api/}

export VITE_API_BASE_URL VITE_RUNTIME_API_BASE_URL VITE_AGENT_API_BASE_URL

find /usr/share/nginx/html -type f -name '*.js' -exec sh -c '
    sed -i \
        -e "s|http://localhost:8007/|$VITE_API_BASE_URL|g" \
        -e "s|http://localhost:8006/server/|$VITE_RUNTIME_API_BASE_URL|g" \
        -e "s|http://localhost:8007/api/v1/sapper/sapperchain/api/|$VITE_AGENT_API_BASE_URL|g" \
        "$1"
' sh {} \;

echo 'Runtime web configuration applied.'
