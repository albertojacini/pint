"""LLM-based provision type classifier."""

import os
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import SystemMessage, HumanMessage
from dotenv import load_dotenv

load_dotenv()

CLASSIFICATION_PROMPT = """You are an expert at classifying public policy provisions into categories.

Given a description of a provision and the political entity it belongs to, classify it into ONE of these types:

1. **ownership** - Stakes in companies, property, infrastructure owned by the entity
   Examples: Municipal transit company ownership, public utility stakes, city-owned buildings

2. **contract** - Service agreements, concessions, partnerships
   Examples: Waste collection contracts, public-private partnerships, service outsourcing

3. **regulation** - Rules, ordinances, codes, standards
   Examples: Building codes, zoning rules, business permits, noise ordinances

4. **taxation** - Taxes, fees, tariffs
   Examples: Property tax, congestion charges, parking fees, tourist tax

5. **allocation** - Programs, subsidies, budgets, funds
   Examples: Housing subsidies, cultural grants, education budgets, social programs

6. **designation** - Zones, landmarks, protected areas, institutions
   Examples: Historical districts, traffic-limited zones, nature reserves, UNESCO sites

Respond with a JSON object containing:
- suggested_type: one of "ownership", "contract", "regulation", "taxation", "allocation", "designation"
- confidence: a number from 0 to 1 indicating confidence
- reasoning: brief explanation of why this type fits

Be concise in your reasoning (1-2 sentences max)."""


async def classify_provision(description: str, entity_name: str) -> dict:
    """
    Classify a provision description into one of the 6 types.

    Returns:
        dict with suggested_type, confidence, and reasoning
    """
    llm = ChatAnthropic(
        model="claude-sonnet-4-20250514",
        api_key=os.getenv("ANTHROPIC_API_KEY"),
        max_tokens=500,
    )

    messages = [
        SystemMessage(content=CLASSIFICATION_PROMPT),
        HumanMessage(content=f"Entity: {entity_name}\n\nDescription: {description}"),
    ]

    response = await llm.ainvoke(messages)
    content = response.content

    # Parse JSON from response
    import json
    import re

    # Try to extract JSON from response
    json_match = re.search(r'\{[\s\S]*\}', content)
    if json_match:
        try:
            result = json.loads(json_match.group())
            return {
                "suggested_type": result.get("suggested_type", "regulation"),
                "confidence": float(result.get("confidence", 0.5)),
                "reasoning": result.get("reasoning", "Unable to determine reasoning"),
            }
        except json.JSONDecodeError:
            pass

    # Fallback
    return {
        "suggested_type": "regulation",
        "confidence": 0.3,
        "reasoning": "Could not parse classification result",
    }
