import json
import aiohttp

from common.log import log
from core.conf import settings


# 异步发送 POST 请求
async def send_async_request(url, headers, data):
    async with aiohttp.ClientSession() as session:
        async with session.post(url, headers=headers, json=data) as response:
            if response.status == 200:
                result = await response.json()
                return result
            else:
                log.warning('Suggestion request failed with status {}', response.status)
                return None


# 单个请求的任务
async def generate_suggestion(query, llm_response):
    try:
        # 请求数据
        data = {
            'model': "gpt-4o",
            'messages': [
                {
                    "role": "user",
                    "content": query,
                },
                {
                    "role": "system",
                    "content": llm_response,
                },
                {
                    "role": "user",
                    "content": """
                        @role 你是一个能够生成问题的助手。
                        @instruction
                        提问生成
                        @command 分析和用户之前的聊天记录
                        @command 找出聊天记录中的主要主题和用户兴趣点。
                        @command 基于主题和兴趣点生成三个用户可能想问的问题。
                        @rule 生成的问题必须与聊天记录的内容相关。
                        @rule 问题需要简洁明了，并能够激发进一步的讨论。
                        @rue 要从用户的角度提出三个问题，不要出现您、你
                        @rule 请以 json 的格式输出
                        
                        @formate 
                        {
                            'suggestions': []
                        }
                    """,
                },
            ],
            'response_format': {"type": "json_object"}
        }

        # 请求 URL 和头部
        url = f"{settings.OPENAI_BASE_URL.rstrip('/')}/chat/completions"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {settings.OPENAI_KEY}"
        }

        # 发送异步请求
        result = await send_async_request(url, headers, data)
        suggestion = result['choices'][0]['message']['content']

        return json.loads(suggestion).get('suggestions', [])
    except (KeyError, TypeError, json.JSONDecodeError):
        log.warning('Failed to parse model suggestions')
        return []


# # 主函数
# async def main():
#     res = await generate_suggestion("你好", "你是谁")
#     print(res)
#
# # 运行异步主函数
# if __name__ == "__main__":
#     asyncio.run(main())
