from sqlalchemy import ForeignKey, Float, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from common.model import Base, id_key

class Interaction(Base):
    __tablename__ = 'agent_interaction'

    id: Mapped[id_key] = mapped_column(init=False)
    user_id: Mapped[int] = mapped_column(ForeignKey('sys_user.id'), nullable=False)
    agent_id: Mapped[int] = mapped_column(ForeignKey('sapper_agent.id', ondelete='CASCADE'), nullable=False)
    # 评分字段
    rating_value: Mapped[float] = mapped_column(Float)

    # 收藏字段
    is_favorite: Mapped[bool] = mapped_column(default=False, comment='是否收藏')

    # 使用记录字段
    usage_count: Mapped[int] = mapped_column(default=0, comment='使用次数')

    # 正确的表参数定义
    __table_args__ = (
        UniqueConstraint('user_id', 'agent_id', name='uq_user_agent'),
        {'sqlite_autoincrement': True}
    )
