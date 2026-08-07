import json
import uuid
import aiohttp
import aiofiles
from core.path_conf import FILES_DIR
from pathlib import Path as LibPath
from ..LLMs.chatgpt import Chatgpt_image


class GenerateAvatar:
    @classmethod
    async def download_image(cls, image_url: str, save_path: LibPath) -> bool:
        """下载图片并保存到本地"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(image_url) as response:
                    if response.status == 200:
                        async with aiofiles.open(save_path, mode='wb') as f:
                            await f.write(await response.read())
                        return True
        except Exception as e:
            print(f"下载图片失败: {str(e)}")
            return False

    @classmethod
    async def generate(cls, openai_key: str, requirement: str):
        """生成头像并保存到本地"""
        chatgpt_image = await Chatgpt_image.create(openai_key)
        response = await chatgpt_image.generate(requirement)

        if not response.data or not response.data[0].url:
            yield json.dumps({"error": "无法生成头像"})
            return

        image_url = response.data[0].url
        folder_name = 'avatar'
        upload_folder = LibPath(FILES_DIR)
        unique_id = str(uuid.uuid4())
        folder_path = upload_folder / folder_name / unique_id
        filename = 'output.png'
        file_location = folder_path / filename

        # 创建文件夹
        folder_path.mkdir(parents=True, exist_ok=True)

        # 下载并保存图片
        success = await cls.download_image(image_url, file_location)
        if not success:
            yield json.dumps({"error": "下载头像失败"})
            return

        # 生成访问URL
        file_url = f"http://localhost:8005/files/{folder_name}/{unique_id}/{filename}"

        yield json.dumps({
            "url": file_url
        })
