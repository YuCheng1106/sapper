from ....utils.prompt import extract_instruction_form,extract_command, extract_other_form\
    , is_refAPI, is_refData, extract_name
from ....data_model.chain import FuncDef
class FunctionAnalyzer():
    def __init__(self):
        pass

    def __analyze_func_type(self):
        pass

    def __analyze_main_func(self):
        pass

    async def analyze(self, prompt_type, spl_prompt):
        # spl_prompt为参数名的话有点固定的感觉，这个function Analyzer只能分析spl_prompt
        func_defs = []

        instructions = extract_instruction_form(spl_prompt)

        other_form = extract_other_form(spl_prompt)
        for ins in instructions:
            name = extract_name(ins)
            commands = extract_command(ins)

            if is_refAPI(commands):
                func_defs.append(FuncDef(name=name, func_type="API", func_des=[ins]))
            elif is_refData(commands):
                func_defs.append(FuncDef(name=name, func_type="data", func_des=[ins]))
            else:
                func_des = other_form.copy()
                func_des.extend([ins])
                if prompt_type == 1:
                    func_defs.append(FuncDef(name=name, func_type="tool_model", func_des=func_des))
                else:
                    func_defs.append(FuncDef(name=name, func_type="mag_model", func_des=func_des))

        return func_defs
