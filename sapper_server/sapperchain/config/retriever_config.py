import argparse
from ..plugins.KG_module.function_module.graph_extractor import SubGraphExtractor
from ..plugins.KG_module.function_module.graph_context_builder import GraphContextBuilder
from ..plugins.data_module.function_moudle.ranker import FieldRanker
from ..plugins.model_module.function_moudle.llm_call.openai_ import ChatModel, EmbeddingModel
from pydantic import BaseModel

from typing import NamedTuple
EXTRACT_ENTITIES_FROM_QUERY = """
You are a helpful assistant that helps a human analyst identify all the named entities present in the input query, as well as general concepts that may be important for answering the query.
Each element you extract will be used to search a knowledge base to gather relevant information to answer the query.When querying entities, pay attention to the protagonist entities that are
useful for retrieval and do not extract some irrelevant supporting actors.

Extract only nouns from questions, not verbs.

Remember not to extract entity names that are not in the question, and don't make them up.

And in order of importance, from top to bottom.

# GOAL
Given the input query, identify all named entities and concepts present in the query.

Return output as a well-formed JSON-formatted string with the following format:
["entity1", "entity2", "entity3"]

# INPUT
query: {query}

"""
class RetrieverConfigArgs(NamedTuple):
    embedding_model_path: str
    extract_model: object
    embedding_model: object
    sub_graph_extractor: object
    ranker: object
    context_builder: object


class Entity(BaseModel):
    content: str

class EntityExtractedRes(BaseModel):
    entities: list[Entity]

class RetrieverConfigurator():
    def __init__(self, embedding_model_path, extract_model, embedding_model,graph_level, max_context_token):
        self.embedding_model_path = embedding_model_path
        self.extract_model = extract_model
        self.embedding_model = embedding_model
        self.sub_graph_extractor = SubGraphExtractor(graph_level=graph_level)
        self.ranker = FieldRanker()
        self.context_builder = GraphContextBuilder(max_context_tokens=max_context_token,ranker=FieldRanker())

# def setup_args() -> RetrieverConfigArgs:
#         parser = argparse.ArgumentParser(description='retriever setting')
#         parser.add_argument("--embedding_model_path", type=str,default="E:/sapper/sapper_chain/config_data/model", help='set embedding path for text retriever')
#         parser.add_argument("--extract_model", type=object, default=ChatModel(
#             api_key="replace-with-your-api-key",
#             base_url="https://api.example.com/v1",
#             model_name="gpt-4o",
#             system_prompt=EXTRACT_ENTITIES_FROM_QUERY,
#             output_format=EntityExtractedRes
#         ), help='Radius of cylinder')
#         parser.add_argument("--embedding_model", type=object, default=EmbeddingModel(
#             base_url="https://api.example.com/v1",
#             api_key="replace-with-your-api-key",
#             model_name="text-embedding-3-small"
#         ),help="")
#         parser.add_argument("--sub_graph_extractor",type=object,default=SubGraphExtractor(graph_level=None))
#         parser.add_argument("--ranker",type=str,default=FieldRanker())
#         parser.add_argument("--context_builder",type=object, default=GraphContextBuilder(max_context_tokens=8000,ranker=FieldRanker()))
#         return RetrieverConfigArgs(**vars(parser.parse_args()))
#
# retriever_args = setup_args()







