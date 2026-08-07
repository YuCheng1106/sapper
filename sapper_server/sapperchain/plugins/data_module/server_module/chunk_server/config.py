import argparse
from data_module.base_module.base import BaseChunker
import mcp.types as types
from data_module.function_moudle.chunker import SemanticChunkerBasedDocling,RegexChunkerBasedPythonLib
parser = argparse.ArgumentParser(description='chunk server')
parser.add_argument("--tools", type=list[types.Tool], default=[
            types.Tool(
                name="chunk_data_by_regex",
                description="chunk the data by regex",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "data": {"type": "string"},
                    },
                    "required": ["data"]
                }
            ),
            types.Tool(
                name="chunk_data_by_semantic",
                description="chunk the data by semantic chunker",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "data": {"type": "string"},
                    },
                    "required": ["data"]
                }
            )
        ], help='Radius of cylinder')
parser.add_argument("--regex_chunker",type=BaseChunker,default=RegexChunkerBasedPythonLib())
parser.add_argument("--semantic_chunker",type=BaseChunker,default=SemanticChunkerBasedDocling(model_name="sentence-transformers/all-MiniLM-L6-v2",max_size="64"))

args = parser.parse_args()







