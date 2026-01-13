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

        # AWS Textract
        self.aws_access_key_id: Optional[str] = os.getenv("AWS_ACCESS_KEY_ID")
        self.aws_secret_access_key: Optional[str] = os.getenv("AWS_SECRET_ACCESS_KEY")
        self.aws_region: str = os.getenv("AWS_REGION", "us-east-1")

        # OpenAI for embeddings
        self.openai_api_key: Optional[str] = os.getenv("OPENAI_API_KEY")

        # Sources App Configuration (SOURCES_APP__ prefix)
        self.sources_app__pdf_parser: str = os.getenv("SOURCES_APP__PDF_PARSER", "pdfplumber")
        self.sources_app__classify_on_upload: bool = os.getenv("SOURCES_APP__CLASSIFY_ON_UPLOAD", "true").lower() == "true"
        self.sources_app__classification_model: str = os.getenv("SOURCES_APP__CLASSIFICATION_MODEL", "claude-haiku")
        self.sources_app__search_default_limit: int = int(os.getenv("SOURCES_APP__SEARCH_DEFAULT_LIMIT", "10"))
        self.sources_app__search_default_threshold: float = float(os.getenv("SOURCES_APP__SEARCH_DEFAULT_THRESHOLD", "0.5"))
        self.sources_app__search_reliability_weight: float = float(os.getenv("SOURCES_APP__SEARCH_RELIABILITY_WEIGHT", "0.0"))
        self.sources_app__chat_model: str = os.getenv("SOURCES_APP__CHAT_MODEL", "claude-sonnet-4-5-20250929")
        self.sources_app__chat_context_chunks: int = int(os.getenv("SOURCES_APP__CHAT_CONTEXT_CHUNKS", "5"))

        # Legacy alias (deprecated, use SOURCES_APP__PDF_PARSER)
        self.pdf_parser: str = self.sources_app__pdf_parser

    def _get_required(self, key: str) -> str:
        """Get required environment variable or raise error."""
        value = os.getenv(key)
        if not value:
            raise ValueError(f"{key} environment variable is required")
        return value


# Global settings instance
settings = Settings()
