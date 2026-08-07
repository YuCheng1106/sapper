#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from typing import Sequence
from fastapi import Request
from sqlalchemy import Select
from urllib.parse import unquote, urlparse
from common.exception import errors
from database.db import async_db_session
from database.redis import redis_client
from plugin.sapper_knowledge.crud import text_collection_dao, knowledge_base_dao, text_block_dao, embedding_dao
from plugin.sapper_knowledge.model import TextCollection
from plugin.sapper_knowledge.schema import DeleteTextCollectionParam, UpdateTextCollectionParam, \
    CreateTextCollectionParam, CreateTextBlockParam, CreateEmbeddingParam
from plugin.sapper_knowledge.utils.sapper_rag import file_embedding, file_chunk


class TextCollectionService:
    """Sapper 知识库服务类"""

    @staticmethod
    async def get(*, request: Request, pk: int) -> TextCollection:
        """
        获取Sapper 知识库

        :param request: FastAPI请求对象
        :param pk: Sapper 知识库 ID
        :return:
        """
        async with async_db_session() as db:
            text_collection = await text_collection_dao.get(db, pk)

            if not text_collection:
                raise errors.NotFoundError(msg='Sapper 知识库不存在')
            knowledge_base = await knowledge_base_dao.get(db, text_collection.knowledge_base_id)
            if not request.user.is_superuser and request.user.id != knowledge_base.creator_id:
                raise errors.ForbiddenError(msg="您没有权限查看该Sapper 知识库")

            return text_collection

    @staticmethod
    async def get_select(*, request: Request, knowledge_base_uuid: str, name: str, status: int) -> Select:
        """
        获取Sapper 知识库列表查询条件

        :param request: FastAPI请求对象
        :param knowledge_base_uuid: Sapper 知识库UUID
        :param name: Sapper 知识库名称
        :param status: Sapper 知识库状态
        :return:
        """
        async with async_db_session() as db:
            knowledge_base = await knowledge_base_dao.get_by_uuid(db, knowledge_base_uuid)

        if knowledge_base is None:
            raise errors.NotFoundError(msg = "该知识库不存在")

        if not request.user.is_superuser and request.user.id != knowledge_base.creator_id:
            raise errors.ForbiddenError(msg="您没有权限获得该知识库详情")

        return await text_collection_dao.get_list(knowledge_base_id= knowledge_base.id, name=name, status=status)

    @staticmethod
    async def get_all(*, request: Request) -> Sequence[TextCollection]:
        """
        获取所有Sapper 知识库

        :param request: FastAPI请求对象
        """

        async with async_db_session() as db:
            if not request.user.is_superuser:
                raise errors.ForbiddenError(msg="您没有权限获得所有Sapper 知识库")
            text_collections = await text_collection_dao.get_all(db)
            return text_collections

    @staticmethod
    async def create(*, request: Request, obj: CreateTextCollectionParam) -> TextCollection:
        """
        创建Sapper 知识库

        :param request: FastAPI请求对象
        :param obj: 创建Sapper 知识库参数
        :return:
        """
        async with async_db_session.begin() as db:
            knowledge_base = await knowledge_base_dao.get_by_uuid(db=db, uuid=obj.knowledge_base_uuid)
            if knowledge_base is None:
                raise errors.NotFoundError(msg="该知识库不存在")
            if not request.user.is_superuser and knowledge_base.creator_id != request.user.id:
                raise errors.ForbiddenError(msg="您没有权限为该知识库添加文件")

            if obj.name is None and obj.file_url is not None:
                url_str = str(obj.file_url)
                # 解析URL并提取文件名部分
                filename = urlparse(url_str).path.split('/')[-1]
                # 对URL编码的文件名进行解码
                obj.name = unquote(filename).split('?')[0]

            obj.knowledge_base_id = knowledge_base.id
            del obj.knowledge_base_uuid
            return await text_collection_dao.create(db, obj)

    @staticmethod
    async def collection_chunk(file_url) -> list:
        """
        创建 Sapper 知识库集合

        :param file_url: 文件路由
        :return:
        """
        chunk_result = await file_chunk(file_url)
        return chunk_result.get("chunk_result", [])

    @staticmethod
    async def collection_embedding(user_id, text_collection_id, file_url) -> None:
        """
        创建 Sapper 知识库集合

        :param user_id: 用户 ID
        :param text_collection_id: 知识库集合 ID
        :param file_url: 文件路由
        :return:
        """
        async with async_db_session.begin() as db:
            embed_result = await file_embedding(file_url)
            if embed_result.get("embed_error", None) is not None:
                await text_collection_dao.update(
                    db=db,
                    pk=text_collection_id,
                    obj=UpdateTextCollectionParam(
                        status=3
                    )
                )
                await redis_client.delete_prefix(f"sapper:text_collection:list:user={user_id}")
                await db.commit()
            else:
                for embed in embed_result.get('embed_result', []):
                    text_block_data = await text_block_dao.create(
                        db,
                        obj=CreateTextBlockParam(
                            text_collection_id=text_collection_id,
                            content=embed.get('text', '')
                        )
                    )
                    await db.flush()
                    await db.flush(text_block_data)
                    await embedding_dao.create(
                        db,
                        obj=CreateEmbeddingParam(
                            vector=embed.get('text_embedding', []),
                            text_block_id=text_block_data.id
                        )
                    )

                await text_collection_dao.update(
                    db=db,
                    pk=text_collection_id,
                    obj=UpdateTextCollectionParam(status=1)
                )
                await redis_client.delete_prefix(f"sapper:text_collection:list:user={user_id}")
                await db.commit()

    @staticmethod
    async def update(*, request: Request, pk: int, obj: UpdateTextCollectionParam) -> int:
        """
        更新Sapper 知识库

        :param request: FastAPI请求对象
        :param pk: Sapper 知识库 ID
        :param obj: 更新Sapper 知识库参数
        :return:
        """
        async with async_db_session.begin() as db:
            text_collection = await text_collection_dao.get(db, pk)
            if not text_collection:
                raise errors.NotFoundError(msg='Sapper 知识库不存在')

            knowledge_base = await knowledge_base_dao.get(db, text_collection.id)
            if knowledge_base is None:
                raise errors.NotFoundError(msg="该知识库不存在")

            if not request.user.is_superuser and request.user.id != knowledge_base.creator_id:
                raise errors.ForbiddenError(msg="您没有权限获得该知识库详情")
            count = await text_collection_dao.update(db, pk, obj)
            return count

    @staticmethod
    async def delete(*, request: Request, obj: DeleteTextCollectionParam) -> int:
        """
        批量删除Sapper 知识库

        :param request: FastAPI请求对象
        :param obj: Sapper 知识库 ID 列表
        :return:
        """
        async with async_db_session.begin() as db:
            fault_text_collection_ids = []
            for text_collection_id in obj.pks:
                text_collection = await text_collection_dao.get(db, text_collection_id)
                if text_collection is not None:
                    knowledge_base = await knowledge_base_dao.get(db, text_collection.id)
                    if knowledge_base is None:
                        raise errors.NotFoundError(msg="该知识库不存在")
                    if not request.user.is_superuser and request.user.id != knowledge_base.creator_id:
                        raise errors.ForbiddenError(msg="您没有权限获得该知识库详情")

                    # obj.pks.remove(text_collection_id)
                    # fault_text_collection_ids.append(text_collection.name if text_collection else text_collection_id)

            count = await text_collection_dao.delete(db, obj.pks)

            if len(fault_text_collection_ids) != 0:
                raise errors.ForbiddenError(msg="您没有权限删除Sapper 知识库" + ', '.join(fault_text_collection_ids))
            return count


text_collection_service: TextCollectionService = TextCollectionService()
