from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from common.model import Base, id_key

if TYPE_CHECKING:
    from plugin.llm_provider.model.llm_model import LlmModel
    from plugin.llm_provider.model.llm_config import LlmProviderConfig

class LlmProvider(Base):
    """大模型提供商表"""
    __tablename__ = "llm_provider"
    id: Mapped[id_key] = mapped_column(init=False)
    name: Mapped[str] = mapped_column(String(255), comment="提供商名称")
    api_key: Mapped[str] = mapped_column(String(255), comment="API密钥")
    api_url: Mapped[str] = mapped_column(String(512), comment="API地址")
    document_url: Mapped[Optional[str]] = mapped_column(String(512), comment="文档URL")
    llm_model_url: Mapped[Optional[str]] = mapped_column(String(512), comment="模型URL")
    status: Mapped[int] = mapped_column(default=1, comment='状态(0停用 1正常)')

    provider_configs: Mapped[List['LlmProviderConfig']] = relationship(
        cascade="all, delete-orphan",
        backref='provider',
        init=False
    )
    # 关系定义
    models: Mapped[List["LlmModel"]] = relationship(
        cascade="all, delete-orphan",
        backref='provider',
        init=False
    )
