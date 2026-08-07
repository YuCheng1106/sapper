#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from fastapi import APIRouter

from core.conf import settings
from plugin.sapper_plugin.api.v1.plugin import router as plugin_router


v1 = APIRouter(prefix=f'{settings.FASTAPI_API_V1_PATH}/sapper')

v1.include_router(plugin_router, prefix='/plugins', tags=['sapper plugin'])
