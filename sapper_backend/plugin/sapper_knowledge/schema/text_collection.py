#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from datetime import datetime

from pydantic import ConfigDict, model_validator
from common.enums import StatusType
from common.schema import SchemaBase
from pydantic import Field, HttpUrl
from typing import Optional, List
from plugin.sapper_knowledge.schema.text_block import GetTextBlockRunChain
from utils.serializers import select_as_dict


class TextCollectionSchemaBase(SchemaBase):
    """知识库集合基础模型"""
    name: Optional[str] = Field(default=None, description='知识库集合名')
    processing_method: Optional[str] = Field(default='markdown_chunking', description='处理方法')
    training_mode: Optional[str] = Field(default='direct_segment', description='训练形式')
    file_url: Optional[HttpUrl] = Field(default=None, description='知识库集合文件')
    status: Optional[int] = Field(default=StatusType.enable.value, description="知识库集合状态(0停用 1正常)")

class CreateTextCollectionParam(TextCollectionSchemaBase):
    """添加知识库集合参数"""
    knowledge_base_uuid: Optional[str] = Field(description="知识库UUID")
    knowledge_base_id: Optional[int] = Field(default=None, description="知识库ID")


class UpdateTextCollectionParam(TextCollectionSchemaBase):
    """更新知识库集合参数模型"""
    pass


class DeleteTextCollectionParam(SchemaBase):
    """删除知识库集合参数"""

    pks: list[int] = Field(description='知识库集合 ID 列表')


class GetTextCollectionList(TextCollectionSchemaBase):
    """知识库集合信息详情"""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(description='知识库集合 ID')
    created_time: datetime = Field(description='知识库集合创建时间')
    updated_time: Optional[datetime] = Field(None, description='知识库集合更新时间')


class GetTextCollectionDetail(GetTextCollectionList):
    """知识库集合信息详情"""
    pass


class GetTextCollectionWithRelationDetail(GetTextCollectionDetail):
    """知识库集合信息关联详情"""

    model_config = ConfigDict(from_attributes=True)
    pass


class GetTextCollectionRunChain(SchemaBase):
    model_config = ConfigDict(from_attributes=True)
    text_blocks: List[GetTextBlockRunChain] = Field(default_factory=list, description="文本块")
