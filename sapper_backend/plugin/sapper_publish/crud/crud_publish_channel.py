from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy_crud_plus import CRUDPlus

from plugin.sapper_publish.model import PublishChannel


class CRUDPublishChannel(CRUDPlus[PublishChannel]):
    async def get(self, db: AsyncSession, pk: int) -> PublishChannel | None:
        """
        获取发布渠道

        :param db:
        :param pk:
        :return:
        """
        return await self.select_model(db, pk)


    async def delete(self, db: AsyncSession, pks: list[int]) -> int:
        """
        批量删除数据库

        :param db: 数据库会话
        :param pks: 数据库 ID 列表
        :return:
        """
        return await self.delete_model_by_column(db, allow_multiple=True, id__in=pks)


publish_channel_dao: CRUDPublishChannel = CRUDPublishChannel(PublishChannel)
