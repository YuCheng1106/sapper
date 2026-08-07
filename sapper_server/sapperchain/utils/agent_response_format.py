from sapperchain.utils.time import get_iso8601_timestamp, humanize_time_diff


class AgentResponseFormatter:
    def __init__(self, agent, has_files=False, has_suggestions=False):
        """
        Initialize the formatter with agent and configuration

        Args:
            agent: The agent instance
            has_files: Whether file processing is involved
            has_suggestions: Whether to include suggestions in output
        """
        self.agent = agent
        self.has_files = has_files
        self.has_suggestions = has_suggestions
        self.start_time = get_iso8601_timestamp()
        self.chain_running_infos = self._create_initial_chain_running_infos()
        self.input_token = 0
        self.output_token = 0
        self.file_content = None
        self.unit_content = ""

    def _create_initial_chain_running_infos(self):
        """Create the initial structure for tracking unit progress"""
        chain_running_infos = {}
        if self.has_files:
            chain_running_infos["文件读取"] = self._create_unit_info_template(
                unit_id=-1,
                unit_name="文件读取"
            )

        for unit_id, unit in enumerate(self.agent.spl_chain.workflow):
            chain_running_infos[unit.name] = self._create_unit_info_template(
                unit_id=unit_id,
                unit_name=unit.name
            )

        return chain_running_infos

    @staticmethod
    def _create_unit_info_template(unit_id, unit_name, status="waiting"):
        """Create a template for unit information"""
        return {
            "unit_id": unit_id,
            "unit_name": unit_name,
            "status": status,
            "timestamps": {
                "started": None,
                "updated": None,
                "finished": None
            },
            "metrics": {
                "token_usage": {
                    "input": None,
                    "output": None,
                    "total": None
                },
                "execution_time": None
            }
        }

    def format_file_response(self, status, content=None):
        """Format file processing responses"""
        if content:
            self.file_content = content

        return {
            "chain_id": self.agent.uuid,
            "chain_name": self.agent.name,
            "timestamps": {
                "started": self.start_time,
                "updated": get_iso8601_timestamp(),
                "finished": get_iso8601_timestamp()
            },
            "current_unit": {
                "unit_id": -1,
                "unit_name": "文件读取",
                "unit_type": "tool_model",
                "current_ref": None,
                "status": status,
                "input": None,
                "output": {
                    "type": "Text",
                    "content": content or self.file_content
                },
                "timestamps": {
                    "started": '',
                    "updated": '',
                    "finished": ''
                },
                "metrics": {
                    "token_usage": {
                        "input": '',
                        "output": '',
                        "total": ''
                    },
                    "execution_time": ''
                }
            },
            "units": self.chain_running_infos,
        }

    def format_progress_response(self, unit_name, message):
        """Format progress messages"""
        return {
            "chain_id": self.agent.uuid,
            "chain_name": self.agent.name,
            "timestamps": {
                "started": self.start_time,
                "updated": get_iso8601_timestamp(),
                "finished": get_iso8601_timestamp()
            },
            "current_unit": {
                "unit_name": unit_name,
                "output": {
                    "type": "progress",
                    "content": message
                }
            },
            "units": self.chain_running_infos
        }

    def format_unit_response(self, unit_res):
        """Format unit execution responses"""
        self.input_token += unit_res["metrics"]["token_usage"]["input"]
        self.output_token += unit_res["metrics"]["token_usage"]["output"]
        self.unit_content += unit_res["output"]["content"]
        # Update chain running infos
        unit_name = unit_res["name"]
        if unit_name in self.chain_running_infos:
            self.chain_running_infos[unit_name].update({
                "status": unit_res["status"],
                "timestamps": {
                    "started": unit_res["timestamps"]["started"],
                    "updated": unit_res["timestamps"]["updated"],
                    "finished": unit_res["timestamps"]["finished"]
                },
                "metrics": {
                    "token_usage": {
                        "input": unit_res["metrics"]["token_usage"]["input"],
                        "output": unit_res["metrics"]["token_usage"]["output"],
                        "total": unit_res["metrics"]["token_usage"]["total"]
                    },
                    "execution_time": unit_res["metrics"]["execution_time"]
                }
            })

        execution_time = humanize_time_diff(self.start_time, unit_res["timestamps"]["updated"])

        return {
            "chain_id": self.agent.uuid,
            "chain_name": self.agent.name,
            "status": unit_res["status"],
            "timestamps": {
                "started": self.start_time,
                "updated": unit_res["timestamps"]["updated"],
                "finished": unit_res["timestamps"]["finished"]
            },
            "current_unit": {
                "unit_id": unit_res["id"],
                "unit_name": unit_res["name"],
                "unit_type": unit_res["type"],
                "current_ref": unit_res["currentRef"],
                "status": unit_res["status"],
                "input": None,
                "output": {
                    "type": unit_res["output"]["type"],
                    "content": unit_res["output"]["content"]
                },
                "timestamps": {
                    "started": unit_res["timestamps"]["started"],
                    "updated": unit_res["timestamps"]["updated"],
                    "finished": unit_res["timestamps"]["finished"]
                },
                "metrics": {
                    "token_usage": {
                        "input": unit_res["metrics"]["token_usage"]["input"],
                        "output": unit_res["metrics"]["token_usage"]["output"],
                        "total": unit_res["metrics"]["token_usage"]["total"]
                    },
                    "execution_time": unit_res["metrics"]["execution_time"]
                }
            },
            "units": self.chain_running_infos,
            "metrics": {
                "token_usage": {
                    "input": self.input_token,
                    "output": self.output_token,
                    "total": self.input_token + self.output_token
                },
                "execution_time": execution_time
            }
        }

    def format_suggestion_response(self, content=None):
        """Format progress messages"""
        if content is None:
            content = []

        return {
            "chain_id": self.agent.uuid,
            "chain_name": self.agent.name,
            "timestamps": {
                "started": self.start_time,
                "updated": get_iso8601_timestamp(),
                "finished": get_iso8601_timestamp()
            },
            "current_unit": {
                "unit_name": "suggestion",
                "output": {
                    "type": "suggestion",
                    "content": content
                }
            },
            "units": self.chain_running_infos
        }
