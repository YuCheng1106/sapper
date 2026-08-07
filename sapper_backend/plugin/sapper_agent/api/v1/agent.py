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
from plugin.sapper_agent.schema import UpdateInteractionParam
from plugin.sapper_agent.schema.agent import CreateAgentParam, DeleteAgentParam, UpdateAgentParam, \
    GetAgentWithRelationDetail, GetAgentList
from plugin.sapper_agent.service.agent_service import agent_service
from utils.serializers import select_as_dict

router = APIRouter()

@router.get('/{agent_uuid}', summary='获取智能体详情', dependencies=[DependsJwtAuth])
async def get(request: Request, agent_uuid: Annotated[str, Path(description='智能体 UUID')]) -> ResponseSchemaModel[GetAgentList]:
    # 用户维度的详情缓存，避免跨用户数据泄漏
    cache_key = f"sapper:agent:detail:{agent_uuid}"

    # 命中缓存直接返回
    cached = await redis_client.get(cache_key)
    if cached:
        return response_base.success(data=json.loads(cached))

    # 查询数据库
    agent = await agent_service.get(request=request, agent_uuid=agent_uuid)

    # 统一转换为 Pydantic 数据，避免 ORM 懒加载导致的 DetachedInstanceError
    agent_data = GetAgentList(**select_as_dict(agent))

    # 写入缓存（24 小时）
    await redis_client.setex(cache_key, 60 * 60, json.dumps(jsonable_encoder(agent_data), ensure_ascii=False))

    # 返回 Pydantic 数据（而非原始 ORM 实例）
    return response_base.success(data=agent)

@router.get('/workspace/{agent_uuid}', summary='获取智能体工作间detail', dependencies=[DependsJwtAuth])
async def get_agent_workspace(request: Request, agent_uuid: Annotated[str, Path(description='智能体 UUID')]) -> ResponseSchemaModel[GetAgentWithRelationDetail]:
    # 用户维度的详情缓存，避免跨用户数据泄漏
    cache_key = f"sapper:agent:workspace:{agent_uuid}"

    # 命中缓存直接返回
    cached = await redis_client.get(cache_key)
    if cached:
        return response_base.success(data=json.loads(cached))
    # 查询数据库
    agent = await agent_service.get(request=request, agent_uuid=agent_uuid)

    # 统一转换为 Pydantic 数据，避免 ORM 懒加载导致的 DetachedInstanceError
    agent_data = GetAgentWithRelationDetail(**select_as_dict(agent))
    # 写入缓存（24 小时）
    await redis_client.setex(cache_key, 60 * 60, json.dumps(jsonable_encoder(agent_data), ensure_ascii=False))

    # 返回 Pydantic 数据（而非原始 ORM 实例）
    return response_base.success(data=agent)

@router.get(
    '/public/all',
    summary='分页获取所有公开智能体',
    dependencies=[
        DependsPagination,
    ],
)
async def get_public_agents_paged(
    request: Request,
    db: CurrentSession,
    name: Annotated[str | None, Query(description='智能体名称')] = None,
    description: Annotated[str | None, Query(description='描述')] = None,
    tags: Annotated[list | None, Query(description='智能体标签')] = None,
    agent_type: Annotated[int | None, Query(description='类型')] = None,
    status: Annotated[int | None, Query(description='状态')] = None,
) -> ResponseSchemaModel[PageData[GetAgentList]]:
    discover = True

    # 构建缓存 key（包含查询条件与分页参数）
    page = request.query_params.get('page', '1')
    size = request.query_params.get('size', '20')
    tags_str = ','.join(sorted(tags)) if tags else ''
    key_parts = [
        f"name={name or ''}",
        f"type={agent_type or ''}",
        f"desc={description or ''}",
        f"tags={tags_str}",
        f"status={status if status is not None else ''}",
        f"page={page or ''}",
        f"size={size or ''}",
    ]
    cache_key = f"sapper:agent:discover:user=-1:" + "|".join(key_parts)

    # 命中缓存直接返回
    cached = await redis_client.get(cache_key)
    if cached:
        print("cached discover")
        return response_base.success(data=json.loads(cached))

    # 未命中查询数据库
    agent_select = await agent_service.get_select(
        request=request,
        name=name,
        description=description,
        tags=tags,
        agent_type=agent_type,
        status=status,
        discover=discover,
    )
    page_data = await paging_data(db, agent_select)

    encoded = jsonable_encoder(page_data)
    await redis_client.setex(cache_key, 60 * 60 * 24, json.dumps(encoded, ensure_ascii=False))

    return response_base.success(data=page_data)


@router.get(
    '',
    summary='分页获取所有智能体',
    dependencies=[
        DependsJwtAuth,
        DependsPagination,
    ],
)
async def get_agents_paged(
    request: Request,
    db: CurrentSession,
    name: Annotated[str | None, Query(description='智能体名称')] = None,
    description: Annotated[str | None, Query(description='描述')] = None,
    tags: Annotated[list | None, Query(description='智能体标签')] = None,
    agent_type: Annotated[int | None, Query(description='类型')] = None,
    status: Annotated[int | None, Query(description='状态')] = None,
) -> ResponseSchemaModel[PageData[GetAgentList]]:
    # 构建包含用户维度的缓存键，避免跨用户数据泄漏
    user_id = getattr(request, 'user').id if hasattr(request, 'user') else None
    page = request.query_params.get('page', '1')
    size = request.query_params.get('size', '20')
    tags_str = ','.join(sorted(tags)) if tags else ''
    key_parts = [
        f"name={name or ''}",
        f"type={agent_type or ''}",
        f"desc={description or ''}",
        f"tags={tags_str}",
        f"status={status if status is not None else ''}",
        f"page={page or ''}",
        f"size={size or ''}",
    ]
    cache_key = f"sapper:agent:list:user={user_id}:" + "|".join(key_parts)

    cached = await redis_client.get(cache_key)
    if cached:
        return response_base.success(data=json.loads(cached))

    agent_select = await agent_service.get_select(
        request=request,
        name=name,
        description=description,
        tags=tags,
        agent_type=agent_type,
        status=status,
        discover=False,
    )
    page_data = await paging_data(db, agent_select)

    # 写入缓存（24 小时）
    await redis_client.setex(cache_key, 60 * 60 * 24, json.dumps(jsonable_encoder(page_data), ensure_ascii=False))
    return response_base.success(data=page_data)


@router.post(
    '',
    summary='创建智能体',
    dependencies=[
        DependsJwtAuth
    ],
)
async def create_agent(
    request: Request,
    obj: CreateAgentParam
) -> ResponseSchemaModel[GetAgentList]:
    agent = await agent_service.create(request=request, obj=obj)
    user_id = getattr(request, 'user').id if hasattr(request, 'user') else None
    if agent:
        agent = await agent_service.get(request=request, pk=agent.id)
        # 新增后清理相关缓存前缀，避免脏数据
        await redis_client.delete_prefix(f'sapper:agent:discover:user=-1:')
        await redis_client.delete_prefix(f'sapper:agent:list:user={user_id}:')
    return response_base.success(data=agent)


@router.post(
    '/{agent_uuid}/favorite',
    summary='收藏智能体',
    dependencies=[
        DependsJwtAuth
    ],
)
async def favorite_agent(
    request: Request,
    agent_uuid: Annotated[str, Path(description='智能体 UUID')],
    obj: UpdateInteractionParam
) -> ResponseModel:
    await agent_service.favorite(request=request, agent_uuid=agent_uuid, obj=obj)
    # 失效当前用户的该智能体详情缓存
    user_id = getattr(request, 'user').id if hasattr(request, 'user') else None
    await redis_client.delete_prefix(f"sapper:agent:detail:{agent_uuid}")
    return response_base.success()


@router.post(
    '/{agent_uuid}/rating',
    summary='评分智能体',
    dependencies=[
        DependsJwtAuth
    ],
)
async def rating_agent(
    request: Request,
    agent_uuid: Annotated[str, Path(description='智能体 UUID')],
    obj: UpdateInteractionParam
) -> ResponseModel:
    user_id = getattr(request, 'user').id if hasattr(request, 'user') else None
    await agent_service.rating(request=request, agent_uuid=agent_uuid, obj=obj)
    # 评分可能影响聚合分数，失效相关缓存
    await redis_client.delete_prefix(f"sapper:agent:detail:{agent_uuid}:")
    await redis_client.delete_prefix(f"sapper:agent:discover:")
    await redis_client.delete_prefix(f"sapper:agent:list:")
    return response_base.success()

@router.put(
    '/{agent_uuid}',
    summary='更新智能体',
    dependencies=[
        DependsJwtAuth,
    ],
)
async def update_agent(request: Request, agent_uuid: Annotated[str, Path(description='智能体 UUID')], obj: UpdateAgentParam) -> ResponseModel:
    user_id = getattr(request, 'user').id if hasattr(request, 'user') else None
    count = await agent_service.update(request=request, agent_uuid=agent_uuid, obj=obj)
    await redis_client.delete_prefix(f"sapper:agent:detail:{agent_uuid}")
    await redis_client.delete_prefix(f'sapper:agent:list:user={user_id}:')
    await redis_client.delete_prefix(f'sapper:agent:workspace:{agent_uuid}')
    await redis_client.delete_prefix(f'sapper:agent:discover:')
    if count > 0:
        return response_base.success()
    return response_base.fail()

@router.delete(
    '',
    summary='批量删除智能体',
    dependencies=[
        DependsJwtAuth,
    ],
)
async def delete_agents(request: Request, obj: DeleteAgentParam) -> ResponseModel:
    user_id = getattr(request, 'user').id if hasattr(request, 'user') else None
    count = await agent_service.delete(request=request, obj=obj)
    if len(count) > 0:
        await redis_client.delete_prefix(f'sapper:agent:discover:')
        await redis_client.delete_prefix(f'sapper:agent:list:user={user_id}:')
        # 删除后清理相关缓存前缀，避免脏数据
        for agent_uuid in count:
            await redis_client.delete_prefix(f'sapper:agent:detail:{agent_uuid}')
        return response_base.success()
    return response_base.fail()
