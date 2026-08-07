#!/usr/bin/env python3
# -*- coding: utf-8 -*-
from fastapi import APIRouter

from app.api.router import v1

from core.conf import settings

route = APIRouter(prefix=settings.FASTAPI_API_V1_PATH)

route.include_router(v1)

