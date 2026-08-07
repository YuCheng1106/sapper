import asyncio
import json
from sapperchain.functions.prompt_compiler.core import SplPromptCompiler
from sapperchain.functions.prompt_compiler.components.unit_builder import FunctionalUnitBuilder
from sapperchain.functions.prompt_compiler.components.func_analyzer import FunctionAnalyzer
from sapperchain.functions.prompt_compiler.components.flow_builder import MainFlowBuilder
from sapperchain.functions.prompt_compiler.components.context_builder import ContextBuilder


async def main():
    spl_prompt_path = "input/agent_data (6)(1)(1).json"
    with open(spl_prompt_path, 'r', encoding='utf-8') as f:
        spl_prompt = json.load(f)
    functional_unit_builder = FunctionalUnitBuilder()
    function_analyzer = FunctionAnalyzer()
    context_builder = ContextBuilder()
    main_flow_builder = MainFlowBuilder(function_analyzer, functional_unit_builder)
    spl_compiler = SplPromptCompiler(main_flow_builder, context_builder)
    spl_chain = await spl_compiler.compile(spl_prompt["type"], spl_prompt["spl_form"])
    print(spl_chain)

if __name__ == '__main__':
    asyncio.run(main())
