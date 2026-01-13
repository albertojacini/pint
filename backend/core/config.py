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

        # PDF parser: "pdfplumber" (default) or "textract"
        self.pdf_parser: str = os.getenv("PDF_PARSER", "pdfplumber")

    def _get_required(self, key: str) -> str:
        """Get required environment variable or raise error."""
        value = os.getenv(key)
        if not value:
            raise ValueError(f"{key} environment variable is required")
        return value


# Global settings instance
settings = Settings()
