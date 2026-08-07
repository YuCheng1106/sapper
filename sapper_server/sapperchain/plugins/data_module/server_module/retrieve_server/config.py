import argparse
import os
import mcp.types as types
from data_module.base_module.base import BaseRetriever
from data_module.function_moudle.retriever import SemanticRetriever, PromptRetriever, RegexRetriever
from model_module.function_moudle.llm_call.openai_ import EmbeddingModel,ChatModel
parser = argparse.ArgumentParser(description='chunk server')
parser.add_argument("--tools", type=list[types.Tool], default=[
            types.Tool(
                name="retrieve_data_by_regex",
                description="retrieve data by regex",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "user_query": {"type": "string"},
                        "database":{"type":"list"}
                    },
                    "required": ["user_query","database"]
                }
            ),
            types.Tool(
                name="retrieve_data_by_semantic",
                description="retrieve data by semantic",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "user_query": {"type": "string"},
                        "database":{"type":"list"}
                    },
                    "required": ["user_query","database"]
                }
            )
        ], help='Radius of cylinder')

parser.add_argument("--regex_retriever",type=BaseRetriever,default=RegexRetriever())
parser.add_argument("--semantic_retriever",type=BaseRetriever,default=SemanticRetriever(
    llm=EmbeddingModel(
    base_url=os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1"),
    api_key=os.getenv("OPENAI_KEY", ""),
    model_name="text-embedding-3-small"
)
))
parser.add_argument("--prompt_retriever",type=BaseRetriever,default=PromptRetriever(
    llm=ChatModel(
        base_url=os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1"),
        api_key=os.getenv("OPENAI_KEY", ""),
        model_name="gpt-4o",
        system_prompt="",
        output_format=""
            ),
    prompt=""
))

args = parser.parse_args()





