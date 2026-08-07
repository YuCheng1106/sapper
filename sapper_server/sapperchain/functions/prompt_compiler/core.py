from ...base.compiler import BasePromptCompiler

import json
class SplPromptCompiler(BasePromptCompiler):
    def __init__(self, main_workflow_builder, context_builder):
        super(SplPromptCompiler, self).__init__()
        self.main_workflow_builder = main_workflow_builder
        self.context_builder = context_builder

    async def compile(self, prompt_type, spl_prompt):
        # 到 build_main_flow的时候放prompt_type就有点不合理了
        main_flow = await self.main_workflow_builder.build_main_flow(prompt_type, spl_prompt)
        context = await self.context_builder.build_context(spl_prompt)
        spl_chain = {
            "global_params": context,
            "workflow": main_flow
        }
        return spl_chain


