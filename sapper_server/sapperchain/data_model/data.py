
from pydantic import BaseModel,HttpUrl
from typing import Any, Optional, List, Dict

class TextBlock(BaseModel):
    similarity: float | None = None
    vector: list | None = None
    content: str

class TextData(BaseModel):
    text_blocks: list[TextBlock]


class Entity(BaseModel):
    uuid: str
    name: str
    type: str
    community_ids: list
    attributes: Optional[Dict[str, Any]] | str
    embeddings:Optional[List[float]] = None

class Relationship(BaseModel):
    uuid: str
    name: str
    type: str
    weight: Optional[float] = 1.0
    attributes: Optional[Dict[str, Any]] | str
    source_entity_uuid: str
    target_entity_uuid: str
    triple_source: str

class Community(BaseModel):
    uuid: str
    title: str
    level: str
    rating: str
    content: str
    attributes: dict[str, Any] | str

class GraphData(BaseModel):
    entities: list[Entity] | str | None = None
    relationships: list[Relationship] | str | None = None
    communities: list[Community] | str | None = None

class DataView(BaseModel):
    text_view: TextData | None = None
    graph_view: GraphData |None
