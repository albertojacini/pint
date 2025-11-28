"""LangGraph state machine for the provision generator agent."""

from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver
from langgraph.types import interrupt, Command

from provision_generator_agent.models import (
    ScrapedPage,
    CandidateProvision,
    DedupResult,
    DedupStatus,
    ReviewDecision,
)


# --- State Definition ---

class ProvisionGraphState(TypedDict):
    """State that flows through the provision generator graph."""

    # Input
    url: str
    entity_id: str
    entity_name: str

    # After scrape
    page: ScrapedPage | None

    # After extract
    candidates: list[CandidateProvision]

    # Processing state
    existing_provisions: list[dict]
    current_candidate_index: int

    # Current candidate processing
    current_candidate: CandidateProvision | None
    current_dedupe_result: DedupResult | None
    current_decision: ReviewDecision | None

    # Results
    stats: dict  # {"approved": 0, "rejected": 0, "skipped": 0, "errors": 0}
    stored_provision_ids: list[str]

    # Control flow
    should_quit: bool


# --- Node Functions ---

async def scrape_node(state: ProvisionGraphState) -> dict:
    """Scrape the URL and return page content."""
    from provision_generator_agent.nodes.scraper import scrape

    print(f"\n[1/5] Scraping {state['url']}...")
    try:
        page = await scrape(state["url"])
        print(f"  ✓ Got {len(page.markdown_content)} characters")
        return {"page": page}
    except Exception as e:
        print(f"  ✗ Scraping failed: {e}")
        stats = state.get("stats", {"approved": 0, "rejected": 0, "skipped": 0, "errors": 0})
        stats["errors"] += 1
        return {"page": None, "stats": stats}


async def extract_node(state: ProvisionGraphState) -> dict:
    """Extract provisions from the scraped page."""
    from provision_generator_agent.nodes.extractor import extract

    if not state.get("page"):
        return {"candidates": []}

    print("\n[2/5] Extracting provisions...")
    try:
        candidates = await extract(state["page"], entity_name=state["entity_name"])
        print(f"  ✓ Found {len(candidates)} candidate provisions")
        return {"candidates": candidates, "current_candidate_index": 0}
    except Exception as e:
        print(f"  ✗ Extraction failed: {e}")
        stats = state.get("stats", {"approved": 0, "rejected": 0, "skipped": 0, "errors": 0})
        stats["errors"] += 1
        return {"candidates": [], "stats": stats}


def load_existing_node(state: ProvisionGraphState) -> dict:
    """Load existing provisions for deduplication."""
    from provision_generator_agent.nodes.storage import get_existing_provisions

    existing = get_existing_provisions(state["entity_id"])
    print(f"\n[3/5] Loaded {len(existing)} existing provisions for deduplication")
    return {"existing_provisions": existing}


def select_candidate_node(state: ProvisionGraphState) -> dict:
    """Select the next candidate to process."""
    idx = state.get("current_candidate_index", 0)
    candidates = state.get("candidates", [])

    if idx >= len(candidates):
        return {"current_candidate": None}

    candidate = candidates[idx]
    print(f"\n--- Candidate {idx + 1}/{len(candidates)} ---")
    return {"current_candidate": candidate}


async def dedupe_node(state: ProvisionGraphState) -> dict:
    """Check if current candidate is a duplicate."""
    from provision_generator_agent.nodes.deduper import dedupe

    candidate = state.get("current_candidate")
    if not candidate:
        return {}

    try:
        result = await dedupe(candidate, state.get("existing_provisions", []))
        return {"current_dedupe_result": result}
    except Exception as e:
        print(f"  ✗ Deduplication failed: {e}")
        stats = state.get("stats", {"approved": 0, "rejected": 0, "skipped": 0, "errors": 0})
        stats["errors"] += 1
        # Skip this candidate on error
        return {
            "current_dedupe_result": None,
            "stats": stats,
            "current_candidate_index": state.get("current_candidate_index", 0) + 1,
        }


def review_node(state: ProvisionGraphState) -> dict:
    """Human review node - uses interrupt() for human-in-the-loop."""
    result = state.get("current_dedupe_result")
    if not result:
        return {"current_decision": ReviewDecision.SKIP}

    candidate = result.candidate

    # Auto-skip duplicates
    if result.status == DedupStatus.DUPLICATE:
        print_candidate_info(result)
        print("Auto-skipping duplicate...")
        return {"current_decision": ReviewDecision.SKIP}

    # Show candidate and interrupt for human input
    print_candidate_info(result)

    # Interrupt and wait for human decision
    decision_str = interrupt({
        "type": "review_decision",
        "candidate": {
            "title": candidate.title,
            "type": candidate.type.value,
            "description": candidate.description,
            "effective_from": candidate.effective_from,
            "source_url": candidate.source_url,
        },
        "dedupe_status": result.status.value,
        "similar_to": result.similar_to,
        "prompt": "[A]pprove  [R]eject  [E]dit  [S]kip  [Q]uit",
    })

    # Parse decision from resume value
    decision = parse_decision(decision_str)
    return {"current_decision": decision}


def store_node(state: ProvisionGraphState) -> dict:
    """Store approved provision in database."""
    from provision_generator_agent.nodes.storage import store

    decision = state.get("current_decision")
    candidate = state.get("current_candidate")
    stats = state.get("stats", {"approved": 0, "rejected": 0, "skipped": 0, "errors": 0})
    stored_ids = state.get("stored_provision_ids", [])
    existing = state.get("existing_provisions", [])

    if decision == ReviewDecision.APPROVE and candidate:
        try:
            provision_id = store(candidate, state["entity_id"])
            print(f"  ✓ Stored provision: {provision_id}")
            stats["approved"] += 1
            stored_ids.append(provision_id)
            # Add to existing for future deduplication
            existing.append({
                "id": provision_id,
                "title": candidate.title,
                "type": candidate.type.value,
                "description": candidate.description,
            })
        except Exception as e:
            print(f"  ✗ Storage failed: {e}")
            stats["errors"] += 1
    elif decision == ReviewDecision.REJECT:
        print("  → Rejected")
        stats["rejected"] += 1
    elif decision == ReviewDecision.QUIT:
        return {
            "should_quit": True,
            "stats": stats,
            "stored_provision_ids": stored_ids,
        }
    else:  # SKIP
        print("  → Skipped")
        stats["skipped"] += 1

    # Move to next candidate
    return {
        "stats": stats,
        "stored_provision_ids": stored_ids,
        "existing_provisions": existing,
        "current_candidate_index": state.get("current_candidate_index", 0) + 1,
    }


# --- Helper Functions ---

def print_candidate_info(result: DedupResult) -> None:
    """Print candidate provision details for review."""
    candidate = result.candidate

    print("\n" + "─" * 60)
    print(f"CANDIDATE: {candidate.title}")
    print(f"Type: {candidate.type.value}")
    print(f"Description: {candidate.description}")
    print(f"Source: {candidate.source_url}")

    if candidate.effective_from:
        print(f"Effective from: {candidate.effective_from}")

    if candidate.source_snippet:
        print(f"\nSnippet: \"{candidate.source_snippet[:200]}...\"")

    print()

    if result.status == DedupStatus.DUPLICATE:
        print("Status: DUPLICATE of existing provision")
        print(f"  → {', '.join(result.similar_to)}")
    elif result.status == DedupStatus.SIMILAR:
        print("Status: SIMILAR to existing provisions")
        for title in result.similar_to:
            print(f"  → {title}")
    else:
        print("Status: NEW (no similar provisions found)")

    print("─" * 60)


def parse_decision(decision_str: str | dict) -> ReviewDecision:
    """Parse decision from interrupt resume value."""
    if isinstance(decision_str, dict):
        decision_str = decision_str.get("decision", "skip")

    choice = str(decision_str).strip().lower()

    if choice in ("a", "approve"):
        return ReviewDecision.APPROVE
    elif choice in ("r", "reject"):
        return ReviewDecision.REJECT
    elif choice in ("e", "edit"):
        return ReviewDecision.EDIT
    elif choice in ("q", "quit"):
        return ReviewDecision.QUIT
    else:  # s, skip, or unknown
        return ReviewDecision.SKIP


# --- Routing Functions ---

def route_after_scrape(state: ProvisionGraphState) -> str:
    """Route after scraping - continue or end on failure."""
    if state.get("page") is None:
        return END
    return "extract"


def route_after_select(state: ProvisionGraphState) -> str:
    """Route after selecting candidate - process or finish."""
    if state.get("current_candidate") is None:
        return END
    if state.get("should_quit"):
        return END
    return "dedupe"


def route_after_dedupe(state: ProvisionGraphState) -> str:
    """Route after deduplication - skip duplicates or review."""
    result = state.get("current_dedupe_result")
    if result is None:
        # Error occurred, move to next
        return "select_candidate"
    if result.status == DedupStatus.DUPLICATE:
        return "store"  # Will auto-skip
    return "review"


def route_after_store(state: ProvisionGraphState) -> str:
    """Route after storing - continue or quit."""
    if state.get("should_quit"):
        return END
    return "select_candidate"


# --- Build Graph ---

def build_graph() -> StateGraph:
    """Build the provision generator state graph."""
    builder = StateGraph(ProvisionGraphState)

    # Add nodes
    builder.add_node("scrape", scrape_node)
    builder.add_node("extract", extract_node)
    builder.add_node("load_existing", load_existing_node)
    builder.add_node("select_candidate", select_candidate_node)
    builder.add_node("dedupe", dedupe_node)
    builder.add_node("review", review_node)
    builder.add_node("store", store_node)

    # Add edges
    builder.add_edge(START, "scrape")
    builder.add_conditional_edges("scrape", route_after_scrape, ["extract", END])
    builder.add_edge("extract", "load_existing")
    builder.add_edge("load_existing", "select_candidate")
    builder.add_conditional_edges("select_candidate", route_after_select, ["dedupe", END])
    builder.add_conditional_edges("dedupe", route_after_dedupe, ["review", "store", "select_candidate"])
    builder.add_edge("review", "store")
    builder.add_conditional_edges("store", route_after_store, ["select_candidate", END])

    return builder


def compile_graph(checkpointer=None):
    """Compile the graph with optional checkpointer."""
    builder = build_graph()
    if checkpointer is None:
        checkpointer = MemorySaver()
    return builder.compile(checkpointer=checkpointer)
