#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from typing import Sequence
from fastapi import Request
from sqlalchemy import Select

from common.exception import errors
from database.db import async_db_session
from plugin.sapper_knowledge.crud import knowledge_base_dao
from plugin.sapper_knowledge.model import KnowledgeBase
from plugin.sapper_knowledge.schema import CreateKnowledgeBaseParam, DeleteKnowledgeBaseParam, UpdateKnowledgeBaseParam

class KnowledgeBaseService:
    """Sapper 知识库服务类"""

    @staticmethod
    async def get(*, request: Request, uuid: str) -> KnowledgeBase:
        """
        获取Sapper 知识库

        :param request: FastAPI请求对象
        :param uuid: Sapper 知识库 UUID
        :return:
        """
        async with async_db_session() as db:
            knowledge_base = await knowledge_base_dao.get_by_uuid(db, uuid)
            if not knowledge_base:
                raise errors.NotFoundError(msg='Sapper 知识库不存在')
            if not request.user.is_superuser and request.user.id != knowledge_base.creator_id:
                raise errors.ForbiddenError(msg="您没有权限查看该Sapper 知识库")

            return knowledge_base

    @staticmethod
    async def get_select(*, request: Request, name: str, description: str, status: int) -> Select:
        """
        获取Sapper 知识库列表查询条件

        :param request: FastAPI请求对象
        :param name: Sapper 知识库名称
        :param description: 用户名
        :param status: Sapper 知识库状态
        :return:
        """
        creator_id = None
        # 如果当前用户不是超级管理员
        if not request.user.is_superuser:
            creator_id = request.user.id

        return await knowledge_base_dao.get_list(creator_id=creator_id, name=name, description=description, status=status)

    @staticmethod
    async def get_all(*, request: Request) -> Sequence[KnowledgeBase]:
        """
        获取所有Sapper 知识库

        :param request: FastAPI请求对象
        """

        async with async_db_session() as db:
            if not request.user.is_superuser:
                raise errors.ForbiddenError(msg="您没有权限获得所有Sapper 知识库")
            knowledge_bases = await knowledge_base_dao.get_all(db)
            return knowledge_bases

    @staticmethod
    async def create(*, request: Request, obj: CreateKnowledgeBaseParam) -> KnowledgeBase:
        """
        创建Sapper 知识库

        :param request: FastAPI请求对象
        :param obj: 创建Sapper 知识库参数
        :return:
        """
        async with async_db_session.begin() as db:
            if obj.creator_id is None:
                obj.creator_id = request.user.id
            if not request.user.is_superuser and request.user.id != obj.creator_id:
                raise errors.ForbiddenError(msg="您没有权限为该用户创建Sapper 知识库")

            knowledge_base = await knowledge_base_dao.create(db, obj)
            return knowledge_base

    @staticmethod
    async def update(*, request: Request, pk: int, obj: UpdateKnowledgeBaseParam) -> int:
        """
        更新Sapper 知识库

        :param request: FastAPI请求对象
        :param pk: Sapper 知识库 ID
        :param obj: 更新Sapper 知识库参数
        :return:
        """
        async with async_db_session.begin() as db:
            knowledge_base = await knowledge_base_dao.get(db, pk)
            if not knowledge_base:
                raise errors.NotFoundError(msg='Sapper 知识库不存在')
            if not request.user.is_superuser and request.user.id != knowledge_base.creator_id:
                raise errors.ForbiddenError(msg="您没有权限更新该Sapper 知识库")
            count = await knowledge_base_dao.update(db, pk, obj)
            return count

    @staticmethod
    async def delete(*, request: Request, obj: DeleteKnowledgeBaseParam) -> int:
        """
        批量删除Sapper 知识库

        :param request: FastAPI请求对象
        :param obj: Sapper 知识库 ID 列表
        :return:
        """
        async with async_db_session.begin() as db:
            fault_knowledge_base_ids = []
            for knowledge_base_id in obj.pks:
                knowledge_base = await knowledge_base_dao.get(db, knowledge_base_id)
                if not knowledge_base or (not request.user.is_superuser and request.user.id != knowledge_base.creator_id):
                    obj.pks.remove(knowledge_base_id)
                    fault_knowledge_base_ids.append(knowledge_base.name if knowledge_base else knowledge_base_id)

            count = await knowledge_base_dao.delete(db, obj.pks)

            if len(fault_knowledge_base_ids) != 0:
                raise errors.ForbiddenError(msg="您没有权限删除Sapper 知识库" + ', '.join(fault_knowledge_base_ids))
            return count


knowledge_base_service: KnowledgeBaseService = KnowledgeBaseService()
