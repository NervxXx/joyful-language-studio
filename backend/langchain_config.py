"""Конфигурация LangChain / OpenRouter"""
import os
from dotenv import load_dotenv

load_dotenv()


class LangChainConfig:
    OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "dummy-key")
    MAX_CONTEXT_MESSAGES = 10
    MAX_HISTORY_LENGTH = 40

    def get_openrouter_config(self) -> dict:
        return {
            "base_url": "https://openrouter.ai/api/v1",
            "default_headers": {
                "HTTP-Referer": "http://localhost:8000",
                "X-Title": "English Studio",
            }
        }

    def get_model_config(self) -> dict:
        return {
            "model": "openai/gpt-4o-mini",
            "temperature": 0.8,
            "max_tokens": 2048
        }


config = LangChainConfig()
