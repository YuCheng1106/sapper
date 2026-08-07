#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from fastapi import APIRouter

from core.conf import settings
from plugin.sapper_file.api.v1.file import router as file_router


v1 = APIRouter(prefix=f'{settings.FASTAPI_API_V1_PATH}/sapper')

v1.include_router(file_router, prefix='/files', tags=['sapper file'])
