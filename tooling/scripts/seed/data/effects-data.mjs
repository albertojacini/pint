/**
 * Effects data
 * Relationships between ideas and measurables (how ideas affect metrics)
 */

export const effects = [
  // Urban speed limit effects
  {
    idea: "Introduce urban speed limits",
    measurable: "Traffic deaths per 100,000 inhabitants",
    title: "Reduces traffic deaths",
    description: "Reduced kinetic energy at impact decreases accident severity by 20-40%",
    mechanism: "Speed limit → Lower vehicle speeds → Reduced kinetic energy at impact → Lower accident severity → Fewer deaths"
  },
  {
    idea: "Introduce urban speed limits",
    measurable: "Average commute time",
    title: "Increases commute time",
    description: "Vehicle travel times may increase 5-15% depending on traffic patterns",
    mechanism: "Speed limit → Lower maximum speeds → Longer travel times for car trips"
  },
  {
    idea: "Introduce urban speed limits",
    measurable: "Public transport ridership",
    title: "Encourages public transport use",
    description: "Modal shift from cars as speed advantage diminishes",
    mechanism: "Speed limit → Reduced car speed advantage → More attractive public transport alternative → Modal shift"
  },
  {
    idea: "Introduce urban speed limits",
    measurable: "CO2 emissions from transport",
    title: "Reduces transport emissions",
    description: "Smoother traffic flow and modal shift to bikes/walking",
    mechanism: "Speed limit → Smoother traffic flow → Reduced fuel consumption → Lower emissions"
  },

  // Public transport subsidy effects
  {
    idea: "Subsidize public transport",
    measurable: "Public transport ridership",
    title: "Increases public transport ridership",
    description: "Lower fares increase ridership by 20-50% based on subsidy level",
    mechanism: "Subsidy → Lower ticket prices → Reduced barrier to entry → Increased ridership"
  },
  {
    idea: "Subsidize public transport",
    measurable: "Average monthly transport cost per household",
    title: "Reduces household transport costs",
    description: "Direct reduction in transport expenditure proportional to subsidy",
    mechanism: "Subsidy → Lower ticket prices → Reduced household transport spending"
  },
  {
    idea: "Subsidize public transport",
    measurable: "CO2 emissions from transport",
    title: "Reduces transport emissions through modal shift",
    description: "Modal shift from private vehicles reduces emissions; partially offset by shift from walking/cycling",
    mechanism: "Subsidy → Lower fares → Modal shift from cars → Reduced emissions per passenger-km"
  },
  {
    idea: "Subsidize public transport",
    measurable: "Average commute time",
    title: "May reduce commute times",
    description: "Increased ridership may lead to more frequent service",
    mechanism: "Subsidy → Higher ridership → Increased revenue → More frequent service → Shorter waiting times"
  },
]