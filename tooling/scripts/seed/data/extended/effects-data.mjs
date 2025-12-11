/**
 * Effects data
 * Relationships between ideas and measurables (how ideas affect metrics)
 */

export const effects = [
  // Urban speed limit effects
  {
    idea: "Urban speed limits",
    measurable: "Traffic deaths per 100,000 inhabitants",
    title: "Reduces traffic deaths",
    description: "Reduced kinetic energy at impact decreases accident severity by 20-40%",
    mechanism: "Speed limit → Lower vehicle speeds → Reduced kinetic energy at impact → Lower accident severity → Fewer deaths"
  },
  {
    idea: "Urban speed limits",
    measurable: "Average commute time",
    title: "Increases commute time",
    description: "Vehicle travel times may increase 5-15% depending on traffic patterns",
    mechanism: "Speed limit → Lower maximum speeds → Longer travel times for car trips"
  },
  {
    idea: "Urban speed limits",
    measurable: "Public transport ridership",
    title: "Encourages public transport use",
    description: "Modal shift from cars as speed advantage diminishes",
    mechanism: "Speed limit → Reduced car speed advantage → More attractive public transport alternative → Modal shift"
  },
  {
    idea: "Urban speed limits",
    measurable: "CO2 emissions from transport",
    title: "Reduces transport emissions",
    description: "Smoother traffic flow and modal shift to bikes/walking",
    mechanism: "Speed limit → Smoother traffic flow → Reduced fuel consumption → Lower emissions"
  },

  // Public transport subsidy effects
  {
    idea: "Public transport subsidies",
    measurable: "Public transport ridership",
    title: "Increases public transport ridership",
    description: "Lower fares increase ridership by 20-50% based on subsidy level",
    mechanism: "Subsidy → Lower ticket prices → Reduced barrier to entry → Increased ridership"
  },
  {
    idea: "Public transport subsidies",
    measurable: "Average monthly transport cost per household",
    title: "Reduces household transport costs",
    description: "Direct reduction in transport expenditure proportional to subsidy",
    mechanism: "Subsidy → Lower ticket prices → Reduced household transport spending"
  },
  {
    idea: "Public transport subsidies",
    measurable: "CO2 emissions from transport",
    title: "Reduces transport emissions through modal shift",
    description: "Modal shift from private vehicles reduces emissions; partially offset by shift from walking/cycling",
    mechanism: "Subsidy → Lower fares → Modal shift from cars → Reduced emissions per passenger-km"
  },
  {
    idea: "Public transport subsidies",
    measurable: "Average commute time",
    title: "May reduce commute times",
    description: "Increased ridership may lead to more frequent service",
    mechanism: "Subsidy → Higher ridership → Increased revenue → More frequent service → Shorter waiting times"
  },

  // Congestion charge effects
  {
    idea: "Urban congestion charge",
    measurable: "Traffic volume in congestion zone",
    title: "Reduces traffic volume in charging zone",
    description: "Studies show 10-30% reduction in vehicle entries (London: -30%, Stockholm: -22%, Milan Area C: -28%)",
    mechanism: "Congestion charge → Price signal to drivers → Modal shift to public transport/carpooling/route changes → Lower traffic volume"
  },
  {
    idea: "Urban congestion charge",
    measurable: "PM10 concentration",
    title: "Reduces particulate matter pollution",
    description: "Reduces PM10 by 13-15% within charging zone",
    mechanism: "Congestion charge → Lower traffic volume → Fewer vehicle emissions → Reduced PM10 concentration"
  },
  {
    idea: "Urban congestion charge",
    measurable: "NOx levels",
    title: "Reduces nitrogen oxide emissions",
    description: "Reduces NOx by approximately 13% in charging zone",
    mechanism: "Congestion charge → Lower traffic volume + vehicle filtering → Fewer combustion emissions → Reduced NOx levels"
  },
  {
    idea: "Urban congestion charge",
    measurable: "CO2 emissions from transport",
    title: "Reduces carbon emissions",
    description: "Reduces CO2 emissions by 13-19% through modal shift and traffic reduction",
    mechanism: "Congestion charge → Modal shift to public transport/cycling → Fewer vehicle-kilometers traveled → Lower CO2 emissions"
  },
  {
    idea: "Urban congestion charge",
    measurable: "Traffic accidents in zone",
    title: "Reduces traffic accidents",
    description: "Reduces accidents by 3-35% (London: -40% serious injuries, Stockholm: -5-10% overall)",
    mechanism: "Congestion charge → Lower traffic density → Fewer vehicle interactions → Reduced collision probability"
  },
  {
    idea: "Urban congestion charge",
    measurable: "Annual congestion charge revenue",
    title: "Generates public revenue",
    description: "Generates €5.9M-€288.6M annually (Milan Area C: €25M, London: £270M, Stockholm: SEK 1.2B)",
    mechanism: "Congestion charge → Fee collection from vehicles → Revenue for public transport investment"
  },
  {
    idea: "Urban congestion charge",
    measurable: "Average vehicle speed in zone",
    title: "Increases traffic flow speed",
    description: "Increases average speeds by 20%+ through reduced congestion (London: +37% in zone)",
    mechanism: "Congestion charge → Lower traffic volume → Less congestion → Higher average speeds"
  },
  {
    idea: "Urban congestion charge",
    measurable: "Public transport ridership",
    title: "Increases public transport usage",
    description: "Increases ridership by 4-7% as drivers switch modes (Stockholm: +6%, London: +7% bus ridership)",
    mechanism: "Congestion charge → Increased relative cost of driving → Modal shift to public transport → Higher ridership"
  },
]