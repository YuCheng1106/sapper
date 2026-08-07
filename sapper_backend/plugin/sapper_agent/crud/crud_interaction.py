#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from typing import Sequence

from sqlalchemy.exc import MultipleResultsFound
from sqlalchemy.sql import Select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy_crud_plus import CRUDPlus

from plugin.sapper_agent.model import Interaction
from plugin.sapper_agent.schema import CreateInteractionParam, UpdateInteractionParam

class CRUDInteraction(CRUDPlus[Interaction]):
    """用户智能体连接数据库操作类"""

    async def get(self, db: AsyncSession, pk: int | None = None, user_id: int | None = None, agent_id: int | None = None) -> Interaction | None:
        """
        获取用户智能体连接

        :param db: 数据库会话
        :param pk: ID
        :param user_id: 用户 ID
        :param agent_id: 智能体 ID
        :return:
        """
        if not any([pk, user_id, agent_id]):
            raise ValueError("必须提供至少一个查询条件(pk, user_id或agent_id)")
        interaction = await self.select_model_by_column(
            db,
            agent_id=agent_id,
            user_id=user_id,
        )

        if interaction is None:
            return await self.create_model(db, CreateInteractionParam(agent_id=agent_id, user_id=user_id))
        else:
            return interaction

    async def get_list(
            self,
            user_id: int | None
    ) -> Select:
        """
        获取用户智能体连接列表（支持标签模糊匹配）

        Args:
            user_id: 创建者ID筛选

        Returns:
            Select: SQLAlchemy 查询对象
        """
        from sqlalchemy import or_, and_

        filters = []

        # 基础条件筛选
        if user_id is not None:
            filters.append(self.model.user_id == user_id)
        # 构建查询
        query = await self.select_order(
            'id',
            'desc',
        )

        # 应用所有筛选条件
        if filters:
            query = query.where(and_(*filters))

        return query

    async def get_all(self, db: AsyncSession) -> Sequence[Interaction]:
        """
        获取所有数据库

        :param db: 数据库会话
        :return:
        """
        return await self.select_models(db)

    async def create(self, db: AsyncSession, obj: CreateInteractionParam) -> Interaction:
        """
        创建数据库

        :param db: 数据库会话
        :param obj: 创建数据库参数
        :return:
        """
        return await self.create_model(db, obj)

    async def update(self, db: AsyncSession, pk: int, obj: UpdateInteractionParam) -> int:
        """
        更新数据库

        :param db: 数据库会话
        :param pk: 用户智能体连接 ID
        :param obj: 更新数据库参数
        :return:
        """

        return await self.update_model(db, pk, obj)

    async def delete(self, db: AsyncSession, pks: list[int]) -> int:
        """
        批量删除数据库

        :param db: 数据库会话
        :param pks: 数据库 ID 列表
        :return:
        """
        return await self.delete_model_by_column(db, allow_multiple=True, id__in=pks)


interaction_dao: CRUDInteraction = CRUDInteraction(Interaction)
