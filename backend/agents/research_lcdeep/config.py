"""Configuration for research_lcdeep agent."""

# Model configuration
# Main model used for the lead agent and subagents (search_evaluator, summarizer)
# MAIN_MODEL = "claude-haiku-4-5"
MAIN_MODEL = "claude-sonnet-4-5"

# Model used specifically for summarization and content processing in SourceLoader
SUMMARIZER_MODEL = "claude-sonnet-4-5"

# Alternative high-capacity model for complex tasks (not currently used)
ADVANCED_MODEL = "claude-haiku-4-5"

# Model parameters
DEFAULT_TEMPERATURE = 0
DEFAULT_MAX_TOKENS = 1000
