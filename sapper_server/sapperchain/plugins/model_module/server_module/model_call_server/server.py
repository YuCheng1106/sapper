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



def serve() -> Server:
    server = Server("model_server")
    base_url = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
    api_key = os.getenv("OPENAI_KEY", "")
    chat_model = ChatModel(base_url=base_url, api_key=api_key, model_name="gpt-4o")
    embedding_model = EmbeddingModel(base_url=base_url, api_key=api_key, model_name="text-embedding-3-small")

    @server.list_tools()
    async def handle_list_tools() -> list[types.Tool]:
        return [
            types.Tool(
                name="call_chat_model",
                description="get response based on chat model",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "user_input": {"type": "string"},
                    },
                    "required": ["user_input"]
                }
            ),
            types.Tool(
                name="call_embedding_model",
                description="get response based on embedding model",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "user_input": {"type": "string"},
                    },
                    "required": ["user_input"]
                }
            )
        ]



    @server.call_tool()
    async def handle_tool_call(name: str, arguments: dict | None) -> list[types.TextContent]:
        try:
            if not arguments:
                raise ValueError("No arguments provided")

            if name == "call_chat_model":
                response =  chat_model.generate(
                    user_input=arguments["user_input"],
                )
                return [types.TextContent(type="text", text=f"model response:\n{response}")]
            if name == "call_embedding_model":
                response = embedding_model.generate(
                    user_input=arguments["user_input"],
                )
                return [types.TextContent(type="text", text=f"model response:\n{response}")]
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
