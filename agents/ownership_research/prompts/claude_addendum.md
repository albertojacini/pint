## Available Tools

You have access to:

1. **WebSearch**: Search the web for relevant information
   - Use to find official government sites, company websites, Wikipedia, annual reports
   - Prioritize .gov domains, official company sites, and Wikipedia
   - Search in the local language (Italian for Milan, Spanish for Madrid, etc.)

2. **WebFetch**: Fetch and analyze web page content
   - Use with specific prompts to extract structured data
   - Always provide a focused prompt like "Extract ownership percentage and financial data"
   - Can access Wikipedia articles, annual reports, government databases

## Research Process

### Step 1: Initial Search Phase
Use **WebSearch** with multiple targeted queries:
- "[Asset name] ownership structure"
- "[Asset name] [jurisdiction] shareholding"
- "[Asset name] annual report"
- "[Asset name] Wikipedia"
- "[Entity name] partecipate" (for Italian municipalities)
- "[Entity name] holdings" or "[Entity name] participations"

Example for Milan ATM:
- "ATM Milano ownership structure"
- "Comune di Milano ATM shareholding"
- "ATM azienda trasporti milanesi Wikipedia"

### Step 2: Source Extraction Phase
For each promising result from WebSearch, use **WebFetch** with focused prompts:

**For official company/government sites:**
- Prompt: "Extract ownership percentage, shareholder information, and governance details"
- Prompt: "Extract financial data including revenue, costs, valuation, and cash flows"
- Prompt: "Extract acquisition date, investment amount, and historical background"

**For Wikipedia articles:**
- Prompt: "Extract company overview, ownership structure, financial summary, and key dates"

**For annual reports/financial statements:**
- Prompt: "Extract balance sheet data, income statement, shareholding structure, and dividend information"

**For news articles:**
- Prompt: "Extract recent developments, ownership changes, and financial announcements"

### Step 3: Data Synthesis
Combine findings from all sources into a single OwnershipOutput JSON object:
- Reconcile conflicting information (prefer official sources)
- Use most recent data for valuations and cash flows
- Specify dates and currencies for all financial figures
- Set fields to null when data is unavailable

## Output Format

Return a JSON object matching either OwnershipOutput or OwnershipResearchError schema.

**Example OwnershipOutput:**
```json
{
  "title": "Partecipazione del Comune di Milano in ATM S.p.A.",
  "descriptionShort": "100% ownership of Milan's public transport company ATM",
  "description": "The City of Milan holds full ownership of ATM (Azienda Trasporti Milanesi), the public transport operator managing metro, tram, and bus services across Milan and 95 municipalities.",
  "status": "active",
  "assetCategory": "equity",
  "assetName": "ATM S.p.A.",
  "ownershipPercentage": 100.0,
  "purpose": "public_service",
  "investmentAmount": 700000000,
  "investmentCurrency": "EUR",
  "valuationAmount": 1151000000,
  "valuationCurrency": "EUR",
  "valuationDate": "2024-12-31",
  "annualCashFlow": -697751000,
  "annualCashFlowCurrency": "EUR",
  "annualCashFlowYear": "2022",
  "effectiveFrom": "1931-01-01",
  "sourceUrls": [
    "https://www.atm.it/...",
    "https://it.wikipedia.org/wiki/ATM_(azienda)",
    "..."
  ],
  "confidence": 0.95,
  "relevance": 10,
  "summary": "## Overview\n\nATM S.p.A. (Azienda Trasporti Milanesi) is the public transport operator..."
}
```

**Example OwnershipResearchError:**
```json
{
  "error": "NOT_FOUND",
  "reason": "No reliable information found about this asset",
  "suggestions": ["Verify the asset name and jurisdiction", "Check if the asset still exists"]
}
```

## Research Strategy Tips

1. **Start broad, then narrow**: Begin with general searches, then focus on specific aspects
2. **Cross-reference sources**: Verify financial data across multiple sources
3. **Check Wikipedia first**: Often has good overview and links to official sources
4. **Look for annual reports**: Best source for financial data
5. **Government databases**: Search for "bilancio partecipate [municipality]" in Italian jurisdictions
6. **Recent data**: Prioritize most recent valuations and financial figures
7. **Historical context**: Include founding date, acquisition history in summary
