/**
 * Contributions data
 * Relationships between measurables and goals (how metrics contribute to goals)
 */

export const contributions = [
  {
    measurable: "Traffic deaths per 100,000 inhabitants",
    goal: "Public Safety and Law Enforcement",
    contribution_type: "direct",
    weight: 0.9,
    description: null
  },
  {
    measurable: "Average commute time",
    goal: "Job Security and Fair Labor Standards",
    contribution_type: "indirect",
    weight: 0.3,
    description: "Shorter commutes improve work-life balance"
  },
  {
    measurable: "CO2 emissions from transport",
    goal: "Sustainability and Environmental Protection",
    contribution_type: "direct",
    weight: 0.95,
    description: null
  },
  {
    measurable: "Public transport ridership",
    goal: "Sustainability and Environmental Protection",
    contribution_type: "supporting",
    weight: 0.6,
    description: "More transit use indicates shift away from cars"
  },
  {
    measurable: "Public transport ridership",
    goal: "Social Inclusion and Anti-discrimination",
    contribution_type: "direct",
    weight: 0.7,
    description: "Public transport enables mobility for all income levels"
  },
  {
    measurable: "Average monthly transport cost per household",
    goal: "Poverty Alleviation",
    contribution_type: "direct",
    weight: 0.8,
    description: null
  },
  {
    measurable: "Average monthly transport cost per household",
    goal: "Social Inclusion and Anti-discrimination",
    contribution_type: "direct",
    weight: 0.75,
    description: "Lower transport costs improve accessibility for low-income groups"
  },
  {
    measurable: "Traffic deaths per 100,000 inhabitants",
    goal: "Universal Healthcare Access",
    contribution_type: "indirect",
    weight: 0.4,
    description: "Fewer accidents reduce burden on healthcare system"
  },
]