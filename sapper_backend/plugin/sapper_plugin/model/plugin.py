from enum import IntEnum
from typing import List, Dict, Optional, TYPE_CHECKING
from xmlrpc.client import Boolean

from sqlalchemy import String, Text, ForeignKey, JSON, BigInteger
from sqlalchemy.orm import Mapped, mapped_column, relationship
from common.model import Base, id_key
from database.db import uuid4_str
from plugin.sapper_plugin.model.m2m import agent_has_plugin

if TYPE_CHECKING:
    from app.admin.model import User
    from plugin.sapper_agent.model import Agent

class PluginType(IntEnum):
    """插件类型枚举"""
    AGENT_PLUGIN = 0  # 智能体插件
    COMMON_PLUGIN = 1  # 普通插件


class PluginStatus(IntEnum):
    """插件状态枚举"""
    DISABLED = 0  # 停用
    ACTIVE = 1  # 正常

class Plugin(Base):
    """插件数据模型"""

    __tablename__ = 'sapper_plugin'

    id: Mapped[id_key] = mapped_column(init=False)
    uuid: Mapped[str] = mapped_column(String(50), init=False, default_factory=uuid4_str, unique=True)
    name: Mapped[str] = mapped_column(String(32), default='', nullable=False, comment='插件名称')
    description: Mapped[str] = mapped_column(Text, default="", comment='插件详细描述')

    # API相关配置
    server_url: Mapped[Optional[str]] = mapped_column(Text, default=None, nullable=False, comment='插件服务地址')
    method: Mapped[Optional[str]] = mapped_column(Text, default=None, nullable=False, comment='插件服务请求形式')
    return_value_type: Mapped[Optional[str]] = mapped_column(Text, default=None, nullable=False, comment='输出参数类型')
    request_body: Mapped[JSON] = mapped_column(JSON, default_factory=dict, comment='请求体定义')
    headers: Mapped[JSON] = mapped_column(JSON, default_factory=list, comment='固定请求头')
    auth_config: Mapped[JSON] = mapped_column(JSON, default_factory=dict, comment='认证配置')
    input_parameters: Mapped[List] = mapped_column(JSON, default_factory=list, comment='输入参数列表')
    output_parameters: Mapped[List] = mapped_column(JSON, default_factory=list, comment='输出参数列表')
    responses: Mapped[List] = mapped_column(JSON, default_factory=list, comment='响应处理')
    stream: Mapped[bool] = mapped_column(default=False, comment='是否流式')

    # 状态控制
    cover_image: Mapped[Optional[str]] = mapped_column(String(255), default=None, comment='封面图URL')
    category: Mapped[str] = mapped_column(String(32), default='', nullable=False, comment='插件分类')
    type: Mapped[int] = mapped_column(default=PluginType.COMMON_PLUGIN.value, comment='插件类型')
    status: Mapped[int] = mapped_column(default=PluginStatus.ACTIVE.value, comment='插件状态 2 公共插件')

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
        secondary=agent_has_plugin,
        back_populates='plugins',
    )
