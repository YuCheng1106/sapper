from typing import TYPE_CHECKING, List

from sqlalchemy import Text, ForeignKey, BigInteger
from sqlalchemy.orm import Mapped, mapped_column, relationship
from common.model import Base, id_key

if TYPE_CHECKING:
    from plugin.sapper_knowledge.model.embedding import Embedding

class TextBlock(Base):
    __tablename__ = 'text_block'

    id: Mapped[id_key] = mapped_column(init=False)
    content: Mapped[str] = mapped_column(Text)
    text_collection_id: Mapped[int] = mapped_column(BigInteger, ForeignKey('text_collection.id', ondelete='CASCADE'), nullable=False)

    embedding: Mapped[List['Embedding']] = relationship('Embedding', backref='text_block', init=False, cascade="all, delete-orphan")
