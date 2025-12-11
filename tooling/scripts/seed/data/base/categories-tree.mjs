/**
 * Policy categories tree - BASE dataset
 * Minimal hierarchy demonstrating structure
 */

export const categoriesTree = [
  { title: "Culture and Arts", children: [] },
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
            ]
          },
        ]
      },
    ]
  },
  { title: "Environment", children: [] },
  { title: "Finance", children: [] },
]
