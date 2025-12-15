"""Configuration for avatar generation agent."""

import os
from dotenv import load_dotenv

load_dotenv()

# API Keys
BRIGHTDATA_API_KEY = os.getenv("BRIGHTDATA_API_KEY")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# BrightData proxy configuration
# If you have proxy credentials in format "brd-customer-XXX-zone-YYY:password"
BRIGHTDATA_PROXY_AUTH = os.getenv("BRIGHTDATA_PROXY_AUTH", None)

# Output directory (relative to this file)
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "output")

# Image settings
TARGET_SIZE = (512, 512)
IMAGE_FORMAT = "PNG"

# Validation thresholds
MIN_VALIDATION_SCORE = 0.6  # Minimum score to accept an image
MAX_CANDIDATES = 5           # Max images to evaluate before falling back to DALL-E

# DALL-E settings
DALLE_MODEL = "dall-e-3"
DALLE_SIZE = "1024x1024"
DALLE_QUALITY = "standard"
DALLE_STYLE = "vivid"
