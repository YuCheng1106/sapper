import asyncio
import json
from typing import Any, AsyncGenerator

import aiohttp
from fastapi import HTTPException
from core.conf import settings
from plugin.sapper_agent.model import Agent, Conversation


async def send_async_request(url, headers, data, timeout=30.0):
    """
        发送异步 RAG 请求 (非文件类型)

        参数:
        - url: 目标API地址
        - headers: 请求头 (可选)
        - data: form-data格式数据 (可选)
        - json_data: JSON格式数据 (可选)
        - timeout: 超时时间(秒) 默认60秒

        返回:
        - 响应JSON数据

        异常:
        - HTTPException: 包含错误详情
        """

    # 设置默认headers
    final_headers = headers or {}

    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                    url,
                    headers=final_headers,
                    json=data,
                    timeout=aiohttp.ClientTimeout(total=timeout)
            ) as response:

                # 检查响应状态
                if response.status != 200:
                    error_detail = await response.text()
                    raise HTTPException(
                        status_code=response.status,
                        detail=f"RAG请求失败: {error_detail}"
                    )

                # 尝试解析JSON响应
                try:
                    return await response.json()
                except json.JSONDecodeError as e:
                    raise HTTPException(
                        status_code=500,
                        detail=f"响应JSON解析失败: {str(e)}"
                    )

    except aiohttp.ClientError as e:
        raise HTTPException(
            status_code=503,
            detail=f"RAG服务连接错误: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"处理RAG请求时发生意外错误: {str(e)}"
        )


async def file_embedding(file_url: str):
    url = f'{settings.SAPPER_SERVER_URL}sapperrag/embedding'
    headers = {"Accept": "application/json"}
    data = {
        "file_url": file_url
    }
    embed_result = await send_async_request(url, headers, data)
    return embed_result


async def file_chunk(file_url: str):
    url = f'{settings.SAPPER_SERVER_URL}sapperrag/chunk'
    headers = {"Accept": "application/json"}
    data = {
        "file_url": file_url
    }
    chunk_result = await send_async_request(url, headers, data)
    return chunk_result


async def content_embedding(content: str):
    url = f'{settings.SAPPER_SERVER_URL}sapperrag/content-embedding'
    headers = {"Accept": "application/json"}
    data = {
        "content": content
    }
    embed_result = await send_async_request(url, headers, data)
    return embed_result
