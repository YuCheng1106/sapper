import httpx
from ....utils.match import match_placeholder
from ....base.executor import BaseChainExecutor, BaseUnitExecutor, BaseStatementExecutor
from ....data_model.statement import Tool, APIInput
from httpx import Timeout, AsyncClient
from ....utils.data import calculate_string_len, add
import json

timeout = Timeout(60.0, read=360.0)
from ....utils.post_request import IPostRequest
from ....data_model.unit import Statement
from ....utils.time import humanize_time_diff, get_iso8601_timestamp
from ....utils.data import split_json_objects


class ChainExecutor(BaseChainExecutor):
    def __init__(self, unit_executor, long_memory_manager):
        super(ChainExecutor, self).__init__()
        self.long_memory_manager = long_memory_manager
        self.unit_executor = unit_executor
        self.return_value_map = {
            "audio": "audio",
            "audio_base64": "audio",
            "image": "image",
            "image_base64": "image",
            "video": "video",
            "video_base64": "video",
            "text": "text",
        }

    async def run_chain(self, chain):
        for unit_id, unit in enumerate(chain.workflow):
            unit_input_token = 0
            unit_output_token = 0
            start_time = get_iso8601_timestamp()
            yield {
                "id": unit_id,
                "name": unit.name,
                "type": unit.type,
                "status": "pending",
                "timestamps": {
                    "started": start_time,
                    "updated": start_time,
                    "finished": start_time
                },
                "metrics": {
                    "token_usage": {
                        "input": unit_input_token,
                        "output": unit_output_token,
                        "total": unit_input_token + unit_output_token
                    },
                    "execution_time": humanize_time_diff(start_time, start_time)
                },
                "input": {
                    "type": "text",
                    "content": unit.input.input_data
                },
                "output": {
                    "type": "text",
                    "content": ""
                },
                "currentRef": {
                    "ref_id": "",
                    "ref_name": "",
                    "ref_type": ""
                }
            }

            async for statement_res in self.unit_executor.run_unit(unit, chain.global_params):
                execution_time = humanize_time_diff(start_time, statement_res["timestamps"]["updated"])
                unit_input_token += statement_res["metrics"]["token_usage"]["input"]
                unit_output_token += statement_res["metrics"]["token_usage"]["output"]

                yield {
                    "id": unit_id,
                    "name": unit.name,
                    "type": unit.type,
                    "status": statement_res["status"],
                    "timestamps": {
                        "started": start_time,
                        "updated": statement_res["timestamps"]["finished"],
                        "finished": statement_res["timestamps"]["finished"]
                    },
                    "metrics": {
                        "token_usage": {
                            "input": unit_input_token,
                            "output": unit_output_token,
                            "total": unit_input_token + unit_output_token
                        },
                        "execution_time": execution_time
                    },
                    "input": {
                        "type": "text",
                        "content": unit.input.input_data
                    },
                    "output": {
                        "type": self.return_value_map.get(statement_res["output"]["type"].lower(), "text"),
                        "content": statement_res["output"]["content"]
                    },
                    "currentRef": {
                        "ref_id": statement_res["id"],
                        "ref_name": statement_res["name"],
                        "ref_type": statement_res["type"]
                    }
                }
            finished_time = get_iso8601_timestamp()

            yield {
                "id": unit_id,
                "name": unit.name,
                "type": unit.type,
                "status": "success",
                "timestamps": {
                    "started": start_time,
                    "updated": finished_time,
                    "finished": finished_time
                },
                "metrics": {
                    "token_usage": {
                        "input": unit_input_token,
                        "output": unit_output_token,
                        "total": unit_input_token + unit_output_token
                    },
                    "execution_time": humanize_time_diff(start_time, finished_time)
                },
                "input": {
                    "type": "text",
                    "content": unit.input.input_data
                },
                "output": {
                    "type": "text",
                    "content": ""
                },
                "currentRef": {
                    "ref_id": "",
                    "ref_name": "",
                    "ref_type": ""
                }
            }


class UnitExecutor(BaseUnitExecutor):
    def __init__(self, short_memory_manager, API_statement_executor, data_statement_executor,
                 tool_model_statement_executor, mag_model_statement_executor):
        super(UnitExecutor, self).__init__()
        self.API_statement_executor = API_statement_executor
        self.data_statement_executor = data_statement_executor
        self.tool_model_statement_executor = tool_model_statement_executor
        self.mag_model_statement_executor = mag_model_statement_executor
        self.short_memory_manager = short_memory_manager

    def __update_global_params(self, target_param, param_value, global_params):
        for global_param in global_params:
            if global_param.placeholder == target_param:
                global_param.value = param_value
                break
        return global_params

    def __assign_value_to_statement_param(self, target_param, global_params):
        for global_param in global_params:
            if global_param.placeholder == target_param:
                return global_param.value
        return ""

    async def run_unit(self, unit, global_params):
        chat_records = []
        start_time = get_iso8601_timestamp()
        statement_output_token = 0
        for id, statement in enumerate(unit.func_statements):
            if statement.type == "API":
                input_token = calculate_string_len(statement.input.input_data)
                for param_name, param_value in statement.input.input_data.items():
                    assigned_value = self.__assign_value_to_statement_param(param_value, global_params)
                    if assigned_value != "":
                        statement.input.input_data[param_name] = assigned_value
                async for res in self.API_statement_executor.run_statement(statement):
                    chat_records.append(res)
                    statement_output_token += calculate_string_len(res)
                    finish_time = get_iso8601_timestamp()
                    execution_time = humanize_time_diff(start_time, finish_time)
                    global_params = self.__update_global_params(statement.output, res, global_params)
                    try:
                        yield {
                            "id": id,
                            "name": statement.name,
                            "type": statement.type,
                            "status": "running",
                            "timestamps": {
                                "started": start_time,
                                "updated": get_iso8601_timestamp(),
                                "finished": get_iso8601_timestamp()
                            },
                            "metrics": {
                                "token_usage": {
                                    "input": input_token,
                                    "output": statement_output_token,
                                    "total": add(input_token, statement_output_token)
                                },
                                "execution_time": execution_time
                            },
                            "input": {
                                "type": statement.input.content_type,
                                "content": unit.input.input_data
                            },
                            "output": {
                                "type": statement.input.return_value_type,
                                "content": res
                            }
                        }
                    except:
                        yield {
                            "id": id,
                            "name": statement.name,
                            "type": statement.type,
                            "status": "running",
                            "timestamps": {
                                "started": start_time,
                                "updated": get_iso8601_timestamp(),
                                "finished": get_iso8601_timestamp()
                            },
                            "metrics": {
                                "token_usage": {
                                    "input": input_token,
                                    "output": statement_output_token,
                                    "total": add(input_token, statement_output_token)
                                },
                                "execution_time": execution_time
                            },
                            "input": {
                                "type": statement.input.content_type,
                                "content": unit.input.input_data
                            },
                            "output": {
                                "type": statement.input.return_value_type,
                                "content": res
                            }
                        }
                    # yield res
            elif statement.type == "data":
                input_token = calculate_string_len(statement.input)
                res = await self.data_statement_executor.run_statement(statement)
                print("data retriver", res)
                chat_records.append(res)
                statement_output_token += calculate_string_len(res)
                finish_time = get_iso8601_timestamp()
                execution_time = humanize_time_diff(start_time, finish_time)
                # try:
                #     yield {
                #         "id": id,
                #         "name": statement.name,
                #         "type": statement.type,
                #         "status": "waiting",
                #         "timestamps": {
                #             "started": start_time,
                #             "updated": finish_time,
                #             "finished": finish_time
                #         },
                #         "metrics": {
                #             "token_usage": {
                #                 "input": input_token,
                #                 "output": statement_output_token,
                #                 "total": add(input_token, statement_output_token)
                #             },
                #             "execution_time": execution_time
                #         },
                #         "input": {
                #             "type": unit.input.input_data,
                #             "content": unit.input
                #         },
                #         "output": {
                #             "type": "text",
                #             "content": res
                #         }
                #     }
                # except:
                #     yield {
                #         "id": id,
                #         "name": statement.name,
                #         "type": statement.type,
                #         "status": "failed",
                #         "timestamps": {
                #             "started": start_time,
                #             "updated": finish_time,
                #             "finished": finish_time
                #         },
                #         "metrics": {
                #             "token_usage": {
                #                 "input": input_token,
                #                 "output": statement_output_token,
                #                 "total": add(input_token, statement_output_token)
                #             },
                #             "execution_time": execution_time
                #         },
                #         "input": {
                #             "type": unit.input.input_data,
                #             "content": unit.input
                #         },
                #         "output": {
                #             "type": "text",
                #             "content": res
                #         }
                #     }
                global_params = self.__update_global_params(statement.output, res, global_params)
            elif statement.type == "tool_model":
                input_token = calculate_string_len(statement.input.input_data)
                for model_input_mes in statement.input.input_data["messages"]:
                    if model_input_mes["role"] == "system":
                        placeholders = match_placeholder(model_input_mes["content"])
                        for placeholder in placeholders:
                            assigned_value = self.__assign_value_to_statement_param(placeholder, global_params)
                            if assigned_value != "":
                                assigned_value += """
                                \n-学术公式规范
                                    当问题涉及以下场景时：
                                    - 数学推导
                                    - 物理定律表达
                                    - 化学方程式
                                    - 工程计算公式

                                    请严格遵循：
                                    1. 所有科学公式必须用$$包裹，例如：$$f(x)=x^2$$，牛顿定律$$F=ma$$，质能方程$$E=mc^2$$
                                    2. 不使用表格对齐符&，复杂公式换行用`\\\`
                                    3. 非公式内容保持自然语言叙述
                                    4.所有数学公式必须且只能用 $$ 包裹，禁止以单 $、自然语言换行或任何其他格式表示公式！
                                """
                                model_input_mes["content"] = model_input_mes["content"].replace(placeholder,
                                                                                                assigned_value)

                    elif model_input_mes["role"] == "user":
                        assigned_value = self.__assign_value_to_statement_param(model_input_mes["content"],
                                                                                global_params)
                        if assigned_value != "":
                            if len(self.short_memory_manager.short_memory.chat_history) > 0:
                                chat_history = '\n'.join(self.short_memory_manager.short_memory.chat_history)
                                model_input_mes["content"] = f"chat_history:{chat_history}" + assigned_value
                            else:
                                model_input_mes["content"] = assigned_value
                statement_res = ""
                print(statement.input)
                async for stream_res in self.tool_model_statement_executor.run_statement(statement):
                    # yield stream_res
                    statement_output_token += calculate_string_len(stream_res)
                    finish_time = get_iso8601_timestamp()
                    execution_time = humanize_time_diff(start_time, finish_time)
                    try:
                        yield {
                            "id": id,
                            "name": statement.name,
                            "type": statement.type,
                            "status": "running",
                            "timestamps": {
                                "started": start_time,
                                "updated": get_iso8601_timestamp(),
                                "finished": get_iso8601_timestamp()
                            },
                            "metrics": {
                                "token_usage": {
                                    "input": input_token,
                                    "output": statement_output_token,
                                    "total": add(input_token, statement_output_token)
                                },
                                "execution_time": execution_time
                            },
                            "input": {
                                "type": statement.input.content_type,
                                "content": unit.input.input_data
                            },
                            "output": {
                                "type": statement.input.return_value_type,
                                "content": stream_res
                            }
                        }
                    except:
                        yield {
                            "id": id,
                            "name": statement.name,
                            "type": statement.type,
                            "status": "failed",
                            "timestamps": {
                                "started": start_time,
                                "updated": get_iso8601_timestamp(),
                                "finished": get_iso8601_timestamp()
                            },
                            "metrics": {
                                "token_usage": {
                                    "input": input_token,
                                    "output": statement_output_token,
                                    "total": add(input_token, statement_output_token)
                                },
                                "execution_time": execution_time
                            },
                            "input": {
                                "type": statement.input.content_type,
                                "content": unit.input.input_data
                            },
                            "output": {
                                "type": statement.input.return_value_type,
                                "content": stream_res
                            }
                        }
                    statement_res += stream_res
                chat_records.append(statement_res)
                global_params = self.__update_global_params(statement.output, statement_res, global_params)
            elif statement.type == "mag_model":
                input_token = calculate_string_len(statement.input.input_data)
                for model_input_mes in statement.input.input_data["messages"]:
                    if model_input_mes["role"] == "system":
                        placeholders = match_placeholder(model_input_mes["content"])
                        for placeholder in placeholders:
                            assigned_value = self.__assign_value_to_statement_param(placeholder, global_params)
                            if assigned_value != "":
                                assigned_value += """
                                \n-学术公式规范
                                    当问题涉及以下场景时：
                                    - 数学推导
                                    - 物理定律表达
                                    - 化学方程式
                                    - 工程计算公式
                                    
                                    请严格遵循：
                                    1. 所有科学公式必须用$$包裹，例如：$$f(x)=x^2$$，牛顿定律$$F=ma$$，质能方程$$E=mc^2$$
                                    2. 不使用表格对齐符&，复杂公式换行用`\\\`
                                    3. 非公式内容保持自然语言叙述
                                    4.所有数学公式必须且只能用 $$ 包裹，禁止以单 $、自然语言换行或任何其他格式表示公式！
                                """
                                model_input_mes["content"] = model_input_mes["content"].replace(placeholder,
                                                                                                assigned_value)
                    elif model_input_mes["role"] == "user":
                        assigned_value = self.__assign_value_to_statement_param(model_input_mes["content"],
                                                                                global_params)
                        if assigned_value != "":
                            if self.short_memory_manager.short_memory.chat_history != []:
                                chat_history = '\n'.join(self.short_memory_manager.short_memory.chat_history)
                                model_input_mes["content"] = f"chat_history:{chat_history}" + assigned_value
                            else:
                                model_input_mes["content"] = assigned_value
                statement_res = ""
                async for part in self.mag_model_statement_executor.run_statement(statement):
                    stream_res = part.get('content', '')
                    statement_output_token += calculate_string_len(stream_res)
                    finish_time = get_iso8601_timestamp()
                    execution_time = humanize_time_diff(start_time, finish_time)
                    try:
                        yield {
                            "id": id,
                            "name": statement.name,
                            "type": statement.type,
                            "status": "running",
                            "timestamps": {
                                "started": start_time,
                                "updated": get_iso8601_timestamp(),
                                "finished": get_iso8601_timestamp()
                            },
                            "metrics": {
                                "token_usage": {
                                    "input": input_token,
                                    "output": statement_output_token,
                                    "total": add(input_token, statement_output_token)
                                },
                                "execution_time": execution_time
                            },
                            "input": {
                                "type": statement.input.content_type,
                                "content": unit.input.input_data
                            },
                            "output": part
                        }
                        statement_res = statement_res + stream_res
                    except:
                        yield {
                            "id": id,
                            "name": statement.name,
                            "type": statement.type,
                            "status": "failed",
                            "timestamps": {
                                "started": start_time,
                                "updated": get_iso8601_timestamp(),
                                "finished": get_iso8601_timestamp()
                            },
                            "metrics": {
                                "token_usage": {
                                    "input": input_token,
                                    "output": statement_output_token,
                                    "total": add(input_token, statement_output_token)
                                },
                                "execution_time": execution_time
                            },
                            "input": {
                                "type": statement.input.content_type,
                                "content": unit.input.input_data
                            },
                            "output": part
                        }
                chat_records.append(statement_res)
                global_params = self.__update_global_params(statement.output, statement_res, global_params)
            else:
                pass

        memory_state = self.short_memory_manager.check_memory_state()
        if memory_state == "normal":
            self.short_memory_manager.update_short_memory(chat_records, global_params)
        elif memory_state == "overloading":
            self.short_memory_manager.clear_short_memory()
        else:
            pass


class APIStatementExecutor(BaseStatementExecutor):
    def __init__(self):
        super(APIStatementExecutor, self).__init__()
        self.API_poster = IPostRequest

    async def run_statement(self, statement):
        async for res in self.API_poster.post_plugin_request(statement.input):
            yield res


class DataStatementExecutor(BaseStatementExecutor):
    def __init__(self, text_data_retriever, graph_data_retriever):
        super(DataStatementExecutor, self).__init__()
        self.text_data_retriever = text_data_retriever
        self.graph_data_retriever = graph_data_retriever

    async def run_statement(self, statement):
        res = ""
        if statement.input.data_view.text_view != None:
            text_res = await self.text_data_retriever.retrieve(statement.input.input_data["query"],
                                                               statement.input.data_view.text_view)
        else:
            text_res = ""
        if statement.input.data_view.graph_view != None:
            graph_res = await self.graph_data_retriever.retrieve(statement.input.input_data["query"],
                                                                 statement.input.data_view.graph_view)
        else:
            graph_res = ""
        res = text_res + graph_res
        return res


class ToolModelStatementExecutor(BaseStatementExecutor):
    def __init__(self):
        super(ToolModelStatementExecutor, self).__init__()
        self.API_poster = IPostRequest

    async def run_statement(self, statement):
        async for res in self.API_poster.post_plugin_request(statement.input):
            print("statement.input", statement.input)
            yield res


class MagModelStatementExecutor(BaseStatementExecutor):
    def __init__(self):
        super(MagModelStatementExecutor, self).__init__()
        self.tool_base = None
        self.API_poster = IPostRequest

    async def __get_tool_by_llm(self, statement: Statement):
        argument_text = ""
        tool_name = []
        ids = []
        finish_reason = None
        async for res in self.API_poster.post_plugin_request(statement.input):
            if len(res) > 0:
                res = res[0]
                if "tool_calls" in res["delta"]:
                    if res["delta"]["tool_calls"] != None:
                        if "name" in res["delta"]["tool_calls"][0]["function"]:
                            if res["delta"]["tool_calls"][0]["function"]["name"] != None:
                                tool_name.append(res["delta"]["tool_calls"][0]["function"]["name"])

                        if "arguments" in res["delta"]["tool_calls"][0]["function"]:
                            argument_text += res["delta"]["tool_calls"][0]["function"]["arguments"]

                        if "id" in res["delta"]["tool_calls"][0]:
                            if res["delta"]["tool_calls"][0]["id"] != None:
                                ids.append(res["delta"]["tool_calls"][0]["id"])
                    else:
                        if res["delta"]["content"] != None:
                            yield {"type": "Text", 'content': res.delta.content}
                if "finish_reason" in res:
                    if res["finish_reason"] == None:
                        pass
                    else:
                        finish_reason = res["finish_reason"]
        yield (finish_reason, tool_name, ids, argument_text)


    async def __create_tool_statement(self, tool: Tool) -> Statement:
        api_input = APIInput(
            server_url=tool.server_url,
            input_data=tool.tool_parameter,
            return_value_type=tool.return_value_type,
            content_type=tool.content_type,
            auth_config=tool.auth_config,
            input_parameters=tool.input_parameters,
            output_parameters=tool.output_parameters,
            request_body=tool.request_body,
            headers=tool.headers,
            responses=tool.responses,
            stream=tool.stream
        )
        statement = Statement(name=tool.tool_def["function"]["name"],
                              description=tool.tool_def["function"]["description"], type="text", input=api_input, output="")
        return statement

    async def __execute_tool(self, tool_call):
        tool_name = tool_call["name"]
        tool_arguments = tool_call["arguments"]
        for tool in self.tool_base:
            if tool.tool_def["function"]["name"] == tool_name:
                tool.tool_parameter = tool_arguments
                statement = await self.__create_tool_statement(tool)
                async for tool_res in self.API_poster.post_plugin_request(statement.input):
                    print("statement.input.return_value_type", statement.input.return_value_type)
                    yield {'type': statement.input.return_value_type, 'content': tool_res}

    async def __init_tool_base(self, statement):
        self.tool_base = statement.input.input_data["tools"]
        tool_call = []
        for tool in statement.input.input_data["tools"]:
            tool_call.append(tool.tool_def)
        statement.input.input_data["tools"] = tool_call
        return statement

    async def run_statement(self, statement):
        statement = await self.__init_tool_base(statement)
        pingyi_to_eng = {}
        for tool in self.tool_base:
            origin_name = tool.tool_def["function"]["origin_name"]
            name = tool.tool_def["function"]["name"]
            pingyi_to_eng[name] = origin_name

        try:
            argument_text = ""
            tool_name = []
            ids = []
            finish_reason = None
            async for tool_char in self.__get_tool_by_llm(statement):
                if isinstance(tool_char, dict):
                    yield tool_char
                elif isinstance(tool_char, tuple):
                    finish_reason, tool_name, ids, argument_text = tool_char
            print(f"finish_reason:{finish_reason}")
            print(f"tool_calls:{tool_name}")
            while finish_reason == "tool_calls":
                structured_argument = split_json_objects(argument_text)
                tool_calls = []
                temp_mes = []
                for index, tool in enumerate(tool_name):
                    yield {
                        'type': 'Text',
                        'content': "\n##### 已选中 " + pingyi_to_eng[tool] + "\n"
                    }
                    temp_mes.append(
                        {
                            'function': {
                                'arguments': structured_argument[index],
                                'name': tool
                            },
                            'id': ids[index],
                            'type': 'function'}
                    )
                    tool_calls.append({
                        "name": tool,
                        "arguments": json.loads(structured_argument[index]),
                        "id": ids[index]
                    })
                statement.input.input_data["messages"].append(
                    {'role': 'assistant',
                     'content': None,
                     'refusal': None,
                     'tool_calls': temp_mes
                     }
                )
                print(f"finish_reason:{finish_reason}")
                print(f"tool_calls:{tool_calls}")
                if finish_reason == "tool_calls":
                    for tool_call in tool_calls:
                        yield {
                            'type': 'Text',
                            'content': "\n##### 正在执行 " + pingyi_to_eng.get(tool_call["name"], tool_call["name"]) + "\n"
                        }
                        yield {
                            'type': 'Text',
                            'content': "\n##### 以下是 " + pingyi_to_eng.get(tool_call["name"],
                                                                          tool_call["name"]) + " 的执行结果\n"
                        }
                        fina_res = ''
                        async for char in self.__execute_tool(tool_call):
                            fina_res += char.get("content")
                            yield char

                        statement.input.input_data["messages"].append({
                            "role": "tool",
                            "name": tool_call['name'],
                            "tool_call_id": tool_call['id'],
                            "content": f"tool result:{fina_res}",
                        })

                    async for tool_char in self.__get_tool_by_llm(statement):
                        if isinstance(tool_char, dict):
                            yield tool_char
                        elif isinstance(tool_char, tuple):
                            finish_reason, tool_name, ids, argument_text = tool_char

        except Exception as e:
            print(e)
