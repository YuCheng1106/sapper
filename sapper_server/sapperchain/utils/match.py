import re

def replace_input_param(text, source_param):
    pattern = r'\"\$\{?(\w+)\}?\$\"'
    replaced_text = re.sub(pattern, f"'{source_param}'", text)
    return replaced_text


def replace_output_param(text, source_param):
    pattern = r'\$\{?(\w+)\}?\$'
    replaced_text = re.sub(pattern, source_param, text)
    return replaced_text

def match_refAPI(text):
    pattern = r"(\~refAPI\{.*?\}.*?\/refAPI)"
    match = re.findall(pattern, str(text))
    return match

def match_refData(text):
    pattern = r"(\~refData\{.*?\}.*?\/refData)"
    match = re.findall(pattern, str(text))
    return match

def match_refParam(text):
    pattern = r'(\~refParameter\{.*?\}/refParameter)'
    match = re.findall(pattern, str(text))
    return match

async def match_func_ref(text):
    pattern = r"(\~refData\{.*?\}.*?\/refData|\~refAPI\{.*?\}.*?\/refAPI)"
    matches = re.findall(pattern, str(text))
    return matches

def match_placeholder(text):
    pattern = r"\$\{.*?\}\$"
    matches = re.findall(pattern, str(text))
    return matches


def parse_refAPI(string_refapi):
    pattern = r'\~refAPI\{(.*?)\}\[(.*?)\]\[(.*?)\]/refAPI'

    match = re.search(pattern, str(string_refapi))
    return match

def parse_refData(string_refdata):
    pattern = r'\~refData\{(.*?)\}\[(.*?)\]\[(.*?)\]/refData'
    # pattern = r'(\~refData\{(.*?)\}\[(.*?)\]\[(.*?)\]/refData|\~refAPI\{.*?\}.*?\/refAPI|\$\{.*?\}\$)'

    match = re.search(pattern, str(string_refdata))
    return match

def parse_refParameter(string_refparameter):
    pattern = r'\~refParameter\{(.*?)\}/refParameter'
    match = re.search(pattern, str(string_refparameter))
    return match