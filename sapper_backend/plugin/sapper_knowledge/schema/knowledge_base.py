#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from datetime import datetime

from pydantic import ConfigDict, model_validator

from app.admin.schema.user import UserInfoSchemaBase
from common.enums import StatusType
from common.schema import SchemaBase
from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List

from plugin.sapper_knowledge.schema.text_collection import GetTextCollectionRunChain
from plugin.sapper_knowledge.schema.graph_collection import GetGraphCollectionRunChain


class KnowledgeBaseSchemaBase(SchemaBase):
    """知识库基础模型"""
    creator_id: int = Field(description='创建者 ID')
    name: str = Field(description='知识库名')
    embedding_model: Optional[str] = Field(default="/DMetaSoul/Dmeta-embedding", description='知识库嵌入模型')
    description: str = Field(description='简介')
    cover_image: Optional[HttpUrl] = Field(None, description='图像地址')
    status: int = Field(default=StatusType.enable.value, description="知识库状态(0停用 1正常)")
    type: int = Field(default=1, description="知识库类型(0智能体会话类型 1正常)")


class CreateKnowledgeBaseParam(KnowledgeBaseSchemaBase):
    """添加知识库参数"""
    creator_id: Optional[int] = Field(None, description='创建者 ID')


class UpdateKnowledgeBaseParam(BaseModel):
    """更新知识库参数模型"""
    name: Optional[str] = Field(None, description='知识库名')
    description: Optional[str] = Field(None, description='简介')
    cover_image: Optional[HttpUrl] = Field(None, description='图像地址')
    type: Optional[int] = Field(None, description="知识库类型(0智能体知识库 1普通知识库)")
    status: Optional[int] = Field(None,description="知识库状态(0停用 1正常)")


class DeleteKnowledgeBaseParam(SchemaBase):
    """删除知识库参数"""

    pks: list[int] = Field(description='知识库 ID 列表')


class GetKnowledgeBaseList(KnowledgeBaseSchemaBase):
    """知识库信息详情"""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(description='知识库 ID')
    uuid: str = Field(description='知识库 UUID')
    # text_collection_count: int = Field(default=0, description="文本集合数量")
    # graph_collection_count: int = Field(default=0, description="图谱集合数量")
    created_time: datetime = Field(description='知识库创建时间')
    updated_time: Optional[datetime] = Field(None, description='知识库更新时间')

    # @model_validator(mode='before')
    # def check_collection(cls, values):
    #     if isinstance(values, dict):
    #         # Pydantic v1 风格
    #         text_collections = values.get('text_collections')
    #         if text_collections is not None:
    #             values['text_collection_count'] = len(text_collections)
    #
    #         graph_collections = values.get('graph_collections')
    #         if graph_collections is not None:
    #             values['graph_collection_count'] = len(graph_collections)
    #     else:
    #         # Pydantic v2 风格或其他情况
    #         text_collections = getattr(values, 'text_collections', None)
    #         if text_collections is not None:
    #             values.text_collection_count = len(text_collections)
    #
    #         graph_collections = getattr(values, 'graph_collections', None)
    #         if graph_collections is not None:
    #             values.graph_collection_count = len(graph_collections)
    #
    #     return values

class GetKnowledgeBaseDetail(GetKnowledgeBaseList):
    """知识库信息详情"""
    pass

class GetKnowledgeBaseWithRelationDetail(GetKnowledgeBaseDetail):
    """知识库信息关联详情"""

    model_config = ConfigDict(from_attributes=True)

    creator: UserInfoSchemaBase = Field(description='创建者详情')


class GetKnowledgeBaseRunChain(SchemaBase):
    model_config = ConfigDict(from_attributes=True)

    name: str = Field(description='知识库名')
    embedding_model: Optional[str] = Field(default="/DMetaSoul/Dmeta-embedding", description='知识库嵌入模型')
    description: str = Field(description='简介')
    uuid: str = Field(description='知识库 UUID')
    graph_collections: List[GetGraphCollectionRunChain] = Field(default_factory=list, description="图谱知识集合")
    text_collections: List[GetTextCollectionRunChain] = Field(default_factory=list, description="文本知识集合")
