/**
 * Entity relationships data
 * Defines hierarchical relationships between political entities
 */

export const entityRelationships = [
  // Italy - Milan hierarchy
  { entity: "Zona 1", related: "Comune di Milano", type: "parent city" },
  { entity: "Zona 1", related: "Regione Lombardia", type: "parent region" },
  { entity: "Zona 1", related: "Repubblica Italiana", type: "parent country" },
  { entity: "Comune di Milano", related: "Regione Lombardia", type: "parent region" },
  { entity: "Comune di Milano", related: "Repubblica Italiana", type: "parent country" },
  { entity: "Regione Lombardia", related: "Repubblica Italiana", type: "parent country" },

  // Germany - Berlin hierarchy
  { entity: "Bezirk Britz", related: "Bezirk Neukölln", type: "parent district" },
  { entity: "Bezirk Britz", related: "Stadt Berlin", type: "parent city" },
  { entity: "Bezirk Britz", related: "Bundesrepublik Deutschland", type: "parent country" },
  { entity: "Bezirk Neukölln", related: "Stadt Berlin", type: "parent city" },
  { entity: "Bezirk Neukölln", related: "Bundesrepublik Deutschland", type: "parent country" },
  { entity: "Stadt Berlin", related: "Bundesrepublik Deutschland", type: "parent country" },

  // Spain - Barcelona hierarchy
  { entity: "Eixample", related: "Ajuntament de Barcelona", type: "parent city" },
  { entity: "Eixample", related: "Reino de España", type: "parent country" },
  { entity: "Ajuntament de Barcelona", related: "Reino de España", type: "parent country" },

  // France - Paris hierarchy
  { entity: "1er arrondissement", related: "Centre de Paris", type: "parent district" },
  { entity: "1er arrondissement", related: "Ville de Paris", type: "parent city" },
  { entity: "1er arrondissement", related: "République française", type: "parent country" },
  { entity: "Centre de Paris", related: "Ville de Paris", type: "parent city" },
  { entity: "Centre de Paris", related: "République française", type: "parent country" },
  { entity: "Ville de Paris", related: "République française", type: "parent country" },

  // Austria - Vienna hierarchy
  { entity: "Leopoldstadt", related: "Stadt Wien", type: "parent city" },
  { entity: "Leopoldstadt", related: "Republik Österreich", type: "parent country" },
  { entity: "Stadt Wien", related: "Republik Österreich", type: "parent country" },

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