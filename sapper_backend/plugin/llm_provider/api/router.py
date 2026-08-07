#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from fastapi import APIRouter

from core.conf import settings
from plugin.llm_provider.api.v1.llm_provider import router as llm_provider_router
from plugin.llm_provider.api.v1.llm_model import router as llm_model_router



v1 = APIRouter(prefix=f'{settings.FASTAPI_API_V1_PATH}/llm')

v1.include_router(llm_provider_router, prefix='/providers', tags=['llm provider'])
v1.include_router(llm_model_router, prefix='/models', tags=['llm model'])
