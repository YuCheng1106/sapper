from typing import Optional, List
from pydantic import Field, ConfigDict
from app.schema import GetKnowledgeBaseRunChain, GetPluginRunChain, GetAgentRunChain, GetConversationRunChain
from common.schema import SchemaBase

class GenerateAnswerParam(SchemaBase):
    model_config = ConfigDict(from_attributes=True)

    agent: GetAgentRunChain
    conversation: Optional[GetConversationRunChain] = Field()
    knowledge_bases: Optional[List[GetKnowledgeBaseRunChain]] = Field(default_factory=list)
    plugins: Optional[List[GetPluginRunChain]] = Field(default_factory=list)
    query: Optional[list] = Field(default_factory=list)


class GenerateAvatarParam(SchemaBase):
    requirement: str


class GenerateConversationNameParam(SchemaBase):
    query: str