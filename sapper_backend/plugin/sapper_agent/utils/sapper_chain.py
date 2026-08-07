import asyncio
import json
from typing import Any, AsyncGenerator
import httpx
from common.log import log
from core.conf import settings
from plugin.sapper_agent.schema import GetAgentRunChain, GetConversationRunChain
from plugin.sapper_knowledge.schema import GetKnowledgeBaseRunChain
from plugin.sapper_plugin.schema import GetPluginRunChain


async def send_async_request(url, headers, data, timeout=360.0):
    try:
        async with httpx.AsyncClient(
            timeout=timeout,
            verify=True,
            trust_env=False,
        ) as client:
            async with client.stream("POST", url, headers=headers, json=data) as response:
                async for line in response.aiter_lines():
                    line = line.strip()
                    if not line:
                        continue
    
                    if line.startswith('data: '):
                        data_content = line[6:]
                        if data_content == '[DONE]':
                            break
    
                        try:
                            decoded_data = json.loads(data_content)
                            if decoded_data.get("error"):
                                raise ValueError(f"API error: {decoded_data.get('error')}")
                            yield decoded_data
                        except json.JSONDecodeError:
                            log.warning(f"JSON解析失败: {data_content}")
                            continue

    except httpx.HTTPStatusError as e:
        log.error(f"HTTP错误 {e.response.status_code}: {str(e)}")
        raise
    except Exception as e:
        log.error(f"请求出错: {str(e)}")
        raise

async def generate_spl_form(agent_capability: str) -> AsyncGenerator[str, Any]:
    data = {
        "requirement": agent_capability,
    }
    url = f'{settings.SAPPER_SERVER_URL}sapperchain/generate-spl-form'
    headers = {
        "Content-Type": "application/json"
    }
    async for response in send_async_request(url, headers, data):
        yield response
        await asyncio.sleep(0.1)


async def generate_spl_chain(agent_type: int, spl_form: list) -> AsyncGenerator[dict, Any]:
    data = {
        "agent_type": agent_type,
        "spl_form": spl_form,
    }
    url = f'{settings.SAPPER_SERVER_URL}sapperchain/generate-spl-chain'
    headers = {
        "Content-Type": "application/json"
    }
    async for response in send_async_request(url, headers, data):
        yield response
        await asyncio.sleep(0.1)


async def run_chain(query: list, agent: GetAgentRunChain, knowledge_bases: list[GetKnowledgeBaseRunChain], plugins: list[GetPluginRunChain], conversation: GetConversationRunChain) -> AsyncGenerator[dict, Any]:
    data = {
        "query": query,
        "agent": agent.model_dump(),  # 转换为字典
        "knowledge_bases": [kb.model_dump() for kb in knowledge_bases],  # 列表中的每个对象都转换
        "plugins": [plugin.model_dump(mode='json') for plugin in plugins],  # 列表中的每个对象都转换
        "conversation": conversation.model_dump(mode='json'),
    }
    url = f'{settings.SAPPER_SERVER_URL}sapperchain/generate-answer'
    headers = {
        "Content-Type": "application/json"
    }
    async for response in send_async_request(url, headers, data):
        yield response
        await asyncio.sleep(0.1)


async def generate_conversation_name(query: str) -> str:
    data = {
        "query": query
    }
    url = f'{settings.SAPPER_SERVER_URL}sapperchain/generate-conversation-name'
    headers = {
        "Content-Type": "application/json"
    }
    res = {}
    async for response in send_async_request(url, headers, data):
        res = response
    return res.get('content', "新会话")
