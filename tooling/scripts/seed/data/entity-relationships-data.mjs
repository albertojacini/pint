/**
 * Entity relationships data
 * Defines hierarchical relationships between political entities
 */

export const entityRelationships = [
  // Italy - Milan hierarchy
  { entity: "Zone 1", related: "City of Milan", type: "parent city" },
  { entity: "Zone 1", related: "Lombardy", type: "parent region" },
  { entity: "Zone 1", related: "Republic of Italy", type: "parent country" },
  { entity: "City of Milan", related: "Lombardy", type: "parent region" },
  { entity: "City of Milan", related: "Republic of Italy", type: "parent country" },
  { entity: "Lombardy", related: "Republic of Italy", type: "parent country" },

  // Germany - Berlin hierarchy
  { entity: "Britz", related: "Neukölln", type: "parent district" },
  { entity: "Britz", related: "City of Berlin", type: "parent city" },
  { entity: "Britz", related: "Federal Republic of Germany", type: "parent country" },
  { entity: "Neukölln", related: "City of Berlin", type: "parent city" },
  { entity: "Neukölln", related: "Federal Republic of Germany", type: "parent country" },
  { entity: "City of Berlin", related: "Federal Republic of Germany", type: "parent country" },

  // Spain - Barcelona hierarchy
  { entity: "Eixample", related: "City of Barcelona", type: "parent city" },
  { entity: "Eixample", related: "Kingdom of Spain", type: "parent country" },
  { entity: "City of Barcelona", related: "Kingdom of Spain", type: "parent country" },

  // France - Paris hierarchy
  { entity: "1st arrondissement", related: "Paris Centre", type: "parent district" },
  { entity: "1st arrondissement", related: "City of Paris", type: "parent city" },
  { entity: "1st arrondissement", related: "French Republic", type: "parent country" },
  { entity: "Paris Centre", related: "City of Paris", type: "parent city" },
  { entity: "Paris Centre", related: "French Republic", type: "parent country" },
  { entity: "City of Paris", related: "French Republic", type: "parent country" },

  // Austria - Vienna hierarchy
  { entity: "Leopoldstadt", related: "City of Vienna", type: "parent city" },
  { entity: "Leopoldstadt", related: "Republic of Austria", type: "parent country" },
  { entity: "City of Vienna", related: "Republic of Austria", type: "parent country" },

  // UK - London hierarchy
  { entity: "London Borough of Hackney", related: "City of London", type: "parent city" },
  { entity: "London Borough of Hackney", related: "United Kingdom", type: "parent country" },
  { entity: "City of London", related: "United Kingdom", type: "parent country" },

  // USA - New York hierarchy
  { entity: "Bedford–Stuyvesant", related: "Brooklyn", type: "parent district" },
  { entity: "Bedford–Stuyvesant", related: "City of New York", type: "parent city" },
  { entity: "Bedford–Stuyvesant", related: "State of New York", type: "parent region" },
  { entity: "Bedford–Stuyvesant", related: "United States of America", type: "parent country" },
  { entity: "Brooklyn", related: "City of New York", type: "parent city" },
  { entity: "Brooklyn", related: "State of New York", type: "parent region" },
  { entity: "Brooklyn", related: "United States of America", type: "parent country" },
  { entity: "City of New York", related: "State of New York", type: "parent region" },
  { entity: "City of New York", related: "United States of America", type: "parent country" },
  { entity: "State of New York", related: "United States of America", type: "parent country" },
]