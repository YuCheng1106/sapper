#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from datetime import datetime

from pydantic import ConfigDict

from common.schema import SchemaBase
from pydantic import Field
from typing import Optional



class EmbeddingSchemaBase(SchemaBase):
    """文本向量基础模型"""
    vector: Optional[list] = Field(description='文本向量')

class CreateEmbeddingParam(EmbeddingSchemaBase):
    """添加文本向量参数"""
    text_block_id: Optional[int] = Field(None, description='文本块 ID')


class UpdateEmbeddingParam(EmbeddingSchemaBase):
    """更新文本向量参数模型"""
    pass


class DeleteEmbeddingParam(SchemaBase):
    """删除文本向量参数"""

    pks: list[int] = Field(description='文本向量 ID 列表')


class GetEmbeddingDetail(EmbeddingSchemaBase):
    """文本向量信息详情"""

    model_config = ConfigDict(from_attributes=True)

    id: int = Field(description='文本向量 ID')
    created_time: datetime = Field(description='文本向量创建时间')
    updated_time: Optional[datetime] = Field(None, description='文本向量更新时间')


class GetEmbeddingWithRelationDetail(GetEmbeddingDetail):
    """文本向量信息关联详情"""

    model_config = ConfigDict(from_attributes=True)
    pass


class GetCurrentUserInfoWithRelationDetail(GetEmbeddingWithRelationDetail):
    """当前文本向量信息关联详情"""

    model_config = ConfigDict(from_attributes=True)

