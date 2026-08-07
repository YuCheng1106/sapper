from typing import Optional

from pydantic import Field, model_validator, ConfigDict

from common.enums import IntEnum
from common.schema import SchemaBase


class GenerateSplFormParam(SchemaBase):
    requirement: str

class AgentType(IntEnum):
    """智能体类型枚举"""
    MANAGEMENT = 0  # 管理型
    FUNCTIONAL = 1  # 功能型


class GenerateSplChainParam(SchemaBase):
    spl_form: list
    agent_type: AgentType


class GetAgentRunChain(SchemaBase):
    model_config = ConfigDict(from_attributes=True)
    name: str | None = ""
    description: str | None = ""
    spl_chain: dict
    parameters: dict | list
    has_long_memory: Optional[bool] = Field(default=False, description="是否长期记忆")
    has_short_memory: Optional[bool] = Field(default=False, description="是否短期记忆")
    short_memory: Optional[dict] = Field(default={"chat_history": [], "parameters": []})
    long_memory: Optional[dict] = Field(default={"preference": "preference", "knowledge_collections": [], "APIs": []})
    type: Optional[int] = Field(default=AgentType.FUNCTIONAL.value, description="智能体类型(0管理型 1功能型)")
    suggestion: Optional[bool] = Field(default=False, description='是否生成建议')

    @model_validator(mode='before')
    def transform_agent(cls, values):
        parameters = []
        for param_id, param_value in values["parameters"].items():
            parameters.append(
                {"uuid": param_id, "type": param_value.get("value_type", 'string'), "placeholder": f"${{{param_id}}}$",
                 "description": "des", "value": param_value.get("content", "")})
        values["parameters"] = parameters

        return values
