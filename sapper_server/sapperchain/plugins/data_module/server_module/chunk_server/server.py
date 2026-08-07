import asyncio
import logging
import sys

import mcp.types as types
from mcp.server import Server, NotificationOptions
from mcp.server.models import InitializationOptions
import mcp.server.stdio
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)
from mcp.server import Server, NotificationOptions
from config import args

async def serve() -> Server:
    server = Server("chunk_server")
    # init reader
    regex_chunker = args.regex_chunker
    semantic_chunker = args.semantic_chunker

    @server.list_tools()
    async def handle_list_tools() -> list[types.Tool]:
        return args.tools

    @server.call_tool()
    async def handle_tool_call(name: str, arguments: dict | None) -> list[types.TextContent]:
        try:
            if not arguments:
                raise ValueError("No arguments provided")
            if name == "chunk_data_by_regex":
                logger.info(arguments["data"])
                logger.info(type(arguments["data"]))
                response = regex_chunker.chunk(
                    text=arguments["data"],
                )
                return [types.TextContent(type="text", text=f"chunked_data:\n{response}")]
            elif name == "chunk_data_by_semantic":
                response = semantic_chunker.chunk(
                    text=arguments["data"],
                )
                return [types.TextContent(type="text", text=f"chunked_data:\n{response}")]
            else:
                raise ValueError(f"Unknown tool: {name}")
        except Exception as e:
            logger.error(f"Tool call failed: {str(e)}")
            return [types.TextContent(type="text", text=f"Error: {str(e)}")]
    return server

def main():
    try:
        async def _run():
            async with mcp.server.stdio.stdio_server() as (read_stream, write_stream):
                server = await serve()
                await server.run(
                    read_stream, write_stream,
                    InitializationOptions(
                        server_name="chunk_server",
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

