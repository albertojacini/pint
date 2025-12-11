/**
 * Policy ideas data
 * Abstract policy concepts that can be implemented
 */

export const ideas = [
  {
    title: "Urban speed limits",
    description: "Lower maximum speed limits in urban areas (residential, commercial, school zones)",
    category: "Traffic Management" // category title, will be resolved to ID
  },
  {
    title: "Public transport subsidies",
    description: "Government funding to reduce or eliminate public transport fares for users",
    category: "Public Transportation" // category title, will be resolved to ID
  },
  {
    title: "Urban congestion charge",
    description: "Fee for vehicles to enter designated urban zones during peak hours to reduce traffic congestion, improve air quality, and generate revenue for public transport",
    category: "Traffic Management", // category title, will be resolved to ID
    effectsDiagram: {
      stakeholderGroups: [
        {
          // Will be resolved to UUID using stakeholder group name
          stakeholderGroupName: 'private_drivers',
          subtitle: '≈300,000 daily commuters',
          effects: [
            {
              title: 'Increased commuting costs',
              description: 'Daily fee of €5-15 to enter the congestion zone',
              sentiment: 'negative',
              severity: 4
            },
            {
              title: 'Faster commute times',
              description: 'Reduced traffic congestion means 15-30% faster travel',
              sentiment: 'positive',
              severity: 3
            },
            {
              title: 'Better air quality',
              description: 'Reduced vehicle emissions improve health outcomes',
              sentiment: 'positive',
              severity: 2
            }
          ]
        },
        {
          stakeholderGroupName: 'public_transit_riders',
          subtitle: '≈500,000 daily riders',
          effects: [
            {
              title: 'Improved service quality',
              description: 'Revenue from charges funds more frequent and reliable service',
              sentiment: 'positive',
              severity: 4
            },
            {
              title: 'Faster bus travel',
              description: 'Less traffic means buses move 20-40% faster',
              sentiment: 'positive',
              severity: 3
            }
          ]
        },
        {
          stakeholderGroupName: 'cyclists_pedestrians',
          subtitle: '≈150,000 daily active commuters',
          effects: [
            {
              title: 'Safer streets',
              description: 'Fewer cars reduce collision risk by up to 30%',
              sentiment: 'positive',
              severity: 4
            },
            {
              title: 'Cleaner air to breathe',
              description: 'Reduced vehicle emissions directly benefit active travelers',
              sentiment: 'positive',
              severity: 3
            }
          ]
        },
        {
          stakeholderGroupName: 'local_businesses',
          subtitle: 'Retail & service businesses in zone',
          effects: [
            {
              title: 'Reduced customer access',
              description: 'Customers may avoid area due to charge, impacting foot traffic',
              sentiment: 'negative',
              severity: 3
            },
            {
              title: 'Improved pedestrian environment',
              description: 'Less traffic makes streets more pleasant for shopping',
              sentiment: 'positive',
              severity: 2
            }
          ]
        },
        {
          stakeholderGroupName: 'delivery_logistics',
          subtitle: 'Freight & delivery operators',
          effects: [
            {
              title: 'Increased operational costs',
              description: 'Daily charges add significant expense to delivery operations',
              sentiment: 'negative',
              severity: 4
            },
            {
              title: 'Faster deliveries',
              description: 'Reduced congestion enables more deliveries per shift',
              sentiment: 'positive',
              severity: 2
            }
          ]
        },
        {
          stakeholderGroupName: 'urban_residents',
          subtitle: 'Residents living in charged zone',
          effects: [
            {
              title: 'Quieter neighborhoods',
              description: 'Less through-traffic reduces noise pollution significantly',
              sentiment: 'positive',
              severity: 4
            },
            {
              title: 'Cleaner air',
              description: 'Reduced emissions improve respiratory health, especially for children',
              sentiment: 'positive',
              severity: 5
            },
            {
              title: 'Guest access costs',
              description: 'Visitors and service providers may charge premium or avoid area',
              sentiment: 'negative',
              severity: 2
            }
          ]
        }
      ]
    }
  },
]