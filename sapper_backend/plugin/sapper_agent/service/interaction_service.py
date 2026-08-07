#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from typing import Sequence
from fastapi import Request
from sqlalchemy import Select

from common.exception import errors
from database.db import async_db_session
from plugin.sapper_agent.crud import agent_dao
from plugin.sapper_agent.crud.crud_interaction import interaction_dao
from plugin.sapper_agent.model import Interaction
from plugin.sapper_agent.schema.interaction import CreateInteractionParam, DeleteInteractionParam, UpdateInteractionParam

class InteractionService:
    """用户智能体连接服务类"""

    @staticmethod
    async def get(*, request: Request, pk: int) -> Interaction:
        """
        获取用户智能体连接

        :param request: FastAPI请求对象
        :param pk: 用户智能体连接 ID
        :return:
        """
        async with async_db_session() as db:
            interaction = await interaction_dao.get(db, pk)
            if not interaction:
                raise errors.NotFoundError(msg='用户智能体连接不存在')
            if not request.user.is_superuser and request.user.id != interaction.user_id:
                raise errors.ForbiddenError(msg="您没有权限查看该用户智能体连接")

            return interaction

    @staticmethod
    async def get_select(*, request: Request, user_id) -> Select:
        """
        获取用户智能体连接列表查询条件

        :param request: FastAPI请求对:
        :param user_id: 用户 ID:
        :return:
        """
        user_id = None
        # 如果当前用户不是超级管理员
        if not request.user.is_superuser:
            user_id = request.user.id

        return await interaction_dao.get_list(user_id=user_id)

    @staticmethod
    async def get_all(*, request: Request) -> Sequence[Interaction]:
        """
        获取所有用户智能体连接

        :param request: FastAPI请求对象
        """

        async with async_db_session() as db:
            if not request.user.is_superuser:
                raise errors.ForbiddenError(msg="您没有权限获得所有用户智能体连接")
            interactions = await interaction_dao.get_all(db)
            return interactions

    @staticmethod
    async def create(*, request: Request, obj: CreateInteractionParam) -> None:
        """
        创建用户智能体连接

        :param request: FastAPI请求对象
        :param obj: 创建用户智能体连接参数
        :return:
        """
        async with async_db_session.begin() as db:
            if obj.creator_id is None:
                obj.creator_id = request.user.id
            agent = await agent_dao.get(db, obj.agent_id)
            if not agent:
                raise errors.NotFoundError(msg="该智能体不存在")
            if not request.user.is_superuser and request.user.id != agent.creator_id and agent.status != 2:
                raise errors.ForbiddenError(msg="您没有权限创建该用户智能体连接")
            if not request.user.is_superuser and request.user.id != obj.creator_id:
                raise errors.ForbiddenError(msg="您没有权限为该用户创建用户智能体连接")
            await interaction_dao.create(db, obj)

    @staticmethod
    async def update(*, request: Request, pk: int, obj: UpdateInteractionParam) -> int:
        """
        更新用户智能体连接

        :param request: FastAPI请求对象
        :param pk: 用户智能体连接 ID
        :param obj: 更新用户智能体连接参数
        :return:
        """
        async with async_db_session.begin() as db:
            interaction = await interaction_dao.get(db, pk)
            if not interaction:
                raise errors.NotFoundError(msg='用户智能体连接不存在')
            if not request.user.is_superuser and request.user.id != interaction.user_id:
                raise errors.ForbiddenError(msg="您没有权限更新该用户智能体连接")
            agent = await agent_dao.get(db, interaction.agent_id)
            if not request.user.is_superuser and request.user.id != agent.creator_id and agent.status != 2:
                raise errors.ForbiddenError(msg="您没有权限获得该智能体")
            count = await interaction_dao.update(db, pk, obj)
            return count

    @staticmethod
    async def update_by_agent(*, request: Request, agent_id: int, obj: UpdateInteractionParam) -> int:
        """
        通过智能体更新交互信息

        :param request: FastAPI请求对象
        :param agent_id: 智能体 ID
        :param obj: 更新用户智能体连接参数
        :return:
        """
        async with async_db_session.begin() as db:
            interaction = await interaction_dao.get(db, agent_id=agent_id, user_id=request.user.id)
            if not interaction:
                raise errors.NotFoundError(msg='用户智能体交互记录不存在')
            if not request.user.is_superuser and request.user.id != interaction.user_id:
                raise errors.ForbiddenError(msg="您没有权限更新该用户智能体交互记录")
            agent = await agent_dao.get(db, interaction.agent_id)
            if not request.user.is_superuser and request.user.id != agent.creator_id and agent.status != 2:
                raise errors.ForbiddenError(msg="您没有权限获得该智能体")
            count = await interaction_dao.update(db, interaction.id, obj)
            return count

    @staticmethod
    async def add_usage_count(*, request: Request, agent_id: int) -> int:
        """
        通过智能体更新交互信息

        :param request: FastAPI请求对象
        :param agent_id: 智能体 ID
        :return:
        """
        async with async_db_session.begin() as db:
            interaction = await interaction_dao.get(db, agent_id=agent_id, user_id=request.user.id)
            if not interaction:
                raise errors.NotFoundError(msg='用户智能体交互记录不存在')
            if not request.user.is_superuser and request.user.id != interaction.user_id:
                raise errors.ForbiddenError(msg="您没有权限更新该用户智能体交互记录")
            agent = await agent_dao.get(db, interaction.agent_id)
            if not request.user.is_superuser and request.user.id != agent.creator_id and agent.status != 2:
                raise errors.ForbiddenError(msg="您没有权限获得该智能体")
            count = await interaction_dao.update(db, interaction.id, obj=UpdateInteractionParam(usage_count=interaction.usage_count + 1))
            return count

    @staticmethod
    async def delete(*, request: Request, obj: DeleteInteractionParam) -> int:
        """
        批量删除用户智能体连接

        :param request: FastAPI请求对象
        :param obj: 用户智能体连接 ID 列表
        :return:
        """
        async with async_db_session.begin() as db:
            fault_interaction_ids = []
            for interaction_id in obj.pks:
                interaction = await interaction_dao.get(db, interaction_id)
                if not interaction or (not request.user.is_superuser and request.user.id != interaction.user_id):
                    obj.pks.remove(interaction_id)
                    fault_interaction_ids.append(interaction_id)

            count = await interaction_dao.delete(db, obj.pks)

            if len(fault_interaction_ids) != 0:
                raise errors.ForbiddenError(msg="您没有权限删除用户智能体连接" + ', '.join(fault_interaction_ids))
            return count


interaction_service: InteractionService = InteractionService()
