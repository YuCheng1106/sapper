import asyncio
import json
from sapperchain.config.sapper_config import SapperConfigurator
from sapperchain.functions.agent_initiator.core import AgentExecutor, AgentInitializer
from sapperchain.functions.agent_initiator.components.memory_manager import LongMemoryManager, ShortMemoryManager
from sapperchain.functions.agent_initiator.components.chain_initializer import ChainInitializer, ParamInitializer,UnitInitializer, \
     DataViewDefiner, DataStatementInitializer, APIStatementInitializer, ToolModelStatementInitializer, MagModelStatementInitializer
from sapperchain.functions.agent_initiator.components.chain_executor import ChainExecutor, UnitExecutor, \
    APIStatementExecutor, DataStatementExecutor, ToolModelStatementExecutor, MagModelStatementExecutor
from sapperchain.plugins.data_module.function_moudle.retriever import TextDataRetriever, GraphDataRetriever


def temporary_processing(agent_data, conversation_data):
    parameters = []
    for knowledge_base in agent_data["knowledge_bases"]:
        for graph in knowledge_base["graph_collections"]:
            for entity in graph["entities"]:
                # entity["attributes"] = json.loads(entity["attributes"].replace(r'\"', '"').replace(r'\\', '\\'))
                entity["attributes"] = json.loads(entity["attributes"])
                entity["community_ids"] = entity["communities"]
            for community in graph["communities"]:
                try:
                    community["attributes"] = {}
                except Exception as e:
                    a = 1
            for relationship in graph["relationships"]:
                relationship["attributes"] = json.loads(relationship["attributes"])
                relationship["triple_source"] = relationship["source"]
        if knowledge_base["graph_collections"] != []:
            for graph in knowledge_base["graph_collections"]:
                for relationship in graph["relationships"]:
                    relationship["attributes"] = "{}"
                    for entity in graph["entities"]:
                        if entity["uuid"] == relationship["source_entity_uuid"]:
                            relationship["source_entity"] = entity["name"]
                        if entity["uuid"] == relationship["target_entity_uuid"]:
                            relationship["target_entity"] = entity["name"]

    for param_id, param_value in agent_data["parameters"].items():
        parameters.append({"uuid":param_id,"type":param_value["value_type"],"placeholder":f"${{{param_id}}}$", "description":"des", "value":param_value["content"]})
    agent_data["parameters"] = parameters

    agent_data['long_memory'] = {"preference": "preference", "knowledge_collections": agent_data["knowledge_bases"],
                              "APIs": agent_data["plugins"]}

    if conversation_data is not None:
        agent_data['short_memory'] = {"chat_history": conversation_data.chat_history, "parameters": []}
    else:
        agent_data['short_memory'] = {"chat_history": [], "parameters": []}

    return agent_data


async def main():
    spl_prompt_path = "input/agent_data.json"
    with open(spl_prompt_path, 'r', encoding='utf-8') as f:
        agent_data = json.load(f)
    agent_data = temporary_processing(agent_data, None)
    config = {
        "model_config": {
            "api_key": "replace-with-your-api-key"
        },
        "retriever_config": {
            "embedding_model_path": "E:/virtual_teacher_server/sapperchain/config_data/model",
            "extract_model_name": "gpt-4o",
            "embedding_model_name": "text-embedding-3-small",
            "graph_level": None,
            "max_context_token": 8000
        }
    }

    sapper_configurator = SapperConfigurator()
    sapper_configurator.set_up_sapper(config)
    # 这个memory可能会为None, 也有可能不为None
    long_memory_manager = LongMemoryManager(agent_data["long_memory"])
    short_memory_manager = ShortMemoryManager(agent_data["short_memory"])

    data_view_definer = DataViewDefiner()
    API_statement_initializer = APIStatementInitializer(agent_data["plugins"])
    data_statement_initializer = DataStatementInitializer(agent_data["knowledge_bases"], data_view_definer)
    tool_model_statement_initializer = ToolModelStatementInitializer(sapper_configurator.base_model_config)
    mag_model_statement_initializer = MagModelStatementInitializer(agent_data["plugins"],
                                                                   sapper_configurator.base_model_config)
    param_initializer = ParamInitializer(agent_data["parameters"])
    unit_initializer = UnitInitializer(API_statement_initializer, data_statement_initializer,
                                       tool_model_statement_initializer, mag_model_statement_initializer)
    graph_data_retriever = GraphDataRetriever(
        embedding_model=sapper_configurator.retriever_config.embedding_model,
        extract_model=sapper_configurator.retriever_config.extract_model,
        sub_graph_extractor=sapper_configurator.retriever_config.sub_graph_extractor,
        ranker=sapper_configurator.retriever_config.ranker,
        context_builder=sapper_configurator.retriever_config.context_builder
    )
    text_data_retriever = TextDataRetriever(
        embedding_model_path=sapper_configurator.retriever_config.embedding_model_path)
    API_statement_executor = APIStatementExecutor()
    data_statement_executor = DataStatementExecutor(text_data_retriever, graph_data_retriever)
    tool_model_statement_executor = ToolModelStatementExecutor()
    mag_model_statement_executor = MagModelStatementExecutor()
    unit_executor = UnitExecutor(short_memory_manager, API_statement_executor, data_statement_executor,
                                 tool_model_statement_executor, mag_model_statement_executor)
    chain_initializer = ChainInitializer(param_initializer, unit_initializer)
    agent_initializer = AgentInitializer(chain_initializer)
    agent = await agent_initializer.init_agent(agent_data)

    chain_executor = ChainExecutor(unit_executor, long_memory_manager)
    agent_executor = AgentExecutor(chain_initializer, chain_executor)
    # test_user_request = "https://example.com:8020/files/af4c804f-3966-4949-ace2-3bb7416ea926/4ab3130e-6567-4ae6-82c5-8ca583fb8469/%E4%BD%9C%E6%96%873.jpg"
    test_user_request = "帮我生成高猛酸钾制备氧气的实验计划"
#     test_user_request ='''请对下面科技与文化英语作文进行润色修改
#     The Keys to Successful Group Cooperative Learning
# Group cooperative learning has become an indispensable part of our school life. Nevertheless, it often comes with various challenges. Poor communication, unequal participation, and ambiguous task division frequently hinder the effectiveness of group work.
# I once participated in a group project where we failed miserably. Due to a lack of clear communication, each of us worked on different aspects of the task without coordinating. As a result, our final presentation was a mess. From this experience, I learned the importance of establishing effective communication channels.
# To enhance group cooperation efficiency, several measures can be taken. First, setting up regular group meetings can ensure everyone is on the same page. Second, implementing a role - rotation system allows each member to showcase their strengths. Last but not least, leveraging online collaboration tools can streamline task management. Only by mastering these keys can we achieve successful group cooperative learning and benefit more from it.
#     '''
    async for res in agent_executor.run_agent_to_answer(agent, user_request=test_user_request, file_path_list=None):
        print(res['current_unit']['output']['content'], end="")

if __name__ == '__main__':
    asyncio.run(main())


