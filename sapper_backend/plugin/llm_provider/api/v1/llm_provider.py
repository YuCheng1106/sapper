#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from typing import Annotated

import json
from fastapi import APIRouter, Path, Request, Query
from fastapi.encoders import jsonable_encoder

from common.pagination import DependsPagination, PageData, paging_data
from common.response.response_code import CustomResponse
from common.response.response_schema import ResponseModel, ResponseSchemaModel, response_base
from common.security.jwt import DependsJwtAuth
from database.db import CurrentSession
from database.redis import redis_client
from plugin.llm_provider.schema import CreateLlmProviderParam, DeleteLlmProviderParam, UpdateLlmProviderParam, \
    GetLlmProviderWithRelationDetail, GetLlmProviderList
from plugin.llm_provider.service.llm_provider_service import llm_provider_service

router = APIRouter()


@router.get('/{pk}', summary='获取模型供应商详情', dependencies=[DependsJwtAuth])
async def get_llm_provider(request: Request, pk: Annotated[int, Path(description='模型供应商 ID')]) -> ResponseSchemaModel[GetLlmProviderWithRelationDetail]:
    user_id = getattr(getattr(request, 'user', None), 'id', None)
    cache_key = f"llm:provider:detail:user={user_id}:{pk}"
    ttl_seconds = 60
    if user_id is not None:
        cached = await redis_client.get(cache_key)
        if cached:
            data = json.loads(cached)
            return response_base.success(data=data)

    llm_provider = await llm_provider_service.get(request=request, pk=pk)

    llm_provider_data = GetLlmProviderWithRelationDetail.model_validate(llm_provider, context={'user_id': user_id})

    encoded = jsonable_encoder(llm_provider_data)

    if user_id is not None:
        await redis_client.setex(cache_key, ttl_seconds, json.dumps(encoded))

    return response_base.success(data=encoded)

@router.get(
    '',
    summary='分页获取所有模型供应商',
    dependencies=[
        DependsJwtAuth,
        DependsPagination,
    ],
)
async def get_llm_providers_paged(
    request: Request,
    db: CurrentSession,
    name: Annotated[str | None, Query(description='模型供应商名称')] = None,
    status: Annotated[int | None, Query(description='状态')] = None,
) -> ResponseSchemaModel[PageData[GetLlmProviderList]]:
    user_id = getattr(getattr(request, 'user', None), 'id', None)
    page = request.query_params.get('page', '1')
    size = request.query_params.get('size', '20')

    key_parts = [
        f"name={name or ''}",
        f"status={status if status is not None else ''}",
        f"page={page or ''}",
        f"size={size or ''}",
    ]
    cache_key = f"llm:provider:list:user={user_id}:" + "|".join(key_parts)

    ttl_seconds = 600

    if user_id is not None and page is not None and size is not None:
        cached = await redis_client.get(cache_key)
        if cached:
            data = json.loads(cached)
            return response_base.success(data=data)

    llm_provider_select = await llm_provider_service.get_select(
        request=request, name=name, status=status
    )
    page_data = await paging_data(db, llm_provider_select)
    items = page_data.get('items', [])
    serialized_items = [
        jsonable_encoder(GetLlmProviderList.model_validate(item, context={'user_id': user_id}))
        for item in items
    ]
    page_data['items'] = serialized_items
    encoded = jsonable_encoder(page_data)

    if user_id is not None and page is not None and size is not None:
        await redis_client.setex(cache_key, ttl_seconds, json.dumps(encoded))

    return response_base.success(data=encoded)


@router.post(
    '',
    summary='创建模型供应商',
    dependencies=[
        DependsJwtAuth
    ],
)
async def create_llm_provider(
    request: Request,
    obj: CreateLlmProviderParam
) -> ResponseModel:
    user_id = getattr(getattr(request, 'user', None), 'id', None)
    await llm_provider_service.create(request=request, obj=obj)

    # 创建成功后，失效相关缓存（列表与详情前缀）
    try:
        await redis_client.delete_prefix(f"llm:provider:list:user={user_id}:")
    except Exception:
        pass
    return response_base.success()


@router.put(
    '/{pk}',
    summary='更新模型供应商',
    dependencies=[
        DependsJwtAuth,
    ],
)
async def update_llm_provider(request: Request, pk: Annotated[int, Path(description='模型供应商 ID')], obj: UpdateLlmProviderParam) -> ResponseModel:
    user_id = getattr(getattr(request, 'user', None), 'id', None)
    count = await llm_provider_service.update(request=request, pk=pk, obj=obj)
    if count > 0:
        # 更新成功后，失效对应详情与列表缓存
        try:
            await redis_client.delete_prefix(f"llm:provider:detail:user={user_id}:{pk}")
            await redis_client.delete_prefix(f"llm:provider:list:user={user_id}:")
        except Exception:
            pass
        return response_base.success()
    return response_base.fail()


@router.delete(
    '',
    summary='批量删除模型供应商',
    dependencies=[
        DependsJwtAuth,
    ],
)
async def delete_llm_providers(request: Request, obj: DeleteLlmProviderParam) -> ResponseModel:
    user_id = getattr(getattr(request, 'user', None), 'id', None)
    count = await llm_provider_service.delete(request=request, obj=obj)
    if count > 0:
        # 删除成功后，失效对应详情与列表缓存
        try:
            await redis_client.delete_prefix(f"llm:provider:detail:user={user_id}")
            await redis_client.delete_prefix(f"llm:provider:list:user={user_id}:")
        except Exception:
            pass
        return response_base.success()
    return response_base.fail()

@router.get('/config/validate', summary='验证用户LLM配置', dependencies=[DependsJwtAuth])
async def validate_provider(request: Request) -> ResponseModel:
    """验证当前用户是否有有效的LLM配置"""
    try:
        is_valid = await llm_provider_service.validate(request=request)
        return response_base.success(data={"is_valid": is_valid})
    except Exception as e:
        return response_base.fail(res=CustomResponse(code=400, msg=f"验证配置失败: {str(e)}"))