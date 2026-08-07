#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from typing import Annotated

from fastapi import APIRouter, Path, Request

from common.pagination import DependsPagination, PageData, paging_data
from common.response.response_schema import ResponseModel, ResponseSchemaModel, response_base
from common.security.jwt import DependsJwtAuth
from database.db import CurrentSession
from plugin.sapper_agent.schema import CreateInteractionParam, DeleteInteractionParam, UpdateInteractionParam, \
    GetInteractionWithRelationDetail
from plugin.sapper_agent.service import interaction_service

router = APIRouter()


@router.get('/{pk}', summary='获取用户智能体连接详情', dependencies=[DependsJwtAuth])
async def get_interaction(request: Request, pk: Annotated[int, Path(description='用户智能体连接 ID')]) -> ResponseSchemaModel[GetInteractionWithRelationDetail]:
    interaction = await interaction_service.get(request=request, pk=pk)
    return response_base.success(data=interaction)


@router.get(
    '',
    summary='分页获取所有用户智能体连接',
    dependencies=[
        DependsJwtAuth,
        DependsPagination,
    ],
)
async def get_interactions_paged(
    request: Request,
    db: CurrentSession,
) -> ResponseSchemaModel[PageData[GetInteractionWithRelationDetail]]:
    interaction_select = await interaction_service.get_select(request=request, user_id=None)
    page_data = await paging_data(db, interaction_select)
    return response_base.success(data=page_data)


@router.post(
    '',
    summary='创建用户智能体连接',
    dependencies=[
        DependsJwtAuth
    ],
)
async def create_interaction(
    request: Request,
    obj: CreateInteractionParam
) -> ResponseModel:
    await interaction_service.create(request=request, obj=obj)
    return response_base.success()


@router.put(
    '/{pk}',
    summary='更新用户智能体连接',
    dependencies=[
        DependsJwtAuth,
    ],
)
async def update_interaction(request: Request, pk: Annotated[int, Path(description='用户智能体连接 ID')], obj: UpdateInteractionParam) -> ResponseModel:
    count = await interaction_service.update(request=request, pk=pk, obj=obj)
    if count > 0:
        return response_base.success()
    return response_base.fail()


@router.delete(
    '',
    summary='批量删除用户智能体连接',
    dependencies=[
        DependsJwtAuth,
    ],
)
async def delete_interactions(request: Request, obj: DeleteInteractionParam) -> ResponseModel:
    count = await interaction_service.delete(request=request, obj=obj)
    if count > 0:
        return response_base.success()
    return response_base.fail()
