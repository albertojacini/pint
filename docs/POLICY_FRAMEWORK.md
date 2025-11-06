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

### Ideas (Policy Levers)
Abstract, reusable policy instruments - the fundamental actions a government can take.

**Rules:**
- **Action-oriented**: Start with a verb (Subsidize, Regulate, Tax, Mandate, Prohibit, Incentivize, Provide, Introduce)
- **Parameter-agnostic**: No specific numbers or thresholds (not "30 km/h" but "urban speed limits")
- **One-dimensional**: Each idea pulls one lever in one direction
- **Context-independent**: Could apply to any city/country with appropriate parameters
- **Atomic**: Cannot be broken down into smaller policy actions

**Examples:**
- ✅ "Subsidize public transport" (not "Free public transportation")
- ✅ "Introduce urban speed limits" (not "30 km/h zones")
- ✅ "Tax vehicle emissions"
- ✅ "Mandate bicycle infrastructure"
- ✅ "Prohibit diesel vehicles in centers"

**Properties:** title, description, category

### Effects (Direct Mechanisms)
The immediate mechanical consequences - what physically/behaviorally changes as a direct result of an idea.

**Rules:**
- **Mechanistic**: Describe the physical or behavioral change that occurs
- **Direction-neutral**: Can be positive, negative, or variable
- **Comprehensive**: List ALL significant first-order effects
- **Observable**: Things you could measure or observe happening
- **Non-evaluative**: Don't judge if it's good or bad

**Example - "Subsidize public transport":**
- Public transport ticket prices decrease
- Modal shift: car → public transport
- Modal shift: bike → public transport
- Modal shift: walking → public transport
- Public transport vehicle occupancy increases
- Public transport service frequency may increase
- Government spending on transport subsidies increases
- Fare collection administrative costs may decrease

**Properties:** idea_id, measurable_id, direction (positive/negative), intensity (low/medium/high), confidence (low/medium/high/proven), evidence

### Measurables (Observable Metrics)
Universal, quantifiable metrics independent of any policy or entity. Can be influenced by multiple effects from different ideas.

**Rules:**
- **Quantifiable**: Has a clear unit of measurement
- **Standardizable**: Can be measured consistently across jurisdictions
- **Multi-causal**: Influenced by multiple effects from different ideas
- **Observable**: Can be measured or calculated from data

**Examples:**
- "Traffic deaths per 100,000 inhabitants" (unit: count)
- "Average commute time" (unit: minutes)
- "CO2 emissions from transport" (unit: tons)
- "Public transport ridership" (unit: trips per day)
- "Average monthly transport cost per household" (unit: EUR)

**Properties:** title, description, unit, data_source, measurement_frequency

### Contributions
Links between measurables and goals with weighted importance.

**Properties:** measurable_id, goal_id, contribution_type (direct/indirect/supporting), weight (0-1), description

### Policies
Concrete implementations of ideas by specific political entities.

**Properties:** idea_id, entity_id, administration_id, title, description, status, dates, budget

## Example: Urban Speed Limits

**Idea:** "Introduce urban speed limits" (generic policy lever)

**Effects (direct mechanisms):**
- Maximum vehicle speeds decrease → Traffic deaths ↓ (kinetic energy reduction)
- Vehicle travel time changes → Average commute time ↑ (context-dependent)
- Modal shift: car → bike → Public transport ridership ↑ (safer cycling)
- Modal shift: car → walking → CO2 emissions ↓ (less car usage)
- Traffic flow patterns change → CO2 emissions ↓ (smoother acceleration)
- Enforcement requirements increase → Government spending ↑

**Measurables:**
- "Traffic deaths per 100,000 inhabitants" (unit: count, yearly)
- "Average commute time" (unit: minutes, yearly)
- "Public transport ridership" (unit: trips per day, monthly)
- "CO2 emissions from transport" (unit: tons, yearly)

**Contributions:**
- Traffic deaths → **Public Safety** goal (direct, weight: 0.9)
- Commute time → **Job Security** goal (indirect, weight: 0.3)
- CO2 emissions → **Environmental Protection** goal (direct, weight: 0.95)

**Policy Implementation (concrete with parameters):**
- Milan: "Città 30" - 30 km/h limit (2024, €2.5M budget)
- Paris: "Zone 30" - 30 km/h limit (2021, €5M budget)
- Barcelona: "Ciutat 30" - 30 km/h limit (2020, €1.5M budget)

Each city implements the same **idea** with potentially different parameters and approaches, allowing for comparison of effectiveness.

## Key Principles

1. **Abstraction**: Ideas and measurables are entity-independent
2. **Reusability**: Same idea can be implemented by multiple entities with different parameters
3. **Traceability**: Every policy traces back through the chain to goals
4. **Evidence-based**: Effects require confidence levels and evidence
5. **Comparable**: Policies implementing the same idea can be compared across entities
6. **Comprehensive**: Effects capture ALL trade-offs (positive and negative)
7. **Mechanistic**: Effects describe direct causal mechanisms, not evaluations

## Key Insights

The power of this framework lies in:

1. **Template Reusability**: Ideas are templates that different administrations can implement with different parameters (e.g., speed limit of 30 vs 20 km/h)

2. **Trade-off Visibility**: By listing ALL effects comprehensively, decision-makers see the complete picture - both benefits and costs

3. **Cross-pollination**: Cities can learn from each other's implementations of the same idea

4. **Evidence Accumulation**: As more entities implement an idea, the confidence in effects increases

5. **Multi-pathway Impact**: Multiple ideas can influence the same measurable through different effect pathways (e.g., both "Subsidize public transport" and "Tax private vehicles" reduce CO2)

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
