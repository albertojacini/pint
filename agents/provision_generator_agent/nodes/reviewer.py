"""Reviewer node - CLI interface for human review of candidate provisions."""

from provision_generator_agent.models import (
    CandidateProvision,
    DedupResult,
    DedupStatus,
    ReviewDecision,
)


def print_candidate(result: DedupResult) -> None:
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
        print(f"Status: DUPLICATE of existing provision")
        print(f"  → {', '.join(result.similar_to)}")
    elif result.status == DedupStatus.SIMILAR:
        print(f"Status: SIMILAR to existing provisions")
        for title in result.similar_to:
            print(f"  → {title}")
    else:
        print(f"Status: NEW (no similar provisions found)")

    print("─" * 60)


def get_review_decision() -> ReviewDecision:
    """Prompt user for review decision."""
    print("[A]pprove  [R]eject  [E]dit  [S]kip  [Q]uit")

    while True:
        choice = input("> ").strip().lower()

        if choice in ("a", "approve"):
            return ReviewDecision.APPROVE
        elif choice in ("r", "reject"):
            return ReviewDecision.REJECT
        elif choice in ("e", "edit"):
            return ReviewDecision.EDIT
        elif choice in ("s", "skip"):
            return ReviewDecision.SKIP
        elif choice in ("q", "quit"):
            return ReviewDecision.QUIT
        else:
            print("Invalid choice. Please enter A, R, E, S, or Q.")


def edit_candidate(candidate: CandidateProvision) -> CandidateProvision:
    """Allow user to edit candidate fields."""
    print("\nEditing candidate (press Enter to keep current value):\n")

    # Title
    new_title = input(f"Title [{candidate.title}]: ").strip()
    if new_title:
        candidate.title = new_title

    # Type
    print(f"Current type: {candidate.type.value}")
    print("Options: ownership, contract, regulation, taxation, allocation, designation")
    new_type = input("Type: ").strip().lower()
    if new_type and new_type in ["ownership", "contract", "regulation", "taxation", "allocation", "designation"]:
        from provision_generator_agent.models import ProvisionType
        candidate.type = ProvisionType(new_type)

    # Description
    print(f"\nCurrent description: {candidate.description}")
    new_desc = input("Description (or Enter to keep): ").strip()
    if new_desc:
        candidate.description = new_desc

    # Effective from
    new_date = input(f"Effective from [{candidate.effective_from or 'None'}]: ").strip()
    if new_date:
        candidate.effective_from = new_date if new_date.lower() != "none" else None

    print("\nUpdated candidate:")
    print(f"  Title: {candidate.title}")
    print(f"  Type: {candidate.type.value}")
    print(f"  Description: {candidate.description}")
    print(f"  Effective from: {candidate.effective_from}")

    return candidate


def review(result: DedupResult) -> tuple[ReviewDecision, CandidateProvision]:
    """
    Present candidate for human review.

    Args:
        result: DedupResult containing candidate and similarity info

    Returns:
        Tuple of (decision, possibly-edited candidate)
    """
    # Auto-skip duplicates (but show them)
    if result.status == DedupStatus.DUPLICATE:
        print_candidate(result)
        print("Auto-skipping duplicate...")
        return ReviewDecision.SKIP, result.candidate

    print_candidate(result)
    decision = get_review_decision()

    candidate = result.candidate

    if decision == ReviewDecision.EDIT:
        candidate = edit_candidate(candidate)
        # After editing, ask for final decision
        print("\nAfter edit:")
        decision = get_review_decision()
        if decision == ReviewDecision.EDIT:
            # Don't allow nested edits
            decision = ReviewDecision.APPROVE

    return decision, candidate
