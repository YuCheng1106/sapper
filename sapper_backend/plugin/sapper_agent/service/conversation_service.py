#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from typing import Sequence
from fastapi import Request
from sqlalchemy import Select

from common.exception import errors
from database.db import async_db_session
from plugin.sapper_agent.crud import agent_dao
from plugin.sapper_agent.crud.crud_conversation import conversation_dao
from plugin.sapper_agent.model import Conversation
from plugin.sapper_agent.schema.conversation import CreateConversationParam, DeleteConversationParam, UpdateConversationParam
from plugin.sapper_knowledge.crud import knowledge_base_dao
from plugin.sapper_knowledge.schema import CreateKnowledgeBaseParam

class ConversationService:
    """智能体会话服务类"""

    @staticmethod
    async def get(*, request: Request, conversation_uuid: str) -> Conversation:
        """
        获取智能体会话

        :param request: FastAPI请求对象
        :param conversation_uuid: 智能体会话 UUID
        :return:
        """
        async with async_db_session() as db:
            conversation = await conversation_dao.get_by_uuid(db, uuid=conversation_uuid)
            if not conversation:
                raise errors.NotFoundError(msg='智能体会话不存在')
            if not request.user.is_superuser and request.user.id != conversation.creator_id:
                raise errors.ForbiddenError(msg="您没有权限查看该智能体会话")

            return conversation

    @staticmethod
    async def get_select(*, request: Request, agent_uuid: str, name: str, remark: str, conversation_type: int, status: int) -> Select:
        """
        获取智能体会话列表查询条件

        :param request: FastAPI请求对:
        :param agent_uuid: 智能体 UUID
        :param name: 智能体会话名称
        :param remark: 会话备注
        :param conversation_type: 智能体会话类型
        :param status: 智能体会话状态
        :return:
        """
        creator_id = None
        # 如果当前用户不是超级管理员
        if not request.user.is_superuser:
            creator_id = request.user.id
        async with async_db_session() as db:
            agent = await agent_dao.get_by_uuid(db, uuid=agent_uuid)
        if agent is not None:
            return await conversation_dao.get_list(agent_id=agent.id, creator_id=creator_id, name=name, remark=remark, conversation_type=conversation_type, status=status)
        else:
            raise errors.NotFoundError(msg="该会话对应智能体不存在")

    @staticmethod
    async def get_all(*, request: Request) -> Sequence[Conversation]:
        """
        获取所有智能体会话

        :param request: FastAPI请求对象
        """

        async with async_db_session() as db:
            if not request.user.is_superuser:
                raise errors.ForbiddenError(msg="您没有权限获得所有智能体会话")
            conversations = await conversation_dao.get_all(db)
            return conversations

    @staticmethod
    async def create(*, request: Request, obj: CreateConversationParam) -> Conversation:
        """
        创建智能体会话

        :param request: FastAPI请求对象
        :param obj: 创建智能体会话参数
        :return:
        """
        async with async_db_session.begin() as db:
            if obj.creator_id is None:
                obj.creator_id = request.user.id
            agent = await agent_dao.get_by_uuid(db, obj.agent_uuid)
            if not agent:
                raise errors.NotFoundError(msg="该智能体不存在")
            if not request.user.is_superuser and request.user.id != agent.creator_id and agent.status != 2:
                raise errors.ForbiddenError(msg="您没有权限创建该智能体会话")
            if not request.user.is_superuser and request.user.id != obj.creator_id:
                raise errors.ForbiddenError(msg="您没有权限为该用户创建智能体会话")
            obj.name = obj.name if obj.name else f"{agent.name} 的会话"
            obj.agent_id = agent.id
            knowledge_base = await knowledge_base_dao.create(db,
                CreateKnowledgeBaseParam(
                    creator_id=obj.creator_id,
                    name=f"{agent.name} 会话绑定的智能体知识库",
                    description=f"{agent.name} 会话绑定的智能体知识库",
                    type=0,
                    cover_image=None,
                )
            )
            await db.flush()
            await db.refresh(knowledge_base)
            obj.knowledge_base_id = knowledge_base.id
            del obj.agent_uuid
            return await conversation_dao.create(db, obj)

    @staticmethod
    async def update(*, request: Request, conversation_uuid: str, obj: UpdateConversationParam) -> int:
        """
        更新智能体会话

        :param request: FastAPI请求对象
        :param conversation_uuid: 智能体会话 UUID
        :param obj: 更新智能体会话参数
        :return:
        """
        async with async_db_session.begin() as db:
            conversation = await conversation_dao.get_by_uuid(db, uuid=conversation_uuid)
            if not conversation:
                raise errors.NotFoundError(msg='智能体会话不存在')
            if not request.user.is_superuser and request.user.id != conversation.creator_id:
                raise errors.ForbiddenError(msg="您没有权限更新该智能体会话")
            agent = await agent_dao.get(db, conversation.agent_id)
            if not request.user.is_superuser and request.user.id != agent.creator_id and agent.status != 2:
                raise errors.ForbiddenError(msg="您没有权限获得该智能体")
            count = await conversation_dao.update(db, conversation.id, obj)
            return count

    @staticmethod
    async def delete(*, request: Request, obj: DeleteConversationParam) -> int:
        """
        批量删除智能体会话

        :param request: FastAPI请求对象
        :param obj: 智能体会话 ID 列表
        :return:
        """
        async with async_db_session.begin() as db:
            fault_conversation_ids = []
            for conversation_id in obj.pks:
                conversation = await conversation_dao.get(db, conversation_id)
                if not conversation or (not request.user.is_superuser and request.user.id != conversation.creator_id):
                    obj.pks.remove(conversation_id)
                    fault_conversation_ids.append(conversation.name if conversation else conversation_id)

            count = await conversation_dao.delete(db, obj.pks)

            if len(fault_conversation_ids) != 0:
                raise errors.ForbiddenError(msg="您没有权限删除智能体会话" + ', '.join(fault_conversation_ids))
            return count


conversation_service: ConversationService = ConversationService()
