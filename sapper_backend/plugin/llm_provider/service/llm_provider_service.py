#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from typing import Sequence
from fastapi import Request
from sqlalchemy import Select

from common.exception import errors
from database.db import async_db_session
from plugin.llm_provider.crud.crud_llm_provider import llm_provider_dao
from plugin.llm_provider.model import LlmProvider
from plugin.llm_provider.schema import CreateLlmProviderParam, DeleteLlmProviderParam, UpdateLlmProviderParam


class LlmProviderService:
    """LLM模型供应商服务类"""

    @staticmethod
    async def get(*, request: Request, pk: int) -> LlmProvider:
        """
        获取LLM模型供应商

        :param request: FastAPI请求对象
        :param pk: LLM模型供应商 ID
        :return:
        """
        async with async_db_session() as db:
            llm_provider = await llm_provider_dao.get(db, pk)
            if not llm_provider:
                raise errors.NotFoundError(msg='LLM模型供应商不存在')

            return llm_provider

    @staticmethod
    async def get_select(*, request: Request, name: str, status: int) -> Select:
        """
        获取LLM模型供应商列表查询条件

        :param request: FastAPI请求对象
        :param name: LLM模型供应商名称
        :param status: LLM模型供应商状态
        :return:
        """

        return await llm_provider_dao.get_list(status=status, name=name)

    @staticmethod
    async def get_all(*, request: Request) -> Sequence[LlmProvider]:
        """
        获取所有LLM模型供应商

        :param request: FastAPI请求对象
        """

        async with async_db_session() as db:
            if not request.user.is_superuser:
                raise errors.ForbiddenError(msg="您没有权限获得所有LLM模型供应商")
            llm_providers = await llm_provider_dao.get_all(db)
            return llm_providers

    @staticmethod
    async def create(*, request: Request, obj: CreateLlmProviderParam) -> None:
        """
        创建LLM模型供应商

        :param request: FastAPI请求对象
        :param obj: 创建LLM模型供应商参数
        :return:
        """
        async with async_db_session.begin() as db:
            if obj.creator_id is None:
                obj.creator_id = request.user.id
            if not request.user.is_superuser and request.user.id != obj.creator_id:
                raise errors.ForbiddenError(msg="您没有权限为该用户创建LLM模型供应商")

            await llm_provider_dao.create(db, obj)

    @staticmethod
    async def update(*, request: Request, pk: int, obj: UpdateLlmProviderParam) -> int:
        """
        更新LLM模型供应商

        :param request: FastAPI请求对象
        :param pk: LLM模型供应商 UUID
        :param obj: 更新LLM模型供应商参数
        :return:
        """
        async with async_db_session.begin() as db:
            llm_provider = await llm_provider_dao.get(db, pk)
            if not llm_provider:
                raise errors.NotFoundError(msg='LLM模型供应商不存在')
            if not request.user.is_superuser:
                raise errors.ForbiddenError(msg="您没有权限更新该LLM模型供应商")
            if llm_provider.status == 3:
                raise errors.ForbiddenError(msg="该LLM模型供应商为智能体插件，不可修改")
            count = await llm_provider_dao.update(db, llm_provider.id, obj)
            return count

    @staticmethod
    async def delete(*, request: Request, obj: DeleteLlmProviderParam) -> int:
        """
        批量删除LLM模型供应商

        :param request: FastAPI请求对象
        :param obj: LLM模型供应商 ID 列表
        :return:
        """
        async with async_db_session.begin() as db:
            fault_llm_provider_ids = []
            for llm_provider_id in obj.pks:
                llm_provider = await llm_provider_dao.get(db, llm_provider_id)
                if not llm_provider or (not request.user.is_superuser):
                    obj.pks.remove(llm_provider_id)
                    fault_llm_provider_ids.append(llm_provider.name if llm_provider else llm_provider_id)

            count = await llm_provider_dao.delete(db, obj.pks)

            if len(fault_llm_provider_ids) != 0:
                raise errors.ForbiddenError(msg="您没有权限删除LLM模型供应商" + ', '.join(fault_llm_provider_ids))
            return count

    @staticmethod
    async def validate(*, request: Request) -> int:
        """
        批量删除LLM模型供应商

        :param request: FastAPI请求对象
        :return:
        """
        return 1


llm_provider_service: LlmProviderService = LlmProviderService()
