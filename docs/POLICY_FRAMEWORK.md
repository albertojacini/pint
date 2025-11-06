# Policy Framework

## Philosophy

Pint uses a data-driven framework to enable evidence-based policy analysis and cross-entity comparison. The core principle: **separate abstract ideas from concrete implementations** and trace their impact through measurable metrics to high-level societal goals.

## The Chain

```
IDEA → EFFECT → MEASURABLE → CONTRIBUTION → GOAL
```

**Flow:**
1. **Idea**: Abstract policy concept (entity-independent)
2. **Effect**: How the idea impacts specific metrics (direction + intensity)
3. **Measurable**: Universal quantifiable metric (entity-independent)
4. **Contribution**: How the metric relates to high-level goals (weight)
5. **Goal**: Ultimate societal objective from Maslow hierarchy

**Implementation:**
- **Policy**: Concrete implementation of an idea by a specific entity (city, region, country)

## Core Entities

### Ideas
Abstract, reusable policy concepts. Examples: "Speed limit reduction", "Free public transport"

**Properties:** title, description, category

### Measurables
Universal, quantifiable metrics independent of any policy or entity. Examples: "Traffic deaths per 100k", "CO2 emissions"

**Properties:** title, description, unit, data_source, measurement_frequency

### Effects
Links between ideas and measurables with qualified impact.

**Properties:** idea_id, measurable_id, direction (positive/negative), intensity (low/medium/high), confidence (low/medium/high/proven), evidence

### Contributions
Links between measurables and goals with weighted importance.

**Properties:** measurable_id, goal_id, contribution_type (direct/indirect/supporting), weight (0-1), description

### Policies
Concrete implementations of ideas by specific political entities.

**Properties:** idea_id, entity_id, administration_id, title, description, status, dates, budget

## Example: Speed Limit Reduction

**Idea:** "Urban speed limit reduction to 30 km/h"

**Effects:**
- Traffic deaths per 100k → **negative** direction, **high** intensity, **proven** confidence
- Average commute time → **positive** direction (increases), **low** intensity

**Measurables:**
- "Traffic deaths per 100,000 inhabitants" (unit: count, yearly)
- "Average commute time" (unit: minutes, yearly)

**Contributions:**
- Traffic deaths → **Public Safety** goal (direct, weight: 0.9)
- Commute time → **Job Security** goal (indirect, weight: 0.3)

**Policy Implementation:**
- Milan implements "Città 30" (2024, €2.5M budget)

## Key Principles

1. **Abstraction**: Ideas and measurables are entity-independent
2. **Reusability**: Same idea can be implemented by multiple entities
3. **Traceability**: Every policy traces back through the chain to goals
4. **Evidence-based**: Effects require confidence levels and evidence
5. **Comparable**: Policies implementing the same idea can be compared across entities

## Future Enhancements

### AI & Automation
- LLM-powered effect prediction from research papers
- Automated policy recommendation based on goal priorities
- Evidence gathering from academic databases
- Natural language policy search and analysis

### Analytics & Visualization
- Goal achievement dashboards and progress tracking
- Cross-entity policy effectiveness comparison
- Policy impact simulation and forecasting
- Cost-benefit analysis automation
- Network visualization of idea-effect-measurable-goal relationships

### Collaboration
- Citizen feedback and sentiment analysis
- Expert peer review system for effects and evidence
- Collaborative policy design workspace
- Voting and prioritization mechanisms

### Data Integration
- Real-time data feeds from city APIs and sensors
- Open data portal integration
- International policy database connections
- Automated measurement tracking

### Advanced Features
- Multi-criteria decision analysis for policy selection
- Risk assessment and mitigation planning
- Version control and policy evolution tracking
- Temporal analysis (before/after comparisons)
- Machine learning for pattern recognition in successful policies

### User Experience
- Interactive policy builder wizard
- Goal-to-policy reverse search ("what policies achieve this goal?")
- Impact calculator and scenario modeling
- Evidence repository with citations
- Mobile-friendly policy exploration

### Research & Validation
- A/B testing framework for policies
- Longitudinal impact studies
- Causal inference tools
- Meta-analysis of similar policies across entities
- Academic research integration and validation
