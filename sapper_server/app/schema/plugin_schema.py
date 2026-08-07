from common.schema import SchemaBase
from typing import Optional
from pydantic import ConfigDict
from sapperchain.data_model.base import API


class GetPluginRunChain(API):
    model_config = ConfigDict(from_attributes=True)

class ImageRequest(SchemaBase):
    image_url: Optional[str] = None  # 图片 URL
    base64_image: Optional[str] = None  # Base64 编码的图片数据


class MarkdownConvertRequest(SchemaBase):
    content: str