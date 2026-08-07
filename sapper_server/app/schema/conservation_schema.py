from pydantic import ConfigDict

from common.schema import SchemaBase


class GetConversationRunChain(SchemaBase):
    model_config = ConfigDict(from_attributes=True)
    chat_history: list
    chat_parameters: dict
