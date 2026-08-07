#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from typing import Sequence
from fastapi import Request
from sqlalchemy import Select

from common.exception import errors
from database.db import async_db_session
from plugin.sapper_knowledge.crud import text_block_dao, text_block_dao, embedding_dao
from plugin.sapper_knowledge.model import TextBlock
from plugin.sapper_knowledge.schema import CreateTextBlockParam, DeleteTextBlockParam, UpdateTextBlockParam, \
    CreateTextBlockParam, CreateEmbeddingParam, UpdateEmbeddingParam
from plugin.sapper_knowledge.utils.sapper_rag import file_embedding, content_embedding


class TextBlockService:
    """Sapper 知识库文本块服务类"""

    @staticmethod
    async def get(*, request: Request, pk: int) -> TextBlock:
        """
        获取Sapper 知识库文本块

        :param request: FastAPI请求对象
        :param pk: Sapper 知识库文本块 ID
        :return:
        """
        async with async_db_session() as db:
            text_block = await text_block_dao.get(db, pk)
            if not text_block:
                raise errors.NotFoundError(msg='Sapper 知识库文本块不存在')

            return text_block

    @staticmethod
    async def get_select(*, request: Request, text_collection_id: int, content: str) -> Select:
        """
        获取Sapper 知识库文本块列表查询条件

        :param request: FastAPI请求对象
        :param text_collection_id: Sapper 知识库文本块集合 ID
        :param content: 文本块内容
        :return:
        """

        return await text_block_dao.get_list(text_collection_id=text_collection_id, content = content)

    @staticmethod
    async def get_all(*, request: Request) -> Sequence[TextBlock]:
        """
        获取所有Sapper 知识库文本块

        :param request: FastAPI请求对象
        """

        async with async_db_session() as db:

            text_blocks = await text_block_dao.get_all(db)
            return text_blocks

    @staticmethod
    async def create(*, request: Request, obj: CreateTextBlockParam) -> TextBlock:
        """
        创建Sapper 知识库文本块

        :param request: FastAPI请求对象
        :param obj: 创建Sapper 知识库文本块参数
        :return:
        """
        async with async_db_session.begin() as db:

            text_block = await text_block_dao.create(db, obj)
            await db.flush()
            await db.refresh(text_block)

            embed_result = await content_embedding(obj.content)
            await embedding_dao.create(
                db=db,
                obj=CreateEmbeddingParam(
                    vector=embed_result['embed_result'][0]['text_embedding'],
                    text_block_id=text_block.id,
                )
            )

            await db.commit()
            return text_block


    @staticmethod
    async def update(*, request: Request, pk: int, obj: UpdateTextBlockParam) -> int:
        """
        更新Sapper 知识库文本块

        :param request: FastAPI请求对象
        :param pk: Sapper 知识库文本块 ID
        :param obj: 更新Sapper 知识库文本块参数
        :return:
        """
        async with async_db_session.begin() as db:
            text_block = await text_block_dao.get(db, pk)
            if not text_block:
                raise errors.NotFoundError(msg='Sapper 知识库文本块不存在')
            if obj.content is not None and obj.content != text_block.content and obj.content != "":
                embed_result = await content_embedding(obj.content)
                if text_block.embedding is not None and len(text_block.embedding) > 0:
                    await embedding_dao.update(
                        db=db,
                        pk=text_block.embedding[0].id,
                        obj=UpdateEmbeddingParam(
                            vector=embed_result['embed_result'][0]['text_embedding']
                        )
                    )
                else:
                    await embedding_dao.create(
                        db=db,
                        obj=CreateEmbeddingParam(
                            vector=embed_result['embed_result'][0]['text_embedding'],
                            text_block_id=text_block.id,
                        )
                    )

            count = await text_block_dao.update(db, pk, obj)
            return count

    @staticmethod
    async def delete(*, request: Request, obj: DeleteTextBlockParam) -> int:
        """
        批量删除Sapper 知识库文本块

        :param request: FastAPI请求对象
        :param obj: Sapper 知识库文本块 ID 列表
        :return:
        """
        async with async_db_session.begin() as db:
            fault_text_block_ids = []
            for text_block_id in obj.pks:
                text_block = await text_block_dao.get(db, text_block_id)
                if not text_block:
                    obj.pks.remove(text_block_id)

            count = await text_block_dao.delete(db, obj.pks)

            if len(fault_text_block_ids) != 0:
                raise errors.ForbiddenError(msg="您没有权限删除Sapper 知识库文本块" + ', '.join(fault_text_block_ids))
            return count


text_block_service: TextBlockService = TextBlockService()
