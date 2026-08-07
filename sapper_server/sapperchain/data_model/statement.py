from pydantic import HttpUrl
from typing import Union
from typing import Optional, Dict
from .base import API
from .data import DataView


class APIInput(API):
    pass

class DataInput(API):
    # query: str
    data_view: DataView
    content_type: str = 'text'

class ModelInput(API):
   pass


class Tool(API):
    tool_def: dict
    tool_parameter: Union[str, Dict, None] = None
