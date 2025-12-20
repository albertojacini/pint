"""Compare outputs from deepagents vs Claude SDK implementations."""

import json
import asyncio
import time
import sys
import os
from typing import Any

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.services.research import run_ownership_agent, run_ownership_agent_sdk


async def compare_agents(description: str) -> dict[str, Any]:
    """
    Run both agents on same input and compare outputs.

    Args:
        description: The asset description to research

    Returns:
        Comparison report with metrics
    """
    print(f"\n{'='*80}")
    print(f"COMPARING AGENTS")
    print(f"{'='*80}")
    print(f"Description: {description}\n")

    # Run deepagents version
    print("🔵 Running deepagents implementation...")
    start = time.time()
    result_deepagents = None
    try:
        result_deepagents = await run_ownership_agent(description)
    except Exception as e:
        result_deepagents = {"error": "EXECUTION_ERROR", "reason": str(e)}
    deepagents_time = time.time() - start
    print(f"   ⏱️  Completed in {deepagents_time:.2f}s")

    # Run SDK version
    print("\n🟢 Running Claude SDK implementation...")
    start = time.time()
    result_sdk = None
    try:
        result_sdk = await run_ownership_agent_sdk(description)
    except Exception as e:
        result_sdk = {"error": "EXECUTION_ERROR", "reason": str(e)}
    sdk_time = time.time() - start
    print(f"   ⏱️  Completed in {sdk_time:.2f}s")

    # Compare results
    comparison = {
        "description": description,
        "deepagents": {
            "result": result_deepagents,
            "execution_time_seconds": round(deepagents_time, 2),
            "success": result_deepagents is not None and "error" not in result_deepagents,
        },
        "sdk": {
            "result": result_sdk,
            "execution_time_seconds": round(sdk_time, 2),
            "success": result_sdk is not None and "error" not in result_sdk,
        },
        "comparison": {
            "both_succeeded": (
                result_deepagents is not None and "error" not in result_deepagents and
                result_sdk is not None and "error" not in result_sdk
            ),
            "time_difference_seconds": round(abs(deepagents_time - sdk_time), 2),
            "faster_agent": "deepagents" if deepagents_time < sdk_time else "sdk",
            "field_completeness": compare_field_completeness(result_deepagents, result_sdk),
        }
    }

    # Print summary
    print(f"\n{'='*80}")
    print("COMPARISON SUMMARY")
    print(f"{'='*80}")
    print(f"Deepagents: {'✅ Success' if comparison['deepagents']['success'] else '❌ Failed'}")
    print(f"SDK:        {'✅ Success' if comparison['sdk']['success'] else '❌ Failed'}")
    print(f"Time diff:  {comparison['comparison']['time_difference_seconds']}s (faster: {comparison['comparison']['faster_agent']})")

    if comparison['comparison']['both_succeeded']:
        fc = comparison['comparison']['field_completeness']
        print(f"\nField Completeness:")
        print(f"  Deepagents: {fc['deepagents']['populated_fields']}/{fc['deepagents']['total_fields']} fields")
        print(f"  SDK:        {fc['sdk']['populated_fields']}/{fc['sdk']['total_fields']} fields")
    print(f"{'='*80}\n")

    return comparison


def compare_field_completeness(r1: dict | None, r2: dict | None) -> dict:
    """
    Compare how many fields are populated in each result.

    Args:
        r1: First result (deepagents)
        r2: Second result (SDK)

    Returns:
        Comparison dict with field counts
    """
    if not r1 or not r2:
        return {"error": "Cannot compare - one or both results missing"}

    # Skip if either is an error
    if "error" in r1 or "error" in r2:
        return {"error": "Cannot compare - one or both results are errors"}

    def count_populated_fields(data: dict) -> dict:
        """Count non-null fields."""
        counts = {
            "total_fields": 0,
            "populated_fields": 0,
            "null_fields": 0,
            "populated_field_names": [],
            "null_field_names": [],
        }

        for key, value in data.items():
            # Skip error fields and metadata
            if key in ["error", "reason", "suggestions"]:
                continue

            counts["total_fields"] += 1

            # Check if field is populated
            if value is not None and value != [] and value != "":
                counts["populated_fields"] += 1
                counts["populated_field_names"].append(key)
            else:
                counts["null_fields"] += 1
                counts["null_field_names"].append(key)

        return counts

    return {
        "deepagents": count_populated_fields(r1),
        "sdk": count_populated_fields(r2),
    }


async def main():
    """Run comparison tests."""
    test_cases = [
        "Comune di Milano partecipazione in ATM (azienda trasporti milanesi)",
        # Add more test cases as needed
        # "Comune di Milano - Milano Ristorazione",
    ]

    results = []
    for test_case in test_cases:
        result = await compare_agents(test_case)
        results.append(result)

    # Save comparison report
    output_path = "comparison_report.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    print(f"📊 Full comparison report saved to: {output_path}\n")

    # Print detailed comparison
    for i, result in enumerate(results, 1):
        print(f"\n{'='*80}")
        print(f"TEST CASE {i}: {result['description']}")
        print(f"{'='*80}")

        if result['comparison']['both_succeeded']:
            print("\n✅ Both agents succeeded\n")

            # Compare key fields
            da_result = result['deepagents']['result']
            sdk_result = result['sdk']['result']

            print("Key Field Comparison:")
            key_fields = ['title', 'assetCategory', 'ownershipPercentage', 'confidence', 'relevance']
            for field in key_fields:
                da_val = da_result.get(field, 'N/A')
                sdk_val = sdk_result.get(field, 'N/A')
                match = "✅" if da_val == sdk_val else "❌"
                print(f"  {field:25} {match}  DA: {da_val}  |  SDK: {sdk_val}")

            print(f"\n  Sources:")
            print(f"    Deepagents: {len(da_result.get('sourceUrls', []))} URLs")
            print(f"    SDK:        {len(sdk_result.get('sourceUrls', []))} URLs")

        else:
            print("\n❌ At least one agent failed\n")
            if not result['deepagents']['success']:
                err = result['deepagents']['result']
                print(f"  Deepagents error: {err.get('error', 'unknown')} - {err.get('reason', '')}")
            if not result['sdk']['success']:
                err = result['sdk']['result']
                print(f"  SDK error: {err.get('error', 'unknown')} - {err.get('reason', '')}")

    print(f"\n{'='*80}")
    print("Comparison complete!")
    print(f"{'='*80}\n")


if __name__ == "__main__":
    asyncio.run(main())
