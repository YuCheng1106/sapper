import aiofiles
import aiohttp
from typing import Union


class FileUtil:
    @staticmethod
    async def file(file_path: str) -> Union[str, aiohttp.FormData]:
        """读取文件并返回文件内容或用于上传的文件对象"""
        # 假设你需要返回一个 multipart/form-data 类型的文件上传字段
        async with aiofiles.open(file_path, mode='rb') as f:
            file_data = await f.read()

        # 使用 aiohttp 创建一个 FormData 对象
        form_data = aiohttp.FormData()
        form_data.add_field('file', file_data, filename=file_path.split('/')[-1],
                            content_type='application/octet-stream')

        return form_data

    @staticmethod
    async def read_file(file_path: str) -> str:
        """异步读取文件内容，适用于文本文件"""
        async with aiofiles.open(file_path, mode='r', encoding='utf-8') as f:
            return await f.read()

    @staticmethod
    async def save_file(file_path: str, content: bytes) -> None:
        """异步保存文件内容"""
        async with aiofiles.open(file_path, mode='wb') as f:
            await f.write(content)
