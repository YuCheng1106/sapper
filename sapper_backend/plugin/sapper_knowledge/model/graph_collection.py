from typing import TYPE_CHECKING
from sqlalchemy import String, Text, ForeignKey, BigInteger, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from common.model import Base, id_key

if TYPE_CHECKING:
    from plugin.sapper_knowledge.model.knowledge_base import KnowledgeBase

class GraphCollection(Base):
    __tablename__ = 'graph_collection'

    id: Mapped[id_key] = mapped_column(init=False)
    knowledge_base_id: Mapped[int] = mapped_column(BigInteger, ForeignKey('sapper_knowledge.id', ondelete='CASCADE'), nullable=False)
    name: Mapped[str] = mapped_column(String(255))
    file_url: Mapped[str] = mapped_column(Text)
    entities: Mapped[list] = mapped_column(JSON, default_factory=list, comment='图谱数据实体')
    relationships: Mapped[list] = mapped_column(JSON, default_factory=list, comment='图谱数据关系')
    communities: Mapped[list] = mapped_column(JSON, default_factory=list, comment='图谱数据社区')
    status: Mapped[int] = mapped_column(default=1, comment='状态(0停用 1正常)')

    knowledge_base: Mapped['KnowledgeBase'] = relationship('KnowledgeBase', back_populates='graph_collections', init=False)
