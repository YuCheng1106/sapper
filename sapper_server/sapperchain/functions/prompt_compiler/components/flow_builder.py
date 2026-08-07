


# class MainFlowBuilder():
#     def __init__(self, function_decoupler, functional_unit_builder):
#         # function_decoupler放在重构里 关注点分离
#         self.function_decoupler = function_decoupler
#         self.functional_unit_builder = functional_unit_builder
#         # fuc_par
#     def build_main_flow(self, spl_prompt):
#         main_pipeline = []
#         modules  = self.function_decoupler.decouple(spl_prompt)
#         for module_def in modules:
#             unit = self.functional_unit_builder.build(module_def)
#             main_pipeline.append(unit)
#         return main_pipeline


class MainFlowBuilder():
    def __init__(self, func_analyzer, functional_unit_builder):
        # function_decoupler放在重构里 关注点分离
        self.func_analyzer = func_analyzer
        self.functional_unit_builder = functional_unit_builder
    #
    async def build_main_flow(self, prompt_type, spl_prompt):
        main_pipeline = []
        func_defs = await self.func_analyzer.analyze(prompt_type, spl_prompt)
        for func_def in func_defs:
            unit = await self.functional_unit_builder.build(func_def)
            main_pipeline.append(unit)
        return main_pipeline