from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from common.model import Base, id_key

if TYPE_CHECKING:
    from plugin.sapper_publish.model.agent_publication_model import AgentPublication

class PublishChannel(Base):
    """发布渠道表"""
    __tablename__ = 'publish_channel'

    id: Mapped[id_key] = mapped_column(init=False)
    name: Mapped[str] = mapped_column(String(50), comment='渠道名称')
    description: Mapped[Optional[str]] = mapped_column(Text, comment='渠道描述')
    is_active: Mapped[bool] = mapped_column(default=True, comment='是否激活')

    # Relationships
    publications: Mapped[List['AgentPublication']] = relationship(
        back_populates="channel",
        cascade="all, delete-orphan", init=False
    )
