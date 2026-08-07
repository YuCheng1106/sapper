#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from typing import Sequence

from sqlalchemy import Select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, noload
from sqlalchemy_crud_plus import CRUDPlus

from plugin.sapper_knowledge.model import  Embedding
from plugin.sapper_knowledge.schema import CreateEmbeddingParam, UpdateEmbeddingParam

class CRUDEmbedding(CRUDPlus[Embedding]):
    """Sapper知识库集合数据库操作类"""

    async def get(self, db: AsyncSession, pk: int) -> Embedding | None:
        """
        获取Sapper知识库集合

        :param db: 数据库会话
        :param pk: 数据库 ID
        :return:
        """
        return await self.select_model(db, pk)

    async def get_list(
            self,
            name: str | None,
            status: int | None
    ) -> Select:
        """
        获取Sapper知识库集合列表（支持标签模糊匹配）

        Args:
            name: 名称模糊搜索（包含）
            status: 状态筛选

        Returns:
            Select: SQLAlchemy 查询对象
        """
        from sqlalchemy import or_, and_

        filters = []

        # 基础条件筛选
        if name:
            filters.append(self.model.name.ilike(f'%{name}%'))
        if status is not None:
            filters.append(self.model.status == status)

        # 构建查询
        query = await self.select_order(
            'id',
            'desc',
            load_options=[
                selectinload(self.model.embeddings).options(
                    selectinload(Embedding.embedding)
                )
            ]
        )

        # 应用所有筛选条件
        if filters:
            query = query.where(and_(*filters))

        return query

    async def get_all(self, db: AsyncSession) -> Sequence[Embedding]:
        """
        获取所有数据库

        :param db: 数据库会话
        :return:
        """
        return await self.select_models(db)

    async def create(self, db: AsyncSession, obj: CreateEmbeddingParam) -> Embedding:
        """
        创建数据库

        :param db: 数据库会话
        :param obj: 创建数据库参数
        :return:
        """
        return await self.create_model(db, obj)

    async def update(self, db: AsyncSession, pk: int, obj: UpdateEmbeddingParam) -> int:
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


embedding_dao: CRUDEmbedding = CRUDEmbedding(Embedding)
