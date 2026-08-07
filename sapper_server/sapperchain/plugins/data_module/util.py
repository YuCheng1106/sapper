import json
import os
from typing import Any
from dotenv import load_dotenv

class Configuration:
    """Manages configuration and environment variables for the MCP client."""

    def __init__(self) -> None:
        """Initialize configuration with environment variables."""
        self.load_env()
        self.api_key = os.getenv("OPENAI_KEY", "")

    @staticmethod
    def load_env() -> None:
        """Load environment variables from .env file."""
        load_dotenv()

    @staticmethod
    def load_config(file_path: str) -> dict[str, Any]:
        with open(file_path, "r") as f:
            return json.load(f)

    @property
    def llm_api_key(self) -> str:

        if not self.api_key:
            raise ValueError("LLM_API_KEY not found in environment variables")
        return self.api_key
