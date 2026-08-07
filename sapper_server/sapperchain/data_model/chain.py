from pydantic import BaseModel
from .base import API
from .unit import Statement
from .statement import DataInput, ModelInput, APIInput


class Unit(BaseModel):
    name: str
    description: str
    input: dict | APIInput | DataInput | ModelInput
    type: str
    func_statements: list[Statement]


class FuncDef(BaseModel):
    name: str
    func_type: str
    func_des: list