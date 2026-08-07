from datetime import datetime
from typing import Optional, List
from pydantic import Field, ConfigDict, model_validator, ValidationInfo

from common.enums import StatusType
from common.schema import SchemaBase
from plugin.llm_provider.schema.llm_config import LlmModelConfigBase

class LlmModelSchemaBase(SchemaBase):
    type: str = Field(description="模型类型")
    name: str = Field(max_length=255, description="模型名称")
    group_name: Optional[str] = Field(default="默认分组", max_length=100, description="分组名称")
    status: int = Field(default=StatusType.enable.value, description="状态(0停用 1正常)")

class GetLlmModelDetail(LlmModelSchemaBase):
    model_config = ConfigDict(from_attributes=True)

    id: int = Field(description='模型 ID')
    provider_id: int = Field(description="关联提供商ID")
    created_time: datetime = Field(description='模型创建时间')
    updated_time: Optional[datetime] = Field(None, description='模型更新时间')

class GetLlmModelWithRelationDetail(GetLlmModelDetail):
    """模型信息关联详情"""
    model_configs: Optional[List[LlmModelConfigBase]] = Field(default_factory=list)
    model_config = ConfigDict(from_attributes=True)

    @model_validator(mode='after')
    def process_model_config(self, info: ValidationInfo):
        """按上下文中的 user_id 过滤当前用户的模型配置"""
        try:
            # pydantic v2 的上下文
            user_id = (info.context or {}).get('user_id')
        except Exception:
            user_id = None

        if user_id is not None and self.model_configs:
            self.model_configs = [cfg for cfg in self.model_configs if getattr(cfg, 'user_id', None) == user_id]
            if len(self.model_configs) > 0:
                self.status = self.model_configs[0].model_status
        self.model_configs = None
        return self


class GetLlmModelList(GetLlmModelDetail):
    pass


class CreateLlmModelParam(LlmModelSchemaBase):
    provider_id: int = Field(description="关联提供商ID")  # 修正字段名

class UpdateLlmModelParam(SchemaBase):
    type: Optional[str] = Field(None, description="模型类型")
    name: Optional[str] = Field(None, max_length=255, description="模型名称")
    group_name: Optional[str] = Field(None, max_length=100, description="分组名称")
    status: Optional[int] = Field(None, description="状态(0停用 1正常)")

class DeleteLlmModelParam(SchemaBase):
    pks: List[int] = Field(description="llm 模型id")
