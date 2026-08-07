#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from fastapi import APIRouter

from core.conf import settings
from plugin.sapper_publish.api.v1.publish import router as publish_router


v1 = APIRouter(prefix=f'{settings.FASTAPI_API_V1_PATH}/sapper')

v1.include_router(publish_router, prefix='/publications', tags=['sapper publish'])
