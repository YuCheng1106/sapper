from file_module.function_module.file_reader import PdfReaderBasedDocling, FileReaderFactory
import asyncio
import logging
import sys

import mcp.types as types
from mcp.server import Server, NotificationOptions
from mcp.server.models import InitializationOptions
import mcp.server.stdio
from config import args
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)
from mcp.server import Server, NotificationOptions
from pydantic import FileUrl, AnyUrl


async def serve() -> Server:
    server = Server("file_scheduling_server")
    @server.list_resources()
    async def handle_list_resources() -> list[types.Resource]:
        return args.resources

    @server.read_resource()
    async def handle_resource_read(uri: AnyUrl) -> str | bytes:
        extension_name = uri.path.split(".")[-1]
        logger.info(extension_name)
        reader = FileReaderFactory.get_file_reader(extension_name)
        content = reader.read(uri.path)
        return content

    return server

def main():

    try:
        async def _run():
            async with mcp.server.stdio.stdio_server() as (read_stream, write_stream):
                server = await serve()
                await server.run(
                    read_stream, write_stream,
                    InitializationOptions(
                        server_name="file_scheduling_server",
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

