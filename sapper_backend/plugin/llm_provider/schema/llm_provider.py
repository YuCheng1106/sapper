from datetime import datetime
from typing import Optional, List
from pydantic import Field, ConfigDict, model_validator
from pydantic_core.core_schema import ValidationInfo

from common.schema import SchemaBase
from plugin.llm_provider.schema.llm_config import LlmProviderConfigBase
from plugin.llm_provider.schema.llm_model import GetLlmModelList

class LlmProviderSchemaBase(SchemaBase):
    name: str = Field(..., max_length=255, description="提供商名称")
    api_key: Optional[str] = Field('', description="API密钥")
    api_url: Optional[str] = Field('', max_length=512, description="API地址")
    document_url: Optional[str] = Field(default="--", max_length=512, description="文档URL")
    llm_model_url: Optional[str] = Field(default="--", max_length=512, description="模型URL")
    status: Optional[int] = Field(None, description="状态(0停用 1正常)")


class GetLlmProviderList(LlmProviderSchemaBase):
    id: int
    created_time: datetime
    updated_time: Optional[datetime] = None

    provider_configs: Optional[List[LlmProviderConfigBase]] = Field(default_factory=list)

    @model_validator(mode='after')
    def process_provider_config(self, info: ValidationInfo):
        """按上下文中的 user_id 过滤当前用户的模型配置"""
        try:
            # pydantic v2 的上下文
            user_id = (info.context or {}).get('user_id')
        except Exception:
            user_id = None
        if user_id is not None and self.provider_configs:
            self.provider_configs = [cfg for cfg in self.provider_configs if getattr(cfg, 'user_id', None) == user_id]
            if len(self.provider_configs) > 0:
                self.api_key = self.provider_configs[0].api_key
        self.provider_configs = None
        return self

class GetLlmProviderDetail(GetLlmProviderList):
    pass

class GetLlmProviderWithRelationDetail(GetLlmProviderDetail):
    """模型信息关联详情"""

    model_config = ConfigDict(from_attributes=True)
    models: List[GetLlmModelList]

class CreateLlmProviderParam(LlmProviderSchemaBase):
    pass

class UpdateLlmProviderParam(SchemaBase):
    name: Optional[str] = Field(None, max_length=255, description="提供商名称")
    api_key: Optional[str] = Field(None, description="API密钥")
    api_url: Optional[str] = Field(None, max_length=512, description="API地址")
    document_url: Optional[str] = Field(None, max_length=512, description="文档URL")
    llm_model_url: Optional[str] = Field(None, max_length=512, description="模型URL")
    status: Optional[int] = Field(None, description="状态(0停用 1正常)")

class DeleteLlmProviderParam(SchemaBase):
    pks: List[int] = Field(description="llm 模型供应商id")
