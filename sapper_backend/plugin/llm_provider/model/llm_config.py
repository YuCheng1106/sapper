from typing import Optional
from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from common.model import Base, id_key


class LlmProviderConfig(Base):
    """大模型表"""
    __tablename__ = "llm_provider_config"

    id: Mapped[id_key] = mapped_column(init=False)
    # 外键关系
    user_id: Mapped[int] = mapped_column(
        ForeignKey("sys_user.id", ondelete="CASCADE"),
        nullable=False,
        comment="用户ID"
    )
    api_key: Mapped[str] = mapped_column(String(255), comment="API密钥")

    provider_id: Mapped[int] = mapped_column(
        ForeignKey("llm_provider.id", ondelete="CASCADE"),
        nullable=False,
        comment="模型供应商ID"
    )

class LlmModelConfig(Base):
    """大模型表"""
    __tablename__ = "llm_model_config"

    id: Mapped[id_key] = mapped_column(init=False)
    # 外键关系
    user_id: Mapped[int] = mapped_column(
        ForeignKey("sys_user.id", ondelete="CASCADE"),
        nullable=False,
        comment="用户ID"
    )
    model_id: Mapped[int] = mapped_column(
        ForeignKey("llm_model.id", ondelete="CASCADE"),
        nullable=False,
        comment="模型供应商ID"
    )
    model_status: Mapped[int] = mapped_column(default=1, comment='该用户是否启用该模型状态(0停用 1正常)')
