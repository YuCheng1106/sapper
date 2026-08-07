#这里放一些针对prompt进行操作的公共技术
from .match import match_refParam, match_refData, match_refAPI, parse_refData, parse_refAPI, parse_refParameter

def extract_persona_form(spl_prompt):
    persona = [section for section in spl_prompt if section.get("sectionType") == "Persona"]
    return persona

def extract_audience_form(spl_prompt):
    audience = [section for section in spl_prompt if section.get("sectionType") == "Audience"]
    return audience

def extract_context_form(spl_prompt):
    context = [section for section in spl_prompt if section.get("sectionType") == "Context"]
    return context

def extract_context_control_form(spl_prompt):
    context_control = [section for section in spl_prompt if section.get("sectionType") == "ContextControl"]
    return context_control

def extract_instruction_form(spl_prompt):
    instructions = [section for section in spl_prompt if section.get("sectionType") == "Instruction"]
    return instructions




def extract_other_form(spl_prompt):
    other_form = [section for section in spl_prompt if section.get("sectionType") != "Instruction"]
    return other_form


def extract_input_var(instruction):
    input_var = [section for section in instruction["section"] if section.get("subSectionType") == "InputVariable"][0]["content"]
    return input_var

def extract_output_var(instruction):
    output_var = [section for section in instruction["section"] if section.get("subSectionType") == "OutputVariable"][0]["content"]
    return output_var

def extract_input_var_form(instruction):
    input_var = [section for section in instruction["section"] if section.get("subSectionType") == "InputVariable"]
    return input_var

def extract_output_var_form(instruction):
    output_var = [section for section in instruction["section"] if section.get("subSectionType") == "OutputVariable"]
    return output_var


def extract_rule_form(instruction):
    rules = [section for section in instruction["section"] if section.get("subSectionType") == "Rules"]
    return rules

def extract_format_form(instruction):
    format = [section for section in instruction["section"] if section.get("subSectionType") == "Format"]
    return format

def extract_command_form(instruction):
    commands = [section for section in instruction["section"] if section.get("subSectionType") == "Commands"]
    return commands

def extract_name(instruction):
    name = [section for section in instruction["section"] if section.get("subSectionType") == "Name"][0]["content"]
    return name

def extract_command(instruction):
    commands = [section for section in instruction["section"] if section.get("subSectionType") == "Commands"][0]["content"]
    return commands

def spilt_commands(commands, split_flags):

    split_points = [(i, elem) for i, elem in enumerate(commands) if elem in split_flags]

    if not split_points:
        return [commands.copy()]  # 没有分隔符时返回原列表的拷贝

    result = []
    prev = 0

    # 处理首个分隔符前的元素
    first_idx, first_sep = split_points[0]
    if first_idx > 0:
        result.append(commands[prev:first_idx])
    result.append([first_sep])
    prev = first_idx + 1

    # 遍历后续分隔符
    for idx, sep in split_points[1:]:
        # 添加中间内容
        if prev < idx:
            result.append(commands[prev:idx])

        result.append([sep])
        prev = idx + 1

    # 处理最后部分
    if prev < len(commands):
        result.append(commands[prev:])

    return result

def has_rule(instruction):
    if [section for section in instruction["section"] if section.get("subSectionType") == "Rules"] != []:
        return True
    return False

def has_format(instruction):
    if [section for section in instruction["section"] if section.get("subSectionType") == "Format"] != []:
        return True
    return False



def has_func_ref(text):
    if "~refAPI" in str(text) or "~refData" in str(text):
        return True
    return False


def is_refAPI(text):
    if "~refAPI" in str(text):
        return True
    return False

def is_refData(text):
    if "~refData" in str(text):
        return True
    return False

def is_refParameter(text):
    if "~refParameter" in str(text):
        return True
    return False


def json_to_spl(json_data):
    result = []
    for item in json_data:
        section_type = "@" + item["sectionType"]
        sub_sections = []

        for sub_item in item["section"]:
            sub_section_type = "@" + sub_item["subSectionType"]
            content = sub_item["content"]

            if sub_section_type == "@Name":
                # Handling "Name" differently by appending the content directly to the section type
                section_type += f" {content}"

            else:
                if isinstance(content, list):
                    temp_content = []
                    for item in content:
                        temp_content.append(sub_section_type + " " + item)
                    content = '\n    '.join(temp_content)
                # elif sub_section_type == "@OutputVariable" or "@INPVariable"
                elif isinstance(content, dict):
                    # Formatting the dictionary content with line breaks, avoiding backslashes in f-strings
                    formatted_content = []
                    print(content)
                    for key, value in content.items():
                        # Indenting each line for 'input' and 'output'
                        if key in ['input', 'output']:
                            indented_value = '\n'.join(['            ' + line for line in value.split('\n')])
                            indented_value = f"        @{key} {{\n{indented_value}\n        }}"
                        elif key in ['knowledge']:
                            continue
                        else:
                            indented_value = value
                        formatted_content.append(indented_value)
                    content = '\n'.join(formatted_content)

                if '@input' in content:
                    sub_sections.append(f"    {sub_section_type} {{\n{content}\n    }}")
                elif sub_section_type == '@Format':
                    sub_sections.append(f"    {sub_section_type} {{\n{content}\n    }}")
                elif sub_section_type == "@OutputVariable" or sub_section_type == "@InputVariable":
                    continue
                else:
                    sub_sections.append(f"    {content}\n    ")
        result.append(f"{section_type}:\n" + "\n\t".join(sub_sections))
    Spl_prompt = "\n".join(result)
    return Spl_prompt


def standardize_model_prompt(prompt):
    string_prompt = json_to_spl(prompt)
    refAPIs = match_refAPI(string_prompt)
    refDatas = match_refData(string_prompt)
    refParameters = match_refParam(string_prompt)
    if refDatas != []:
        for ref_data in refDatas:
            match = parse_refData(ref_data)
            data_id, ref_input, ref_output = match.groups()
            string_prompt = string_prompt.replace(ref_data,ref_output)
    if refParameters != []:
        for ref_parameter in refParameters:
            param_id, = parse_refParameter(ref_parameter).groups()
            string_prompt = string_prompt.replace(ref_parameter, f"${{{param_id}}}$")
    return string_prompt


