from sqlalchemy import Column, ForeignKey, Table, BigInteger

from common.model import MappedBase

# Association Tables for Many-to-Many relationships
agent_has_knowledge_base = Table(
    'agent_has_knowledge_base',
    MappedBase.metadata,
    Column('id', BigInteger, primary_key=True, unique=True, index=True, autoincrement=True, comment='主键ID'),
    Column('sapper_agent_id', BigInteger, ForeignKey('sapper_agent.id', ondelete='CASCADE'), primary_key=True, comment='智能体ID'),
    Column('sapper_knowledge_id', BigInteger, ForeignKey('sapper_knowledge.id', ondelete='CASCADE'), primary_key=True, comment='知识库ID'),
)