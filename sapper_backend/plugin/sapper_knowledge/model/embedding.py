from typing import Optional

from sqlalchemy import ForeignKey, BigInteger, JSON
from sqlalchemy.orm import Mapped, mapped_column
from common.model import Base, id_key

class Embedding(Base):
    __tablename__ = 'embedding'

    id: Mapped[id_key] = mapped_column(init=False)
    text_block_id: Mapped[int] = mapped_column(BigInteger, ForeignKey('text_block.id', ondelete='CASCADE'), nullable=False, comment='关联的文本块ID')
    vector: Mapped[Optional[list]] = mapped_column(JSON, default_factory=list, comment='实体嵌入向量')
