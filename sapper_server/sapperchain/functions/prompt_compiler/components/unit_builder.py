import json


from ....utils.match import parse_refData, parse_refAPI, parse_refParameter , match_func_ref
from ....utils.prompt import is_refData, is_refAPI, extract_input_var, extract_output_var,extract_instruction_form, json_to_spl, extract_command, standardize_model_prompt

class IMatchRef:
    pass

class IStandardizeRef:

    @staticmethod
    async def standardize_refAPI(string_ref):
        match = parse_refAPI(string_ref)
        api_id, ref_input, ref_output = match.groups()

        refAPI_statement = {
            "link_id": api_id,
            "input": json.loads(ref_input),
            "output":ref_output
        }
        return refAPI_statement

    @staticmethod
    async def standardize_refdata(string_ref):
        match = parse_refData(string_ref)
        data_id, ref_input, ref_output = match.groups()
        refData_statement = {
            "link_id": data_id,
            "input": json.loads(ref_input),
            "output": ref_output
        }
        return refData_statement


    @staticmethod
    async def standardize_model_call(func_des):

        instruction = extract_instruction_form(func_des)[0]
        # 所有call_statement中的参数只有一个
        input, = parse_refParameter(extract_input_var(instruction)).groups()
        output, = parse_refParameter(extract_output_var(instruction)).groups()
        call_statement = {
            "link_id": "1111",
            "model_prompt": standardize_model_prompt(func_des),
            "input": f"${{{input}}}$",
            "output": f"${{{output}}}$",

        }
        return call_statement
    # def normalize(self, raw_unit_feature):
    #     # {"type":"API_unit","id":"xxxx","input":"{"image_url":"xxxxx"}","output":"$output1$"}
    #     # {"type":"data_unit":"id":"yyyy","input":"{"query":"yyyyy"}","output":"$output2$"}
    #     # {"type":"model_unit":"id":"zzzz","input":"~refParameter{input_id}/refParameter","output":"~refParameter{output_id}/refParameter", "model_prompt":"prompt"}
    #     # 这里的代码很垃圾
    #
    #     if is_refAPI(raw_unit_feature):
    #         ref_statement  = self.__normalize_refAPI(raw_unit_feature)
    #     elif is_refData(raw_unit_feature):
    #         ref_statement  = self.__normalize_refdata(raw_unit_feature)
    #     else:
    #         ref_statement = self.__normalize_model_call(raw_unit_feature)
    #     return ref_statement

class IStandardizeParam:

    @staticmethod
    def standardize_param(string_param):
        param = []
        matches = parse_refParameter(str(string_param))
        for match in matches:
            param.append(match)
        return param




class FunctionalUnitBuilder():
    def __init__(self):

        self.ref_std_interface = IStandardizeRef
        self.param_std_interface = IStandardizeParam

    def __identity_type(self, def_):
        if is_refAPI(def_):
            return "API"
        elif is_refData(def_):
            return "data"
        else:
            return "model"


    async def __parse_ref_func(self, func_des):
        ref_funcs = {}
        for d_index,statement_def in enumerate(func_des):
            string_refs = await match_func_ref(statement_def)
            if string_refs == []:
                pass
            else:
                for r_index, string_ref in enumerate(string_refs):
                    statement_type = self.__identity_type(string_ref)
                    if statement_type == "API":
                        call_statement = await self.ref_std_interface.standardize_refAPI(string_ref)
                        ref_funcs[f"API_{d_index}_{r_index}"] = call_statement
                    elif statement_type == "data":
                        call_statement = await self.ref_std_interface.standardize_refdata(string_ref)
                        ref_funcs[f"data_{d_index}_{r_index}"] = call_statement
                    else:
                        pass
        return ref_funcs

    async def __build_func(self, func_def):
        funcs = {}
        ref_funcs = await self.__parse_ref_func(func_def.func_des)
        funcs.update(ref_funcs)
        if func_def.func_type == "tool_model":
            call_statement = await self.ref_std_interface.standardize_model_call(func_def.func_des)
            funcs["tool_model"] = call_statement
        elif func_def.func_type == "mag_model":
            call_statement = await self.ref_std_interface.standardize_model_call(func_def.func_des)
            funcs["mag_model"] = call_statement
        return funcs


    async def __assembly_to_unit(self, func_name,func_des, func_type, func):
        unit = {
            "name": func_name,
            "description": "",
            "type": func_type,
            "functions": func,
            "unit_des": func_des,
        }
        return unit


    async def build(self, func_def):
        func = await self.__build_func(func_def)

        unit = await self.__assembly_to_unit(func_def.name,func_def.func_des, func_def.func_type, func)
        return unit





