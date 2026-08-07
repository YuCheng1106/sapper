#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from typing import Annotated

import json
from fastapi import APIRouter, Path, Request, Query, BackgroundTasks
from fastapi.encoders import jsonable_encoder

from common.pagination import DependsPagination, PageData, paging_data
from common.response.response_schema import ResponseModel, ResponseSchemaModel, response_base
from common.security.jwt import DependsJwtAuth
from database.db import CurrentSession
from database.redis import redis_client
from plugin.sapper_knowledge.schema.graph_collection import CreateGraphCollectionParam, DeleteGraphCollectionParam, \
    GetGraphCollectionDetail, UpdateGraphCollectionParam, GetGraphCollectionList
from plugin.sapper_knowledge.service.graph_collection_service import graph_collection_service
from utils.serializers import select_as_dict

router = APIRouter()


@router.get('/{pk}', summary='获取Sapper知识库集合详情', dependencies=[DependsJwtAuth])
async def get_graph_collection(request: Request, pk: Annotated[int, Path(description='Sapper知识库集合 ID')]) -> ResponseSchemaModel[GetGraphCollectionDetail]:
    user_id = getattr(getattr(request, 'user', None), 'id', None)
    cache_key = f"sapper:graph_collection:detail:user={user_id}:{pk}"
    ttl_seconds = 600

    if user_id is not None:
        cached = await redis_client.get(cache_key)
        if cached:
            data = json.loads(cached)
            return response_base.success(data=data)

    graph_collection = await graph_collection_service.get(request=request, pk=pk)
    graph_collection_data = GetGraphCollectionDetail(**select_as_dict(graph_collection))
    encoded = jsonable_encoder(graph_collection_data)

    if user_id is not None:
        await redis_client.setex(cache_key, ttl_seconds, json.dumps(encoded))

    return response_base.success(data=encoded)


@router.get(
    '',
    summary='分页获取所有Sapper知识库集合',
    dependencies=[
        DependsJwtAuth,
        DependsPagination,
    ],
)
async def get_graph_collections_paged(
    request: Request,
    db: CurrentSession,
    knowledge_base_uuid: Annotated[str | None, Query(description='Sapper知识库UUID')] = None,
    name: Annotated[str | None, Query(description='Sapper知识库集合名称')] = None,
    status: Annotated[int | None, Query(description='状态')] = None,
) -> ResponseSchemaModel[PageData[GetGraphCollectionList]]:
    user_id = getattr(getattr(request, 'user', None), 'id', None)
    page = getattr(getattr(request.state, 'page', None), 'page', None)
    size = getattr(getattr(request.state, 'page', None), 'size', None)

    key_parts = [
        f"name={name or ''}",
        f"status={status if status is not None else ''}",
        f"kb={knowledge_base_uuid or ''}",
        f"page={page or ''}",
        f"size={size or ''}",
    ]
    cache_key = f"sapper:graph_collection:list:user={user_id}:" + "|".join(key_parts)
    ttl_seconds = 600

    if user_id is not None and page is not None and size is not None:
        cached = await redis_client.get(cache_key)
        if cached:
            data = json.loads(cached)
            return response_base.success(data=data)

    graph_collection_select = await graph_collection_service.get_select(
        request=request, name=name, status=status, knowledge_base_uuid=knowledge_base_uuid
    )
    page_data = await paging_data(db, graph_collection_select)
    encoded = jsonable_encoder(page_data)

    if user_id is not None and page is not None and size is not None:
        await redis_client.setex(cache_key, ttl_seconds, json.dumps(encoded))

    return response_base.success(data=encoded)


@router.post(
    '',
    summary='创建Sapper知识库集合',
    dependencies=[
        DependsJwtAuth
    ],
)
async def create_graph_collection(
    request: Request,
    obj: CreateGraphCollectionParam,
) -> ResponseSchemaModel[GetGraphCollectionList]:
    user_id = getattr(getattr(request, 'user', None), 'id', None)
    graph_collection = await graph_collection_service.create(request=request, obj=obj)

    # 创建成功后，失效相关缓存（列表与详情前缀）
    try:
        await redis_client.delete_prefix(f"sapper:graph_collection:list:user={user_id}")
    except Exception:
        pass

    return response_base.success(data=graph_collection)


@router.put(
    '/{pk}',
    summary='更新Sapper知识库集合',
    dependencies=[
        DependsJwtAuth,
    ],
)
async def update_graph_collection(request: Request, pk: Annotated[int, Path(description='Sapper知识库集合 ID')], obj: UpdateGraphCollectionParam) -> ResponseModel:
    user_id = getattr(getattr(request, 'user', None), 'id', None)
    count = await graph_collection_service.update(request=request, pk=pk, obj=obj)
    if count > 0:
        # 更新成功后，失效对应详情与列表缓存
        try:
            await redis_client.delete_prefix(f"sapper:graph_collection:detail:user={user_id}:{pk}:")
            await redis_client.delete_prefix(f"sapper:graph_collection:list:user={user_id}")
        except Exception:
            pass
        return response_base.success()
    return response_base.fail()


@router.delete(
    '',
    summary='批量删除Sapper知识库集合',
    dependencies=[
        DependsJwtAuth,
    ],
)
async def delete_graph_collections(request: Request, obj: DeleteGraphCollectionParam) -> ResponseModel:
    user_id = getattr(getattr(request, 'user', None), 'id', None)
    count = await graph_collection_service.delete(request=request, obj=obj)
    if count > 0:
        # 删除成功后，失效对应详情与列表缓存
        try:
            if getattr(obj, 'ids', None):
                for _id in obj.pks:
                    await redis_client.delete_prefix(f"sapper:graph_collection:detail:user={user_id}:{_id}:")
            await redis_client.delete_prefix(f"sapper:graph_collection:list:user={user_id}:")
        except Exception:
            pass
        return response_base.success()
    return response_base.fail()
