# app/common/data_conversion.py

def convert_spl_to_splform(spl):
    splform = {"formData": []}
    for section_type, sections in spl.items():
        section_id = str(len(splform['formData']))
        if 'Instruction' in section_type:
            splform_sections = [{"subSectionId": str(i), "sequencialId": key.split('-')[1], "subSectionType": key.split('-')[0], "content": value} for i, (key, value) in enumerate(sections.items())]
            splform['formData'].append({"sectionId": section_id, "sectionType": section_type, "sections": splform_sections})
        elif 'Guardrails' in section_type:
            splform_sections = [{"subSectionId": str(i), "sequencialId": str(i), "subSectionType": key, "content": value} for i, (key, value) in enumerate(sections.items())]
            splform['formData'].append({"sectionId": section_id, "sectionType": "Guardrails", "sections": splform_sections})
        else:
            splform_sections = [{"subSectionId": key.split('-')[1], "sequencialId": key.split('-')[1], "subSectionType": key.split('-')[0], "content": value} for key, value in sections.items()]
            splform['formData'].append({"sectionId": section_id, "sectionType": section_type, "sections": splform_sections})
    return splform

def convert_splform_to_spl(splform):
    spl = {}
    i = 0
    for section in splform:
        if section['sectionType'] == "Instruction":
            section_key = f"{section['sectionType']}-{i}"
            i += 1
            spl[section_key] = {}
            for sub_section in section['sections']:
                sub_section_key = f"{sub_section['subSectionType']}-{sub_section['sequencialId']}"
                spl[section_key][sub_section_key] = sub_section['content']
        elif section['sectionType'] == "Guardrails":
            section_key = section['sectionType']
            spl[section_key] = {}
            for sub_section in section['sections']:
                spl[section_key][sub_section['subSectionType']] = sub_section['content']
        else:
            section_key = section['sectionType']
            spl[section_key] = {}
            for sub_section in section['sections']:
                sub_section_key = f"{sub_section['subSectionType']}-{sub_section['sequencialId']}"
                spl[section_key][sub_section_key] = sub_section['content']
    return spl

class ConvertTool:
    @staticmethod
    def JSON2SPL(jsonData):
        result = []
        for item in jsonData:
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
                    elif isinstance(content, dict):
                        # Formatting the dictionary content with line breaks, avoiding backslashes in f-strings
                        formatted_content = []
                        for key, value in content.items():
                            # Indenting each line for 'input' and 'output'
                            if key in ['input', 'output']:
                                indented_value = '\n'.join(['            ' + line for line in value.split('\n')])
                            else:
                                indented_value = value
                            formatted_content.append(f"        @{key} {{\n{indented_value}\n        }}")
                        content = '\n'.join(formatted_content)

                    if '@input' in content:
                        sub_sections.append(f"    {sub_section_type} {{\n{content}\n    }}")
                    elif sub_section_type == '@Format':
                        sub_sections.append(f"    {sub_section_type} {{\n{content}\n    }}")
                    else:
                        sub_sections.append(f"    {content}\n    ")
            result.append(f"{section_type} {{\n" + "\n".join(sub_sections) + "}")
        Spl_prompt = "\n".join(result)
        return Spl_prompt

    @staticmethod
    def SPL2JSON():
        pass
