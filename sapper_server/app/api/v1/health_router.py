import asyncio
import json
from datetime import datetime, timezone

from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse

router = APIRouter()


@router.get("/proxy", include_in_schema=False)
async def proxy_health(request: Request):
    return {
        "status": "ok",
        "service": "sapper_server",
        "port": 8006,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "request": {
            "host": request.headers.get("host"),
            "x_forwarded_for": request.headers.get("x-forwarded-for"),
            "x_forwarded_proto": request.headers.get("x-forwarded-proto"),
            "client": request.client.host if request.client else None,
        },
    }


@router.get("/stream", include_in_schema=False)
async def stream_health():
    async def events():
        for sequence in range(3):
            yield json.dumps(
                {
                    "status": "ok",
                    "service": "sapper_server",
                    "sequence": sequence,
                }
            ) + "\n"
            await asyncio.sleep(0.2)

    return StreamingResponse(
        events(),
        media_type="application/x-ndjson",
        headers={"X-Accel-Buffering": "no"},
    )
