#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from typing import Sequence

from sqlalchemy import Select, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, noload
from sqlalchemy_crud_plus import CRUDPlus

from plugin.sapper_plugin.model import Plugin
from plugin.sapper_plugin.schema.plugin import CreatePluginParam, UpdatePluginParam
from app.admin.model import User

class CRUDPlugin(CRUDPlus[Plugin]):
    """Sapper插件数据库操作类"""

    async def get(self, db: AsyncSession, pk: int) -> Plugin | None:
        """
        获取Sapper插件

        :param db: 数据库会话
        :param pk: 数据库 ID
        :return:
        """
        return await self.select_model(db, pk)

    async def get_by_uuid(self, db: AsyncSession, uuid: str) -> Plugin | None:
        """
        获取Sapper数据库

        :param db: 数据库会话
        :param uuid: 数据库 UUID
        :return:
        """
        stmt = select(self.model).where(self.model.uuid == uuid)
        result = await db.execute(stmt)
        plugin = result.scalar_one_or_none()
        if plugin is not None:
            return await self.select_model(db, pk=plugin.id)
        return None

    async def get_list(
            self,
            creator_id: int | None,
            name: str | None,
            description: str | None,
            plugin_type: int | None,
            category: str | None,
            status: int | None
    ) -> Select:
        """
        获取Sapper插件列表（支持标签模糊匹配）

        Args:
            creator_id: 创建者ID筛选
            name: 名称模糊搜索（包含）
            description: 描述模糊搜索（包含）
            plugin_type: Sapper插件类型筛选
            category: Sapper插件类型筛选
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
        if category:
            filters.append(self.model.category.ilike(f'%{category}%'))
        if description:
            filters.append(self.model.description.ilike(f'%{description}%'))
        if plugin_type is not None:
            filters.append(self.model.type == plugin_type)
        if status is not None:
            filters.append(self.model.status == status)

        # 构建查询
        query = await self.select_order(
            'id',
            'desc',
            load_options=[
                selectinload(self.model.creator).options(
                    noload(User.dept),
                    noload(User.roles)
                ),
                noload(self.model.agents)
            ]
        )

        # 应用所有筛选条件
        if filters:
            query = query.where(and_(*filters))

        return query

    async def get_all(self, db: AsyncSession) -> Sequence[Plugin]:
        """
        获取所有数据库

        :param db: 数据库会话
        :return:
        """
        return await self.select_models(db)

    async def create(self, db: AsyncSession, obj: CreatePluginParam) -> Plugin:
        """
        创建数据库

        :param db: 数据库会话
        :param obj: 创建数据库参数
        :return:
        """
        return await self.create_model(db, obj)

    async def update(self, db: AsyncSession, pk: int, obj: UpdatePluginParam) -> int:
        """
        更新数据库

        :param db: 数据库会话
        :param pk: 数据库 ID
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


plugin_dao: CRUDPlugin = CRUDPlugin(Plugin)
