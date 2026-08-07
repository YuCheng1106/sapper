
from typing import Dict, Optional

from pydantic import Field, ConfigDict

from common.schema import SchemaBase


# 基础的 AgentPublication 信息结构
class AgentPublicationSchemaBase(SchemaBase):
    model_config = ConfigDict(from_attributes=True)
    agent_id: int = Field(description='智能体 ID')
    channel_id: int = Field(description='发布渠道 ID')
    published_by: int = Field(description='发布者 ID')
    publish_config: Optional[Dict] = Field(default_factory=dict, description="发布配置参数")


class PublicationItem(SchemaBase):
    channel_id: int = Field(description='发布渠道 ID')
    publish_config: Optional[Dict] = Field(default_factory=dict, description="发布配置参数")


# 创建 AgentPublication 参数
class CreateAgentPublicationParam(SchemaBase):
    agent_uuid: str = Field(description='智能体 UUID')
    published_by: Optional[int] = Field(default=None, description='发布者 ID')
    channels: list[PublicationItem]


# 创建 AgentPublication 参数
class AddAgentPublication(AgentPublicationSchemaBase):
    pass


# 更新 AgentPublication 参数
class UpdateAgentPublicationParam(AgentPublicationSchemaBase):
    publish_config: Optional[Dict] = Field(default=None, description="发布配置参数")


# AgentPublication 列表信息结构
class GetAgentPublicationList(AgentPublicationSchemaBase):
    id: int = Field(description='发布者 ID')

# AgentPublication 详情信息结构
class GetAgentPublicationDetail(GetAgentPublicationList):
    pass

class GetAgentPublicationWithRelationDetail(GetAgentPublicationDetail):
    """知识库信息关联详情"""
    model_config = ConfigDict(from_attributes=True)

class DeleteAgentPublishParam(SchemaBase):
    pks: list[int]