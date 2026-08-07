from pydantic import BaseModel as SchemaBase

from app.schema import GetKnowledgeBaseRunChain


class ContentEmbeddingParam(SchemaBase):
    content: str


class FileEmbeddingParam(SchemaBase):
    file_url: str


class FileReadingParam(SchemaBase):
    file_url: str

class KnowledgeRetrivalParam(SchemaBase):
    knowledge_base: GetKnowledgeBaseRunChain
    query: str
