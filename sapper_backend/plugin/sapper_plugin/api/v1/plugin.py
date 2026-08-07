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
from plugin.sapper_plugin.schema.plugin import CreatePluginParam, DeletePluginParam, UpdatePluginParam, \
    GetPluginWithRelationDetail
from plugin.sapper_plugin.service.plugin_service import plugin_service
from utils.serializers import select_as_dict

router = APIRouter()


@router.get('/{uuid}', summary='获取Sapper插件详情', dependencies=[DependsJwtAuth])
async def get_plugin(request: Request, uuid: Annotated[str, Path(description='Sapper插件 ID')]) -> ResponseSchemaModel[GetPluginWithRelationDetail]:
    user_id = getattr(getattr(request, 'user', None), 'id', None)
    cache_key = f"sapper:plugin:detail:user={user_id}:{uuid}"
    ttl_seconds = 600

    if user_id is not None:
        cached = await redis_client.get(cache_key)
        if cached:
            data = json.loads(cached)
            return response_base.success(data=data)

    plugin = await plugin_service.get_by_uuid(request=request, uuid=uuid)
    plugin_data = GetPluginWithRelationDetail(**select_as_dict(plugin))
    encoded = jsonable_encoder(plugin_data)

    if user_id is not None:
        await redis_client.setex(cache_key, ttl_seconds, json.dumps(encoded))

    return response_base.success(data=encoded)


@router.get(
    '',
    summary='分页获取所有Sapper插件',
    dependencies=[
        DependsJwtAuth,
        DependsPagination,
    ],
)
async def get_plugins_paged(
    request: Request,
    db: CurrentSession,
    name: Annotated[str | None, Query(description='Sapper插件名称')] = None,
    description: Annotated[str | None, Query(description='描述')] = None,
    plugin_type: Annotated[int | None, Query(description='类型')] = None,
    status: Annotated[int | None, Query(description='状态')] = None,
) -> ResponseSchemaModel[PageData[GetPluginWithRelationDetail]]:
    user_id = getattr(getattr(request, 'user', None), 'id', None)
    page = request.query_params.get('page', '1')
    size = request.query_params.get('size', '20')

    key_parts = [
        f"desc={description or ''}",
        f"name={name or ''}",
        f"type={plugin_type or ''}",
        f"status={status if status is not None else ''}",
        f"page={page or ''}",
        f"size={size or ''}",
    ]
    cache_key = f"sapper:plugin:list:user={user_id}:" + "|".join(key_parts)

    ttl_seconds = 600

    if user_id is not None and page is not None and size is not None:
        cached = await redis_client.get(cache_key)
        if cached:
            data = json.loads(cached)
            return response_base.success(data=data)

    plugin_select = await plugin_service.get_select(
        request=request, name=name, description=description, plugin_type=plugin_type, status=status
    )
    page_data = await paging_data(db, plugin_select)
    encoded = jsonable_encoder(page_data)

    if user_id is not None and page is not None and size is not None:
        await redis_client.setex(cache_key, ttl_seconds, json.dumps(encoded))

    return response_base.success(data=encoded)


@router.get(
    '/public/all',
    summary='分页获取所有公共Sapper插件',
    dependencies=[
        DependsJwtAuth,
        DependsPagination,
    ],
)
async def get_discover_plugins_paged(
    request: Request,
    db: CurrentSession,
    name: Annotated[str | None, Query(description='Sapper插件名称')] = None,
    description: Annotated[str | None, Query(description='描述')] = None,
    plugin_type: Annotated[int | None, Query(description='类型')] = None,
    category: Annotated[str | None, Query(description='类型目录')] = None,
) -> ResponseSchemaModel[PageData[GetPluginWithRelationDetail]]:
    user_id = getattr(getattr(request, 'user', None), 'id', None)
    page = request.query_params.get('page', '1')
    size = request.query_params.get('size', '20')
    status = 2
    if category == "recommend":
        category = None
    key_parts = [
        f"desc={description or ''}",
        f"name={name or ''}",
        f"type={plugin_type or ''}",
        f"category={category or ''}",
        f"status={status if status is not None else ''}",
        f"page={page or ''}",
        f"size={size or ''}",
    ]
    cache_key = f"sapper:plugin:discover:user=-1:" + "|".join(key_parts)

    ttl_seconds = 600

    if user_id is not None and page is not None and size is not None:
        cached = await redis_client.get(cache_key)
        if cached:
            data = json.loads(cached)
            return response_base.success(data=data)

    plugin_select = await plugin_service.get_select(
        request=request, name=name, description=description, plugin_type=plugin_type, status=status, category=category,discover=True
    )
    page_data = await paging_data(db, plugin_select)
    encoded = jsonable_encoder(page_data)

    if user_id is not None and page is not None and size is not None:
        await redis_client.setex(cache_key, ttl_seconds, json.dumps(encoded))

    return response_base.success(data=encoded)


@router.post(
    '',
    summary='创建Sapper插件',
    dependencies=[
        DependsJwtAuth
    ],
)
async def create_plugin(
    request: Request,
    obj: CreatePluginParam
) -> ResponseModel:
    user_id = getattr(getattr(request, 'user', None), 'id', None)
    await plugin_service.create(request=request, obj=obj)

    # 创建成功后，失效相关缓存（列表与详情前缀）
    try:
        await redis_client.delete_prefix(f"sapper:plugin:list:user={user_id}:")
        await redis_client.delete_prefix(f'sapper:plugin:discover:user=-1:')
    except Exception:
        pass

    return response_base.success()


@router.put(
    '/{uuid}',
    summary='更新Sapper插件',
    dependencies=[
        DependsJwtAuth,
    ],
)
async def update_plugin(request: Request, uuid: Annotated[str, Path(description='Sapper插件 ID')], obj: UpdatePluginParam) -> ResponseModel:
    user_id = getattr(getattr(request, 'user', None), 'id', None)
    count = await plugin_service.update(request=request, uuid=uuid, obj=obj)
    if count > 0:
        # 更新成功后，失效对应详情与列表缓存
        try:
            await redis_client.delete_prefix(f"sapper:plugin:detail:user={user_id}:{uuid}")
            await redis_client.delete_prefix(f"sapper:plugin:list:user={user_id}:")
            await redis_client.delete_prefix(f'sapper:plugin:discover:user=-1:')
        except Exception:
            pass
        return response_base.success()
    return response_base.fail()


@router.delete(
    '',
    summary='批量删除Sapper插件',
    dependencies=[
        DependsJwtAuth,
    ],
)
async def delete_plugins(request: Request, obj: DeletePluginParam) -> ResponseModel:
    user_id = getattr(getattr(request, 'user', None), 'id', None)
    count = await plugin_service.delete(request=request, obj=obj)
    if count > 0:
        # 删除成功后，失效对应详情与列表缓存
        try:
            await redis_client.delete_prefix(f"sapper:plugin:detail:user={user_id}")
            await redis_client.delete_prefix(f"sapper:plugin:list:user={user_id}:")
            await redis_client.delete_prefix(f'sapper:plugin:discover:user=-1:')
        except Exception:
            pass
        return response_base.success()
    return response_base.fail()
