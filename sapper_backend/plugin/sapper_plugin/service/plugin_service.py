#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from typing import Sequence
from fastapi import Request
from sqlalchemy import Select
from common.exception import errors
from database.db import async_db_session
from plugin.sapper_plugin.crud.crud_plugin import plugin_dao
from plugin.sapper_plugin.model import Plugin
from plugin.sapper_plugin.schema.plugin import CreatePluginParam, DeletePluginParam, UpdatePluginParam


class PluginService:
    """Sapper 插件服务类"""

    @staticmethod
    async def get(*, request: Request, pk: int) -> Plugin:
        """
        获取Sapper 插件

        :param request: FastAPI请求对象
        :param pk: Sapper 插件 ID
        :return:
        """
        async with async_db_session() as db:
            plugin = await plugin_dao.get(db, pk)
            if not plugin:
                raise errors.NotFoundError(msg='Sapper 插件不存在')
            if not request.user.is_superuser and request.user.id != plugin.creator_id:
                raise errors.ForbiddenError(msg="您没有权限查看该Sapper 插件")

            return plugin

    @staticmethod
    async def get_by_uuid(*, request: Request, uuid: str) -> Plugin:
        """
        获取Sapper 插件

        :param request: FastAPI请求对象
        :param pk: Sapper 插件 ID
        :return:
        """
        async with async_db_session() as db:
            plugin = await plugin_dao.get_by_uuid(db, uuid)
            if not plugin:
                raise errors.NotFoundError(msg='Sapper 插件不存在')
            if not request.user.is_superuser and request.user.id != plugin.creator_id:
                raise errors.ForbiddenError(msg="您没有权限查看该Sapper 插件")

            return plugin

    @staticmethod
    async def get_select(*, request: Request, name: str, description: str, plugin_type: int, status: int, category: str = None, discover: bool = False) -> Select:
        """
        获取Sapper 插件列表查询条件

        :param request: FastAPI请求对象
        :param name: Sapper 插件名称
        :param description: 用户名
        :param plugin_type: Sapper 插件类型
        :param category: Sapper 插件类型
        :param status: Sapper 插件状态
        :param discover: Sapper 插件发现
        :return:
        """
        creator_id = None
        # 如果当前用户不是超级管理员
        if not request.user.is_superuser:
            creator_id = request.user.id

        if discover:
            creator_id = None
            status = 2

        return await plugin_dao.get_list(creator_id=creator_id, name=name, description=description, plugin_type=plugin_type, category=category, status=status)

    @staticmethod
    async def get_all(*, request: Request) -> Sequence[Plugin]:
        """
        获取所有Sapper 插件

        :param request: FastAPI请求对象
        """

        async with async_db_session() as db:
            if not request.user.is_superuser:
                raise errors.ForbiddenError(msg="您没有权限获得所有Sapper 插件")
            plugins = await plugin_dao.get_all(db)
            return plugins

    @staticmethod
    async def create(*, request: Request, obj: CreatePluginParam) -> None:
        """
        创建Sapper 插件

        :param request: FastAPI请求对象
        :param obj: 创建Sapper 插件参数
        :return:
        """
        async with async_db_session.begin() as db:
            if obj.creator_id is None:
                obj.creator_id = request.user.id
            if not request.user.is_superuser and request.user.id != obj.creator_id:
                raise errors.ForbiddenError(msg="您没有权限为该用户创建Sapper 插件")

            await plugin_dao.create(db, obj)

    @staticmethod
    async def update(*, request: Request, uuid: str, obj: UpdatePluginParam) -> int:
        """
        更新Sapper 插件

        :param request: FastAPI请求对象
        :param uuid: Sapper 插件 UUID
        :param obj: 更新Sapper 插件参数
        :return:
        """
        async with async_db_session.begin() as db:
            plugin = await plugin_dao.get_by_uuid(db, uuid)
            if not plugin:
                raise errors.NotFoundError(msg='Sapper 插件不存在')
            if not request.user.is_superuser and request.user.id != plugin.creator_id:
                raise errors.ForbiddenError(msg="您没有权限更新该Sapper 插件")
            if plugin.status == 3:
                raise errors.ForbiddenError(msg="该Sapper 插件为智能体插件，不可修改")
            count = await plugin_dao.update(db, plugin.id, obj)
            return count

    @staticmethod
    async def delete(*, request: Request, obj: DeletePluginParam) -> int:
        """
        批量删除Sapper 插件

        :param request: FastAPI请求对象
        :param obj: Sapper 插件 ID 列表
        :return:
        """
        async with async_db_session.begin() as db:
            fault_plugin_ids = []
            for plugin_id in obj.pks:
                plugin = await plugin_dao.get(db, plugin_id)
                if not plugin or (not request.user.is_superuser and request.user.id != plugin.creator_id) or plugin.status == 3:
                    obj.pks.remove(plugin_id)
                    fault_plugin_ids.append(plugin.name if plugin else plugin_id)

            count = await plugin_dao.delete(db, obj.pks)

            if len(fault_plugin_ids) != 0:
                raise errors.ForbiddenError(msg="您没有权限删除Sapper 插件" + ', '.join(fault_plugin_ids))
            return count


plugin_service: PluginService = PluginService()
