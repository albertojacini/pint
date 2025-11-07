/**
 * Effects data
 * Relationships between ideas and measurables (how ideas affect metrics)
 */

export const effects = [
  // Urban speed limit effects (direct mechanisms)
  {
    idea: "Introduce urban speed limits",
    measurable: "Traffic deaths per 100,000 inhabitants",
    direction: "negative",
    intensity: "high",
    confidence: "proven",
    evidence: "Reduced kinetic energy at impact decreases accident severity by 20-40%"
  },
  {
    idea: "Introduce urban speed limits",
    measurable: "Average commute time",
    direction: "positive",
    intensity: "low",
    confidence: "medium",
    evidence: "Vehicle travel times may increase 5-15% depending on traffic patterns"
  },
  {
    idea: "Introduce urban speed limits",
    measurable: "Public transport ridership",
    direction: "positive",
    intensity: "low",
    confidence: "medium",
    evidence: "Modal shift from cars as speed advantage diminishes"
  },
  {
    idea: "Introduce urban speed limits",
    measurable: "CO2 emissions from transport",
    direction: "negative",
    intensity: "low",
    confidence: "medium",
    evidence: "Smoother traffic flow and modal shift to bikes/walking"
  },

  // Public transport subsidy effects (direct mechanisms)
  {
    idea: "Subsidize public transport",
    measurable: "Public transport ridership",
    direction: "positive",
    intensity: "high",
    confidence: "proven",
    evidence: "Lower fares increase ridership by 20-50% based on subsidy level"
  },
  {
    idea: "Subsidize public transport",
    measurable: "Average monthly transport cost per household",
    direction: "negative",
    intensity: "high",
    confidence: "proven",
    evidence: "Direct reduction in transport expenditure proportional to subsidy"
  },
  {
    idea: "Subsidize public transport",
    measurable: "CO2 emissions from transport",
    direction: "negative",
    intensity: "medium",
    confidence: "high",
    evidence: "Modal shift from private vehicles reduces emissions; partially offset by shift from walking/cycling"
  },
  {
    idea: "Subsidize public transport",
    measurable: "Average commute time",
    direction: "negative",
    intensity: "low",
    confidence: "low",
    evidence: "Increased ridership may lead to more frequent service"
  },
]