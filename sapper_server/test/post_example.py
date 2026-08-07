import json
import httpx
from httpx import Timeout
import asyncio

server_url = 'https://api.example.com/api/v1/sapper/agent/generate_answer/f9f0a450-7b67-4df4-b376-3f2963919341'
authorization = 'Bearer replace-with-your-test-token'


async def main():
    query = '你好'
    headers = {
        "Content-Type": 'application/json',
        "Authorization": authorization
    }
    data = {
        "message": query
    }
    async with httpx.AsyncClient(timeout=Timeout(60.0, read=360.0)) as client:
        async with client.stream("POST", server_url, headers=headers, json=data) as response:
            async for line in response.aiter_lines():
                if line.startswith("data: ") and line != "data: [DONE]":
                    payload = json.loads(line[6:])
                    result = payload
                    for key in ['current_unit', 'output', 'content']:
                        result = result.get(key, "")
                        if not result: break
                    if result: print(result, end="", flush=True)
                    if payload.get("choices") and payload["choices"][0].get("finish_reason") == "stop":
                        break

asyncio.run(main())
