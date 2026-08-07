from .retriever_config import RetrieverConfigurator, EXTRACT_ENTITIES_FROM_QUERY, EntityExtractedRes
from .base_model_config import ModelConfig
from ..plugins.model_module.function_moudle.llm_call.openai_ import ChatModel, EmbeddingModel

class SapperConfigurator():
    def __init__(self):
        self.base_model_config = None
        self.retriever_config = None

    def __instantiate_base_model_config(self, base_model_config):
        api_key = base_model_config.get("api_key", None)
        return ModelConfig(api_key)

    def __instantiate_retriever_config(self, retriever_config):
        embedding_model_path = retriever_config.get("embedding_model_path", None)
        extract_model_name = retriever_config.get("extract_model_name", None)
        embedding_model_name = retriever_config.get("embedding_model_name", None)
        graph_level = retriever_config.get("graph_level", None)
        max_context_token = retriever_config.get("max_context_token", None)
        embedding_model = EmbeddingModel(
            api_key= self.base_model_config.api_key,
            model_name= embedding_model_name,
            base_url=self.base_model_config.base_url,
        )
        extract_model = ChatModel(
            api_key=self.base_model_config.api_key,
            model_name=extract_model_name,
            base_url=self.base_model_config.base_url,
            system_prompt=EXTRACT_ENTITIES_FROM_QUERY,
            output_format=EntityExtractedRes
        )
        return RetrieverConfigurator(embedding_model_path, extract_model, embedding_model, graph_level, max_context_token)

    def set_up_sapper(self, config):
        self.base_model_config = self.__instantiate_base_model_config(config["model_config"])
        self.retriever_config = self.__instantiate_retriever_config(config["retriever_config"])
