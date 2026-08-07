from function_module.graph_importer import *
from function_module.graph_extractor import *
from data_module.function_moudle.parser import JsonParser
from data_module.function_moudle.retriever import *
from model_module.function_moudle.llm_call.openai_ import *
import asyncio
import logging
import os
import sys

import mcp.types as types
from mcp.server import Server, NotificationOptions
from mcp.server.models import InitializationOptions
import mcp.server.stdio

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)
from mcp.server import Server, NotificationOptions
RETRIEVER_PROMPT = '''
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
'''


def serve() -> Server:
    server = Server("kg_server")
    graph_import = GraphImporter(json_parser=JsonParser())
    base_url = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
    api_key = os.getenv("OPENAI_KEY", "")
    entity_identifier = PromptRetriever(llm=ChatModel(base_url=base_url, api_key=api_key, model_name="gpt-4o"), prompt=RETRIEVER_PROMPT)
    entity_retriever = SemanticRetriever(llm=EmbeddingModel(base_url=base_url, api_key=api_key, model_name="text-embedding-3-small"))
    sub_graph_extractor = SubGraphExtractor(graph_level=1)

    @server.list_tools()
    async def handle_list_tools() -> list[types.Tool]:
        return [
            types.Tool(
                name="retrieve_entity",
                description="retrieve entities from graph data",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "user_query": {"type": "string"},
                        "database": {"type": "list"}
                    },
                    "required": ["user_query","database"]
                }
            ),
            types.Tool(
                name="identify_entity",
                description="identify entities in text",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "user_query": {"type": "string"},
                        "database": {"type": "list","default":""}
                    },
                    "required": ["user_query"]
                }
            ),
            types.Tool(
                name="extract_subgraph",
                description="extract subgraph based on entities",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "entities": {"type": "list"},
                        "graph": {"type": "object"}
                    },
                    "required": ["entities","graph"]
                }
            )
        ]

    @server.call_tool()
    async def handle_tool_call(name: str, arguments: dict | None) -> list[types.TextContent]:
        try:
            if not arguments:
                raise ValueError("No arguments provided")

            if name == "retrieve_entity":
                response =  entity_retriever.retrieve_from_database(
                    user_query = arguments["user_input"],
                    database = arguments["database"]
                )
                return [types.TextContent(type="text", text=f"retrieved entities:\n{response}")]
            elif name == "identify_entity":
                response = entity_identifier.retrieve_from_database(
                    user_query = arguments["user_query"],
                    database = ""
                )
                return [types.TextContent(type="text", text=f"entity data:\n{response}")]
            elif name == "extract_subgraph":
                response = sub_graph_extractor.extract_by_entities(
                    entities = arguments["entities"],
                    graph = arguments["graph"]
                )
                return [types.TextContent(type="text", text=f"subgraph:\n{response}")]
            raise ValueError(f"Unknown tool: {name}")
        except Exception as e:
            logger.error(f"Tool call failed: {str(e)}")
            return [types.TextContent(type="text", text=f"Error: {str(e)}")]

    return server
def main():
    try:
        async def _run():
            async with mcp.server.stdio.stdio_server() as (read_stream, write_stream):
                server = serve()
                await server.run(
                    read_stream, write_stream,
                    InitializationOptions(
                        server_name="openai-server",
                        server_version="0.1.0",
                        capabilities=server.get_capabilities(
                            notification_options=NotificationOptions(),
                            experimental_capabilities={}
                        )
                    )
                )
        asyncio.run(_run())
    except KeyboardInterrupt:
        logger.info("Server stopped by user")
    except Exception as e:
        logger.exception("Server failed")
        sys.exit(1)

if __name__ == "__main__":
    main()
