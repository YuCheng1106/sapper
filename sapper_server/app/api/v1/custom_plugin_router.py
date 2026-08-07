#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import uuid
from fastapi import APIRouter
from app.schema.plugin_schema import (
 ImageRequest, MarkdownConvertRequest
)
from common.custom.md_to_docx import md_to_docx
from common.custom.md_to_image import md_to_image
from common.custom.md_to_pdf import md_to_pdf
from common.openai_image import image_to_text
from common.response.response_schema import ResponseModel, response_base
from core.path_conf import FILES_DIR
from pathlib import Path as LibPath
from app.conf import admin_settings

router = APIRouter()


@router.post('/image-2-text', summary='添加插件')
async def custom_image_to_text(obj: ImageRequest) -> ResponseModel:
    content = await image_to_text(obj.image_url)
    text = content.get('choices')
    if text:
        text = text[0].get('message').get('content')
    return response_base.success(data=text)


@router.post('/markdown-2-image', summary='md转图片')
async def custom_markdown_to_image(obj: MarkdownConvertRequest) -> ResponseModel:
    # 将 FILES_DIR 转换为 Path 对象
    upload_folder = LibPath(FILES_DIR)

    flod = 'md2text'
    # 生成一个 UUID 用作新文件夹的名称
    unique_id = str(uuid.uuid4())
    folder_path = upload_folder / flod / unique_id

    # 创建新的文件夹
    folder_path.mkdir(parents=True, exist_ok=True)

    filename = 'output.png'
    # 保存文件到指定的 UUID 文件夹中
    file_location = folder_path / filename

    file_url = f"{admin_settings.PUBLIC_FILE_URL}/{flod}/{unique_id}/{filename}"

    result = await md_to_image(content=obj.content, output_path=str(file_location), wkhtml_path=admin_settings.WKHTMLTOIMAGE)
    if result:
        return response_base.success(data={"url": file_url})


@router.post('/markdown-2-pdf', summary='md转pdf')
async def custom_markdown_to_pdf(obj: MarkdownConvertRequest) -> ResponseModel:
    # 将 FILES_DIR 转换为 Path 对象
    upload_folder = LibPath(FILES_DIR)

    flod = 'md2text'
    # 生成一个 UUID 用作新文件夹的名称
    unique_id = str(uuid.uuid4())
    folder_path = upload_folder / flod / unique_id

    # 创建新的文件夹
    folder_path.mkdir(parents=True, exist_ok=True)

    filename = 'output.pdf'
    # 保存文件到指定的 UUID 文件夹中
    file_location = folder_path / filename

    file_url = f"{admin_settings.PUBLIC_FILE_URL}/{flod}/{unique_id}/{filename}"

    result = await md_to_pdf(content=obj.content, output_path=str(file_location), wkhtml_path=admin_settings.WKHTMLTOPDF)
    if result:
        return response_base.success(data={"url": file_url})


@router.post('/markdown-2-docx', summary='md转pdf')
async def custom_markdown_to_docx(obj: MarkdownConvertRequest) -> ResponseModel:
    # 将 FILES_DIR 转换为 Path 对象
    upload_folder = LibPath(FILES_DIR)

    flod = 'md2text'
    # 生成一个 UUID 用作新文件夹的名称
    unique_id = str(uuid.uuid4())
    folder_path = upload_folder / flod / unique_id

    # 创建新的文件夹
    folder_path.mkdir(parents=True, exist_ok=True)

    filename = 'output.docx'
    # 保存文件到指定的 UUID 文件夹中
    file_location = folder_path / filename

    file_url = f"{admin_settings.PUBLIC_FILE_URL}/{flod}/{unique_id}/{filename}"

    result = await md_to_docx(content=obj.content, output_path=str(file_location))
    if result:
        return response_base.success(data={"url": file_url})
