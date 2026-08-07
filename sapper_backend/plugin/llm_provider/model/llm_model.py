from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from common.model import Base, id_key

if TYPE_CHECKING:
    from plugin.llm_provider.model.llm_config import LlmModelConfig

class LlmModel(Base):
    """大模型表"""
    __tablename__ = "llm_model"

    id: Mapped[id_key] = mapped_column(init=False)
    # 外键关系
    provider_id: Mapped[str] = mapped_column(
        ForeignKey("llm_provider.id", ondelete="CASCADE"),
        nullable=False,
        comment="提供商ID"
    )
    type: Mapped[str] = mapped_column(String(50), comment="模型类型")
    name: Mapped[str] = mapped_column(String(255), comment="模型名称")
    group_name: Mapped[Optional[str]] = mapped_column(String(100), comment="分组名称")
    status: Mapped[int] = mapped_column(default=1, comment='状态(0停用 1正常)')

    model_configs: Mapped[List['LlmModelConfig']] = relationship(
        cascade="all, delete-orphan",
        backref='provider',
        init=False
    )