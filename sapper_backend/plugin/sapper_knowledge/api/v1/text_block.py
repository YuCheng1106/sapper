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
from plugin.sapper_knowledge.schema import GetTextBlockList
from plugin.sapper_knowledge.schema.text_block import CreateTextBlockParam, DeleteTextBlockParam, \
    GetTextBlockDetail, UpdateTextBlockParam
from plugin.sapper_knowledge.service.text_block_service import text_block_service
from utils.serializers import select_as_dict

router = APIRouter()


@router.get('/{pk}', summary='获取知识库集合文本块详情', dependencies=[DependsJwtAuth])
async def get_text_block(request: Request, pk: Annotated[int, Path(description='知识库集合文本块 ID')]) -> ResponseSchemaModel[GetTextBlockDetail]:
    user_id = getattr(getattr(request.state, 'user', None), 'id', None)
    cache_key = f"sapper:text_block:detail:user={user_id}:{pk}"
    ttl_seconds = 600

    if user_id is not None:
        cached = await redis_client.get(cache_key)
        if cached:
            data = json.loads(cached)
            return response_base.success(data=data)

    text_block = await text_block_service.get(request=request, pk=pk)
    text_block_data = GetTextBlockDetail(**select_as_dict(text_block))
    encoded = jsonable_encoder(text_block_data)

    if user_id is not None:
        await redis_client.setex(cache_key, ttl_seconds, json.dumps(encoded))

    return response_base.success(data=encoded)


@router.get(
    '',
    summary='分页获取所有知识库集合文本块',
    dependencies=[
        DependsJwtAuth,
        DependsPagination,
    ],
)
async def get_text_blocks_paged(
    request: Request,
    db: CurrentSession,
    text_collection_id: Annotated[int | None, Query(description='知识库集合 ID')] = None,
    content: Annotated[str | None, Query(description='知识库集合文本块内容')] = None,
) -> ResponseSchemaModel[PageData[GetTextBlockList]]:
    user_id = getattr(getattr(request.state, 'user', None), 'id', None)
    page = getattr(getattr(request.state, 'page', None), 'page', None)
    size = getattr(getattr(request.state, 'page', None), 'size', None)

    key_parts = [
        f"text_collection={text_collection_id or ''}",
        f"content={content or ''}",
        f"page={page or ''}",
        f"size={size or ''}",
    ]
    cache_key = f"sapper:text_block:list:user={user_id}:" + "|".join(key_parts)
    ttl_seconds = 600

    if user_id is not None and page is not None and size is not None:
        cached = await redis_client.get(cache_key)
        if cached:
            data = json.loads(cached)
            return response_base.success(data=data)

    text_block_select = await text_block_service.get_select(
        request=request, text_collection_id=text_collection_id, content=content
    )
    page_data = await paging_data(db, text_block_select)
    encoded = jsonable_encoder(page_data)

    if user_id is not None and page is not None and size is not None:
        await redis_client.setex(cache_key, ttl_seconds, json.dumps(encoded))

    return response_base.success(data=encoded)


@router.post(
    '',
    summary='创建知识库集合文本块',
    dependencies=[
        DependsJwtAuth
    ],
)
async def create_text_block(
    request: Request,
    obj: CreateTextBlockParam,
) -> ResponseSchemaModel[GetTextBlockList]:
    user_id = getattr(getattr(request.state, 'user', None), 'id', None)
    text_block = await text_block_service.create(request=request, obj=obj)

    # 创建成功后，失效相关缓存（列表与详情前缀）
    try:
        await redis_client.delete_prefix(f"sapper:text_block:list:user={user_id}:")
    except Exception:
        pass

    return response_base.success(data=text_block)


@router.put(
    '/{pk}',
    summary='更新知识库集合文本块',
    dependencies=[
        DependsJwtAuth,
    ],
)
async def update_text_block(request: Request, pk: Annotated[int, Path(description='知识库集合文本块 ID')], obj: UpdateTextBlockParam) -> ResponseModel:
    user_id = getattr(getattr(request.state, 'user', None), 'id', None)
    count = await text_block_service.update(request=request, pk=pk, obj=obj)
    if count > 0:
        # 更新成功后，失效对应详情与列表缓存
        try:
            await redis_client.delete_prefix(f"sapper:text_block:detail:user={user_id}:{pk}:")
            await redis_client.delete_prefix(f"sapper:text_block:list:user={user_id}:")
        except Exception:
            pass
        return response_base.success()
    return response_base.fail()


@router.delete(
    '',
    summary='批量删除知识库集合文本块',
    dependencies=[
        DependsJwtAuth,
    ],
)
async def delete_text_blocks(request: Request, obj: DeleteTextBlockParam) -> ResponseModel:
    user_id = getattr(getattr(request.state, 'user', None), 'id', None)
    count = await text_block_service.delete(request=request, obj=obj)
    if count > 0:
        # 删除成功后，失效对应详情与列表缓存
        try:
            if getattr(obj, 'pks', None):
                for _id in obj.ids:
                    await redis_client.delete_prefix(f"sapper:text_block:detail:user={user_id}:{_id}:")
            await redis_client.delete_prefix(f"sapper:text_block:list:user={user_id}:")
        except Exception:
            pass
        return response_base.success()
    return response_base.fail()
