#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from typing import Annotated
import json

from fastapi import APIRouter, Path, Request, Query
from fastapi.encoders import jsonable_encoder

from common.pagination import DependsPagination, PageData, paging_data
from common.response.response_schema import ResponseModel, ResponseSchemaModel, response_base
from common.security.jwt import DependsJwtAuth
from database.db import CurrentSession
from database.redis import redis_client
from plugin.sapper_agent.schema import CreateConversationParam, DeleteConversationParam, UpdateConversationParam, \
    GetConversationWithRelationDetail, GetConversationList
from plugin.sapper_agent.service import conversation_service
from utils.serializers import select_as_dict

router = APIRouter()


@router.get('/{conversation_uuid}', summary='获取智能体会话详情', dependencies=[DependsJwtAuth])
async def get_conversation(request: Request, conversation_uuid: Annotated[str, Path(description='智能体会话 UUID')]) -> ResponseSchemaModel[GetConversationWithRelationDetail]:
    user_id = getattr(request, 'user').id if hasattr(request, 'user') else None
    cache_key = f"sapper:conversation:detail:user={user_id}:{conversation_uuid}"

    cached = await redis_client.get(cache_key)
    if cached:
        try:
            cached_str = cached.decode("utf-8") if isinstance(cached, (bytes, bytearray)) else str(cached)
            data = json.loads(cached_str)
            return response_base.success(data=data)
        except Exception:
            pass

    conversation = await conversation_service.get(request=request, conversation_uuid=conversation_uuid)
    conversation_data = GetConversationWithRelationDetail(**select_as_dict(conversation))

    encoded = jsonable_encoder(conversation_data)
    await redis_client.setex(cache_key, 60 * 10, json.dumps(encoded, ensure_ascii=False))
    return response_base.success(data=encoded)

@router.get(
    '',
    summary='分页获取所有智能体会话',
    dependencies=[
        DependsJwtAuth,
        DependsPagination,
    ],
)
async def get_conversations_paged(
    request: Request,
    db: CurrentSession,
    agent_uuid: Annotated[str | None, Query(description='智能体 UUID')] = None,
    name: Annotated[str | None, Query(description='智能体会话名称')] = None,
    remark: Annotated[str | None, Query(description='备注')] = None,
    conversation_type: Annotated[int | None, Query(description='类型')] = None,
    status: Annotated[int | None, Query(description='状态')] = None,
) -> ResponseSchemaModel[PageData[GetConversationList]]:
    user_id = request.user.id
    page = request.query_params.get('page')
    size = request.query_params.get('size')

    key_parts = [
        f"agent={agent_uuid or ''}",
        f"name={name or ''}",
        f"remark={remark or ''}",
        f"type={conversation_type if conversation_type is not None else ''}",
        f"status={status if status is not None else ''}",
        f"page={page or ''}",
        f"size={size or ''}",
    ]
    cache_key = f"sapper:conversation:list:user={user_id}:" + "|".join(key_parts)

    cached = await redis_client.get(cache_key)
    if cached:
        try:
            cached_str = cached.decode("utf-8") if isinstance(cached, (bytes, bytearray)) else str(cached)
            data = json.loads(cached_str)
            return response_base.success(data=data)
        except Exception:
            pass

    conversation_select = await conversation_service.get_select(request=request, name=name, remark=remark, conversation_type=conversation_type, status=status, agent_uuid=agent_uuid)
    page_data = await paging_data(db, conversation_select)
    encoded = jsonable_encoder(page_data)
    await redis_client.setex(cache_key, 60 * 10, json.dumps(encoded, ensure_ascii=False))
    return response_base.success(data=encoded)


@router.post(
    '',
    summary='创建智能体会话',
    dependencies=[
        DependsJwtAuth
    ],
)
async def create_conversation(
    request: Request,
    obj: CreateConversationParam
) -> ResponseSchemaModel[GetConversationList]:
    user_id = getattr(request, 'user').id if hasattr(request, 'user') else None
    conversation = await conversation_service.create(request=request, obj=obj)

    # 变更后清理相关缓存（列表与详情前缀）
    await redis_client.delete_prefix(f"sapper:conversation:list:user={user_id}")

    return response_base.success(data=conversation)


@router.put(
    '/{conversation_uuid}',
    summary='更新智能体会话',
    dependencies=[
        DependsJwtAuth,
    ],
)
async def update_conversation(request: Request, conversation_uuid: Annotated[str, Path(description='智能体会话 UUID')], obj: UpdateConversationParam) -> ResponseModel:
    user_id = getattr(request, 'user').id if hasattr(request, 'user') else None
    count = await conversation_service.update(request=request, conversation_uuid=conversation_uuid, obj=obj)
    if count > 0:
        # 更新成功后清理相关缓存（详情-该会话所有用户、列表）
        await redis_client.delete_prefix(f"sapper:conversation:detail:user={user_id}:{conversation_uuid}")
        await redis_client.delete_prefix(f"sapper:conversation:list:user={user_id}:")
        return response_base.success()
    return response_base.fail()


@router.delete(
    '',
    summary='批量删除智能体会话',
    dependencies=[
        DependsJwtAuth,
    ],
)
async def delete_conversations(request: Request, obj: DeleteConversationParam) -> ResponseModel:
    user_id = getattr(request, 'user').id if hasattr(request, 'user') else None
    count = await conversation_service.delete(request=request, obj=obj)
    if count > 0:
        # 删除成功后清理相关缓存（详情与列表）
        await redis_client.delete_prefix(f"sapper:conversation:detail:user={user_id}:")
        await redis_client.delete_prefix(f"sapper:conversation:list:user={user_id}:")
        return response_base.success()
    return response_base.fail()
