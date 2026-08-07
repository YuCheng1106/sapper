from sapperchain.functions.prompt_compiler.core import SplPromptCompiler
from sapperchain.functions.prompt_compiler.components.unit_builder import FunctionalUnitBuilder
from sapperchain.functions.prompt_compiler.components.func_analyzer import FunctionAnalyzer
from sapperchain.functions.prompt_compiler.components.flow_builder import MainFlowBuilder
from sapperchain.functions.prompt_compiler.components.context_builder import ContextBuilder


class SPLCompiler:
    def __init__(self, spl_compiler) -> None:
        self.spl_compiler = spl_compiler

    @classmethod
    async def create(cls):
        functional_unit_builder = FunctionalUnitBuilder()
        function_analyzer = FunctionAnalyzer()
        context_builder = ContextBuilder()
        main_flow_builder = MainFlowBuilder(function_analyzer, functional_unit_builder)
        spl_compiler = SplPromptCompiler(main_flow_builder, context_builder)
        return cls(spl_compiler)

    async def run_compile(self, agent_type, spl_form):
        # try:
        spl_chain = await self.spl_compiler.compile(agent_type, spl_form)

        yield {'type': 'result', 'content': spl_chain}
        yield {'type': 'logInfo', 'content': "编译成功\n"}

        # except Exception as e:
        #     yield {'type': 'logInfo',
        #            'content': "编译错误: 在编译时出现了问题。请检查您的更改并重试。\n"}
