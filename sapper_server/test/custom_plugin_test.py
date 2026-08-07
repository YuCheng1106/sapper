import aiohttp
import asyncio
from asyncio import Semaphore

# server_url = 'http://localhost:8005/api/v1/'
server_url = 'https://api.example.com/server/api/v1/'


async def send_async_request(url, headers, data):
    async with aiohttp.ClientSession() as session:
        async with session.post(url, headers=headers, json=data) as response:
            if response.status == 200:
                result = await response.json()
                return result.get('data', '')
            else:
                print(f"请求失败，状态码: {response.status}")
                print(await response.text())
                return None


async def process_image_to_text(task_id, semaphore, image_url):
    async with semaphore:
        try:
            data = {
                "image_url": image_url
            }
            url = f'{server_url}custom-plugin/image-2-text'
            headers = {
                "Content-Type": "application/json"
            }
            result = await send_async_request(url, headers, data)
            return {"task_id": task_id, "result": result}
        except Exception as e:
            print(f"任务 {task_id} 处理失败: {str(e)}")
            return {"task_id": task_id, "result": "处理失败"}


async def process_markdown_to_image(task_id, semaphore, markdown_content):
    async with semaphore:
        try:
            data = {
                "content": markdown_content
            }
            url = f'{server_url}custom-plugin/markdown-2-image'
            headers = {
                "Content-Type": "application/json"
            }
            result = await send_async_request(url, headers, data)
            return {"task_id": task_id, "result": result}
        except Exception as e:
            print(f"任务 {task_id} 处理失败: {str(e)}")
            return {"task_id": task_id, "result": "处理失败"}


async def process_markdown_to_pdf(task_id, semaphore, markdown_content):
    async with semaphore:
        try:
            data = {
                "content": markdown_content
            }
            url = f'{server_url}custom-plugin/markdown-2-pdf'
            headers = {
                "Content-Type": "application/json"
            }
            result = await send_async_request(url, headers, data)
            return {"task_id": task_id, "result": result}
        except Exception as e:
            print(f"任务 {task_id} 处理失败: {str(e)}")
            return {"task_id": task_id, "result": "处理失败"}


async def process_markdown_to_docx(task_id, semaphore, markdown_content):
    async with semaphore:
        try:
            data = {
                "content": markdown_content
            }
            url = f'{server_url}custom-plugin/markdown-2-docx'
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
        # tasks = [process_image_to_text(sid, semaphore, 'http://localhost:8005/files/作文2.jpg') for sid in range(1)]

        with open('input/input.md', 'r', encoding='utf-8') as f:
            md_content = f.read()

        # tasks = [process_markdown_to_image(sid, semaphore, md_content) for sid in range(1)]
        tasks = [process_markdown_to_docx(sid, semaphore, md_content) for sid in range(1)]
        # tasks = [process_markdown_to_pdf(sid, semaphore, md_content) for sid in range(1)]
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
