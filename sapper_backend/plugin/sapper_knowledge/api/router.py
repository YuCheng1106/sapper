#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from fastapi import APIRouter

from core.conf import settings
from plugin.sapper_knowledge.api.v1.knowledge_base import router as knowledge_base_router
from plugin.sapper_knowledge.api.v1.text_collection import router as text_collection_router
from plugin.sapper_knowledge.api.v1.graph_collection import router as graph_collection_router
from plugin.sapper_knowledge.api.v1.text_block import router as text_block_router


v1 = APIRouter(prefix=f'{settings.FASTAPI_API_V1_PATH}/sapper')

v1.include_router(knowledge_base_router, prefix='/knowledge-bases', tags=['sapper knowledge'])
v1.include_router(text_collection_router, prefix='/text-collections', tags=['text collection'])
v1.include_router(graph_collection_router, prefix='/graph-collections', tags=['graph collection'])
v1.include_router(text_block_router, prefix='/text-blocks', tags=['text block'])

