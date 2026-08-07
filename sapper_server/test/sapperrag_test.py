import json
from asyncio import Semaphore
import aiofiles
import aiohttp
import asyncio
from fastapi import UploadFile
from typing import Dict


async def send_async_request(url: str, headers: Dict[str, str], file: UploadFile):
    async with aiohttp.ClientSession() as session:
        # 构造 multipart/form-data 请求
        form_data = aiohttp.FormData()
        form_data.add_field(
            "file",  # 字段名，必须与接口参数名一致
            file.file,  # 文件对象
            filename=file.filename,  # 文件名
            content_type=file.content_type  # 文件类型
        )

        # 发送异步请求
        async with session.post(url, headers=headers, data=form_data) as response:
            return await response.json()


async def process_read(task_id: int, semaphore: asyncio.Semaphore, file_path: str):
    async with semaphore:
        try:
            # 打开文件并构造 UploadFile 对象
            file = UploadFile(
                filename=file_path.split("/")[-1],  # 提取文件名
                file=open(file_path, "rb"),  # 以二进制模式打开文件
            )

            # 准备请求 URL 和 headers
            url = 'https://example.com:8025/api/v1/sapperrag/read'
            headers = {
                "Accept": "application/json"
            }

            # 发送异步请求
            result = await send_async_request(url, headers, file)
            return {"task_id": task_id, "result": result}
        except Exception as e:
            print(f"任务 {task_id} 处理失败: {str(e)}")
            return {"task_id": task_id, "result": "处理失败"}
        finally:
            # 确保文件被关闭
            if file:
                file.file.close()


async def process_embedding(task_id, semaphore, file_path):
    async with semaphore:
        try:
            # 打开文件并构造 UploadFile 对象
            file = UploadFile(
                filename=file_path.split("/")[-1],  # 提取文件名
                file=open(file_path, "rb"),  # 以二进制模式打开文件
            )

            # 准备请求 URL 和 headers
            url = 'https://example.com:8025/api/v1/sapperrag/embedding'
            headers = {
                "Accept": "application/json"
            }

            # 发送异步请求
            result = await send_async_request(url, headers, file)
            return {"task_id": task_id, "result": result}
        except Exception as e:
            print(f"任务 {task_id} 处理失败: {str(e)}")
            return {"task_id": task_id, "result": "处理失败"}
        finally:
            # 确保文件被关闭
            if file:
                file.file.close()


async def process_generate_answer(task_id, semaphore, agent_file_path, query):
    async with semaphore:
        try:
            async with aiofiles.open(agent_file_path, mode='r', encoding='utf-8') as f:
                agent_data = json.loads(await f.read())
            data = {
                "agent_data": agent_data,
                'query': query
            }
            url = 'https://example.com:8025/api/v1/sapperchain/generate-answer'
            headers = {
                "Content-Type": "application/json"
            }
            result = await send_async_request(url, headers, data)
            return {"task_id": task_id, "result": result}
        except Exception as e:
            print(f"任务 {task_id} 处理失败: {str(e)}")
            return {"task_id": task_id, "result": "处理失败"}


async def main():
    try:
        semaphore = Semaphore(1)  # 限制最大并发数
        tasks = [process_read(sid, semaphore, 'D:/workplace/virtualTeacher/server/test/input/竞赛指导.pdf') for sid in range(1)]
        # tasks = [process_embedding(sid, semaphore, 'D:/workplace/virtualTeacher/server/test/input/竞赛指导.pdf') for sid in range(1)]
        # tasks = [process_generate_answer(sid, semaphore, 'D:/workplace/virtualTeacher/server/test/input/agent_data2.json', [{'type': 'text', 'content': '你好'}]) for sid in range(1)]

        # 按完成顺序处理结果
        for future in asyncio.as_completed(tasks):
            result = await future
            print(result)
    except Exception as e:
        print(f"主程序错误: {str(e)}")
    finally:
        print("处理完成")


if __name__ == "__main__":
    asyncio.run(main())
