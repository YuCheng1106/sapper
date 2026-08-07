#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from datetime import datetime

from pydantic import ConfigDict
from common.enums import StatusType
from common.schema import SchemaBase
from pydantic import BaseModel, Field
from typing import Optional, List
from enum import IntEnum

class ConversationType(IntEnum):
    """会话类型枚举"""
    SIMULATOR = 0      # 模拟器会话
    NORMAL = 1         # 正常会话


class ConversationSchemaBase(SchemaBase):
    """会话基础模型"""
    creator_id: int = Field(description='创建者 ID')
    agent_id: int = Field(description='智能体 UUID')
    knowledge_base_id: int = Field(description='知识库 ID')
    name: str = Field(description='会话名')
    remark: str = Field(description='备注')
    type: int = Field(description="会话类型(0模拟会话 1正常会话)")
    status: int = Field(default=StatusType.enable.value)


class CreateConversationParam(ConversationSchemaBase):
    """添加会话参数"""
    creator_id: Optional[int] = Field(None, description='创建者 ID')
    agent_uuid: Optional[str] = Field(default=None, description='智能体 UUID')
    agent_id: Optional[int] = Field(None, description='创建者 ID')
    name: Optional[str] = Field(default=None, description='会话名')
    knowledge_base_id: Optional[int] = Field(None, description='知识库 ID')
    remark: Optional[str] = Field(None, description='备注')
    type: Optional[int] = Field(default=ConversationType.NORMAL.value, description="会话类型(0模拟会话 1正常会话)")
    status: Optional[int] = Field(default=StatusType.enable.value)

class UpdateConversationParam(BaseModel):
    """更新会话参数模型"""
    model_config = ConfigDict(from_attributes=True)
    name: Optional[str] = Field(default=None, description='会话名')
    remark: Optional[str] = Field(default=None, description='备注')
    type: Optional[int] = Field(default=None, description="会话类型(0模拟会话 1正常会话)")
    status: Optional[int] = Field(default=None)
    chat_parameters: Optional[dict] = Field(default=None, description='智能体聊天参数')
    chat_history: Optional[List[dict]] = Field(default=None, description='聊天记录')
    short_memory: Optional[str] = Field(default=None, description='短期记忆')
    long_memory: Optional[str] = Field(default=None, description='长期记忆')

class DeleteConversationParam(SchemaBase):
    """删除会话参数"""

    pks: list[int] = Field(description='会话 ID 列表')


class GetConversationList(ConversationSchemaBase):
    """会话信息详情"""

    model_config = ConfigDict(from_attributes=True)
    id: int = Field(description='会话 ID')
    uuid: str = Field(description='会话 UUID')
    created_time: datetime
    updated_time: Optional[datetime] = None


class GetConversationDetail(GetConversationList):
    """会话信息详情"""

    model_config = ConfigDict(from_attributes=True)
    chat_parameters: dict = Field(description='智能体聊天参数')
    chat_history: List[dict] = Field(description='聊天记录')
    short_memory: str = Field(description='短期记忆')
    long_memory: str = Field(description='长期记忆')


class GetConversationWithRelationDetail(GetConversationDetail):
    """会话信息关联详情"""

    model_config = ConfigDict(from_attributes=True)


class GetConversationRunChain(SchemaBase):
    """当前智能体信息关联详情"""
    model_config = ConfigDict(from_attributes=True)
    chat_parameters: Optional[dict] = Field(default={}, description='智能体聊天参数')
    chat_history: Optional[List[dict]] = Field(default=[], description='聊天记录')