from pydantic import BaseModel
from .base import KnowledgeBase, API, Parameter


class LongMemory(BaseModel):
    preference: str | None
    knowledge_collections: list[KnowledgeBase] | None
    APIs: list[API] | None


class ShortMemory(BaseModel):
    chat_history: list[str] | None
    parameters: list[Parameter] | None


class AgentMemory(BaseModel):
    long_memory: LongMemory | str
    short_memory: ShortMemory | str

# class MemoryState(BaseModel):
#     state: Literal["empty", "full", "overload", "normal"]
