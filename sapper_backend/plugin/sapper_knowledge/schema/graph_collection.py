#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from datetime import datetime

from pydantic import ConfigDict

from app.admin.schema.user import UserInfoSchemaBase
from common.enums import StatusType
from common.schema import SchemaBase
from pydantic import BaseModel, Field, HttpUrl
from typing import Optional
from enum import IntEnum



class GraphCollectionSchemaBase(SchemaBase):
    """知识库集合基础模型"""
    name: Optional[str] = Field(description='知识库集合名')
    file_url: Optional[HttpUrl] = Field(None, description='知识库集合文件')
    status: Optional[int] = Field(default=StatusType.enable.value, description="知识库集合状态(0停用 1正常)")

class CreateGraphCollectionParam(GraphCollectionSchemaBase):
    """添加知识库集合参数"""
    knowledge_base_uuid: Optional[str] = Field(description="知识库UUID")
    knowledge_base_id: Optional[int] = Field(default=None, description="知识库ID")
    entities: Optional[list] = Field(default_factory=list, description='知识库集合实体')
    relationships: Optional[list] = Field(default_factory=list, description='知识库集合关系')
    communities: Optional[list] = Field(default_factory=list, description='知识库集合社区')


class UpdateGraphCollectionParam(GraphCollectionSchemaBase):
    """更新知识库集合参数模型"""
    pass


class DeleteGraphCollectionParam(SchemaBase):
    """删除知识库集合参数"""
    pks: list[int] = Field(description='知识库集合 ID 列表')

class GetGraphCollectionList(GraphCollectionSchemaBase):
    """知识库集合信息详情"""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(description='知识库集合 ID')
    knowledge_base_id: Optional[int] = Field(description='知识库ID')
    entities: Optional[list] = Field(default_factory=list, description='知识库集合实体')
    relationships: Optional[list] = Field(default_factory=list, description='知识库集合关系')
    communities: Optional[list] = Field(default_factory=list, description='知识库集合社区')
    created_time: datetime = Field(description='知识库集合创建时间')
    updated_time: Optional[datetime] = Field(None, description='知识库集合更新时间')


class GetGraphCollectionDetail(GetGraphCollectionList):
    """知识库集合信息详情"""
    pass


class GetGraphCollectionWithRelationDetail(GetGraphCollectionDetail):
    """知识库集合信息关联详情"""

    model_config = ConfigDict(from_attributes=True)
    pass


class GetGraphCollectionRunChain(SchemaBase):
    model_config = ConfigDict(from_attributes=True)
    entities: Optional[list] = Field(default_factory=list, description='知识库集合实体')
    relationships: Optional[list] = Field(default_factory=list, description='知识库集合关系')
    communities: Optional[list] = Field(default_factory=list, description='知识库集合社区')


