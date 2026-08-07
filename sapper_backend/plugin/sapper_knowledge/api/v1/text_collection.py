#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from typing import Annotated
import json

from fastapi import APIRouter, Path, Request, Query, BackgroundTasks
from fastapi.encoders import jsonable_encoder

from common.exception import errors
from common.pagination import DependsPagination, PageData, paging_data
from common.response.response_schema import ResponseModel, ResponseSchemaModel, response_base
from common.security.jwt import DependsJwtAuth
from database.db import CurrentSession
from database.redis import redis_client
from plugin.sapper_knowledge.schema.text_collection import CreateTextCollectionParam, DeleteTextCollectionParam, \
    GetTextCollectionDetail, UpdateTextCollectionParam, \
    GetTextCollectionWithRelationDetail, GetTextCollectionList
from plugin.sapper_knowledge.service.text_collection_service import text_collection_service
from utils.serializers import select_as_dict

router = APIRouter()


@router.get('/{pk}', summary='获取Sapper知识库集合详情', dependencies=[DependsJwtAuth])
async def get_text_collection(request: Request, pk: Annotated[int, Path(description='Sapper知识库集合 ID')]) -> ResponseSchemaModel[GetTextCollectionDetail]:
    user_id = getattr(request, 'user').id if hasattr(request, 'user') else None
    cache_key = f"sapper:text_collection:detail:user={user_id}:{pk}"

    cached = await redis_client.get(cache_key)
    if cached:
        try:
            cached_str = cached.decode("utf-8") if isinstance(cached, (bytes, bytearray)) else str(cached)
            data = json.loads(cached_str)
            return response_base.success(data=data)
        except Exception:
            pass

    text_collection = await text_collection_service.get(request=request, pk=pk)
    text_collection_data = GetTextCollectionDetail(**select_as_dict(text_collection))
    encoded = jsonable_encoder(text_collection_data)
    await redis_client.setex(cache_key, 60 * 10, json.dumps(encoded, ensure_ascii=False))
    return response_base.success(data=encoded)


@router.get(
    '',
    summary='分页获取所有Sapper知识库集合',
    dependencies=[
        DependsJwtAuth,
        DependsPagination,
    ],
)
async def get_text_collections_paged(
    request: Request,
    db: CurrentSession,
    knowledge_base_uuid: Annotated[str | None, Query(description='Sapper知识库UUID')] = None,
    name: Annotated[str | None, Query(description='Sapper知识库集合名称')] = None,
    status: Annotated[int | None, Query(description='状态')] = None,
) -> ResponseSchemaModel[PageData[GetTextCollectionList]]:
    user_id = getattr(request, 'user').id if hasattr(request, 'user') else None
    page = request.query_params.get('page')
    size = request.query_params.get('size')

    key_parts = [
        f"kb={knowledge_base_uuid or ''}",
        f"name={name or ''}",
        f"status={status if status is not None else ''}",
        f"page={page or ''}",
        f"size={size or ''}",
    ]
    cache_key = f"sapper:text_collection:list:user={user_id}:" + "|".join(key_parts)

    cached = await redis_client.get(cache_key)
    if cached:
        try:
            cached_str = cached.decode("utf-8") if isinstance(cached, (bytes, bytearray)) else str(cached)
            data = json.loads(cached_str)
            return response_base.success(data=data)
        except Exception:
            pass

    text_collection_select = await text_collection_service.get_select(request=request, name=name, status=status, knowledge_base_uuid=knowledge_base_uuid)
    page_data = await paging_data(db, text_collection_select)
    encoded = jsonable_encoder(page_data)
    await redis_client.setex(cache_key, 60 * 10, json.dumps(encoded, ensure_ascii=False))
    return response_base.success(data=encoded)


@router.post(
    '',
    summary='创建Sapper知识库集合',
    dependencies=[
        DependsJwtAuth
    ],
)
async def create_text_collection(
    request: Request,
    obj: CreateTextCollectionParam,
    background_tasks: BackgroundTasks
) -> ResponseSchemaModel[GetTextCollectionList]:
    user_id = getattr(request, 'user').id if hasattr(request, 'user') else None
    obj.status = 2
    # Add the embedding task to background tasks
    chunk_result = await text_collection_service.collection_chunk(str(obj.file_url))
    if len(chunk_result) >= 50:
        raise errors.ConflictError(msg=f"文件{obj.name} 段落数量为 {len(chunk_result)}, 大于50段，请减少文件段落数量")
    text_collection = await text_collection_service.create(request=request, obj=obj)
    background_tasks.add_task(
        text_collection_service.collection_embedding,
        user_id,
        text_collection.id,
        str(obj.file_url)
    )
    # 变更后清理相关缓存（列表与详情前缀）
    await redis_client.delete_prefix(f"sapper:text_collection:list:user={user_id}")
    return response_base.success(data=text_collection)


@router.put(
    '/{pk}',
    summary='更新Sapper知识库集合',
    dependencies=[
        DependsJwtAuth,
    ],
)
async def update_text_collection(request: Request, pk: Annotated[int, Path(description='Sapper知识库集合 ID')], obj: UpdateTextCollectionParam) -> ResponseModel:
    user_id = getattr(request, 'user').id if hasattr(request, 'user') else None
    count = await text_collection_service.update(request=request, pk=pk, obj=obj)
    if count > 0:
        # 更新成功后清理相关缓存（详情-该集合所有用户、列表）
        await redis_client.delete_prefix(f"sapper:text_collection:detail:user={user_id}:{pk}:")
        await redis_client.delete_prefix(f"sapper:text_collection:list:user={user_id}")
        return response_base.success()
    return response_base.fail()


@router.delete(
    '',
    summary='批量删除Sapper知识库集合',
    dependencies=[
        DependsJwtAuth,
    ],
)
async def delete_text_collections(request: Request, obj: DeleteTextCollectionParam) -> ResponseModel:
    user_id = getattr(request, 'user').id if hasattr(request, 'user') else None
    count = await text_collection_service.delete(request=request, obj=obj)
    if count > 0:
        # 删除成功后清理相关缓存（详情与列表）
        await redis_client.delete_prefix(f"sapper:text_collection:detail:user={user_id}:")
        await redis_client.delete_prefix(f"sapper:text_collection:list:user={user_id}:")
        return response_base.success()
    return response_base.fail()
