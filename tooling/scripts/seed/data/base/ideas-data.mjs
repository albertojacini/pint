/**
 * Policy ideas - BASE dataset
 * Two ideas demonstrating the concept
 */

export const ideas = [
  {
    title: "Urban speed limits",
    description: "Lower maximum speed limits in urban areas (residential, commercial, school zones)",
    category: "Traffic Management"
  },
  {
    title: "Urban congestion charge",
    description: "Fee for vehicles to enter designated urban zones during peak hours to reduce traffic congestion",
    category: "Traffic Management",
    effectsDiagram: {
      stakeholderGroups: [
        {
          stakeholderGroupName: 'private_drivers',
          subtitle: 'Daily commuters',
          effects: [
            {
              title: 'Increased commuting costs',
              description: 'Daily fee to enter the congestion zone',
              sentiment: 'negative',
              severity: 4
            },
            {
              title: 'Faster commute times',
              description: 'Reduced traffic congestion means faster travel',
              sentiment: 'positive',
              severity: 3
            },
          ]
        },
        {
          stakeholderGroupName: 'public_transit_riders',
          subtitle: 'Daily riders',
          effects: [
            {
              title: 'Improved service quality',
              description: 'Revenue from charges funds better service',
              sentiment: 'positive',
              severity: 4
            },
          ]
        },
      ]
    }
  },
]
