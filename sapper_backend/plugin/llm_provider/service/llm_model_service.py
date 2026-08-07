#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from typing import Sequence
from fastapi import Request
from sqlalchemy import Select

from common.exception import errors
from database.db import async_db_session
from plugin.llm_provider.crud.crud_llm_model import llm_model_dao
from plugin.llm_provider.model import LlmModel
from plugin.llm_provider.schema import CreateLlmModelParam, DeleteLlmModelParam, UpdateLlmModelParam


class LlmModelService:
    """LLM模型服务类"""

    @staticmethod
    async def get(*, request: Request, pk: int) -> LlmModel:
        """
        获取LLM模型

        :param request: FastAPI请求对象
        :param pk: LLM模型 ID
        :return:
        """
        async with async_db_session() as db:
            llm_model = await llm_model_dao.get(db, pk)
            if not llm_model:
                raise errors.NotFoundError(msg='LLM模型不存在')

            return llm_model

    @staticmethod
    async def get_select(*, request: Request, name: str, status: int, provider_id: int) -> Select:
        """
        获取LLM模型列表查询条件

        :param request: FastAPI请求对象
        :param name: LLM模型名称
        :param status: LLM模型状态
        :param provider_id: 模型供应商ID
        :return:
        """

        # 将当前用户 ID 传入列表查询，以便在 DAO 层按用户的 model_config 过滤
        user_id = getattr(getattr(request, 'user', None), 'id', None)
        return await llm_model_dao.get_list(status=status, name=name, provider_id=provider_id, user_id=user_id)

    @staticmethod
    async def get_all(*, request: Request) -> Sequence[LlmModel]:
        """
        获取所有LLM模型

        :param request: FastAPI请求对象
        """

        async with async_db_session() as db:
            if not request.user.is_superuser:
                raise errors.ForbiddenError(msg="您没有权限获得所有LLM模型")
            llm_models = await llm_model_dao.get_all(db)
            return llm_models

    @staticmethod
    async def create(*, request: Request, obj: CreateLlmModelParam) -> None:
        """
        创建LLM模型

        :param request: FastAPI请求对象
        :param obj: 创建LLM模型参数
        :return:
        """
        async with async_db_session.begin() as db:
            if obj.creator_id is None:
                obj.creator_id = request.user.id
            if not request.user.is_superuser and request.user.id != obj.creator_id:
                raise errors.ForbiddenError(msg="您没有权限为该用户创建LLM模型")

            await llm_model_dao.create(db, obj)

    @staticmethod
    async def update(*, request: Request, pk: int, obj: UpdateLlmModelParam) -> int:
        """
        更新LLM模型

        :param request: FastAPI请求对象
        :param pk: LLM模型 UUID
        :param obj: 更新LLM模型参数
        :return:
        """
        async with async_db_session.begin() as db:
            llm_model = await llm_model_dao.get(db, pk)
            if not llm_model:
                raise errors.NotFoundError(msg='LLM模型不存在')
            if not request.user.is_superuser:
                raise errors.ForbiddenError(msg="您没有权限更新该LLM模型")
            if llm_model.status == 3:
                raise errors.ForbiddenError(msg="该LLM模型为智能体插件，不可修改")
            count = await llm_model_dao.update(db, llm_model.id, obj)
            return count

    @staticmethod
    async def delete(*, request: Request, obj: DeleteLlmModelParam) -> int:
        """
        批量删除LLM模型

        :param request: FastAPI请求对象
        :param obj: LLM模型 ID 列表
        :return:
        """
        async with async_db_session.begin() as db:
            fault_llm_model_ids = []
            for llm_model_id in obj.pks:
                llm_model = await llm_model_dao.get(db, llm_model_id)
                if not llm_model or (not request.user.is_superuser):
                    obj.pks.remove(llm_model_id)
                    fault_llm_model_ids.append(llm_model.name if llm_model else llm_model_id)

            count = await llm_model_dao.delete(db, obj.pks)

            if len(fault_llm_model_ids) != 0:
                raise errors.ForbiddenError(msg="您没有权限删除LLM模型" + ', '.join(fault_llm_model_ids))
            return count


llm_model_service: LlmModelService = LlmModelService()
