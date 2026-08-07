from typing import Sequence

from sqlalchemy import and_, desc, select, Select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy_crud_plus import CRUDPlus

from plugin.sapper_publish.model import AgentPublication
from plugin.sapper_publish.schema import UpdateAgentPublicationParam, AddAgentPublication


class CRUDAgentPublication(CRUDPlus[AgentPublication]):
    async def get(self, db: AsyncSession, pk: int) -> AgentPublication | None:
        """
        获取智能体

        :param db:
        :param pk:
        :return:
        """
        return await self.select_model(db, pk, load_strategies=["channel"])

    async def create(self, db: AsyncSession, obj: AddAgentPublication) -> AgentPublication:
        """
        创建智能体

        :param db: 异步数据库会话
        :param obj: 创建智能体的参数
        :return: 新创建的智能体对象
        """
        return await self.create_model(db, obj)

    async def get_all(self, db: AsyncSession, user_id: int = None, agent_id: int = None, channel_id: int = None) -> Sequence[AgentPublication]:
        """
        获取会话列表
        :param db:
        :param agent_id:
        :param user_id:
        :param channel_id:
        :return:
        """
        stmt = select(self.model).order_by(desc(self.model.id))
        where_list = []
        if user_id:
            where_list.append(self.model.published_by == user_id)
        if agent_id:
            where_list.append(self.model.agent_id == agent_id)
        if channel_id:
            where_list.append(self.model.channel_id == channel_id)
        if where_list:
            stmt = stmt.where(and_(*where_list))

        result = await db.execute(stmt)
        return result.scalars().all()

    async def get_list(
                self,user_id: int = None, agent_id: int = None, channel_id: int = None
        ) -> Select:
        """
        获取Sapper数据库列表（支持标签模糊匹配）

        Args:
            :param agent_id:
            :param user_id:
            :param channel_id:

        Returns:
            Select: SQLAlchemy 查询对象
        """
        from sqlalchemy import and_

        filters = []

        # 基础条件筛选
        if user_id:
            filters.append(self.model.published_by == user_id)
        if agent_id:
            filters.append(self.model.agent_id == agent_id)
        if channel_id:
            filters.append(self.model.channel_id == channel_id)
        # 构建查询
        query = await self.select_order(
            'id',
            'desc',
            load_options=[

            ]
        )

        # 应用所有筛选条件
        if filters:
            query = query.where(and_(*filters))

        return query

    async def update(self, db: AsyncSession, pk: int, obj: UpdateAgentPublicationParam) -> int:
        """
        更新智能体信息

        :param db:
        :param pk:
        :param obj:
        :return:
        """
        return await self.update_model(db, pk, obj)

    async def delete(self, db: AsyncSession, pks: list[int]) -> int:
        """
        批量删除数据库

        :param db: 数据库会话
        :param pks: 数据库 ID 列表
        :return:
        """
        return await self.delete_model_by_column(db, allow_multiple=True, id__in=pks)


agent_publication_dao: CRUDAgentPublication = CRUDAgentPublication(AgentPublication)
