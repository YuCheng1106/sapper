import asyncio
from ...data_model.agent import Agent
from ...base import BaseAgentExecutor
from ...utils.agent_response_format import AgentResponseFormatter
from ...utils.generate_suggestion import generate_suggestion
from ...utils.process_file import process_files


class AgentInitializer:
    def __init__(self, chain_initializer):
        self.chain_initializer = chain_initializer

    async def __init_chain(self, source_chain):
        chain = await self.chain_initializer.init_chain(source_chain)
        return chain

    def __init_agent_memory(self, agent_data):
        pass

    async def init_agent(self, agent_data):
        agent_data["spl_chain"] = await self.__init_chain(agent_data["spl_chain"])
        agent = Agent(**agent_data)
        return agent


class AgentExecutor(BaseAgentExecutor):
    def __init__(self, chain_initializer, chain_executor):
        super(AgentExecutor, self).__init__(chain_initializer, chain_executor)

    @staticmethod
    def __assign_value_to_chain_input(spl_chain, user_request=None):
        for params in spl_chain.global_params:
            if params.uuid == "UserRequest":
                params.value = user_request
        return spl_chain

    def __update_user_preference(self):
        pass

    def __update_long_memory(self):
        pass

    async def run_agent_to_answer(self, agent, user_request=None, file_path_list=None):
        has_files = file_path_list is not None and len(file_path_list) != 0
        formatter = AgentResponseFormatter(
            agent=agent,
            has_files=has_files,
            has_suggestions=agent.suggestion
        )

        if has_files:
            yield formatter.format_progress_response(unit_name="文件读取", message="正在读取文件内容")
            file_res = await process_files(file_path_list)
            user_request = file_res + "\n" + user_request
            yield formatter.format_file_response(status="success", content=file_res)
        else:
            yield formatter.format_progress_response(unit_name="文件读取", message="思考中，请耐心等待...")

        await asyncio.sleep(0.01)

        agent.spl_chain = self.__assign_value_to_chain_input(agent.spl_chain, user_request)
        async for unit_res in self.chain_executor.run_chain(agent.spl_chain):
            yield formatter.format_unit_response(unit_res)
        print(agent.suggestion)
        if agent.suggestion:
            suggestion = await generate_suggestion(user_request, formatter.unit_content)
            print(suggestion)
            yield formatter.format_suggestion_response(content=suggestion)
