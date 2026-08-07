#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from common.schema import SchemaBase
from pydantic import Field
from typing import Optional




class FileUploadRes(SchemaBase):
    """文本向量基础模型"""
    url: Optional[str] = Field(description='文件 URL')
