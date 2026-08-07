import os
import aiohttp
from common.log import log
from core.conf import settings


# class Setting:
#     OPENAI_KEY = "replace-with-your-api-key"
#
#
# settings = Setting()


async def audio_to_text(audio_path):
    # 检查文件是否存在
    if not os.path.exists(audio_path):
        raise FileNotFoundError(f"音频文件不存在: {audio_path}")

    url = f"{settings.OPENAI_BASE_URL.rstrip('/')}/audio/transcriptions"

    # 获取文件名
    filename = os.path.basename(audio_path)
    headers = {
        'Authorization': f'Bearer {settings.OPENAI_KEY}',
    }

    try:
        # 创建 FormData 对象
        form_data = aiohttp.FormData()
        form_data.add_field('file',
                          open(audio_path, 'rb'),
                          filename=filename,
                          content_type='audio/mpeg')
        form_data.add_field('model', 'whisper-1')
        form_data.add_field('language', 'en')

        async with aiohttp.ClientSession() as session:
            async with session.post(url, headers=headers, data=form_data) as response:
                if response.status == 200:
                    result = await response.json()
                    return result.get('text', result)  # 根据实际返回结构调整
                else:
                    log.warning('Transcription API request failed with status {}', response.status)
                    return None
    except (aiohttp.ClientError, OSError):
        log.exception('Transcription request failed')
        return None


# async def main():
#     # 音频路径
#     audio_path = r"D:\workspace\agent_dy\sapper_server\test\input\20251115_013846.mp3"
#     content = await audio_to_text(audio_path)
#     print(content)
#
#
# # 运行异步主函数
# if __name__ == "__main__":
#     asyncio.run(main())
