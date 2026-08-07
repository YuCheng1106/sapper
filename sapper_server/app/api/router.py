#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import asyncio

from fastapi import APIRouter

from app.api.v1.sapperchain_router import router as sapperchain_router
from app.api.v1.sapperrag_router import router as sapperrag_router
from app.api.v1.custom_plugin_router import router as custom_plugin_router
from app.api.v1.health_router import router as health_router
# import sys
# print(sys.platform)
# if sys.platform == "win32":
#     asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

v1 = APIRouter()

v1.include_router(health_router, prefix='/health', tags=['health'])
v1.include_router(sapperchain_router, prefix='/sapperchain', tags=['sapperchain'])
v1.include_router(sapperrag_router, prefix='/sapperrag', tags=['sapperrag'])
v1.include_router(custom_plugin_router, prefix='/custom-plugin', tags=['custom plugin'])
