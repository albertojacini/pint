/**
 * Policy categories tree structure
 * This defines the hierarchical organization of policy categories
 */

export const categoriesTree = [
  { title: "Culture and Arts", children: [] },
  { title: "Defence and Security", children: [] },
  { title: "Education", children: [] },
  {
    title: "Transport and Infrastructure",
    children: [
      {
        title: "Roads",
        children: [
          {
            title: "Urban Areas",
            children: [
              { title: "Traffic Management", only_entities_with_types: ["city"] },
              { title: "Public Transportation", only_entities_with_types: ["city"] },
              { title: "Cycling Infrastructure", only_entities_with_types: ["city"] },
              { title: "Pedestrian Safety", only_entities_with_types: ["city"] },
            ]
          },
          { title: "Safety" },
          { title: "Parking" },
          { title: "Cycling" },
          { title: "Traffic", children: [] },
          { title: "Road Maintenance", children: [] }
        ]
      },
      { title: "Railways", children: [] },
      { title: "Airports", children: [] },
      { title: "Ports", children: [] },
    ]
  },
  {
    title: "Economy",
    children: [
      {
        title: "Consumer Protection",
        children: [
          {
            title: "Gambling",
            children: [
              { title: "Licensing", only_entities_with_types: ["country"] },
              { title: "Online Gambling", only_entities_with_types: ["country"] },
              { title: "Casinos", only_entities_with_types: ["country"] },
              { title: "Taxation", only_entities_with_types: ["country"] },
              { title: "Advertising", only_entities_with_types: ["country"] }
            ]
          }
        ]
      },
    ]
  },
  { title: "Environment", children: [] },
  { title: "Foreign Affairs", children: [] },
  { title: "Public Administration", children: [] },
  { title: "Health", children: [] },
  { title: "Housing", children: [] },
  { title: "Justice", children: [] },
  {
    title: "Labour and Social Affairs",
    children: [
      {
        title: "Employment",
        children: [
          { title: "Job Creation Strategies" },
          {
            title: "Unemployment Policies",
            children: [
              { title: "Unemployment Benefits" },
              { title: "Job Search Assistance Programs" }
            ]
          }
        ]
      },
      {
        title: "Social Protection",
        children: [
          {
            title: "Pensions",
            children: [
              { title: "Retirement Age Reform" },
              { title: "Sustainable Pension Systems" }
            ]
          },
          {
            title: "Social Insurance",
            children: [
              { title: "Disability Insurance" },
              { title: "Health Insurance" }
            ]
          }
        ]
      },
      {
        title: "Labour Market Regulation",
        children: [
          { title: "Minimum Wage Policies" },
          { title: "Workplace Safety Standards" },
          {
            title: "Fair Labour Practices",
            children: [
              { title: "Equal Pay Legislation" },
              { title: "Affirmative Action Programs" }
            ]
          }
        ]
      },
      {
        title: "Social Services",
        children: [
          { title: "Child Care Services" },
          {
            title: "Elderly Care Programs",
            children: [
              { title: "Long-term Care Policies" },
              { title: "Home Care Assistance" }
            ]
          }
        ]
      }
    ]
  },
  { title: "Science and Technology", children: [] },
  {
    title: "Finance",
    children: [
      { title: "Taxation", children: [] },
      { title: "Monetary", children: [] },
    ]
  },
  { title: "Religion", children: [] },
  { title: "Sports and Leisure", children: [] },
]