from ....utils.prompt import extract_persona_form,extract_audience_form,extract_context_form,extract_context_control_form,\
    extract_instruction_form,extract_command, spilt_commands, extract_input_var_form, extract_output_var_form, \
    extract_format_form, extract_rule_form, has_rule, has_format, has_refAPI, has_refData, extract_command_form, extract_output_var, extract_input_var
from ....data_model.agent import Unit, ToolUnit, MagUnit
from ....utils.match import parse_refAPI, replace_input_param, replace_output_param

class FunctionDecoupler():
    def __init__(self):
        pass

    def __align_param(self, string_ref, ins_input, ins_output):

        match = parse_refAPI(string_ref)
        _, ref_input, ref_output = match.groups()
        string_ref = replace_input_param(string_ref, ins_input)
        string_ref = replace_output_param(string_ref, ins_output)
        return [string_ref]

    def decouple(self, spl_prompt):
        units = []
        person = extract_persona_form(spl_prompt)
        audience = extract_audience_form(spl_prompt)
        context = extract_context_form(spl_prompt)
        context_control = extract_context_control_form(spl_prompt)
        instructions = extract_instruction_form(spl_prompt)

        for ins in instructions:
            split_command_flags = []
            input_var = extract_input_var_form(ins)
            output_var = extract_output_var_form(ins)
            ins_input = extract_input_var(ins)
            ins_output = extract_output_var(ins)
            if has_rule(ins):
                rules = extract_rule_form(ins)
            else:
                rules = None
            if has_format(ins):
                format = extract_format_form(ins)
            else:
                format = None
            commands  = extract_command(ins)

            for command in commands:
                if has_refAPI(command):
                    split_command_flags.append(command)

                else:
                    pass
            temp_commands = spilt_commands(commands, split_command_flags)
            if split_command_flags == []:
                unit = []
                unit.extend(person)
                unit.extend(audience)
                unit.extend(context)
                unit.extend(context_control)
                unit.append(ins)
                units.append(unit)
            else:

                for index,temp_command in enumerate(temp_commands):
                    if has_refAPI(temp_command):
                        a = 1
                        #instruction input $用户的请求$ output $重写的结果$
                        #  根据用户的请求从[xiaowu, chengyv] 筛选出合适的人
                        #  根据筛选的人进行检索refData{${user_request}$}{$检索结果$}
                        #  基于检索的结果重写
                        # 在这里需要将API的参数进行一个适配

                        if index == 0:
                            if len(temp_commands) == 1:
                                instruction_info = [
                                    {'subSectionId': '1', 'subSectionType': 'Commands', 'content': self.__align_param(temp_command[0], ins_input, ins_output)}
                                ]
                                instruction_info.extend(input_var)
                                instruction_info.extend(output_var)
                            else:
                                instruction_info = [
                                    {'subSectionId': 'S9', 'subSectionType': 'OutputVariable','content': '~refParameter{temp_variable}/refParameter'},
                                    {'subSectionId': '1', 'subSectionType': 'Commands', 'content': self.__align_param(temp_command[0], ins_input, '~refParameter{temp_variable}/refParameter')}
                                ]
                                instruction_info.extend(input_var)

                        elif index == len(temp_commands)-1:
                            instruction_info = [
                                {'subSectionId': 'S9', 'subSectionType': 'InputVariable', 'content': '~refParameter{temp_variable}/refParameter'},
                                {'subSectionId': '1', 'subSectionType': 'Commands', 'content': self.__align_param(temp_command[0], '~refParameter{temp_variable}/refParameter', ins_output)}
                            ]
                            instruction_info.extend(output_var)
                        else:
                            instruction_info = [
                                    {'subSectionId': 'S8', 'subSectionType': 'InputVariable', 'content': '~refParameter{temp_variable}/refParameter'},
                                    {'subSectionId': 'S9', 'subSectionType': 'OutputVariable','content': '~refParameter{temp_variable}/refParameter'},
                                    {'subSectionId': '1', 'subSectionType': 'Commands', 'content': self.__align_param(temp_command[0], '~refParameter{temp_variable}/refParameter', '~refParameter{temp_variable}/refParameter')}
                                ]
                        unit = [{
                            'sectionId': '1',
                            'sectionType': "Instruction",
                            'section': instruction_info
                        }]
                        units.append(unit)
                    else:
                        if index == 0:

                            instruction_info = [
                                    {'subSectionId': 'S9', 'subSectionType': 'OutputVariable','content': '~refParameter{temp_variable}/refParameter'},
                                    {'subSectionId': '1', 'subSectionType': 'Commands', 'content': temp_command}
                                ]
                            instruction_info.extend(input_var)
                            if rules!=None:
                                instruction_info.extend(rules)
                            if format!=None:
                                instruction_info.extend(format)
                        elif index == len(temp_commands)-1:
                            instruction_info = [
                                    {'subSectionId': 'S8', 'subSectionType': 'InputVariable', 'content': '~refParameter{temp_variable}/refParameter'},
                                    {'subSectionId': '1', 'subSectionType': 'Commands', 'content': temp_command}
                                ]
                            instruction_info.extend(output_var)
                            if rules!=None:
                                instruction_info.extend(rules)
                            if format!=None:
                                instruction_info.extend(format)

                        else:
                            instruction_info = [
                                    {'subSectionId': 'S8', 'subSectionType': 'InputVariable','content': '~refParameter{temp_variable}/refParameter'},
                                    {'subSectionId': 'S9', 'subSectionType': 'OutputVariable','content': '~refParameter{temp_variable}/refParameter'},
                                    {'subSectionId': '1', 'subSectionType': 'Commands', 'content': temp_command}
                                ]
                            if rules!=None:
                                instruction_info.extend(rules)
                            if format!=None:
                                instruction_info.extend(format)
                        unit = []
                        unit.extend(person)
                        unit.extend(audience)
                        unit.extend(context)
                        unit.extend(context_control)
                        unit.append({
                            'sectionId': '1',
                            'sectionType': "Instruction",
                            'section': instruction_info
                        })

                        units.append(unit)
        return units

    def decouple_base_instruction(self, spl_prompt):
        modules = []
        person = extract_persona_form(spl_prompt)
        audience = extract_audience_form(spl_prompt)
        context = extract_context_form(spl_prompt)
        context_control = extract_context_control_form(spl_prompt)
        instructions = extract_instruction_form(spl_prompt)

        for ins in instructions:

            input_var = extract_input_var_form(ins)
            output_var = extract_output_var_form(ins)
            ins_input = extract_input_var(ins)
            ins_output = extract_output_var(ins)
            if has_rule(ins):
                rules = extract_rule_form(ins)
            else:
                rules = None
            if has_format(ins):
                format = extract_format_form(ins)
            else:
                format = None
            commands = extract_command(ins)
            if has_refAPI(commands) or has_refData(commands):
                modules.append(ins)
            else:
                module = []
                module.extend(person)
                module.extend(audience)
                module.extend(context)
                module.extend(context_control)
                module.extend(instructions)

class InstructionDecoupler():
    def __init__(self):
        pass






