# from ..common.Tool import OpenAI_API_HandleUtility, HuggingFace_API_HandleUtility, UnstructuredDataExtract_API_Utility, \
#     StructuredDataExtract_API_Utility
#
#
# class APIHandleUtilityFactory:
#     @staticmethod
#     def Create_HandleUtility(API):
#         API_Type = type(API).__name__
#         print(API.API_Name)
#         print(API_Type)
#         if API_Type=="OpenAI_API":
#             return OpenAI_API_HandleUtility(API)
#         elif API_Type=="WenXin_API":
#             pass
#         elif API_Type=="HuggingFace_API":
#             return HuggingFace_API_HandleUtility(API)
#         elif API_Type=="UnstructuredDataExtract_API":
#             return UnstructuredDataExtract_API_Utility(API)
#         elif API_Type=="StructuredDataExtract_API":
#             return StructuredDataExtract_API_Utility(API)
#         else:
#             raise ValueError(f"Unsupported handleTool")
