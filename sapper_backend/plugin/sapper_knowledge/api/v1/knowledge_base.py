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
from plugin.sapper_knowledge.schema import GetKnowledgeBaseList
from plugin.sapper_knowledge.schema.knowledge_base import CreateKnowledgeBaseParam, DeleteKnowledgeBaseParam, \
    GetKnowledgeBaseDetail, UpdateKnowledgeBaseParam
from plugin.sapper_knowledge.service.knowledge_base_service import knowledge_base_service
from utils.serializers import select_as_dict

router = APIRouter()


@router.get('/{uuid}', summary='获取Sapper知识库详情', dependencies=[DependsJwtAuth])
async def get_knowledge_base(request: Request, uuid: Annotated[str, Path(description='Sapper知识库 UUID')]) -> ResponseSchemaModel[GetKnowledgeBaseDetail]:
    user_id = getattr(request, 'user').id if hasattr(request, 'user') else None
    cache_key = f"sapper:knowledge_base:detail:user={user_id}:{uuid}"

    cached = await redis_client.get(cache_key)
    if cached:
        try:
            cached_str = cached.decode("utf-8") if isinstance(cached, (bytes, bytearray)) else str(cached)
            data = json.loads(cached_str)
            return response_base.success(data=data)
        except Exception:
            pass

    knowledge_base = await knowledge_base_service.get(request=request, uuid=uuid)
    knowledge_base_data = GetKnowledgeBaseDetail(**select_as_dict(knowledge_base))
    encoded = jsonable_encoder(knowledge_base_data)
    await redis_client.setex(cache_key, 60 * 10, json.dumps(encoded, ensure_ascii=False))
    return response_base.success(data=encoded)


@router.get(
    '',
    summary='分页获取所有Sapper知识库',
    dependencies=[
        DependsJwtAuth,
        DependsPagination,
    ],
)
async def get_knowledge_bases_paged(
    request: Request,
    db: CurrentSession,
    name: Annotated[str | None, Query(description='Sapper知识库名称')] = None,
    description: Annotated[str | None, Query(description='描述')] = None,
    status: Annotated[int | None, Query(description='状态')] = None,
) -> ResponseSchemaModel[PageData[GetKnowledgeBaseList]]:
    user_id = getattr(request, 'user').id if hasattr(request, 'user') else None
    page = request.query_params.get('page')
    size = request.query_params.get('size')

    key_parts = [
        f"name={name or ''}",
        f"description={description or ''}",
        f"status={status if status is not None else ''}",
        f"page={page or ''}",
        f"size={size or ''}",
    ]
    cache_key = f"sapper:knowledge_base:list:user={user_id}:" + "|".join(key_parts)

    cached = await redis_client.get(cache_key)
    if cached:
        try:
            cached_str = cached.decode("utf-8") if isinstance(cached, (bytes, bytearray)) else str(cached)
            data = json.loads(cached_str)
            return response_base.success(data=data)
        except Exception:
            pass

    knowledge_base_select = await knowledge_base_service.get_select(request=request, name=name, description=description, status=status)
    page_data = await paging_data(db, knowledge_base_select)
    encoded = jsonable_encoder(page_data)
    await redis_client.setex(cache_key, 60 * 10, json.dumps(encoded, ensure_ascii=False))
    return response_base.success(data=page_data)


@router.post(
    '',
    summary='创建Sapper知识库',
    dependencies=[
        DependsJwtAuth
    ],
)
async def create_knowledge_base(
    request: Request,
    obj: CreateKnowledgeBaseParam
) -> ResponseSchemaModel[GetKnowledgeBaseList]:
    user_id = getattr(request, 'user').id if hasattr(request, 'user') else None
    knowledge_base = await knowledge_base_service.create(request=request, obj=obj)
    knowledge_base = await knowledge_base_service.get(request=request, uuid=knowledge_base.uuid)

    # 变更后清理相关缓存（列表与详情前缀）
    await redis_client.delete_prefix(f"sapper:knowledge_base:list:user={user_id}")

    return response_base.success(data=knowledge_base)


@router.put(
    '/{pk}',
    summary='更新Sapper知识库',
    dependencies=[
        DependsJwtAuth,
    ],
)
async def update_knowledge_base(request: Request, pk: Annotated[int, Path(description='Sapper知识库 ID')], obj: UpdateKnowledgeBaseParam) -> ResponseModel:
    user_id = getattr(request, 'user').id if hasattr(request, 'user') else None
    count = await knowledge_base_service.update(request=request, pk=pk, obj=obj)
    if count > 0:
        # 更新成功后清理相关缓存（详情-该知识库所有用户、列表）
        await redis_client.delete_prefix(f"sapper:knowledge_base:detail:user={user_id}")
        await redis_client.delete_prefix(f"sapper:knowledge_base:list:user={user_id}")
        return response_base.success()
    return response_base.fail()


@router.delete(
    '',
    summary='批量删除Sapper知识库',
    dependencies=[
        DependsJwtAuth,
    ],
)
async def delete_knowledge_bases(request: Request, obj: DeleteKnowledgeBaseParam) -> ResponseModel:
    user_id = getattr(request, 'user').id if hasattr(request, 'user') else None
    count = await knowledge_base_service.delete(request=request, obj=obj)
    if count > 0:
        # 删除成功后清理相关缓存（详情与列表）
        await redis_client.delete_prefix(f"sapper:knowledge_base:detail:user={user_id}")
        await redis_client.delete_prefix(f"sapper:knowledge_base:list:user={user_id}")
        return response_base.success()
    return response_base.fail()
