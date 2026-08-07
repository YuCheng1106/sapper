#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from typing import Annotated
import json
from fastapi import APIRouter, Path, Query, Request
from fastapi.encoders import jsonable_encoder

from common.pagination import DependsPagination, paging_data, PageData
from common.exception.errors import RequestError
from common.response.response_schema import ResponseSchemaModel, ResponseModel, response_base
from common.security.jwt import DependsJwtAuth
from database.db import CurrentSession
from database.redis import redis_client
from plugin.sapper_publish.schema import CreateAgentPublicationParam, UpdateAgentPublicationParam, \
    GetAgentPublicationList, DeleteAgentPublishParam

from plugin.sapper_publish.service import agent_publication_service
from utils.serializers import select_as_dict

router = APIRouter()


@router.post('', summary='创建智能体发布', dependencies=[DependsJwtAuth])
async def create_agent_publication(request: Request, obj: CreateAgentPublicationParam) -> ResponseModel:
    user_id = request.user.id
    await redis_client.delete_prefix(f'sapper:agent:workspace:{obj.agent_uuid}')
    await redis_client.delete_prefix(f'sapper:agent:detail:{obj.agent_uuid}')
    await redis_client.delete_prefix(f'sapper:agent:list:user={user_id}:{obj.agent_uuid}')
    await redis_client.delete_prefix(f'sapper:agent:discover:user=-1:')
    await agent_publication_service.add(request=request, obj=obj)
    # 写操作后失效发布相关缓存
    return response_base.success()


@router.put('/{agent_publication_id}', summary='更新智能体发布信息', dependencies=[DependsJwtAuth])
async def update_agent_publication(request: Request, agent_publication_uuid: Annotated[str, Path(...)],
                              obj: UpdateAgentPublicationParam) -> ResponseModel:
    user_id = getattr(getattr(request.state, 'user', None), 'id', None)
    count = await agent_publication_service.update(request=request, agent_publication_uuid=agent_publication_uuid, obj=obj)
    if count > 0:
        # 失效当前发布详情与列表缓存
        await redis_client.delete_prefix(f'sapper:agent_publication:detail:user={user_id}:{agent_publication_uuid}:')
        await redis_client.delete_prefix(f'sapper:agent_publication:list:user={user_id}:')
        await redis_client.delete_prefix(f'sapper:agent:detail:user={user_id}:')
        return response_base.success()
    return response_base.fail()


@router.get('/{agent_publication_id}', summary='查看智能体发布信息', dependencies=[DependsJwtAuth])
async def get_agent_publication_info(request: Request, agent_publication_uuid: Annotated[str, Path(...)]) -> ResponseSchemaModel[GetAgentPublicationList]:
    # 用户维度缓存 key（优先使用 request.user.uuid，回退到 request.state.user.id）
    user_uuid = getattr(getattr(request, 'user', None), 'uuid', None) or getattr(getattr(request.state, 'user', None), 'id', None)
    cache_key = f"sapper:agent_publication:detail:{agent_publication_uuid}:{user_uuid}"

    cached = await redis_client.get(cache_key)
    if cached:
        try:
            data = json.loads(cached)
            return response_base.success(data=data)
        except Exception:
            pass

    current_agent_publication = await agent_publication_service.get(
        request=request,
        agent_publication_uuid=agent_publication_uuid,
    )
    current_agent_publication_data = GetAgentPublicationList(**select_as_dict(current_agent_publication))
    encoded = jsonable_encoder(current_agent_publication_data)
    # 10 分钟 TTL
    await redis_client.setex(cache_key, 60 * 10, json.dumps(jsonable_encoder(current_agent_publication)))
    return response_base.success(data=current_agent_publication)


@router.get(
    '',
    summary='分页获取所有智能体发布',
    dependencies=[
        DependsJwtAuth,
        DependsPagination,
    ],
)
async def get_pagination_agent_publication(
        request: Request,
        db: CurrentSession,
        name: Annotated[str | None, Query()] = None,
        status: Annotated[int | None, Query()] = None,
)-> ResponseSchemaModel[PageData[GetAgentPublicationList]]:
    # 用户维度分页缓存 key
    user_uuid = getattr(getattr(request, 'user', None), 'uuid', None) or getattr(getattr(request.state, 'user', None), 'id', None)
    page = getattr(getattr(request.state, 'page', None), 'page', None) or 1
    size = getattr(getattr(request.state, 'page', None), 'size', None) or getattr(getattr(request.state, 'page', None), 'limit', None) or 10

    cache_key = (
        f"sapper:agent_publication:list:user:{user_uuid}:"
        f"name:{name or ''}:status:{status if status is not None else ''}:"
        f"page:{page}:size:{size}"
    )

    cached = await redis_client.get(cache_key)
    if cached:
        try:
            data = json.loads(cached)
            return response_base.success(data=data)
        except Exception:
            pass

    agent_publication_select = await agent_publication_service.get_select(user_uuid=user_uuid, name=name, status=status)
    page_data = await paging_data(db, agent_publication_select)
    await redis_client.setex(cache_key, 60 * 10, json.dumps(jsonable_encoder(page_data)))
    return response_base.success(data=page_data)


@router.delete(
    '',
    summary='删除智能体发布',
    description='删除后智能体发布将从数据库中删除',
    dependencies=[DependsJwtAuth],
)
async def delete_agent_publication(request: Request,obj: DeleteAgentPublishParam) -> ResponseModel:
    user_id = request.user.id

    count = await agent_publication_service.delete(request=request, obj=obj)
    await redis_client.delete_prefix(f'sapper:agent:workspace:')
    await redis_client.delete_prefix(f'sapper:agent:detail:')
    await redis_client.delete_prefix(f'sapper:agent:list:user={user_id}:')
    await redis_client.delete_prefix(f'sapper:agent:discover:user=-1:')
    if count > 0:
        # 删除参数为整型 ID（pks），无法精准定位 UUID 详情缓存，故清理相关前缀
        return response_base.success()
    raise RequestError
