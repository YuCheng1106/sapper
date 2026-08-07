from pydantic import BaseModel

from .base import API
from .statement import APIInput, DataInput, ModelInput


class Statement(BaseModel):
    name: str
    description: str
    type: str
    input: APIInput | DataInput | ModelInput | API
    output: str
