from typing import TYPE_CHECKING

from sqlalchemy import String, Text, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from common.model import Base, id_key
from database.db import uuid4_str

if TYPE_CHECKING:
    from plugin.sapper_agent.model import Agent

class Conversation(Base):
    __tablename__ = 'conversation'

    id: Mapped[id_key] = mapped_column(init=False)
    uuid: Mapped[str] = mapped_column(String(50), init=False, default_factory=uuid4_str, unique=True)
    creator_id: Mapped[int] = mapped_column(ForeignKey('sys_user.id'), nullable=False)
    knowledge_base_id: Mapped[int] = mapped_column(ForeignKey('sapper_knowledge.id'), nullable=False)
    agent_id: Mapped[int] = mapped_column(ForeignKey('sapper_agent.id', ondelete='CASCADE'), nullable=False)
    name: Mapped[str] = mapped_column(String(32), default='新会话', comment='会话名称')
    remark: Mapped[str] = mapped_column(Text, default="", comment='会话备注')
    chat_history: Mapped[list] = mapped_column(JSON, default_factory=list, comment='聊天记录')
    chat_parameters: Mapped[dict] = mapped_column(JSON, default_factory=dict, comment='智能体聊天参数')
    short_memory: Mapped[str] = mapped_column(Text, default='', comment='短期记忆')
    long_memory: Mapped[str] = mapped_column(Text, default='', comment='长期记忆')
    type: Mapped[int] = mapped_column(default=1, comment='会话类型（0 模拟器会话 1正常会话）')
    status: Mapped[int] = mapped_column(default=1, comment='状态(0停用 1启用)')
