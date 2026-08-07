import http
from httpx import Timeout, AsyncClient
import json
from typing import AsyncGenerator, Dict, Any, Optional

# Constants
API_URL = 'https://api.example.com/v1/chat/completions'
DEFAULT_TIMEOUT = Timeout(30.0, read=30.0)
DEFAULT_HEADERS = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer replace-with-your-test-token'
}


async def stream_chat_completion(
        messages: list,
        model: str = "",
        api_url: str = API_URL,
        headers: Optional[Dict[str, str]] = None,
        timeout: Timeout = DEFAULT_TIMEOUT,
        stream: bool = True
) :
    """
    Stream chat completions from the API.

    Args:
        messages: List of message dictionaries with role and content
        model: Model to use for completion
        api_url: API endpoint URL
        headers: Request headers
        timeout: Request timeout settings
        stream: Whether to stream the response

    Yields:
        Dictionary with the API response parts
    """
    # Prepare request data
    data = {
        'model': model,
        'messages': messages,
    }

    # Use default headers if none provided
    if headers is None:
        headers = DEFAULT_HEADERS

    async with AsyncClient(timeout=timeout) as client:
        response = await client.post(API_URL, headers=headers, content=json.dumps(data))
        result = response.json()
        return result


# Example usage:
async def main():
    messages = [
        {'role': 'user', 'content': '你好'}
    ]
    chunk = await stream_chat_completion(messages)
    print(chunk)

# To run the example:
import asyncio
asyncio.run(main())
