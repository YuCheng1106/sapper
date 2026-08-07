from typing import Optional, Dict, Any, TYPE_CHECKING
from sqlalchemy import JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from common.model import Base, id_key


if TYPE_CHECKING:
    from plugin.sapper_publish.model.publish_channel_model import PublishChannel


class AgentPublication(Base):
    __tablename__ = 'agent_publication'

    id: Mapped[id_key] = mapped_column(init=False)
    agent_id: Mapped[int] = mapped_column(ForeignKey('sapper_agent.id', ondelete='CASCADE'), comment='智能体UUID')
    channel_id: Mapped[int] = mapped_column(ForeignKey('publish_channel.id', ondelete='CASCADE'), comment='发布渠道UUID')
    published_by: Mapped[int] = mapped_column(ForeignKey('sys_user.id', ondelete='CASCADE'), comment='发布者ID')
    publish_config: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, comment='发布配置')
    status: Mapped[int] = mapped_column(default=1, comment='发布状态')

    # 关系字段
    channel: Mapped['PublishChannel'] = relationship(back_populates="publications", init=False)
