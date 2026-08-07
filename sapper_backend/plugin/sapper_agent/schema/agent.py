#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json
from datetime import datetime
from statistics import mean

from pydantic import ConfigDict, model_validator

from app.admin.schema.user import UserInfoSchemaBase
from common.enums import StatusType
from common.schema import SchemaBase
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from enum import IntEnum

from plugin.sapper_agent.schema.interaction import GetInteractionDetail
from plugin.sapper_agent.schema.conversation import GetConversationDetail
from plugin.sapper_knowledge.schema import GetKnowledgeBaseList
from plugin.sapper_plugin.schema import GetPluginDetail
from plugin.sapper_publish.schema import GetAgentPublicationDetail


class AgentType(IntEnum):
    """智能体类型枚举"""
    MANAGEMENT = 0  # 管理型
    FUNCTIONAL = 1  # 功能型


class AgentStatus(IntEnum):
    """智能体状态枚举"""
    DISABLED = 0  # 停用
    ACTIVE = 1  # 正常
    MARKET = 2  # 发布市场


class AgentSchemaBase(SchemaBase):
    """智能体基础模型"""
    creator_id: int = Field(None, description='创建者 ID')
    name: str = Field(description='智能体名')
    description: str = Field(description='简介')
    capability: str = Field(description='能力')
    cover_image: Optional[str] = Field(None, description='图像地址')
    type: int = Field(description="智能体类型(0管理型 1功能型)")
    status: int = Field(default=StatusType.enable.value)


class CreateAgentParam(AgentSchemaBase):
    """创建智能体的请求参数"""
    name: str = Field(description='智能体名')
    capability: str = Field(description='智能体能力')
    creator_id: Optional[int] = Field(None, description='创建者 ID')
    parameters: Optional[Dict] = Field(default=None, description='参数配置')
    description: Optional[str] = Field("新智能体", description='智能体简介')
    cover_image: Optional[str] = Field(None, description='图像地址')
    type: Optional[int] = Field(default=AgentType.FUNCTIONAL.value, description="智能体类型(0管理型 1功能型)")
    status: Optional[int] = Field(default=StatusType.enable.value)

class RunAgentParam(SchemaBase):
    """运行智能体的请求参数"""
    query: list | str
    conversation_uuid: Optional[str] = Field(None, description='聊天会话UUID')

    @model_validator(mode='before')
    def check(cls, values):
        if type(values) == list or type(values) == dict:
            message = values.get('query')
            if message is not None and type(message) == str:
                values['query'] = [{'type': 'text', 'content': message}]
            return values
        if type(values) == str or type(values) == bytes:
            try:
                return json.loads(values)
            except json.decoder.JSONDecodeError:
                pass
        if isinstance(values.get("query"), str):
            values['query'] = [{'type': 'text', 'content': values['query']}]
        return values

class GenerateSPLFormParam(SchemaBase):
    """创建智能体的请求参数"""
    agent_uuid: str = Field(description='智能体UUID')

class UpdateAgentParam(BaseModel):
    """更新智能体参数模型"""
    name: Optional[str] = Field(default=None, min_length=1, max_length=32, description='智能体名称(1-32个字符)')
    description: Optional[str] = Field(default=None, max_length=500,description='智能体描述(最多500字符)')
    cover_image: Optional[str] = Field(default=None, description='封面图片URL')
    type: Optional[int] = Field(default=None, description='智能体类型')
    status: Optional[int] = Field(default=None, description='智能体状态')
    has_long_memory: Optional[bool] = Field(default=False, description='长期记忆(0关闭 1开启)')
    has_short_memory: Optional[bool] = Field(default=False, description='短期记忆(0关闭 1开启)')
    suggestion: Optional[bool] = Field(default=None, description='是否生成建议')
    output_chaining: Optional[bool] = Field(default=None, description='是否展示思维链')
    welcome_info: Optional[str] = Field(default=None, max_length=1000,description='欢迎信息(最多1000字符)')
    tags: Optional[List[str]] = Field(default=None, description='标签列表(最多20个标签)')
    sample_query: Optional[List] = Field(default=None, description='示例查询列表')
    spl: Optional[str] = Field(default=None, description='SPL定义')
    spl_form: Optional[List[Dict]] = Field(default=None, description='SPL表单结构')
    spl_chain: Optional[Dict] = Field(default=None, description='SPL链结构')
    parameters: Optional[Dict] = Field(default=None, description='参数配置')
    plugin_uuids: Optional[List[str]] = Field(default=None, description='关联的插件 ID')
    knowledge_base_uuids: Optional[List[str]] = Field(default=None, description='关联的知识库 ID')

class DeleteAgentParam(SchemaBase):
    """删除智能体参数"""
    pks: list[int] = Field(description='智能体 ID 列表')


class GetAgentList(AgentSchemaBase):
    """智能体列表信息详情"""
    model_config = ConfigDict(from_attributes=True)
    id: int = Field(description='智能体 ID')
    uuid: str = Field(description='智能体 UUID')
    has_long_memory: Optional[bool] = Field(default=False, description='长期记忆(0关闭 1开启)')
    has_short_memory: Optional[bool] = Field(default=False, description='短期记忆(0关闭 1开启)')
    suggestion: bool = Field(None, description='是否生成建议')
    output_chaining: bool = Field(None, description='是否展示思维链')
    welcome_info: str = Field(None, max_length=1000, description='欢迎信息(最多1000字符)')
    tags: List[str] = Field(None, description='标签列表(最多20个标签)')
    sample_query: List = Field(None, description='示例查询列表')
    creator: UserInfoSchemaBase | None = None
    interactions: List[GetInteractionDetail] = Field(default_factory=list)
    user_interaction: GetInteractionDetail | None = Field(default=None)
    total_rating: Optional[float] = Field(None, description="所有用户的平均评分")
    rating_count: int = Field(0, description="所有评分次数")
    total_favorites: int = Field(0, description="总收藏次数")
    total_usage: int = Field(0, description="总使用次数")
    unique_users: int = Field(0, description="使用过的独立用户数")
    created_time: datetime
    updated_time: Optional[datetime] = None

    @model_validator(mode='after')
    def calculate_stats(self):
        # 计算所有用户的交互数据
        user_interaction = None
        if self.interactions:
            # 查找当前用户的交互记录
            if self.creator is not None:
                for interaction in self.interactions:
                    print(self.creator.id, interaction.user_id)
                    if interaction.user_id == self.creator.id:
                        user_interaction = interaction
                        break

            # 总使用次数
            self.total_usage = sum(i.usage_count for i in self.interactions)

            # 总收藏次数
            self.total_favorites = sum(1 for i in self.interactions if i.is_favorite)

            # 平均评分（排除未评分的记录）
            ratings = [i.rating_value for i in self.interactions if i.rating_value is not None]
            self.total_rating = mean(ratings) if ratings else None
            self.rating_count = len(ratings) if ratings else 0

            # 独立用户数
            self.unique_users = len({i.user_id for i in self.interactions})

            # 设置用户特定的字段
            if user_interaction is not None:
                self.user_interaction = user_interaction

        # 清空所有交互数据
        self.interactions = []

        return self



class GetAgentDetail(GetAgentList):
    """智能体信息详情"""

    model_config = ConfigDict(from_attributes=True)
    spl: str = Field(None, description='SPL定义')
    spl_form: List = Field(None, description='SPL表单结构')
    spl_chain: Dict = Field(None, description='SPL链结构')
    parameters: Dict = Field(None, description='参数配置')
    created_time: datetime
    updated_time: Optional[datetime] = None


class GetAgentWithRelationDetail(GetAgentDetail):
    """智能体信息关联详情"""

    model_config = ConfigDict(from_attributes=True)
    operator_id: Optional[int] = Field(None, description='<UNK> ID')
    creator: UserInfoSchemaBase = Field(description='创建者详情')
    plugins: List[GetPluginDetail] = Field([], description='关联的插件')
    knowledge_bases: List[GetKnowledgeBaseList] = Field([], description='关联的知识库')
    conversations: List[GetConversationDetail] = Field([], description='关联的会话')
    publications: List[GetAgentPublicationDetail] = Field([], description='关联的发布')
    emulator_conversation: Optional[GetConversationDetail] = Field(None, description='')

    @model_validator(mode='after')
    def process_conversation(self):
        # 处理当前用户的会话
        if self.conversations and self.emulator_conversation is None:
            self.emulator_conversation = next(
                (conv for conv in reversed(self.conversations) if conv.type == 0),
                None
            )
            self.conversations = [
                conv for conv in self.conversations
                if conv.type != 0
            ]

        return self


class GetAgentRunChain(SchemaBase):
    """当前智能体信息关联详情"""
    model_config = ConfigDict(from_attributes=True)
    name: str = Field(description='智能体名')
    description: str = Field(description='简介')
    parameters: Optional[Dict] = Field(default=None, description='参数配置')
    spl_chain: Dict = Field(None, description='SPL链结构')
    type: Optional[int] = Field(default=AgentType.FUNCTIONAL.value, description="智能体类型(0管理型 1功能型)")
    suggestion: Optional[bool] = Field(default=False, description='是否生成建议')
    has_long_memory: Optional[bool] = Field(default=False, description='长期记忆(0关闭 1开启)')
    has_short_memory: Optional[bool] = Field(default=False, description='短期记忆(0关闭 1开启)')
