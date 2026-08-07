#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from typing import Sequence

from sqlalchemy import Select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, noload
from sqlalchemy_crud_plus import CRUDPlus

from plugin.sapper_knowledge.model import  TextBlock
from plugin.sapper_knowledge.schema import CreateTextBlockParam, UpdateTextBlockParam

class CRUDTextBlock(CRUDPlus[TextBlock]):
    """Sapper知识库集合数据库操作类"""

    async def get(self, db: AsyncSession, pk: int) -> TextBlock | None:
        """
        获取Sapper知识库集合

        :param db: 数据库会话
        :param pk: 数据库 ID
        :return:
        """
        return await self.select_model(db, pk, load_strategies=["embedding"])

    async def get_list(
            self,
            text_collection_id: int | None,
            content: str | None
    ) -> Select:
        """
        获取Sapper知识库集合列表（支持标签模糊匹配）

        Args:
            text_collection_id: 知识库集合 ID
            content: 文本块内容

        Returns:
            Select: SQLAlchemy 查询对象
        """
        from sqlalchemy import and_

        filters = []

        # 基础条件筛选
        if content:
            filters.append(self.model.content.ilike(f'%{content}%'))
        if text_collection_id is not None:
            filters.append(self.model.text_collection_id == text_collection_id)

        # 构建查询
        query = await self.select_order(
            'id',
            'desc',
            load_options=[
                noload(self.model.embedding),
            ]
        )

        # 应用所有筛选条件
        if filters:
            query = query.where(and_(*filters))

        return query

    async def get_all(self, db: AsyncSession) -> Sequence[TextBlock]:
        """
        获取所有数据库

        :param db: 数据库会话
        :return:
        """
        return await self.select_models(db)

    async def create(self, db: AsyncSession, obj: CreateTextBlockParam) -> TextBlock:
        """
        创建数据库

        :param db: 数据库会话
        :param obj: 创建数据库参数
        :return:
        """
        return await self.create_model(db, obj)

    async def update(self, db: AsyncSession, pk: int, obj: UpdateTextBlockParam) -> int:
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


text_block_dao: CRUDTextBlock = CRUDTextBlock(TextBlock)
