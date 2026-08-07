from enum import IntEnum
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import String, Text, ForeignKey, BigInteger
from sqlalchemy.orm import Mapped, mapped_column, relationship
from common.model import Base, id_key
from database.db import uuid4_str
from plugin.sapper_knowledge.model.m2m import agent_has_knowledge_base

if TYPE_CHECKING:
    from app.admin.model import User
    from plugin.sapper_agent.model import Agent
    from plugin.sapper_knowledge.model.text_collection import TextCollection
    from plugin.sapper_knowledge.model.graph_collection import GraphCollection


class KnowledgeStatus(IntEnum):
    """知识库状态枚举"""
    DISABLED = 0  # 停用
    ACTIVE = 1  # 正常


class KnowledgeBase(Base):
    """知识库数据模型"""

    __tablename__ = 'sapper_knowledge'

    id: Mapped[id_key] = mapped_column(init=False)
    uuid: Mapped[str] = mapped_column(String(50), init=False, default_factory=uuid4_str, unique=True)
    name: Mapped[str] = mapped_column(String(32), default='', nullable=False, comment='知识库名称')
    description: Mapped[str] = mapped_column(Text, default="", comment='知识库详细描述')
    cover_image: Mapped[Optional[str]] = mapped_column(String(255), default=None, comment='封面图URL')
    embedding_model : Mapped[str] = mapped_column(String(255), default='/DMetaSoul/Dmeta-embedding', nullable=False, comment='知识库嵌入模型')
    type: Mapped[int] = mapped_column(default=1, comment='智能体类型(0智能体会话知识库 1普通知识库)')
    # 状态控制
    status: Mapped[int] = mapped_column(default=KnowledgeStatus.ACTIVE.value, comment='知识库状态')

    # # 创建者关系
    creator_id: Mapped[Optional[int]] = mapped_column(
        BigInteger,
        ForeignKey('sys_user.id', ondelete='SET NULL'),
        default=None,
        comment='创建者用户ID'
    )

    creator: Mapped[Optional['User']] = relationship(
        init=False,
        lazy='selectin',
        info={'description': '创建者信息'}
    )

    # 多对多关系
    agents: Mapped[List['Agent']] = relationship(
        init=False,
        secondary=agent_has_knowledge_base,
        back_populates='knowledge_bases',
    )

    text_collections: Mapped[List['TextCollection']] = relationship(
        "TextCollection",
        back_populates="knowledge_base",
        cascade="all, delete-orphan",
        init=False
    )

    graph_collections: Mapped[List['GraphCollection']] = relationship(
        "GraphCollection",
        back_populates="knowledge_base",
        cascade="all, delete-orphan",
        init=False
    )
