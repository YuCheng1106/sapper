from datetime import timedelta
from typing import Sequence
from fastapi import Request
from pydantic import HttpUrl
from common.exception import errors
from core.conf import settings
from database.db import async_db_session
from database.redis import redis_client
from plugin.sapper_agent.crud import agent_dao
from plugin.sapper_agent.schema import UpdateAgentParam
from plugin.sapper_plugin.crud import plugin_dao
from plugin.sapper_plugin.schema import CreatePluginParam
from plugin.sapper_publish.crud import agent_publication_dao, publish_channel_dao
from plugin.sapper_publish.model import AgentPublication
from plugin.sapper_publish.schema import CreateAgentPublicationParam, AddAgentPublication, UpdateAgentPublicationParam, \
    DeleteAgentPublishParam
from plugin.sapper_publish.utils.id_generation import generate_id
from plugin.sapper_publish.utils.robot import robot_service

class AgentPublicationService:
    @staticmethod
    async def add(*, request: Request, obj: CreateAgentPublicationParam) ->None:
        async with async_db_session.begin() as db:
            agent = await agent_dao.get_by_uuid(db=db, uuid=obj.agent_uuid)
            if agent is None:
                raise errors.NotFoundError(msg="该智能体不存在")
            elif not request.user.is_superuser and request.user.id != agent.creator_id:
                raise errors.ForbiddenError(msg="没有权限操作该智能体")
            else:
                obj.published_by = request.user.id
                for channel in obj.channels:
                    publication_obj = AddAgentPublication(agent_id=agent.id, channel_id=channel.channel_id,
                                                                published_by=obj.published_by, publish_config=channel.publish_config)
                    print(publication_obj.channel_id)
                    channel = await publish_channel_dao.get(db=db, pk=channel.channel_id)
                    if channel is None:
                        raise errors.NotFoundError(msg="该发布渠道不存在")

                    if channel.name == 'Sapper商店':
                        await agent_dao.update_by_id(db=db, pk=agent.id, obj=UpdateAgentParam(status=2))
                    elif channel.name == '微信公众号':
                        # 如果是发布到微信服务号
                        publication_obj.publish_config = {
                            'Token': f"{generate_id(32)}",
                            'URL': f"{settings.SAPPER_BACKEND_URL}sapper/agent/wechat/generate_answer/{obj.agent_uuid}",
                            'EncodingAESKey': f"{generate_id(43)}"}
                    elif channel.name == 'API':
                        # 如果是发布成插件
                        plugin_json = {
                            "creator_id": request.user.id,
                            "name": agent.name,
                            "description": agent.description,
                            "server_url": HttpUrl(f'{settings.SAPPER_BACKEND_URL}sapper/sapperchain/{agent.uuid}/run'),
                            "headers": [
                                {
                                    "name": "Accept",
                                    "value": "application/json"
                                }
                            ],
                            "method": "POST",
                            "request_body": {
                                "mode": "raw",
                                "content_type": "application/json"
                            },
                            "stream": True,
                            "auth_config": {
                                "type": "bearer",
                                "token": request.headers.get('Authorization').replace('Bearer', '').strip()
                            },
                            "output_parameters": [
                                {
                                    "name": "current_unit",
                                    "description": "结果",
                                    "type": "object",
                                    "enabled": True,
                                    "properties": [
                                        {
                                            "name": "output",
                                            "description": "结果",
                                            "type": "object",
                                            "enabled": True,
                                            "properties": [
                                                {
                                                    "name": "content",
                                                    "description": "结果",
                                                    "type": "string",
                                                    "enabled": True
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ],
                            "input_parameters": [
                                {
                                    "name": "query",
                                    "description": "发送的消息",
                                    "type": "string",
                                    "location": "body",
                                    "required": True,
                                    "default": "${UserRequest}$"
                                }
                            ],
                            "status": 3,
                            "category": "智能体插件",
                            "return_value_type": "text"
                        }
                        plugin_data = CreatePluginParam(**plugin_json)
                        plugin = await plugin_dao.create(db=db, obj=plugin_data)
                        await redis_client.delete_prefix(f'sapper:plugin:list:user={request.user.id}:')
                        await redis_client.delete_prefix(f'sapper:plugin:detail:user={request.user.id}:{plugin.id}')
                        publication_obj.publish_config = {
                        'plugin_uuid': plugin.uuid,
                        'Authorization': f"{request.headers.get('Authorization')}",
                        'URL': f'{settings.SAPPER_BACKEND_URL}sapper/sapperchain/{agent.uuid}/run',
                        'Example': f"""
import json
import httpx
from httpx import Timeout
import asyncio

authorization = '{request.headers.get('Authorization')}'
server_url = '{settings.SAPPER_BACKEND_URL}sapper/sapperchain/{agent.uuid}/run'

async def main():
    query = '你好'
    headers = {{
        "Content-Type": 'application/json',
        "Authorization": authorization
    }}
    data = {{
        "query": query
    }}
    async with httpx.AsyncClient(timeout=Timeout(60.0, read=360.0)) as client:
        async with client.stream("POST", server_url, headers=headers, json=data) as response:
            async for line in response.aiter_lines():
                if line.startswith("data: ") and line != "data: [DONE]":
                    payload = json.loads(line[6:])
                    result = payload
                    for key in ['current_unit', 'output', 'content']:
                        result = result.get(key, "")
                        if not result: break
                    if result: print(result, end="", flush=True)
                    if payload.get("choices") and payload["choices"][0].get("finish_reason") == "stop":
                        break

asyncio.run(main())
                        """
                    }
                    elif channel.name == 'Sapper机器人':
                        # 如果是发布到Sapper机器人
                        config_json = {
                            "base_url": f'{settings.SAPPER_BACKEND_URL}sapper/sapperchain/{agent.uuid}/run',
                            "model_name": agent.name,  # 可以是空
                            "api_key": request.headers.get('Authorization'),
                            "type": "sapper"
                        }
                        robot_id = publication_obj.publish_config.get("robot_id")
                        res = await robot_service.add_model(robot_config=config_json, robot_id=robot_id)
                        print(res)
                    await agent_publication_dao.create(db, obj=publication_obj)
                await db.commit()
        return None


    @staticmethod
    async def update(*, request: Request, agent_publication_id: int, obj: UpdateAgentPublicationParam) -> int:
        async with async_db_session.begin() as db:
            # 获取智能体发布并检查权限
            agent_publication = await agent_publication_dao.get(db, pk=agent_publication_id)
            if not agent_publication:
                raise errors.NotFoundError(msg="发布记录不存在")

            # 更新智能体发布
            count = await agent_publication_dao.update(db, agent_publication_id, obj)
            return count

    @staticmethod
    async def delete(*, request: Request, obj: DeleteAgentPublishParam) -> int:
        async with async_db_session.begin() as db:
            agent_uuids = []
            for agent_publication_id in obj.pks:
                # 获取智能体发布并检查权限
                agent_publication = await agent_publication_dao.get(db, agent_publication_id)
                agent_uuids.append(agent_publication.agent_id)
                if not agent_publication:
                    raise errors.NotFoundError(msg="智能体发布不存在")
                if not request.user.is_superuser and request.user.id != agent_publication.published_by:
                    raise errors.ForbiddenError(msg="您没有权限删除该发布")
                if agent_publication.channel.name == 'Sapper商店':
                    await agent_dao.update_by_id(db=db, pk=agent_publication.agent_id, obj=UpdateAgentParam(status=1))
                elif agent_publication.channel.name == 'API':
                    plugin_uuid = agent_publication.publish_config.get('plugin_uuid')
                    await redis_client.delete_prefix(f'sapper:plugin:list:user={request.user.id}:')
                    await redis_client.delete_prefix(f'sapper:plugin:detail:user={request.user.id}:{plugin_uuid}')
                    if plugin_uuid is not None:
                        plugin = await plugin_dao.get_by_uuid(db=db, uuid=plugin_uuid)
                        if plugin:
                            await plugin_dao.delete(db, pks=[plugin.id])

            count = await agent_publication_dao.delete(db, pks=obj.pks)
            await db.commit()
            return count

    @staticmethod
    async def get(*, request: Request, agent_publication_id: int) -> AgentPublication:
        async with async_db_session() as db:
            # 获取智能体发布并检查权限
            agent_publication = await agent_publication_dao.get(db, pk=agent_publication_id)
            if not agent_publication:
                raise errors.NotFoundError(msg="智能体发布不存在")

            # 权限检查：如果不是超级管理员，且不是自己的智能体发布，不能获取
            if not request.user.is_superuser and agent_publication.published_by != request.user.uuid:
                raise errors.ForbiddenError(msg="您没有权限查看该智能体发布")

            return agent_publication

    @staticmethod
    async def get_all(*, e) -> Sequence[AgentPublication]:
        async with async_db_session() as db:
            return await agent_publication_dao.get_all(db=db)


agent_publication_service = AgentPublicationService()
