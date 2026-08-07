from typing import List, TYPE_CHECKING

from sqlalchemy import String, Text, ForeignKey, BigInteger
from sqlalchemy.orm import Mapped, mapped_column, relationship
from common.model import Base, id_key

if TYPE_CHECKING:
    from plugin.sapper_knowledge.model.knowledge_base import KnowledgeBase
    from plugin.sapper_knowledge.model.text_block import TextBlock


class TextCollection(Base):
    __tablename__ = 'text_collection'

    id: Mapped[id_key] = mapped_column(init=False)
    knowledge_base_id: Mapped[int] = mapped_column(BigInteger, ForeignKey('sapper_knowledge.id', ondelete='CASCADE'), nullable=False)
    name: Mapped[str] = mapped_column(String(225))
    file_url: Mapped[str] = mapped_column(Text)
    processing_method: Mapped[str] = mapped_column(String(32))
    training_mode: Mapped[str] = mapped_column(String(32))
    status: Mapped[int] = mapped_column(default=1, comment='状态(0停用 1正常)')

    knowledge_base: Mapped['KnowledgeBase'] = relationship('KnowledgeBase', back_populates='text_collections', init=False)
    text_blocks: Mapped[List['TextBlock']] = relationship('TextBlock', backref='text_collection', init=False, cascade="all, delete-orphan")

