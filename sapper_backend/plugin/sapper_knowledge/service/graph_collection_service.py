#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json
from typing import Sequence

import httpx
from fastapi import Request
from sqlalchemy import Select
from urllib.parse import unquote, urlparse
from common.exception import errors
from database.db import async_db_session
from plugin.sapper_knowledge.crud import graph_collection_dao, knowledge_base_dao, text_block_dao, embedding_dao
from plugin.sapper_knowledge.model import GraphCollection
from plugin.sapper_knowledge.schema import DeleteGraphCollectionParam, UpdateGraphCollectionParam, \
    CreateGraphCollectionParam, CreateTextBlockParam, CreateEmbeddingParam
from plugin.sapper_knowledge.utils.sapper_rag import file_embedding


class GraphCollectionService:
    """Sapper 知识库服务类"""

    @staticmethod
    async def get(*, request: Request, pk: int) -> GraphCollection:
        """
        获取Sapper 知识库

        :param request: FastAPI请求对象
        :param pk: Sapper 知识库 ID
        :return:
        """
        async with async_db_session() as db:
            graph_collection = await graph_collection_dao.get(db, pk)

            if not graph_collection:
                raise errors.NotFoundError(msg='Sapper 知识库不存在')
            knowledge_base = await knowledge_base_dao.get(db, graph_collection.id)
            if not request.user.is_superuser and request.user.id != knowledge_base.creator_id:
                raise errors.ForbiddenError(msg="您没有权限查看该Sapper 知识库")

            return graph_collection

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

        return await graph_collection_dao.get_list(knowledge_base_id= knowledge_base.id, name=name, status=status)

    @staticmethod
    async def get_all(*, request: Request) -> Sequence[GraphCollection]:
        """
        获取所有Sapper 知识库

        :param request: FastAPI请求对象
        """

        async with async_db_session() as db:
            if not request.user.is_superuser:
                raise errors.ForbiddenError(msg="您没有权限获得所有Sapper 知识库")
            graph_collections = await graph_collection_dao.get_all(db)
            return graph_collections

    @staticmethod
    async def create(*, request: Request, obj: CreateGraphCollectionParam) -> GraphCollection:
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

            file_url = obj.file_url
            if file_url is not None:
                try:
                    # 使用 httpx 或 aiohttp 获取网络资源
                    async with httpx.AsyncClient() as client:
                        response = await client.get(str(file_url))
                        response.raise_for_status()  # 如果状态码不是200，抛出异常

                        # 解析 JSON 数据
                        json_data = response.json()

                    # 确保 JSON 数据是一个字典，并且包含所需的字段
                    if isinstance(json_data, dict):
                        # 直接获取字段，不需要再次 json.loads()
                        entities = json_data.get('entities', [])
                        relationships = json_data.get('relationships', [])
                        communities = json_data.get('communities', [])

                        # 如果字段是字符串形式的JSON，需要解析
                        if isinstance(entities, str):
                            entities = json.loads(entities)
                        if isinstance(relationships, str):
                            relationships = json.loads(relationships)
                        if isinstance(communities, str):
                            communities = json.loads(communities)

                        obj.entities = entities
                        obj.relationships = relationships
                        obj.communities = communities

                except httpx.HTTPError as e:
                    raise errors.RequestError(msg=f"Failed to fetch remote file: {str(e)}")
                except json.JSONDecodeError as e:
                    raise errors.RequestError(msg=f"Invalid JSON format: {str(e)}")
                except Exception as e:
                    raise errors.RequestError(msg=f"Failed to process JSON file: {str(e)}")

            obj.knowledge_base_id = knowledge_base.id
            del obj.knowledge_base_uuid

            return await graph_collection_dao.create(db, obj)

    @staticmethod
    async def update(*, request: Request, pk: int, obj: UpdateGraphCollectionParam) -> int:
        """
        更新Sapper 知识库

        :param request: FastAPI请求对象
        :param pk: Sapper 知识库 ID
        :param obj: 更新Sapper 知识库参数
        :return:
        """
        async with async_db_session.begin() as db:
            graph_collection = await graph_collection_dao.get(db, pk)
            if not graph_collection:
                raise errors.NotFoundError(msg='Sapper 知识库不存在')

            knowledge_base = await knowledge_base_dao.get(db, graph_collection.id)
            if knowledge_base is None:
                raise errors.NotFoundError(msg="该知识库不存在")

            if not request.user.is_superuser and request.user.id != knowledge_base.creator_id:
                raise errors.ForbiddenError(msg="您没有权限获得该知识库详情")
            count = await graph_collection_dao.update(db, pk, obj)
            return count

    @staticmethod
    async def delete(*, request: Request, obj: DeleteGraphCollectionParam) -> int:
        """
        批量删除Sapper 知识库

        :param request: FastAPI请求对象
        :param obj: Sapper 知识库 ID 列表
        :return:
        """
        async with async_db_session.begin() as db:
            fault_graph_collection_ids = []
            for graph_collection_id in obj.pks:
                graph_collection = await graph_collection_dao.get(db, graph_collection_id)
                if graph_collection is not None:
                    knowledge_base = await knowledge_base_dao.get(db, graph_collection.knowledge_base_id)
                    if knowledge_base is None:
                        raise errors.NotFoundError(msg="该知识库不存在")
                    if not request.user.is_superuser and request.user.id != knowledge_base.creator_id:
                        raise errors.ForbiddenError(msg="您没有权限删除该知识库内集合")

                    # obj.pks.remove(graph_collection_id)
                    # fault_graph_collection_ids.append(graph_collection.name if graph_collection else graph_collection_id)

            count = await graph_collection_dao.delete(db, obj.pks)

            if len(fault_graph_collection_ids) != 0:
                raise errors.ForbiddenError(msg="您没有权限删除Sapper 知识库" + ', '.join(fault_graph_collection_ids))
            return count


graph_collection_service: GraphCollectionService = GraphCollectionService()
