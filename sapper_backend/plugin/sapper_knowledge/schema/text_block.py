#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from datetime import datetime

from pydantic import ConfigDict, model_validator
from common.schema import SchemaBase
from pydantic import Field
from typing import Optional



class TextBlockSchemaBase(SchemaBase):
    """文本块基础模型"""
    content: str


class CreateTextBlockParam(TextBlockSchemaBase):
    """添加文本块参数"""
    text_collection_id: Optional[int] = Field(None, description='知识库集合 ID')


class UpdateTextBlockParam(TextBlockSchemaBase):
    """更新文本块参数模型"""
    pass


class DeleteTextBlockParam(SchemaBase):
    """删除文本块参数"""

    pks: list[int] = Field(description='文本块 ID 列表')

class GetTextBlockList(TextBlockSchemaBase):
    """文本块信息详情"""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(description='文本块 ID')
    created_time: datetime = Field(description='文本块创建时间')
    updated_time: Optional[datetime] = Field(None, description='文本块更新时间')

class GetTextBlockDetail(GetTextBlockList):
    """文本块信息详情"""
    pass

class GetTextBlockWithRelationDetail(GetTextBlockDetail):
    """文本块信息关联详情"""

    model_config = ConfigDict(from_attributes=True)
    pass

class GetTextBlockRunChain(SchemaBase):
    model_config = ConfigDict(from_attributes=True)
    content: str = Field(default_factory=list, description="文本内容")
    vector: list = Field(default_factory=list, description="文本向量")
    similarity: float = Field(default=0.0, description="相似性得分")

    @model_validator(mode='before')
    def transform_embedding(cls, values):
        if isinstance(values, dict):
            if values.get('embedding', None) is not None:
                embedding = values.get('embedding', [])
                if len(embedding) > 0:
                    values["vector"] = embedding[0].vector
        else:
            if values.embedding is not None:
                embedding = values.embedding
                if len(embedding) > 0:
                    values.vector = embedding[0].vector

        return values

