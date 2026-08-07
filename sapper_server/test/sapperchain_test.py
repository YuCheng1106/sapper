import json
import aiohttp
import asyncio
from asyncio import Semaphore
import aiofiles

# server_url = 'http://localhost:8005/api/v1/'
server_url = 'https://api.example.com/server/api/v1/'


async def send_async_request(url, headers, data):
    print(url)
    async with aiohttp.ClientSession() as session:
        async with session.post(url, headers=headers, json=data) as response:
            if response.status == 200:
                result = []
                async for chunk in response.content.iter_chunks():
                    if chunk[0]:
                        try:
                            chunk_data = chunk[0].decode('utf-8')
                            chunk_data = chunk_data.replace("data: ", "").strip()
                            # print(chunk_data)
                            chunk_data = json.loads(chunk_data)
                            chunk_data = chunk_data['current_unit']['output']
                            print(chunk_data)
                            result.append(chunk_data)
                        except json.JSONDecodeError:
                            print("响应数据不是有效的JSON格式")
                return result
            else:
                print(f"请求失败，状态码: {response.status}")
                print(await response.text())
                return None


async def process_generate_spl_form(task_id, semaphore, requirement):
    async with semaphore:
        try:
            data = {
                "requirement": requirement
            }
            url = f'{server_url}sapperchain/generate-spl-form'
            headers = {
                "Content-Type": "application/json"
            }
            result = await send_async_request(url, headers, data)
            return {"task_id": task_id, "result": result}
        except Exception as e:
            print(f"任务 {task_id} 处理失败: {str(e)}")
            return {"task_id": task_id, "result": "处理失败"}


async def process_generate_spl_chain(task_id, semaphore, agent_file_path):
    async with semaphore:
        try:
            async with aiofiles.open(agent_file_path, mode='r', encoding='utf-8') as f:
                agent_data = json.loads(await f.read())
            data = {
                "agent_data": agent_data
            }
            url = f'{server_url}sapperchain/generate-spl-chain'
            headers = {
                "Content-Type": "application/json"
            }
            result = await send_async_request(url, headers, data)
            return {"task_id": task_id, "result": result}  # 直接 return，而不是 yield
        except Exception as e:
            print(f"任务 {task_id} 处理失败: {str(e)}")
            return {"task_id": task_id, "result": "处理失败"}

async def process_generate_answer(task_id, semaphore, agent_file_path, query):
    async with semaphore:
        try:
            async with aiofiles.open(agent_file_path, mode='r', encoding='utf-8') as f:
                agent_data = json.loads(await f.read())
            data = {
                "agent_data": agent_data,
                'query': query
            }
            url = f'{server_url}sapperchain/generate-answer'
            headers = {
                "Content-Type": "application/json"
            }
            result = await send_async_request(url, headers, data)

            return {"task_id": task_id, "result": result}
        except Exception as e:
            print(f"任务 {task_id} 处理失败: {str(e)}")
            return {"task_id": task_id, "result": "处理失败"}


async def process_generate_avatar(task_id, semaphore, requirement):
    async with semaphore:
        try:
            data = {
                'requirement': requirement
            }
            url = f'{server_url}sapperchain/generate-avatar'
            headers = {
                "Content-Type": "application/json"
            }
            result = await send_async_request(url, headers, data)
            return {"task_id": task_id, "result": result}
        except Exception as e:
            print(f"任务 {task_id} 处理失败: {str(e)}")
            return {"task_id": task_id, "result": "处理失败"}


async def process_generate_conversation_name(task_id, semaphore, query):
    async with semaphore:
        try:
            data = {
                'query': query
            }
            url = f'{server_url}sapperchain/generate-conversation-name'
            headers = {
                "Content-Type": "application/json"
            }
            result = await send_async_request(url, headers, data)
            print(result)
            return {"task_id": task_id, "result": result}
        except Exception as e:
            print(f"任务 {task_id} 处理失败: {str(e)}")
            return {"task_id": task_id, "result": "处理失败"}

async def process_get_run_tool(task_id, semaphore):
    async with semaphore:
        url = f"{server_url}sapperchain/run-tool"
        try:
            headers = {
                "Content-Type": "application/json"
            }
            result = await send_async_request(url, headers,None)

            return {"task_id": task_id, "result": result}
        except Exception as e:
            print(f"任务 {task_id} 处理失败: {str(e)}")
            return {"task_id": task_id, "result": "处理失败"}

async def main():
    try:
        semaphore = Semaphore(1)  # 限制最大并发数
        # tasks = [process_generate_spl_form(sid, semaphore, '尽心尽责的英语教师') for sid in range(1)]
        tasks = [process_generate_spl_chain(sid, semaphore, 'input/agent_data (4).json') for sid in range(1)]
        # tasks = [process_generate_answer(sid, semaphore, 'input/agent_data (4).json', [{'type': 'text', 'content':context_3}]) for sid in range(1)]
        # tasks = [process_generate_avatar(sid, semaphore, '英语作文批改教师') for sid in range(1)]
        # tasks = [process_get_run_tool(2, semaphore)]

        # tasks = [process_generate_conversation_name(sid, semaphore, '英语作文批改教师，根据上面的英文作文批改作文') for sid in range(1)]

        # 按完成顺序处理结果
        for future in asyncio.as_completed(tasks):
            result = await future
            # print(result)
    except Exception as e:
        print(f"主程序错误: {str(e)}")
    finally:
        print("处理完成")


if __name__ == "__main__":
    asyncio.run(main())
