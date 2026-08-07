#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from typing import Sequence

from sqlalchemy import Select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy_crud_plus import CRUDPlus

from plugin.llm_provider.model import LlmModel
from plugin.llm_provider.schema import CreateLlmModelParam, UpdateLlmModelParam


class CRUDLlmModel(CRUDPlus[LlmModel]):
    """Sapper插件数据库操作类"""

    async def get(self, db: AsyncSession, pk: int) -> LlmModel | None:
        """
        获取Sapper插件

        :param db: 数据库会话
        :param pk: 数据库 ID
        :return:
        """
        # 预加载 model_configs，避免会话关闭后懒加载导致 DetachedInstanceError
        return await self.select_model(db, pk, load_strategies=['model_configs'])

    async def get_list(
            self,
            name: str | None,
            status: int | None,
            provider_id: int | None,
            user_id: int | None = None
    ) -> Select:
        """
        获取Sapper插件列表（支持标签模糊匹配）

        Args:
            name: 名称模糊搜索（包含）
            status: 状态筛选
            provider_id: 模型供应商 ID

        Returns:
            Select: SQLAlchemy 查询对象
        """
        from sqlalchemy import and_

        filters = []

        if name:
            filters.append(self.model.name.ilike(f'%{name}%'))
        if status is not None:
            filters.append(self.model.status == status)
        if provider_id:
            filters.append(self.model.provider_id == provider_id)

        query = await self.select_order(
            'id',
            'desc',
            load_options=[
                selectinload(self.model.model_configs)
            ]
        )
        # 应用所有筛选条件
        if filters:
            query = query.where(and_(*filters))

        return query

    async def get_all(self, db: AsyncSession) -> Sequence[LlmModel]:
        """
        获取所有数据库

        :param db: 数据库会话
        :return:
        """
        return await self.select_models(db)

    async def create(self, db: AsyncSession, obj: CreateLlmModelParam) -> LlmModel:
        """
        创建数据库

        :param db: 数据库会话
        :param obj: 创建数据库参数
        :return:
        """
        return await self.create_model(db, obj)

    async def update(self, db: AsyncSession, pk: int, obj: UpdateLlmModelParam) -> int:
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


llm_model_dao: CRUDLlmModel = CRUDLlmModel(LlmModel)
