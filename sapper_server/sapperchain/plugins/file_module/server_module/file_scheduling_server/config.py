import argparse

from pydantic import FileUrl, AnyUrl
import mcp.types as types
parser = argparse.ArgumentParser(description='Agent module')
parser.add_argument("--resources", type=list[types.Resource], default=[
        types.Resource(
            uri=AnyUrl("E:/public_tech_lib/test_data/Towards_Systematic_LLM_powered_API_Orchestration_A_Software_Engineering_Perspective.pdf"),
            name="Towards_Systematic_LLM_powered_API_Orchestration_A_Software_Engineering_Perspective",
            description=f"A sample text resource named Towards_Systematic_LLM_powered_API_Orchestration_A_Software_Engineering_Perspective",
            mimeType="text/plain",
        ),
        types.Resource(
            uri=AnyUrl("E:/public_tech_lib/test_data/On_Demand_Non_Human_Reliant_API_Tutorial_Generation_by_LLM_based_Across_Language_Knowledge_Transfer.pdf"),
            name="On_Demand_Non_Human_Reliant_API_Tutorial_Generation_by_LLM_based_Across_Language_Knowledge_Transfer",
            description=f"A sample text resource named On_Demand_Non_Human_Reliant_API_Tutorial_Generation_by_LLM_based_Across_Language_Knowledge_Transfer",
            mimeType="text/plain",
        )
], help='Radius of cylinder')


args = parser.parse_args()







