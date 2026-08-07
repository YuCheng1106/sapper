#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from typing import Annotated

from fastapi import APIRouter, Path, Request
from starlette.responses import StreamingResponse
from common.security.jwt import DependsJwtAuth
from database.redis import redis_client
from plugin.sapper_agent.schema import RunAgentParam
from plugin.sapper_agent.service import conversation_service

from plugin.sapper_agent.service.agent_service import agent_service

router = APIRouter()


@router.post(
    "/{agent_uuid}/form",
    summary='生成智能体表单',
    dependencies=[
        DependsJwtAuth,
    ]
)
async def require_2_spl_form(request: Request, agent_uuid: Annotated[str, Path(...)]):
    await redis_client.delete_prefix(f"sapper:agent:workspace:{agent_uuid}")
    return StreamingResponse(
        agent_service.generate_spl_form(request=request, agent_uuid=agent_uuid),
        media_type="text/plain", 
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Transfer-Encoding": "chunked",
            "Connection": "keep-alive"
        }
    )


@router.post(
    "/{agent_uuid}/compile",
    summary='编译智能体表单',
    dependencies=[
        DependsJwtAuth,
    ]
)
async def compile_spl_form(request: Request, agent_uuid: Annotated[str, Path(...)]):
    await redis_client.delete_prefix(f"sapper:agent:workspace:{agent_uuid}")
    return StreamingResponse(
        agent_service.generate_spl_chain(request=request, agent_uuid=agent_uuid),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Transfer-Encoding": "chunked",
            "Connection": "keep-alive"
        }
    )

@router.post(
    "/{agent_uuid}/run",
    summary='运行智能体',
    dependencies=[
        # DependsJwtAuth,
    ]
)
async def run_agent(request: Request, obj: RunAgentParam, agent_uuid: Annotated[str, Path(...)]):
    # user_id = getattr(request, 'user').id if hasattr(request, 'user') else None
    if obj.conversation_uuid is not None:
        conversation = await conversation_service.get(request=request, conversation_uuid=obj.conversation_uuid)
        await redis_client.delete_prefix(f"sapper:conversation:detail:user={conversation.creator_id}:{obj.conversation_uuid}")
        await redis_client.delete_prefix(f"sapper:conversation:list:user={conversation.creator_id}:")

    return StreamingResponse(
        agent_service.run_chain(request=request, conversation_uuid=obj.conversation_uuid, query=obj.query, agent_uuid=agent_uuid),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Transfer-Encoding": "chunked",
            "Connection": "keep-alive"
        }
    )
