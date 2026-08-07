from pydantic import Field

from common.enums import StatusType
from common.schema import SchemaBase

class LlmProviderConfigBase(SchemaBase):
    provider_id: int = Field(description="模型供应商ID")
    user_id: int = Field(description="用户Id")
    api_key: str = Field(max_length=255, description="API密钥")

class LlmModelConfigBase(SchemaBase):
    model_id: int = Field(description="模型ID")
    user_id: int = Field(description="用户Id")
    model_status: int = Field(default=StatusType.enable.value, description="状态(0停用 1正常)")
