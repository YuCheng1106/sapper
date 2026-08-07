import argparse
import os
from ..model_module.base_module.base import BaseModel
from ..model_module.function_moudle.llm_call.openai_ import ChatModel
from ..file_module.base import ToolOutput, ResourceOutput
RESOURCE_CHOOSE_PROMPT = '''
You are a helpful assistant with access to these resources:
{resources_description}
Choose the appropriate resource based on the user's instruction.
If no prompt is needed, reply None.
IMPORTANT: When you need to use a prompt, you must ONLY respond with the exact JSON object format below, nothing else:
{{
    "file_path": "resource_path",
}}
Here are some Error output cases:
Please use only the resources that are explicitly defined above.
'''

TOOL_CHOOSE_PROMPT = '''
You are a helpful assistant with access to these tools:
{tools_description}
Choose the appropriate tool based on the user's question. 
If no tool is needed, reply directly.
IMPORTANT: When you need to use a tool, you must ONLY respond with the exact JSON object format below, nothing else:
{{
    "tool": "tool-name",
    "arguments": {{
        "argument_name": "argument_value"
        }}
}}
After receiving a tool's response:
1. Transform the raw data into a natural, conversational response
2. Keep responses concise but informative
3. Focus on the most relevant information
4. Use appropriate context from the user's question
5. Avoid simply repeating the raw data
Please use only the tools that are explicitly defined above.
'''



parser = argparse.ArgumentParser(description='file module')
parser.add_argument("--sub_server_config", type=str, default="E:/public_tech_lib/file_module/sub_servers_config.json", help='Radius of cylinder')
parser.add_argument("--read_tool_select_model", type=BaseModel, default=ChatModel(
        base_url=os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1"),
        api_key=os.getenv("OPENAI_KEY", ""),
        model_name="gpt-4o",
        system_prompt=TOOL_CHOOSE_PROMPT,
        output_format=ToolOutput
), help='Radius of cylinder')
parser.add_argument("--convert_tool_select_model", type=BaseModel, default=ChatModel(
        base_url=os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1"),
        api_key=os.getenv("OPENAI_KEY", ""),
        model_name="gpt-4o",
        system_prompt=TOOL_CHOOSE_PROMPT,
        output_format=ToolOutput
), help='Radius of cylinder')
parser.add_argument("--resource_select_model", type=BaseModel, default=ChatModel(
        base_url=os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1"),
        api_key=os.getenv("OPENAI_KEY", ""),
        model_name="gpt-4o",
        system_prompt=RESOURCE_CHOOSE_PROMPT,
        output_format=ResourceOutput
    ), help="")

args = parser.parse_args()





