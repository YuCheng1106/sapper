from pydantic import BaseModel

class ResourceOutput(BaseModel):
    file_path: str

class Argument(BaseModel):
    argument_name: str
    argument_value: str

class ToolOutput(BaseModel):
    tool: str
    arguments: list[Argument]