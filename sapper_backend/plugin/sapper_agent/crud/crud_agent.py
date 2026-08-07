#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from typing import Sequence
from sqlalchemy.sql import Select
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, noload
from sqlalchemy_crud_plus import CRUDPlus
from plugin.sapper_agent.model import Agent
from plugin.sapper_agent.schema.agent import CreateAgentParam, UpdateAgentParam
from app.admin.model import User
from plugin.sapper_knowledge.model import KnowledgeBase, TextCollection, TextBlock
from plugin.sapper_plugin.model import Plugin
from plugin.sapper_publish.model import AgentPublication


class CRUDAgent(CRUDPlus[Agent]):
    """智能体数据库操作类"""
    async def get(self, db: AsyncSession, pk: int) -> Agent | None:
        """
        获取智能体

        :param db: 数据库会话
        :param pk: 数据库 ID
        :return:
        """
        return await self.select_model(db, pk, load_strategies=['creator', 'plugins', 'knowledge_bases', 'conversations', 'interactions'],
                                       load_options=[
                                           selectinload(self.model.knowledge_bases).options(
                                               selectinload(KnowledgeBase.text_collections), selectinload(KnowledgeBase.graph_collections)
                                           ),
                                           selectinload(self.model.publications).options(
                                               selectinload(AgentPublication.channel)
                                           )
                                       ])

    async def get_by_uuid(self, db: AsyncSession, uuid: str) -> Agent | None:
        """
        通过uuid获取智能体

        :param db: 数据库会话
        :param uuid: 智能体 uuid
        :return: 智能体对象或None
        """
        stmt = (
            select(self.model)
            .where(self.model.uuid == uuid)
            .options(
                selectinload(self.model.creator),
                selectinload(self.model.plugins),
                selectinload(self.model.knowledge_bases).options(
                    selectinload(KnowledgeBase.text_collections),
                    selectinload(KnowledgeBase.graph_collections)
                ),
                selectinload(self.model.conversations),
                selectinload(self.model.interactions),
                selectinload(self.model.publications).options(
                    selectinload(AgentPublication.channel),
                )
            )
        )

        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_agent_run_by_uuid(self, db: AsyncSession, uuid: str) -> Agent | None:
        """
        通过uuid获取智能体

        :param db: 数据库会话
        :param uuid: 智能体 uuid
        :return: 智能体对象或None
        """
        stmt = (
            select(self.model)
            .where(self.model.uuid == uuid)
            .options(
                selectinload(self.model.creator)
            )
            .options(
                selectinload(self.model.knowledge_bases)
                .options(
                    selectinload(KnowledgeBase.text_collections).options(
                        selectinload(TextCollection.text_blocks).options(
                            selectinload(TextBlock.embedding)
                        )
                    )
                )
                .options(
                    selectinload(KnowledgeBase.graph_collections)
                )
            )
            .options(
                selectinload(self.model.plugins)
            )
            .options(
                selectinload(self.model.conversations)
            )
        )

        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_list(
            self,
            creator_id: int | None,
            name: str | None,
            description: str | None,
            tags: list | None,
            agent_type: int | None,
            status: int | None
    ) -> Select:
        """
        获取智能体列表（支持标签模糊匹配）

        Args:
            creator_id: 创建者ID筛选
            name: 名称模糊搜索（包含）
            description: 描述模糊搜索（包含）
            tags: 标签列表（只要匹配任意一个标签即返回）
            agent_type: 智能体类型筛选
            status: 状态筛选

        Returns:
            Select: SQLAlchemy 查询对象
        """
        from sqlalchemy import or_, and_

        filters = []

        # 基础条件筛选
        if creator_id is not None:
            filters.append(self.model.creator_id == creator_id)
        if name:
            filters.append(self.model.name.ilike(f'%{name}%'))
        if description:
            filters.append(self.model.description.ilike(f'%{description}%'))
        if agent_type is not None:
            filters.append(self.model.type == agent_type)
        if status is not None:
            filters.append(self.model.status == status)

        # 标签筛选（只要包含任意一个传入的标签）
        if tags:
            tag_conditions = [self.model.tags.contains([tag]) for tag in tags]
            filters.append(or_(*tag_conditions))

        # 构建查询
        query = await self.select_order(
            'id',
            'desc',
            load_options=[
                selectinload(self.model.creator).options(
                    noload(User.dept),
                    noload(User.roles)
                ),
                noload(self.model.plugins),
                noload(self.model.knowledge_bases),
                noload(self.model.publications),
                selectinload(self.model.conversations),
                selectinload(self.model.interactions),
            ]
        )

        # 应用所有筛选条件
        if filters:
            query = query.where(and_(*filters))

        return query

    async def get_all(self, db: AsyncSession) -> Sequence[Agent]:
        """
        获取所有数据库

        :param db: 数据库会话
        :return:
        """
        return await self.select_models(db)

    async def create(self, db: AsyncSession, obj: CreateAgentParam) -> Agent:
        """
        创建数据库

        :param db: 数据库会话
        :param obj: 创建数据库参数
        :return:
        """
        return await self.create_model(db, obj)

    async def update(self, db: AsyncSession, input_agent: Agent, obj: UpdateAgentParam) -> int:
        """
        更新数据库

        :param db: 数据库会话
        :param input_agent: 智能体 ID
        :param obj: 更新数据库参数
        :return:
        """

        plugin_uuids = obj.plugin_uuids
        knowledge_base_uuids = obj.knowledge_base_uuids
        del obj.plugin_uuids
        del obj.knowledge_base_uuids

        count = await self.update_model(db, pk=input_agent.id, obj=obj)

        if plugin_uuids is not None and len(plugin_uuids) >= 0:
            stmt = select(Plugin).where(Plugin.uuid.in_(plugin_uuids))
            plugins = await db.execute(stmt)
            input_agent.plugins = plugins.scalars().all()

        if knowledge_base_uuids is not None and len(knowledge_base_uuids) >= 0:
            stmt = select(KnowledgeBase).where(KnowledgeBase.uuid.in_(knowledge_base_uuids))
            knowledge_bases = await db.execute(stmt)
            input_agent.knowledge_bases = knowledge_bases.scalars().all()

        return count

    async def update_by_id(self, db: AsyncSession, pk: int, obj: UpdateAgentParam) -> int:
        """
        更新数据库

        :param db: 数据库会话
        :param pk: 智能体 ID
        :param obj: 更新数据库参数
        :return:
        """

        del obj.plugin_uuids
        del obj.knowledge_base_uuids

        count = await self.update_model(db, pk=pk, obj=obj)
        return count

    async def delete(self, db: AsyncSession, pks: list[int]) -> int:
        """
        批量删除数据库

        :param db: 数据库会话
        :param pks: 数据库 ID 列表
        :return:
        """
        return await self.delete_model_by_column(db, allow_multiple=True, id__in=pks)


agent_dao: CRUDAgent = CRUDAgent(Agent)
