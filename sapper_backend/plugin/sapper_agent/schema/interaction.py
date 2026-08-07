#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from datetime import datetime

from pydantic import ConfigDict
from common.schema import SchemaBase
from pydantic import BaseModel, Field
from typing import Optional

class InteractionSchemaBase(SchemaBase):
    """用户智能体连接基础模型"""
    user_id: int = Field(description='用户 ID')
    agent_id: int = Field(description='智能体 ID')
    rating_value: float = Field(description='智能体评分')
    is_favorite: bool = Field(description='是否收藏智能体')
    usage_count: int= Field(description='智能体使用次数')


class CreateInteractionParam(SchemaBase):
    """添加用户智能体连接参数"""
    user_id: Optional[int] = Field(default=None, description='用户 ID')
    agent_id: Optional[int] = Field(default=None, description='智能体 ID')
    rating_value: Optional[float] = Field(default=0.0, description='智能体评分')
    is_favorite: Optional[bool] = Field(default=False, description='是否收藏智能体')
    usage_count: Optional[int] = Field(default=0, description='智能体使用次数')


class UpdateInteractionParam(BaseModel):
    """更新用户智能体连接参数模型"""
    rating_value: Optional[float] = Field(default=None, description='智能体评分')
    is_favorite: Optional[bool] = Field(default=None, description='是否收藏智能体')
    usage_count: Optional[int] = Field(default=None, description='智能体使用次数')


class DeleteInteractionParam(SchemaBase):
    """删除用户智能体连接参数"""
    pks: list[int] = Field(description='用户智能体连接 ID 列表')


class GetInteractionDetail(InteractionSchemaBase):
    """用户智能体连接信息详情"""

    model_config = ConfigDict(from_attributes=True)
    id: int = Field(description='用户智能体连接 ID')
    created_time: datetime
    updated_time: Optional[datetime] = None


class GetInteractionWithRelationDetail(GetInteractionDetail):
    """用户智能体连接信息关联详情"""

    model_config = ConfigDict(from_attributes=True)


class GetCurrentUserInfoWithRelationDetail(GetInteractionWithRelationDetail):
    """当前用户智能体连接信息关联详情"""

    model_config = ConfigDict(from_attributes=True)
