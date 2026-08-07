import base64
import os

import aiohttp
from openai import OpenAI

from common.log import log
from core.conf import settings

# 初始化 OpenAI 客户端
client = OpenAI(
    api_key=settings.OPENAI_KEY,
    base_url=settings.OPENAI_BASE_URL,
)


async def fetch_image_as_base64(image_url):
    # 确保 image_url 是字符串类型
    if not isinstance(image_url, str):
        raise TypeError("image_url 必须是字符串类型")

    # 检查是否是本地文件路径
    if os.path.exists(image_url):
        try:
            with open(image_url, 'rb') as image_file:
                image_data = image_file.read()
                return base64.b64encode(image_data).decode('utf-8')
        except OSError:
            log.warning('Failed to read local image')
            return None

    # 处理网络URL
    # 确保 URL 包含协议前缀
    if not image_url.startswith(("http://", "https://")):
        image_url = f"https://{image_url}"  # 默认添加 https://

    async with aiohttp.ClientSession() as session:
        async with session.get(image_url) as response:
            if response.status == 200:
                image_data = await response.read()  # 读取图片二进制数据
                return base64.b64encode(image_data).decode("utf-8")  # 编码为 Base64
            else:
                log.warning('Image download failed with status {}', response.status)
                return None

# 异步发送 POST 请求
async def send_async_request(url, headers, data):
    async with aiohttp.ClientSession() as session:
        async with session.post(url, headers=headers, json=data) as response:
            if response.status == 200:
                result = await response.json()
                return result
            else:
                log.warning('Image API request failed with status {}', response.status)
                return None


# 单个请求的任务
async def image_to_text(image_path):
    # image_path = "files/essay/作文2.jpg"
    # 将图片编码为 Base64
    base64_image = await fetch_image_as_base64(image_path)

    # 请求数据
    data = {
        'model': "claude-3-opus-20240229",
        'messages': [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "请给出图片中的内容（文字、数字、公式等）",
                    },
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}"},
                    },
                ],
            }
        ]
    }

    # 请求 URL 和头部
    url = f"{settings.OPENAI_BASE_URL.rstrip('/')}/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {settings.OPENAI_KEY}"
    }

    # 发送异步请求
    result = await send_async_request(url, headers, data)

    return result

# 主函数
# async def main():
#     # 图片路径
#     image_path = "D:/workplace/virtualTeacher/image/作文2.jpg"
#
#     # 创建 10 个并发任务
#     tasks = [single_request_task(image_path, i + 1) for i in range(10)]
#
#     # 使用 asyncio.gather 并发执行所有任务
#     results = await asyncio.gather(*tasks)
#
#     # 打印所有结果
#     print("所有请求完成，结果如下：")
#     for i, result in enumerate(results):
#         print(f"请求 {i + 1} 的结果: {result}")
#
# # 运行异步主函数
# if __name__ == "__main__":
#     asyncio.run(main())
