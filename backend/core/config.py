"""Configuration and environment variables."""

import os
from typing import Optional
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Application settings loaded from environment variables."""

    def __init__(self):
        self.database_url: str = self._get_required("DATABASE_URL")
        self.frontend_url: Optional[str] = os.getenv("FRONTEND_URL")
        self.anthropic_api_key: str = self._get_required("ANTHROPIC_API_KEY")

    def _get_required(self, key: str) -> str:
        """Get required environment variable or raise error."""
        value = os.getenv(key)
        if not value:
            raise ValueError(f"{key} environment variable is required")
        return value


# Global settings instance
settings = Settings()
