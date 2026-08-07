#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import asyncio
import json
from typing import Sequence, Any, AsyncGenerator
from fastapi import Request
from fastapi.encoders import jsonable_encoder
from sqlalchemy import Select
from common.exception import errors
from database.db import async_db_session
from database.redis import redis_client
from plugin.sapper_agent.crud import interaction_dao
from plugin.sapper_agent.crud.crud_agent import agent_dao
from plugin.sapper_agent.crud.crud_conversation import conversation_dao
from plugin.sapper_agent.model import Agent
from plugin.sapper_agent.schema import CreateInteractionParam, ConversationType, \
    UpdateConversationParam, UpdateInteractionParam, ConversationSchemaBase, GetConversationRunChain, \
    GetConversationDetail, GetConversationWithRelationDetail
from plugin.sapper_agent.schema.agent import CreateAgentParam, DeleteAgentParam, UpdateAgentParam, AgentStatus, \
    GetAgentRunChain
from plugin.sapper_agent.utils.sapper_chain import generate_spl_form, generate_spl_chain, run_chain, \
    generate_conversation_name
from plugin.sapper_knowledge.crud import knowledge_base_dao
from plugin.sapper_knowledge.schema import CreateKnowledgeBaseParam, GetKnowledgeBaseRunChain
from plugin.sapper_plugin.crud import plugin_dao
from plugin.sapper_plugin.schema import GetPluginRunChain, UpdatePluginParam
from utils.serializers import select_as_dict
import hashlib


class AgentService:
    """智能体服务类"""

    @staticmethod
    async def get(*, request: Request, pk: int = None, agent_uuid: str = None) -> Agent:
        """
        获取智能体

        :param request: FastAPI请求对象
        :param pk: 智能体 ID
        :param agent_uuid: 智能体 UUID
        :return:
        """
        async with async_db_session() as db:
            if pk is not None:
                agent = await agent_dao.get(db, pk)
            elif agent_uuid is not None:
                agent = await agent_dao.get_by_uuid(db, agent_uuid)
            else:
                raise errors.ForbiddenError(msg="必须提供智能体的id 或者 uuid")

            if not agent:
                raise errors.NotFoundError(msg='智能体不存在')
            if not request.user.is_superuser and request.user.id != agent.creator_id:
                if agent.status != AgentStatus.MARKET.value:
                    raise errors.ForbiddenError(msg="您没有权限查看该智能体")

            interaction = await interaction_dao.get(db=db, agent_id=agent.id, user_id=request.user.id)

            if interaction is None:
                await interaction_dao.create(db=db, obj=CreateInteractionParam(
                    agent_id=agent.id,
                    user_id=request.user.id,
                    )
                )
            await db.commit()
            agent.conversations = [
                conv for conv in agent.conversations
                if conv.creator_id == request.user.id
            ]
            return agent

    @staticmethod
    async def get_select(*, request: Request, name: str, description: str, tags: list, agent_type: int, status: int, discover: bool = False) -> Select:
        """
        获取智能体列表查询条件

        :param request: FastAPI请求对:
        :param name: 智能体名称
        :param description: 用户名
        :param tags: 智能体标签列表
        :param agent_type: 智能体类型
        :param status: 智能体状态
        :param discover: 是否获得公开智能体
        :return:
        """
        creator_id = None
        # 如果当前用户不是超级管理员
        if not discover and not request.user.is_superuser:
            creator_id = request.user.id

        # 发现模式优先级最高
        if discover:
            creator_id = None
            status = 2

        return await agent_dao.get_list(creator_id=creator_id, name=name, description=description, tags=tags, agent_type=agent_type, status=status)

    @staticmethod
    async def get_all(*, request: Request) -> Sequence[Agent]:
        """
        获取所有智能体

        :param request: FastAPI请求对象
        """

        async with async_db_session() as db:
            if not request.user.is_superuser:
                raise errors.ForbiddenError(msg="您没有权限获得所有智能体")
            agents = await agent_dao.get_all(db)
            return agents

    @staticmethod
    async def create(*, request: Request, obj: CreateAgentParam) -> Agent | None:
        """
        创建智能体

        :param request: FastAPI请求对象
        :param obj: 创建智能体参数
        :return:
        """
        async with async_db_session.begin() as db:
            if obj.creator_id is None:
                obj.creator_id = request.user.id
            if not request.user.is_superuser and request.user.id != obj.creator_id:
                raise errors.ForbiddenError(msg="您没有权限为该用户创建智能体")
            obj.parameters = {"Output1": {"type": "system", "value_type": "text", "fill_type": "cloze", "placeholder": "nihao1", "content": ""}, "UserRequest": {"type": "system", "value_type": "text", "fill_type": "select", "placeholder": "cdscsdc", "options": ["csdcs", "cdscs"], "content": "cdscs", "description": "csdcs"}, "Output3": {"type": "system", "value_type": "text", "fill_type": "cloze", "placeholder": "你好啊", "content": ""}, "Output2": {"type": "system", "value_type": "text", "fill_type": "cloze", "placeholder": "sasa", "content": ""}}

            agent = await agent_dao.create(db, obj)

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
            await db.refresh(agent)
            await db.refresh(knowledge_base)

            await conversation_dao.create(db, ConversationSchemaBase(
                agent_id = agent.id,
                name=f"{agent.name} 模拟会话",
                remark=f"{agent.name} 会话绑定的智能体模拟会话",
                creator_id=obj.creator_id,
                knowledge_base_id=knowledge_base.id,
                type=ConversationType.SIMULATOR.value,
            ))
            await db.commit()
        return agent

    @staticmethod
    async def favorite(*, request: Request, agent_uuid: str, obj: UpdateInteractionParam) -> None:
        """
        收藏智能体

        :param request: FastAPI请求对象
        :param agent_uuid: 智能体 UUID
        :param obj: 交互更新数据
        :return:
        """
        async with async_db_session.begin() as db:

            agent = await agent_dao.get_by_uuid(db, uuid=agent_uuid)
            if agent is None:
                errors.NotFoundError(msg="该智能体不存在")

            if agent:
                interaction = await interaction_dao.get(db=db, agent_id=agent.id, user_id=request.user.id)

            if interaction is not None:
                await interaction_dao.update(db=db, pk=interaction.id, obj=UpdateInteractionParam(
                    is_favorite= obj.is_favorite,
                ))
                await db.commit()

    @staticmethod
    async def rating(*, request: Request, agent_uuid: str, obj: UpdateInteractionParam) -> None:
        """
        收藏智能体

        :param request: FastAPI请求对象
        :param agent_uuid: 智能体 UUID
        :param obj: 交互更新数据
        :return:
        """
        async with async_db_session.begin() as db:

            agent = await agent_dao.get_by_uuid(db, uuid=agent_uuid)
            if agent is None:
                errors.NotFoundError(msg="该智能体不存在")

            if agent:
                interaction = await interaction_dao.get(db=db, agent_id=agent.id, user_id=request.user.id)

            if interaction is not None:
                await interaction_dao.update(db=db, pk=interaction.id, obj=UpdateInteractionParam(
                    rating_value= obj.rating_value,
                ))
                await db.commit()

    @staticmethod
    async def generate_spl_form(*, request: Request, agent_uuid: str) -> AsyncGenerator[str, Any]:
        """
        生成智能体表单
        """
        # 验证权限
        async with async_db_session() as db:
            agent = await agent_dao.get_by_uuid(db, agent_uuid)
            if agent is None:
                raise errors.NotFoundError(msg="该智能体不存在")
            if not request.user.is_superuser and request.user.id != agent.creator_id:
                raise errors.ForbiddenError(msg="您没有权限为该用户创建智能体")

        # 收集所有响应后再更新数据库
        spl_form = []
        async for response in generate_spl_form(agent.capability):
            spl_form.append(response)
            print(response)
            yield f'data: {json.dumps(response, ensure_ascii=False)}\n\n'
            await asyncio.sleep(0.1)

        # 一次性更新数据库
        async with async_db_session() as db:
            await agent_dao.update(
                db,
                input_agent=agent,
                obj=UpdateAgentParam(spl_form=spl_form)
            )
            await db.commit()

        yield '[DONE]'


    @staticmethod
    async def generate_spl_chain(*, request: Request, agent_uuid: str) -> AsyncGenerator[str, Any]:
        """
        编译智能体表单
        """
        # 验证权限
        async with async_db_session() as db:
            agent = await agent_dao.get_by_uuid(db, agent_uuid)
            if agent is None:
                raise errors.NotFoundError(msg="该智能体不存在")
            if not request.user.is_superuser and request.user.id != agent.creator_id:
                raise errors.ForbiddenError(msg="您没有权限编译该智能体")

        # 收集所有响应后再更新数据库
        async for response in generate_spl_chain(agent.type, agent.spl_form):
            if response.get("type") == "result":
                # 一次性更新数据库
                async with async_db_session() as db:
                    await agent_dao.update(
                        db,
                        input_agent=agent,
                        obj=UpdateAgentParam(spl_chain=response.get("content"))
                    )
                    await db.commit()
            yield f'data: {json.dumps(response, ensure_ascii=False)}\n\n'
            await asyncio.sleep(0.1)
        yield '[DONE]'

    @staticmethod
    async def run_chain(*, request: Request, agent_uuid: str, conversation_uuid: str | None, query: list) -> AsyncGenerator[str, Any]:
        """
        运行智能体表单
        """
        # 验证权限
        generate_conversation_name_flag = False
        conversation_id = None
        conversation = None
        history = []
        units = None
        conv_data = None
        saved_partial = False
        try:
            async with async_db_session() as db:
                agent = await agent_dao.get_agent_run_by_uuid(db, agent_uuid)
                if agent is None:
                    raise errors.NotFoundError(msg="该智能体不存在")
                # if not request.user.is_superuser and request.user.id != agent.creator_id and agent.status != AgentStatus.MARKET.value:
                #     raise errors.ForbiddenError(msg="您没有权限运行该智能体")
                if conversation_uuid is not None:
                    conv_cache_key = f"sapper:conversation:detail:user={request.user.id}:{conversation_uuid}"
                    conv_cached = await redis_client.get(conv_cache_key)
                    if conv_cached:
                        try:
                            conv_cached_str = conv_cached.decode("utf-8") if isinstance(conv_cached, (bytes, bytearray)) else str(
                                conv_cached)
                            conv_data = json.loads(conv_cached_str)
                            conversation = GetConversationWithRelationDetail(**conv_data)
                        except Exception:
                            pass
                    else:
                        conversation = await conversation_dao.get_by_uuid(db, conversation_uuid)

                    if conversation is None:
                        raise errors.NotFoundError(msg="该聊天会话不存在")
                    if not request.user.is_superuser and request.user.id != conversation.creator_id and conversation.agent_id != agent.id:
                        raise errors.ForbiddenError(msg="您没有权限访问该会话")

                    conversation_id = conversation.id
                    history = conversation.chat_history
                    if len(history) == 0:
                        generate_conversation_name_flag = True
                    history.append({"role": "user", "contents": query})

                    # 保存用户的消息到历史记录
                    await conversation_dao.update(
                        db,
                        pk=conversation_id,
                        obj=UpdateConversationParam(chat_history=history)
                    )

                    await db.commit()
                    conv_data = GetConversationWithRelationDetail(**select_as_dict(conversation))
                    conv_data.chat_history = history
                    encoded = jsonable_encoder(conv_data)
                    await redis_client.setex(conv_cache_key, 60 * 10, json.dumps(encoded, ensure_ascii=False))

            # 收集所有响应后再更新数据库
            plugin_data = [GetPluginRunChain(**select_as_dict(plugin)) for plugin in agent.plugins]
            knowledge_base_data= [GetKnowledgeBaseRunChain(**select_as_dict(knowledge_base)) for knowledge_base in agent.knowledge_bases]
            agent_data= GetAgentRunChain(**select_as_dict(agent))
            if conversation is not None:
                conversation_data = GetConversationRunChain(**select_as_dict(conversation))
            else:
                conversation_data = GetConversationRunChain()
            chain_generator = run_chain(query, agent_data, knowledge_base_data, plugin_data, conversation_data)
            async for response in chain_generator:
                try:
                    if units is None:
                        units = response.get('units')

                    current_unit = response.get('current_unit')
                    current_unit_content = current_unit.get("output")
                    current_unit_name = current_unit.get("unit_name")
                    if await request.is_disconnected():
                        try:
                            await chain_generator.aclose()
                        except Exception:
                            pass
                        try:
                            if conversation_id is not None and conversation_uuid is not None and conv_data is not None:
                                update_params = UpdateConversationParam()
                                if generate_conversation_name_flag and len(history) > 0:
                                    try:
                                        conservation_name = await generate_conversation_name(query=json.dumps(history))
                                        update_params.name = conservation_name
                                        conv_data.name = conservation_name
                                        await redis_client.delete_prefix(f"sapper:conversation:list:user={request.user.id}:")
                                    except Exception:
                                        pass

                                if units is not None:
                                    history.append({
                                        "role": "system",
                                        "units": list(units.values())
                                    })
                                    update_params.chat_history = history
                                    conv_data.chat_history = history
                                encoded = jsonable_encoder(conv_data)
                                await redis_client.setex(conv_cache_key, 60 * 10, json.dumps(encoded, ensure_ascii=False))
                                async with async_db_session() as db:
                                    await conversation_dao.update(db=db, pk=conversation_id, obj=update_params)
                                    await db.commit()
                                saved_partial = True
                        except Exception:
                            pass
                        break
                    yield f'data: {json.dumps(response, ensure_ascii=False)}\n\n'
                    await asyncio.sleep(0.01)
                    if units.get(current_unit_name) is not None:
                        current_unit_output = units[current_unit_name].get("output", [])

                        def add_output(output_arr, output_content):
                            if output_content.get('type', 'text').lower() == 'text':
                                if len(output_arr) == 0 or output_arr[-1]["type"] != "text":
                                    output_arr.append({"content": "", "type": "text"})
                                output_arr[-1]["content"] = output_arr[-1].get("content") + output_content.get("content")

                            if output_content.get('type', 'text').lower() in ['audio', 'image', 'video']:
                                output_arr.append(output_content)

                            return output_arr

                        current_unit_output = add_output(current_unit_output, current_unit_content)
                        current_unit["output"] = current_unit_output
                        current_unit["input"] = None
                        units[current_unit_name] = current_unit
                except json.JSONDecodeError:
                    continue
            yield '[DONE]'
        except Exception as e:
            error_message = f"Error: {str(e)}"
            print(error_message)
            raise

        finally:
            if hasattr(request.user, 'id'):
                if agent :
                    await redis_client.delete_prefix(f"sapper:agent:detail:{agent_uuid}:")
                    await redis_client.delete_prefix(f"sapper:agent:workspace:{agent_uuid}:")
                    async with async_db_session.begin() as db:
                        interaction = await interaction_dao.get(db, agent_id=agent.id, user_id=request.user.id)
                        if interaction is None:
                            interaction = await interaction_dao.create(db, obj=CreateInteractionParam(
                                agent_id=agent.id,
                                user_id=request.user.id,
                            ))
                            await db.flush()
                            await db.refresh(interaction)
                        if interaction:
                            print("更新交互")
                            await interaction_dao.update(db, pk=interaction.id, obj=UpdateInteractionParam(
                                usage_count=interaction.usage_count + 1))

                if conversation_id is not None and conversation_uuid is not None and conv_data is not None:
                    update_params = UpdateConversationParam()
                    print("判断是否要生成名称1", generate_conversation_name_flag, len(history) )
                    if generate_conversation_name_flag and len(history) > 0:
                        print("判断是否要生成名称2", generate_conversation_name_flag, len(history) )
                        try:
                            conservation_name = await generate_conversation_name(query=json.dumps(history))
                            update_params.name = conservation_name
                            conv_data.name = conservation_name
                            await redis_client.delete_prefix(f"sapper:conversation:list:user={request.user.id}:")
                        except Exception as e:
                            print(f"生成对话名称失败: {str(e)}")

                    if units is not None and not saved_partial:
                        history.append({
                            "role": "system",
                            "units": list(units.values())
                        })
                        update_params.chat_history = history
                        conv_data.chat_history = history
                    encoded = jsonable_encoder(conv_data)
                    await redis_client.setex(conv_cache_key, 60 * 10, json.dumps(encoded, ensure_ascii=False))
                    async with async_db_session() as db:
                        # 更新数据库
                        update_result = await conversation_dao.update(
                            db=db,
                            pk=conversation_id,
                            obj=update_params
                        )
                        await db.commit()
                        print(f"数据库更新结果: {update_result}")


    @staticmethod
    async def update(*, request: Request, agent_uuid: str, obj: UpdateAgentParam) -> int:
        """
        更新智能体

        :param request: FastAPI请求对象
        :param agent_uuid: 智能体 UUID
        :param obj: 更新智能体参数
        :return:
        """
        async with async_db_session.begin() as db:
            agent = await agent_dao.get_by_uuid(db, agent_uuid)
            if not agent:
                raise errors.NotFoundError(msg='智能体不存在')
            if not request.user.is_superuser and request.user.id != agent.creator_id:
                raise errors.ForbiddenError(msg="您没有权限更新该智能体")

            if obj.plugin_uuids:
                for plugin_uuid in obj.plugin_uuids:
                    plugin = await plugin_dao.get_by_uuid(db, uuid=plugin_uuid)
                    if not plugin:
                        raise errors.NotFoundError(msg='插件不存在')
                    if not request.user.is_superuser and request.user.id != plugin.creator_id and  plugin.status != 2:
                        raise errors.ForbiddenError(msg="您没有权限关联该智能体")

            if obj.knowledge_base_uuids:
                for knowledge_base_uuid in obj.knowledge_base_uuids:
                    knowledge_base = await knowledge_base_dao.get_by_uuid(db, uuid=knowledge_base_uuid)
                    if not knowledge_base:
                        raise errors.NotFoundError(msg='知识库不存在')
                    if not request.user.is_superuser and request.user.id != knowledge_base.creator_id:
                        raise errors.ForbiddenError(msg="您没有权限关联该知识库")

            if obj.name is not None or obj.description is not None:
                for publication in agent.publications:
                    if publication.channel.name == "API":
                        plugin_uuid = publication.publish_config.get("plugin_uuid")
                        plugin = await plugin_dao.get_by_uuid(db, uuid=plugin_uuid)
                        if plugin is not None:
                            await plugin_dao.update(db, pk=plugin.id, obj=UpdatePluginParam(name=obj.name, description=obj.description))

            count = await agent_dao.update(db, agent, obj)
            return count

    @staticmethod
    async def delete(*, request: Request, obj: DeleteAgentParam) -> list[str]:
        """
        批量删除智能体

        :param request: FastAPI请求对象
        :param obj: 智能体 ID 列表
        :return:
        """
        async with async_db_session.begin() as db:
            agent_uuids = []
            for agent_id in obj.pks:
                agent = await agent_dao.get(db, agent_id)
                if not agent or (not request.user.is_superuser and request.user.id != agent.creator_id):
                    raise errors.ForbiddenError(msg="您没有权限删除智能体" + agent.name if agent else agent_id)
                if agent is not None and len(agent.publications) > 0:
                    raise errors.ForbiddenError(msg=f"该智能体{agent.name if agent else agent_id} 已经发布，请先取消相关发布")
                agent_uuids.append(agent.uuid)
            await agent_dao.delete(db, obj.pks)
            return agent_uuids


agent_service: AgentService = AgentService()
