from app.schema import GetAgentRunChain, GetKnowledgeBaseRunChain, GetPluginRunChain, GetConversationRunChain
from sapperchain.config.sapper_config import SapperConfigurator
from sapperchain.functions.agent_initiator.core import AgentExecutor, AgentInitializer
from sapperchain.functions.agent_initiator.components.memory_manager import LongMemoryManager, ShortMemoryManager
from sapperchain.functions.agent_initiator.components.chain_initializer import ChainInitializer, ParamInitializer,UnitInitializer, \
     DataViewDefiner, DataStatementInitializer, APIStatementInitializer, ToolModelStatementInitializer, MagModelStatementInitializer
from sapperchain.functions.agent_initiator.components.chain_executor import ChainExecutor, UnitExecutor, \
    APIStatementExecutor, DataStatementExecutor, ToolModelStatementExecutor, MagModelStatementExecutor
from sapperchain.plugins.DataRetrievalPlugin import GraphDataRetriever, TextDataRetriever
from app.conf import admin_settings


class RunChain:
    def __init__(self, agent, agent_executor) -> None:
        self.agent = agent
        self.agent_executor = agent_executor

    @classmethod
    async def create(cls, openai_key, agent_data: GetAgentRunChain, plugins: list[GetPluginRunChain], knowledge_bases: list[GetKnowledgeBaseRunChain], conversation_data: GetConversationRunChain = None):
        print(agent_data.has_long_memory, agent_data.has_short_memory)
        if conversation_data is not None:
            if agent_data.has_long_memory == 1:
                agent_data.long_memory = {"preference": "preference", "knowledge_collections": [], "APIs": []}
            else:
                agent_data.long_memory = {"preference": "preference", "knowledge_collections": [], "APIs": []}

            if agent_data.has_long_memory == 1:
                agent_data.short_memory = {"chat_history": conversation_data.chat_history, "parameters": []}
            else:
                agent_data.short_memory = {"chat_history": [], "parameters": []}

        config = {
            "model_config": {
                "api_key": openai_key
            },
            "retriever_config": {
                "embedding_model_path": admin_settings.EMBEDDING_MODEL_PATH,
                "extract_model_name": "gpt-4.1",
                "embedding_model_name": "Dmeta-embedding",
                "graph_level": None,
                "max_context_token": 8000
            }
        }
        sapper_configurator = SapperConfigurator()
        sapper_configurator.set_up_sapper(config)
        long_memory_manager = LongMemoryManager(agent_data.long_memory)
        short_memory_manager = ShortMemoryManager(agent_data.short_memory)
        agent_data = agent_data.to_dict()
        data_view_definer = DataViewDefiner()
        plugins = [p.model_dump() for p in plugins]
        api_statement_initializer = APIStatementInitializer(plugins)
        knowledge_bases = [kb.model_dump() for kb in knowledge_bases]
        data_statement_initializer = DataStatementInitializer(knowledge_bases, data_view_definer)
        tool_model_statement_initializer = ToolModelStatementInitializer(sapper_configurator.base_model_config)
        mag_model_statement_initializer = MagModelStatementInitializer(plugins,
                                                                       sapper_configurator.base_model_config)

        param_initializer = ParamInitializer(agent_data["parameters"])
        unit_initializer = UnitInitializer(api_statement_initializer, data_statement_initializer,
                                           tool_model_statement_initializer, mag_model_statement_initializer)
        graph_data_retriever = GraphDataRetriever()
        text_data_retriever = TextDataRetriever(sapper_configurator.retriever_config.embedding_model_path)
        api_statement_executor = APIStatementExecutor()
        data_statement_executor = DataStatementExecutor(text_data_retriever, graph_data_retriever)
        tool_model_statement_executor = ToolModelStatementExecutor()
        mag_model_statement_executor = MagModelStatementExecutor()
        unit_executor = UnitExecutor(short_memory_manager, api_statement_executor, data_statement_executor,
                                     tool_model_statement_executor, mag_model_statement_executor)
        chain_initializer = ChainInitializer(param_initializer, unit_initializer, )
        agent_initializer = AgentInitializer(chain_initializer)
        agent = await agent_initializer.init_agent(agent_data)

        chain_executor = ChainExecutor(unit_executor, long_memory_manager)
        agent_executor = AgentExecutor(chain_initializer, chain_executor)

        return cls(agent, agent_executor)

    async def run_chain(self, request):
        # try:
        parsed_data = {"Text": "", 'File_Path': [], "Image": None}
        # 遍历并处理每个元素
        for item in request:
            if item["type"] == "text":
                parsed_data["Text"] += item["content"] + " "
            elif item["type"] == "image":
                parsed_data['File_Path'].append(item["content"])
            elif item["type"] == "speech":
                parsed_data['File_Path'].append(item["content"])
            elif item["type"] == "txt":
                parsed_data['File_Path'].append(item["content"])
            elif item["type"] == "file":
                parsed_data['File_Path'].append(item["content"])
        mag_user_request = parsed_data["Text"]
        async for res in self.agent_executor.run_agent_to_answer(self.agent, user_request=mag_user_request, file_path_list=parsed_data['File_Path']):
            yield res
        # except Exception as e:
        #     yield json.dumps({"type": "error", "content": f"Something went wrong while running the agent. Please try again.{str(e)}"})
