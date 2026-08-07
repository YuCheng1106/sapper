#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from typing import Sequence
from sqlalchemy.sql import Select
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, noload
from sqlalchemy_crud_plus import CRUDPlus

from plugin.sapper_agent.model import Conversation
from plugin.sapper_agent.schema import CreateConversationParam, UpdateConversationParam, ConversationSchemaBase
from app.admin.model import User
from plugin.sapper_knowledge.model import KnowledgeBase
from plugin.sapper_plugin.model import Plugin


class CRUDConversation(CRUDPlus[Conversation]):
    """智能体会话数据库操作类"""

    async def get(self, db: AsyncSession, pk: int) -> Conversation | None:
        """
        获取智能体会话

        :param db: 数据库会话
        :param pk: 数据库 ID
        :return:
        """

        return await self.select_model(db, pk)

    async def get_by_uuid(self, db: AsyncSession, uuid: str) -> Conversation | None:
        """
        获取智能体会话

        :param db: 数据库会话
        :param uuid: 智能体会话 UUID
        :return:
        """
        stmt = select(self.model).where(self.model.uuid == uuid)
        result = await db.execute(stmt)
        conversation = result.scalar_one_or_none()
        if conversation is not None:
            return await self.select_model(db, pk=conversation.id)
        return None

    async def get_list(
            self,
            agent_id: int | None,
            creator_id: int | None,
            name: str | None,
            remark: str | None,
            conversation_type: int | None,
            status: int | None
    ) -> Select:
        """
        获取智能体会话列表（支持标签模糊匹配）

        Args:
            agent_id: 智能体 ID
            creator_id: 创建者ID筛选
            name: 名称模糊搜索（包含）
            remark: 描述模糊搜索（包含）
            conversation_type: 智能体会话类型筛选
            status: 状态筛选

        Returns:
            Select: SQLAlchemy 查询对象
        """
        from sqlalchemy import or_, and_

        filters = []

        # 基础条件筛选
        if creator_id is not None:
            filters.append(self.model.creator_id == creator_id)
        if agent_id is not None:
            filters.append(self.model.agent_id == agent_id)
        if name:
            filters.append(self.model.name.ilike(f'%{name}%'))
        if remark:
            filters.append(self.model.remark.ilike(f'%{remark}%'))

        if conversation_type is not None:
            filters.append(self.model.type == conversation_type)
        else:
            filters.append(self.model.type == 1)

        if status is not None:
            filters.append(self.model.status == status)

        # 构建查询
        query = await self.select_order(
            'id',
            'desc',
        )

        # 应用所有筛选条件
        if filters:
            query = query.where(and_(*filters))

        return query

    async def get_all(self, db: AsyncSession) -> Sequence[Conversation]:
        """
        获取所有数据库

        :param db: 数据库会话
        :return:
        """
        return await self.select_models(db)

    async def create(self, db: AsyncSession, obj: ConversationSchemaBase) -> Conversation:
        """
        创建数据库

        :param db: 数据库会话
        :param obj: 创建数据库参数
        :return:
        """
        return await self.create_model(db, obj)

    async def update(self, db: AsyncSession, pk: int, obj: UpdateConversationParam) -> int:
        """
        更新数据库

        :param db: 数据库会话
        :param pk: 智能体会话 ID
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


conversation_dao: CRUDConversation = CRUDConversation(Conversation)
