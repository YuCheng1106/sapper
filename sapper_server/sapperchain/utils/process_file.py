import asyncio
import os
import tempfile
from typing import List
from urllib.parse import urlparse
import aiohttp
from sapperchain.plugins.file_module.function_module.file_reader import FileReaderFactory


async def process_files(file_path_list: List[str]) -> str:
    if file_path_list is not None and len(file_path_list) != 0:
        # 准备异步任务
        tasks = []
        for file_path in file_path_list:
            tasks.append(_read_file_content(file_path))

        # 并行执行所有文件读取任务
        results = await asyncio.gather(*tasks, return_exceptions=True)

        # 处理结果
        all_content = "以下是用户上传的文件内容：\n"
        for index, (file_path, result) in enumerate(zip(file_path_list, results)):
            if isinstance(result, Exception):
                all_content += f"文件{file_path}读取失败: {str(result)}\n"
            else:
                all_content += f"文件{file_path}的内容：\n{result}\n"
        return all_content
    return ""


async def _download_url_to_tempfile(url: str) -> str:
    """下载网络文件到临时文件，返回临时文件路径"""
    temp_dir = tempfile.gettempdir()
    file_name = os.path.basename(urlparse(url).path) or "downloaded_file"
    temp_file_path = os.path.join(temp_dir, file_name)

    try:
        # 下载文件
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                response.raise_for_status()

                # 写入临时文件
                with open(temp_file_path, 'wb') as f:
                    while True:
                        chunk = await response.content.read(1024)
                        if not chunk:
                            break
                        f.write(chunk)

        return temp_file_path
    except Exception as e:
        # 如果出错，清理可能已创建的临时文件
        if os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except:
                pass
        raise IOError(f"Failed to download URL {url}: {str(e)}")


async def _read_file_content(file_path: str) -> str:
    try:
        # 判断是否是网络URL
        if urlparse(file_path).scheme in ('http', 'https'):
            # 下载网络文件到临时文件，返回临时文件路径
            file_path = await _download_url_to_tempfile(file_path)
        file_extension = await FileReaderFactory.get_file_extension(file_path)
        file_reader = await FileReaderFactory.get_file_reader(file_extension)
        res = await file_reader.read(file_path)
        return res
    except Exception as e:
        return str(e)
