import json
from typing import List, Optional
from pydantic import ConfigDict, Field, model_validator, HttpUrl
from common.schema import SchemaBase


class GetTextBlockRunChain(SchemaBase):
    model_config = ConfigDict(from_attributes=True)
    content: str = Field(default_factory=list, description="文本内容")
    vector: list = Field(default_factory=list, description="文本向量")
    similarity: float = Field(default=0.0, description="相似性得分")


class GetTextCollectionRunChain(SchemaBase):
    model_config = ConfigDict(from_attributes=True)
    text_blocks: List[GetTextBlockRunChain] = Field(default_factory=list, description="文本块")


class GetGraphCollectionRunChain(SchemaBase):
    entities: Optional[list] = Field(default_factory=list, description='知识库集合实体')
    relationships: Optional[list] = Field(default_factory=list, description='知识库集合关系')
    communities: Optional[list] = Field(default_factory=list, description='知识库集合社区')

class GetKnowledgeBaseRunChain(SchemaBase):
    model_config = ConfigDict(from_attributes=True)

    name: str = Field(description='知识库名')
    description: str = Field(description='简介')
    embedding_model: Optional[str] = Field(default="/DMetaSoul/Dmeta-embedding", description='知识库嵌入模型')
    uuid: str = Field(description='知识库 UUID')
    graph_collections: List[GetGraphCollectionRunChain] = Field(default_factory=list, description="图谱知识集合")
    text_collections: List[GetTextCollectionRunChain] = Field(default_factory=list, description="文本知识集合")

    @model_validator(mode='before')
    def transform_knowledge(cls, values):
        graph_collections = []
        for graph in values.get('graph_collections', []):
            for entity in graph["entities"]:
                entity["attributes"] = json.loads(entity["attributes"])
                entity["community_ids"] = entity["communities"]

            for community in graph["communities"]:
                try:
                    community["attributes"] = {}
                except Exception as e:
                    a = 1

            for relationship in graph["relationships"]:
                relationship["attributes"] = json.loads(relationship["attributes"])
                relationship["triple_source"] = relationship["source"]
                for entity in graph["entities"]:
                    if entity["uuid"] == relationship["source_entity_uuid"]:
                        relationship["source_entity"] = entity["name"]
                    if entity["uuid"] == relationship["target_entity_uuid"]:
                        relationship["target_entity"] = entity["name"]

            graph_collections.append(graph)
        values["graph_collections"] = graph_collections
        return values
