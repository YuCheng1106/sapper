import openai
import asyncio

from common.log import log
from core.conf import settings


class Chatgpt_json:
    def __init__(self):
        self.client = None

    @classmethod
    async def create(cls, openai_key):
        instance = cls()
        await instance.async_init(openai_key)
        return instance

    async def async_init(self, openai_key):
        self.client = openai.AsyncOpenAI(base_url=settings.OPENAI_BASE_URL, api_key=openai_key)

    async def process_message(self, message: list):
        try:
            response = await asyncio.wait_for(
                self.client.chat.completions.create(
                    model="gpt-4o",
                    messages=message,
                    response_format={"type": "json_object"},
                ),
                timeout=360  # Timeout in seconds
            )
            return response
        except asyncio.TimeoutError:
            log.warning('Chat completion request timed out')
        except Exception:
            log.exception('Chat completion request failed')


class Chatgpt_image:
    def __init__(self):
        self.client = None

    @classmethod
    async def create(cls, openai_key):
        instance = cls()
        await instance.async_init(openai_key)
        return instance

    async def async_init(self, openai_key):
        self.client = openai.AsyncOpenAI(base_url=settings.OPENAI_BASE_URL, api_key=openai_key)

    async def generate(self, message: str):
        try:
            response = await asyncio.wait_for(
                self.client.images.generate(
                    model="dall-e-3",
                    size="1024x1024",
                    prompt=message,
                    quality="standard",
                    n=1,
                ),
                timeout=360
            )
            return response
        except asyncio.TimeoutError:
            log.warning('Image generation request timed out')
        except Exception:
            log.exception('Image generation request failed')


