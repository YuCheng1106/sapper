#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from fastapi import APIRouter

from core.conf import settings
from plugin.sapper_agent.api.v1.agent import router as agent_router
from plugin.sapper_agent.api.v1.conversation import router as conversation_router
from plugin.sapper_agent.api.v1.interaction import router as interaction_router
from plugin.sapper_agent.api.v1.sapperchain import router as sapperchain_router


v1 = APIRouter(prefix=f'{settings.FASTAPI_API_V1_PATH}/sapper')

v1.include_router(agent_router, prefix='/agents', tags=['sapper agent'])
v1.include_router(conversation_router, prefix='/conversations', tags=['sapper conversation'])
v1.include_router(interaction_router, prefix='/interactions', tags=['sapper interactions'])
v1.include_router(sapperchain_router, prefix='/sapperchain', tags=['sapper chain'])
