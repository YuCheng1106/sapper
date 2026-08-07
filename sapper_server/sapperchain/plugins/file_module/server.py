from typing import Any
import os
import asyncio
import logging
import sys
import shutil
from contextlib import AsyncExitStack
import mcp.types as types
from mcp.server import Server, NotificationOptions
from mcp.server.models import InitializationOptions
import mcp.server.stdio
from file_module.function_module.file_reader import FileReaderFactory
from model_module.function_moudle.llm_call.openai_ import ChatModel
from mcp.server import Server, NotificationOptions
from pydantic import FileUrl, AnyUrl
from mcp.server import Server, NotificationOptions
from mcp.client.session import ClientSession
from mcp.client.stdio import StdioServerParameters, stdio_client
from pydantic import BaseModel
from util import Configuration
from typing import Dict, Any
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)
from config import args




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
    server = Server("file_module_server")
    config = Configuration()
    server_config = config.load_config(args.sub_server_config)
    sub_servers = [
        SubServer(name, srv_config)
        for name, srv_config in server_config["mcpServers"].items()
    ]
    read_tools = []
    convert_tools = []
    file_resources = []
    for sub_server in sub_servers:
        if sub_server.name == "read_file_server":
            await sub_server.initialize()
            tools = await sub_server.list_tools()
            read_tools.extend(tools)
        elif sub_server.name == "file_convert_server":
            await sub_server.initialize()
            tools = await sub_server.list_tools()
            convert_tools.extend(tools)
        elif sub_server.name == "file_scheduling_server":
            await sub_server.initialize()
            resources = await sub_server.list_resources()
            file_resources.extend(resources)
        else:
            pass

    read_tool_description = "\n".join([tool.format_for_llm() for tool in read_tools])
    convert_tool_description = "\n".join([tool.format_for_llm() for tool in convert_tools])


    read_tool_select_model = args.read_tool_select_model
    read_tool_select_model.system_prompt = read_tool_select_model.system_prompt.format(tools_description=read_tool_description)

    convert_tool_select_model = args.convert_tool_select_model
    convert_tool_select_model.system_prompt = convert_tool_select_model.system_prompt.format(tools_description=convert_tool_description)
    resource_select_model = args.resource_select_model

    @server.list_tools()
    async def handle_list_tools() -> list[types.Tool]:
        return [
            types.Tool(
                name = "run_scheduling_server",
                description="running scheduling server to solve the problem about scheduling local resource",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "scheduling_task_description" :{"type":"string"},
                    },
                    "required": ["scheduling_task_description"]
                }

            ),
            types.Tool(
                name="run_read_server",
                description="running read server to solve the problem about reading file",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "read_task_description": {"type": "string"},
                    },
                    "required": ["read_task_description"]
                }
            ),
            types.Tool(
                name="run_convert_server",
                description="running convert server to solve the problem about converting file type",
                inputSchema={
                    "type": "object",
                    "properties": {
                        "conversion_task_description": {"type": "string"},
                    },
                    "required": ["conversion_task_description"]
                }
            )
        ]

    @server.call_tool()
    async def handle_tool_call(name: str, arguments: dict | None) -> list[types.TextContent]:
        try:
            if not arguments:
                raise ValueError("No arguments provided")

            if name == "run_scheduling_server":
                sub_server = next(sub for sub in sub_servers if sub.name == "read_local_resource_server")
                selected_resource = resource_select_model.generate(arguments["scheduling_task_description"])
                resource_response = sub_server.execute_resource(selected_resource.name, selected_resource.uri)
                return [types.TextContent(type="text", text=f"File content:\n{resource_response}")]
            elif name == "run_read_server":
                sub_server = next(sub for sub in sub_servers if sub.name == "read_file_server")
                logger.info(sub_server)
                select_llm_response = read_tool_select_model.generate(arguments["conversion_task_description"])
                logger.info(select_llm_response)
                tool_arguments = {}
                for argument in select_llm_response.arguments:
                    tool_arguments[argument.argument_name] = argument.argument_value
                logger.info(tool_arguments)
                tool_response = await sub_server.execute_tool(select_llm_response.tool, tool_arguments)
                return [types.TextContent(type="text", text=f"File content:\n{tool_response}")]
            elif name == "run_convert_server":
                sub_server = next(sub for sub in sub_servers if sub.name == "file_convert_server")
                selected_tool = convert_tool_select_model.generate(arguments["task_description"])
                tool_response = sub_server.execute_tool(selected_tool.name, selected_tool.argument)
                return [types.TextContent(type="text", text=f"File path:\n{tool_response}")]
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
                        server_name="file_module_server",
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
        logger.info(e)
        logger.exception("Server failed")
        sys.exit(1)
