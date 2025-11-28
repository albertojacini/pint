"""Deduper node - checks if a candidate provision already exists."""

from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage

from provision_generator_agent.models import CandidateProvision, DedupResult, DedupStatus


DEDUPE_PROMPT = """You are checking if a candidate provision already exists in the database.

## Candidate Provision
Title: {candidate_title}
Type: {candidate_type}
Description: {candidate_description}

## Existing Provisions
{existing_provisions}

## Instructions

Compare the candidate to each existing provision. Determine:

1. **DUPLICATE**: The candidate is essentially the same provision as an existing one
   - Same entity being controlled
   - Same type of control mechanism
   - Minor wording differences don't matter

2. **SIMILAR**: The candidate is related but distinct from existing provisions
   - Overlapping subject matter
   - Different aspect of control
   - Example: "Area C fee" is similar to "Area C zone" but not duplicate

3. **NEW**: The candidate doesn't match any existing provision

Respond with EXACTLY this JSON format:
{{
  "status": "duplicate" | "similar" | "new",
  "similar_to": ["Title 1", "Title 2"],  // list of similar/duplicate provision titles, empty if new
  "reasoning": "Brief explanation"
}}
"""


async def dedupe(
    candidate: CandidateProvision,
    existing_provisions: list[dict],
) -> DedupResult:
    """
    Check if a candidate provision is a duplicate or similar to existing ones.

    Args:
        candidate: The candidate provision to check
        existing_provisions: List of existing provisions with title, type, description

    Returns:
        DedupResult with status and similar provisions
    """
    llm = ChatOpenAI(model="gpt-4o", temperature=0)

    # Format existing provisions
    if not existing_provisions:
        existing_str = "(No existing provisions)"
    else:
        existing_str = "\n".join(
            f"- {p['title']} ({p['type']}): {p.get('description', 'No description')}"
            for p in existing_provisions
        )

    prompt = DEDUPE_PROMPT.format(
        candidate_title=candidate.title,
        candidate_type=candidate.type.value,
        candidate_description=candidate.description,
        existing_provisions=existing_str,
    )

    result = await llm.ainvoke([HumanMessage(content=prompt)])

    # Parse response
    import json

    content = result.content.strip()
    # Extract JSON from markdown code blocks if present
    if "```json" in content:
        content = content.split("```json")[1].split("```")[0].strip()
    elif "```" in content:
        content = content.split("```")[1].split("```")[0].strip()

    data = json.loads(content)

    return DedupResult(
        candidate=candidate,
        status=DedupStatus(data["status"]),
        similar_to=data.get("similar_to", []),
    )
