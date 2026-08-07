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
from plugin.llm_provider.schema import CreateLlmModelParam, DeleteLlmModelParam, UpdateLlmModelParam, \
    GetLlmModelWithRelationDetail
from plugin.llm_provider.service.llm_model_service import llm_model_service

router = APIRouter()


@router.get('/{pk}', summary='获取模型详情', dependencies=[DependsJwtAuth])
async def get_llm_model(request: Request, pk: Annotated[int, Path(description='模型 ID')]) -> ResponseSchemaModel[GetLlmModelWithRelationDetail]:
    user_id = getattr(getattr(request, 'user', None), 'id', None)
    cache_key = f"llm:model:detail:user={user_id}:{pk}"
    ttl_seconds = 600
    if user_id is not None:
        cached = await redis_client.get(cache_key)
        if cached:
            data = json.loads(cached)
            return response_base.success(data=data)

    llm_model = await llm_model_service.get(request=request, pk=pk)
    llm_model_data = GetLlmModelWithRelationDetail.model_validate(llm_model, context={'user_id': user_id})
    encoded = jsonable_encoder(llm_model_data)

    if user_id is not None:
        await redis_client.setex(cache_key, ttl_seconds, json.dumps(encoded))

    return response_base.success(data=llm_model_data)


@router.get(
    '',
    summary='分页获取所有模型',
    dependencies=[
        DependsJwtAuth,
        DependsPagination,
    ],
)
async def get_llm_models_paged(
    request: Request,
    db: CurrentSession,
    name: Annotated[str | None, Query(description='模型名称')] = None,
    provider_id: Annotated[int | None, Query(description='模型供应商ID')] = None,
    status: Annotated[int | None, Query(description='状态')] = None,
) -> ResponseSchemaModel[PageData[GetLlmModelWithRelationDetail]]:
    user_id = getattr(getattr(request, 'user', None), 'id', None)
    page = request.query_params.get('page', '1')
    size = request.query_params.get('size', '20')
    key_parts = [
        f"name={name or ''}",
        f"status={status if status is not None else ''}",
        f"provider_id={provider_id if provider_id is not None else ''}",
        f"page={page or ''}",
        f"size={size or ''}",
    ]
    cache_key = f"llm:model:list:user={user_id}:" + "|".join(key_parts)

    ttl_seconds = 600

    if user_id is not None and page is not None and size is not None:
        cached = await redis_client.get(cache_key)
        if cached:
            data = json.loads(cached)
            return response_base.success(data=data)

    llm_model_select = await llm_model_service.get_select(
        request=request, name=name, status=status, provider_id=provider_id
    )
    page_data = await paging_data(db, llm_model_select)
    items = page_data.get('items', [])
    serialized_items = [
        jsonable_encoder(GetLlmModelWithRelationDetail.model_validate(item, context={'user_id': user_id}))
        for item in items
    ]
    page_data['items'] = serialized_items

    if user_id is not None and page is not None and size is not None:
        await redis_client.setex(cache_key, ttl_seconds, json.dumps(page_data))
    return response_base.success(data=page_data)


@router.post(
    '',
    summary='创建模型',
    dependencies=[
        DependsJwtAuth
    ],
)
async def create_llm_model(
    request: Request,
    obj: CreateLlmModelParam
) -> ResponseModel:
    user_id = getattr(getattr(request, 'user', None), 'id', None)
    await llm_model_service.create(request=request, obj=obj)

    # 创建成功后，失效相关缓存（列表与详情前缀）
    try:
        await redis_client.delete_prefix(f"llm:model:list:user={user_id}:")
    except Exception:
        pass
    return response_base.success()


@router.put(
    '/{pk}',
    summary='更新模型',
    dependencies=[
        DependsJwtAuth,
    ],
)
async def update_llm_model(request: Request, pk: Annotated[int, Path(description='模型 ID')], obj: UpdateLlmModelParam) -> ResponseModel:
    user_id = getattr(getattr(request, 'user', None), 'id', None)
    count = await llm_model_service.update(request=request, pk=pk, obj=obj)
    if count > 0:
        # 更新成功后，失效对应详情与列表缓存
        try:
            await redis_client.delete_prefix(f"llm:model:detail:user={user_id}:{pk}")
            await redis_client.delete_prefix(f"llm:model:list:user={user_id}:")
        except Exception:
            pass
        return response_base.success()
    return response_base.fail()


@router.delete(
    '',
    summary='批量删除模型',
    dependencies=[
        DependsJwtAuth,
    ],
)
async def delete_llm_models(request: Request, obj: DeleteLlmModelParam) -> ResponseModel:
    user_id = getattr(getattr(request, 'user', None), 'id', None)
    count = await llm_model_service.delete(request=request, obj=obj)
    if count > 0:
        # 删除成功后，失效对应详情与列表缓存
        try:
            await redis_client.delete_prefix(f"llm:model:detail:user={user_id}")
            await redis_client.delete_prefix(f"llm:model:list:user={user_id}:")
        except Exception:
            pass
        return response_base.success()
    return response_base.fail()

