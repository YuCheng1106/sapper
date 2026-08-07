import sys
project_root = "E:\public_tech_lib"  # 根据实际结构调整
sys.path.append(str(project_root))
import os
os.environ["HF_ENDPOINT"] = "https://hf-mirror.com"

from mcp.server import Server, NotificationOptions
from mcp.server.models import InitializationOptions
import mcp.server.stdio
from pydantic import FileUrl, AnyUrl

from mcp.client.session import ClientSession
from mcp.client.stdio import StdioServerParameters, stdio_client
import os
import asyncio
import logging
import sys
import shutil
from contextlib import AsyncExitStack
import mcp.types as types
from mcp.server.models import InitializationOptions
import mcp.server.stdio
from util import Configuration
from typing import Dict, Any
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)
from config import args

from mcp.server import Server, NotificationOptions

class Resource:
    def __init__(self, uri: AnyUrl, name: str, description: str):
        self.uri: AnyUrl = uri
        self.name: str = name
        self.description: str = description

    def format_for_llm(self) ->str:

        return f"""
           uri: {self.uri.path}
           name:{self.name}
           Description: {self.description}      
                """

class Tool:
    """Represents a tool with its properties and formatting."""

    def __init__(
        self, name: str, description: str, input_schema: dict[str, Any]
    ) -> None:
        self.name: str = name
        self.description: str = description
        self.input_schema: dict[str, Any] = input_schema

    def format_for_llm(self) -> str:

        args_desc = []
        if "properties" in self.input_schema:
            for param_name, param_info in self.input_schema["properties"].items():
                arg_desc = (
                    f"- {param_name}: {param_info.get('description', 'No description')}"
                )
                if param_name in self.input_schema.get("required", []):
                    arg_desc += " (required)"
                args_desc.append(arg_desc)

        return f"""
            Tool: {self.name}
            Description: {self.description}
            Arguments:
            {chr(10).join(args_desc)}
            """

class SubServer():
    def __init__(self, name: str, config: dict[str, Any]) -> None:
        self.name: str = name
        self.config: dict[str, Any] = config
        self.stdio_context: Any | None = None
        self.session: ClientSession | None = None
        self._cleanup_lock: asyncio.Lock = asyncio.Lock()
        self.exit_stack: AsyncExitStack = AsyncExitStack()

    async def initialize(self) -> None:
        """Initialize the server connection."""
        command = (
            shutil.which("npx")
            if self.config["command"] == "npx"
            else self.config["command"]
        )
        if command is None:
            raise ValueError("The command must be a valid string and cannot be None.")

        server_params = StdioServerParameters(
            command=command,
            args=self.config["args"],
            env={**os.environ, **self.config["env"]}
            if self.config.get("env")
            else None,
        )
        try:
            stdio_transport = await self.exit_stack.enter_async_context(
                stdio_client(server_params)
            )
            read, write = stdio_transport
            session = await self.exit_stack.enter_async_context(
                ClientSession(read, write)
            )
            await session.initialize()
            self.session = session
        except Exception as e:
            logging.error(f"Error initializing server {self.name}: {e}")
            await self.cleanup()
            raise

    async def list_tools(self) -> list[Any]:
        if not self.session:
            raise RuntimeError(f"Server {self.name} not initialized")

        tools_response = await self.session.list_tools()
        tools = []

        for tool in tools_response.tools:
            tools.append(Tool(tool.name, tool.description, tool.inputSchema))
        return tools

    async def list_resources(self) -> list[Any]:
        if not self.session:
            raise RuntimeError(f"Server {self.name} not initialized")
        resources_response = await self.session.list_resources()
        resources = []
        for resource in resources_response.resources:
            resources.append(Resource(resource.uri, resource.name, resource.description))
        return resources

    async def execute_tool(
        self,
        tool_name: str,
        arguments: dict[str, Any],
        retries: int = 2,
        delay: float = 1.0,
    ) -> Any:
        if not self.session:
            raise RuntimeError(f"Server {self.name} not initialized")

        attempt = 0
        while attempt < retries:
            try:
                logging.info(f"Executing {tool_name}...")
                logger.info(arguments)
                result = await self.session.call_tool(tool_name, arguments)

                return result

            except Exception as e:
                logging.info(e)
                attempt += 1
                logging.warning(
                    f"Error executing tool: {e}. Attempt {attempt} of {retries}."
                )
                if attempt < retries:
                    logging.info(f"Retrying in {delay} seconds...")
                    await asyncio.sleep(delay)
                else:
                    logging.error("Max retries reached. Failing.")
                    raise



    async def execute_resource(
        self, resource_name: str,
        resource_uri: AnyUrl,
        retries: int = 2,
        delay: float = 1.0
    ) -> Any:
        if not self.session:
            raise RuntimeError(f"Server {self.name} not initialized")

        attempt = 0
        while attempt < retries:
            try:
                logging.info(f"Executing {resource_name}...")
                result = await self.session.read_resource(resource_uri)

                return result

            except Exception as e:
                logging.info(e)
                attempt += 1
                logging.warning(
                    f"Error executing resource: {e}. Attempt {attempt} of {retries}."
                )
                if attempt < retries:
                    logging.info(f"Retrying in {delay} seconds...")
                    await asyncio.sleep(delay)
                else:
                    logging.error("Max retries reached. Failing.")
                    raise

    async def cleanup(self) -> None:
        """Clean up server resources."""
        async with self._cleanup_lock:
            try:
                await self.exit_stack.aclose()
                self.session = None
                self.stdio_context = None
            except Exception as e:
                logging.error(f"Error during cleanup of server {self.name}: {e}")

async def serve() -> Server:
    server = Server("data_module_server")
    config = Configuration()
    server_config = config.load_config(args.sub_server_config)
    sub_servers = [
        SubServer(name, srv_config)
        for name, srv_config in server_config["mcpServers"].items()
    ]
    chunk_tools = []
    retrieve_tools = []

    for sub_server in sub_servers:
        if sub_server.name == "chunk_data_server":
            await sub_server.initialize()
            tools = await sub_server.list_tools()
            chunk_tools.extend(tools)
        elif sub_server.name == "retrieve_data_server":
            await sub_server.initialize()
            tools = await sub_server.list_tools()
            retrieve_tools.extend(tools)
        else:
            pass

    chunk_tool_description = "\n".join([tool.format_for_llm() for tool in chunk_tools])
    retrieve_tool_description = "\n".join([tool.format_for_llm() for tool in retrieve_tools])

    chunk_tool_select_model = args.chunk_tool_select_model
    chunk_tool_select_model.system_prompt = chunk_tool_select_model.system_prompt.format(tools_description=chunk_tool_description)

    retrieve_tool_select_model = args.retrieve_tool_select_model
    retrieve_tool_select_model.system_prompt = retrieve_tool_select_model.system_prompt.format(tools_description=retrieve_tool_description)

    @server.list_tools()
    async def handle_list_tools() -> list[types.Tool]:
        return [
            types.Tool(
                name="run_chunk_server",
                description="running chunk server to solve the problem about chunking data",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "chunking_task_des": {"type": "string"},
                    },
                    "required": ["chunking_task_des"]
                }
            ),
            types.Tool(
                name="run_retriever_server",
                description="running retriever server to solve the problem about retrieving data",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "retrieval_task_des": {"type": "string"},
                    },
                    "required": ["retrieval_task_des"]
                }
            )
        ]


    @server.call_tool()
    async def handle_tool_call(name: str, arguments: dict | None) -> list[types.TextContent]:
        try:
            if not arguments:
                raise ValueError("No arguments provided")

            if name == "run_chunk_server":
                sub_server = next(sub for sub in sub_servers if sub.name == "retrieve_data_server")
                select_llm_response = chunk_tool_select_model.generate(arguments["chunking_task_des"])
                tool_arguments = {}
                for argument in select_llm_response.arguments:
                    tool_arguments[argument.argument_name] = argument.argument_value
                tool_response = await sub_server.execute_tool(select_llm_response.tool, tool_arguments)
                return [types.TextContent(type="text", text=f"chunked data:\n{tool_response}")]
            elif name == "run_retriever_server":
                sub_server = next(sub for sub in sub_servers if sub.name == "retrieve_data_server")
                select_llm_response = retrieve_tool_select_model.generate(arguments["retrieval_task_des"])
                tool_arguments = {}
                for argument in select_llm_response.arguments:
                    tool_arguments[argument.argument_name] = argument.argument_value
                tool_response = await sub_server.execute_tool(select_llm_response.tool, tool_arguments)
                return [types.TextContent(type="text", text=f"retrieve data:\n{tool_response}")]
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
                        server_name="data_module_server",
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