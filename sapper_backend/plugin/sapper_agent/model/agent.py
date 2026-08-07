from typing import TYPE_CHECKING, List

from sqlalchemy import String, Text, ForeignKey, JSON, BigInteger
from sqlalchemy.orm import Mapped, mapped_column, relationship
from common.model import Base, id_key
from database.db import uuid4_str
from plugin.sapper_knowledge.model import KnowledgeBase
from plugin.sapper_knowledge.model import agent_has_knowledge_base

from plugin.sapper_plugin.model import agent_has_plugin
if TYPE_CHECKING:
    from app.admin.model import User
    from plugin.sapper_plugin.model import Plugin
    from plugin.sapper_knowledge.model import KnowledgeBase
    from plugin.sapper_agent.model import Conversation, Interaction
    from plugin.sapper_publish.model import AgentPublication


class Agent(Base):
    """智能体表"""

    __tablename__ = 'sapper_agent'

    id: Mapped[id_key] = mapped_column(init=False)
    uuid: Mapped[str] = mapped_column(String(50), init=False, default_factory=uuid4_str, unique=True)
    name: Mapped[str] = mapped_column(String(32), default="", comment='智能体名称')
    description: Mapped[str] = mapped_column(Text, default="", comment='智能体描述')
    capability: Mapped[str] = mapped_column(Text, nullable=False, default="", comment='智能体能力')
    spl: Mapped[str] = mapped_column(Text, default="", comment='SPL定义')
    spl_form: Mapped[list] = mapped_column(JSON, default_factory=list, comment='SPL表单结构')
    spl_chain: Mapped[dict] = mapped_column(JSON, default_factory=dict, comment='SPL链结构')
    welcome_info: Mapped[str] = mapped_column(Text, default="你可以输入任何问题", comment='欢迎信息')
    sample_query: Mapped[dict] = mapped_column(JSON, default_factory=list, comment='示例查询')
    parameters: Mapped[dict] = mapped_column(JSON, default_factory=dict, comment='参数配置')
    tags: Mapped[list] = mapped_column(JSON, default_factory=list, comment='标签列表')
    cover_image: Mapped[str | None] = mapped_column(String(255), default=None, comment='头像')
    type: Mapped[int] = mapped_column(default=1, comment='智能体类型(0管理型 1功能型)')
    status: Mapped[int] = mapped_column(default=1, comment='状态(0停用 1正常 2发布市场)')
    suggestion: Mapped[bool] = mapped_column(default=False, comment='是否生成建议')
    has_short_memory: Mapped[bool] = mapped_column(default=False, comment='是否短期记忆')
    has_long_memory: Mapped[bool] = mapped_column(default=False, comment='是否长期记忆')
    output_chaining: Mapped[bool] = mapped_column(default=True, comment='是否展示思维链')

    # 用户关联
    creator_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey('sys_user.id', ondelete='CASCADE'), comment='用户关联ID', default=None
    )
    creator: Mapped['User'] = relationship(init=False)
    conversations: Mapped[List['Conversation']] = relationship(init=False, backref='agent', cascade="all, delete-orphan")
    interactions: Mapped[List['Interaction']] = relationship(init=False, backref='agent', cascade="all, delete-orphan")
    # 多对多关系
    plugins: Mapped[List['Plugin']] = relationship(
        init=False,
        secondary=agent_has_plugin,
        back_populates='agents',
        info={'description': '关联的插件列表'}
    )

    knowledge_bases: Mapped[List['KnowledgeBase']] = relationship(
        init=False,
        secondary=agent_has_knowledge_base,
        back_populates='agents',
        info={'description': '关联的知识库列表'}
    )

    publications: Mapped[List['AgentPublication']] = relationship(backref="agent", cascade="all, delete-orphan", init=False)
