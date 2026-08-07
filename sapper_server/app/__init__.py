# import torch
# from typing import Any
# from marker.models import load_all_models
# from pydantic import BaseModel
# from app.common.RAGModuleBase.embedding import load_embedding_models
#
#
# class SharedState(BaseModel):
#     model_list: Any = None
#     embedding_model: Any = None
#     vision_model: Any = None
#     vision_processor: Any = None
#     whisper_model: Any = None
#     crawler: Any = None
#
#
# shared_state = SharedState()
#
#
# async def load_sapper_model():
#     global shared_state
#     shared_state.embedding_model = await load_embedding_models()
#     # model_list = load_all_models()
#     # shared_state.model_list = model_list
#     print("Load embedding mode successful!")
#
#
# def get_shared_state():
#     return shared_state
#
#
# def get_active_models():
#     print(shared_state)
#     # active_models = [key for key, value in shared_state.dict().items() if value is not None]
#     # print(f"These are the active model : {active_models}")
#     return shared_state
