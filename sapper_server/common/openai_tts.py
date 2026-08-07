import asyncio

import base64
import io
import librosa
import soundfile as sf
import aiohttp

from common.log import log
from core.conf import settings
# Fetch the audio file and convert it to a base64 encoded string

async def audio_to_base64(file_path, output_format="wav"):
    """将音频文件（MP3/WAV等）转为 Base64（使用librosa和soundfile）"""
    try:
        # 1. 使用librosa加载音频文件（支持MP3/WAV等）
        audio, sr = librosa.load(file_path, sr=None)

        # 2. 使用内存缓冲区（自动清理）
        with io.BytesIO() as buffer:
            # 使用soundfile将音频写入内存缓冲区
            sf.write(buffer, audio, sr, format=output_format)
            buffer.seek(0)  # 指针复位

            # 3. 转为Base64
            base64_str = base64.b64encode(buffer.read()).decode("utf-8")

        return base64_str

    except (OSError, ValueError):
        log.warning('Failed to convert audio to base64')
        return None

async def send_async_request(url, headers, data):
    async with aiohttp.ClientSession() as session:
        async with session.post(url, headers=headers, json=data) as response:
            if response.status == 200:
                result = await response.json()
                return result
            else:
                log.warning('Audio API request failed with status {}', response.status)
                return None


async def audio_to_text(audio_path):
    base64_audio = await audio_to_base64(audio_path)

    data = {
      "model": "gpt-4o",
      "modalities": ["text", "audio"],
      "audio": { "voice": "alloy", "format": "wav" },
      "messages": [
        {
          "role": "user",
          "content": [
            {
                "type": "text", "text": "Please repeat the content in the audio accurately." },
            {
              "type": "input_audio",
              "input_audio": {
                "data": base64_audio,
                "format": "wav"
              }
            }
          ]
        }
      ]
    }
    url = f"{settings.OPENAI_BASE_URL.rstrip('/')}/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {settings.OPENAI_KEY}"
    }

    # 发送异步请求
    result = await send_async_request(url, headers, data)
    choices = result.get("choices", None)
    if choices is not None:
        message = choices[0].get("message", None)
        if message is not None:
            transcript = message['audio']['transcript']
            return transcript

    return ''
