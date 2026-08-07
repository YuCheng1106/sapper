import argparse
from ..model_module.function_moudle.llm_call.openai_ import ChatModel,EmbeddingModel
from ..file_module.base import ToolOutput, ResourceOutput
from ..data_module.base_module.base import BaseChunker
from ..data_module.function_moudle.chunker import RegexChunkerBasedPythonLib, SemanticChunkerBasedDocling
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
from typing import NamedTuple

class ConfigArgs(NamedTuple):
    sub_Mcpserver_config: str
    extract_entity_prompt: str

def setup_args() -> ConfigArgs:
        parser = argparse.ArgumentParser(description='data module')
        parser.add_argument("--sub_Mcpserver_config", type=str, default="E:/public_tech_lib/data_module/sub_servers_config.json", help='Radius of cylinder')
        parser.add_argument("--extract_entity_prompt", type=str, default="EXTRACT_ENTITIES_FROM_QUERY",help="")
        return ConfigArgs(**vars(parser.parse_args()))

args = setup_args()







