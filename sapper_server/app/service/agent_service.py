import asyncio
import json
from typing import Any, AsyncGenerator

from app.schema import GetAgentRunChain
from app.schema.sapperchain_schema import GenerateAnswerParam
from app.service.WorkSpaceServices.generate_avatar import GenerateAvatar
from app.service.WorkSpaceServices.generate_conversation_name import GenerateConversationName
from app.service.WorkSpaceServices.require_2_SPLForm import Require2SPLForm
from app.service.WorkSpaceServices.run_chain import RunChain
from app.service.WorkSpaceServices.spl_compiler import SPLCompiler
from core.conf import settings
from fastapi import Request


class AgentService:
    @staticmethod
    async def generate_spl_form(*,request: Request, requirement: str) -> AsyncGenerator[str, Any]:
        require2SPLForm_instance = await Require2SPLForm.create(settings.OPENAI_KEY, requirement)
        spl_form = []
        async for response in require2SPLForm_instance.require_2_spl_form():
            spl_form.append(response)
            yield f"data: {json.dumps(response, ensure_ascii=False)}\n"

    @staticmethod
    async def generate_spl_chain(*, request: Request, agent_type, spl_form) -> AsyncGenerator[str, Any]:
        SPLCompiler_instance = await SPLCompiler.create()
        async for response in SPLCompiler_instance.run_compile(agent_type=agent_type, spl_form=spl_form):
            yield f"data: {json.dumps(response, ensure_ascii=False)}\n"

    @staticmethod
    async def generate_answer(*, obj: GenerateAnswerParam)-> AsyncGenerator[str, Any]:
        run_chain_instance = await RunChain.create(
            settings.DOUBAO_KEY,
            agent_data= obj.agent,
            conversation_data= obj.conversation,
            plugins= obj.plugins,
            knowledge_bases=obj.knowledge_bases,
        )
        async for response in run_chain_instance.run_chain(obj.query):
            yield f'data: {json.dumps(response, ensure_ascii=False)}\n'

    @staticmethod
    async def generate_avatar(*, requirement: str) -> AsyncGenerator[str, Any]:
        async for response in GenerateAvatar.generate(settings.OPENAI_KEY, requirement):
            yield f'data: {response}'

    @staticmethod
    async def generate_conversation_name(*, query: str) -> AsyncGenerator[str, Any]:
        async for response in GenerateConversationName.generate(settings.OPENAI_KEY, query):
            yield f'data: {response}'


agent_service = AgentService()
