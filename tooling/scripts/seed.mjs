#!/usr/bin/env node

import 'dotenv/config'
import pg from 'pg'
import { createClient } from '@supabase/supabase-js'

const { Client } = pg

// Set default DATABASE_URL if not present
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:54322/postgres'

// Get user credentials from environment
const ADMIN_USER_FULL_NAME = process.env.ADMIN_USER_FULL_NAME
const ADMIN_USER_EMAIL = process.env.ADMIN_USER_EMAIL
const ADMIN_USER_PASSWORD = process.env.ADMIN_USER_PASSWORD

// Supabase config
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🌱 Starting database seeding...')

const client = new Client({ connectionString: DATABASE_URL })
const supabase = SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

try {
  await client.connect()
  console.log('✅ Connected to database')

  // Create admin user if credentials are provided
  if (ADMIN_USER_EMAIL && ADMIN_USER_PASSWORD && supabase) {
    console.log('👤 Creating admin user...')

    // Check if user already exists
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers()
    const userExists = existingUsers?.users?.some(u => u.email === ADMIN_USER_EMAIL)

    if (!userExists) {
      const { data, error } = await supabase.auth.admin.createUser({
        email: ADMIN_USER_EMAIL,
        password: ADMIN_USER_PASSWORD,
        email_confirm: true,
        user_metadata: {
          full_name: ADMIN_USER_FULL_NAME || null
        }
      })

      if (error) {
        console.error('❌ Error creating admin user:', error.message)
      } else {
        console.log(`✅ Admin user created: ${ADMIN_USER_EMAIL}`)
      }
    } else {
      console.log('⚠️  Admin user already exists')
    }
  } else {
    if (!ADMIN_USER_EMAIL || !ADMIN_USER_PASSWORD) {
      console.log('ℹ️  Skipping admin user creation (credentials not provided)')
    } else if (!supabase) {
      console.log('ℹ️  Skipping admin user creation (SUPABASE_SERVICE_ROLE_KEY not provided)')
    }
  }

  // Check if data already exists
  const existingCategories = await client.query('SELECT COUNT(*) FROM categories')
  if (parseInt(existingCategories.rows[0].count) > 0) {
    console.log('⚠️  Categories already exist. Skipping seed.')
    process.exit(0)
  }

  // Policy categories tree (converted from Python)
  const policyCategoriesTree = [
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

  // Flatten categories tree into insertable records
  const categories = []
  let orderIndex = 0

  function flattenCategories(category, parentId = null, path = []) {
    const currentPath = [...path, category.title]
    const id = crypto.randomUUID()

    // Only insert if it's a leaf node (no children or empty children array)
    const hasChildren = category.children && category.children.length > 0

    if (!hasChildren && category.children !== undefined && category.children.length === 0) {
      // Skip nodes with empty children array
      return
    }

    if (!hasChildren || category.children === undefined) {
      // Leaf node - insert it
      categories.push({
        id,
        parent_id: parentId,
        title: category.title,
        description: null,
        order_index: orderIndex++,
        only_entities_with_types: category.only_entities_with_types || null
      })
    } else {
      // Container node - insert it and recurse
      categories.push({
        id,
        parent_id: parentId,
        title: category.title,
        description: null,
        order_index: orderIndex++,
        only_entities_with_types: category.only_entities_with_types || null
      })

      for (const child of category.children) {
        flattenCategories(child, id, currentPath)
      }
    }
  }

  for (const category of policyCategoriesTree) {
    flattenCategories(category)
  }

  console.log(`📊 Inserting ${categories.length} categories...`)

  // Insert categories
  for (const category of categories) {
    await client.query(
      `INSERT INTO categories (id, parent_id, title, description, order_index, only_entities_with_types)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        category.id,
        category.parent_id,
        category.title,
        category.description,
        category.order_index,
        category.only_entities_with_types
      ]
    )
  }

  console.log('✅ Categories inserted')

  // Political entities
  const politicalEntities = [
    { name: "Zone 1", description: "The first district of Milan", avatar_url: "https://example.com/avatar.jpg", type: "district", native_name: "Zona 1", population: 100000, score_innovation: 8, score_sustainability: 7, score_impact: 9 },
    { name: "City of Milan", description: "The city council of Milan", avatar_url: "https://example.com/avatar.jpg", type: "city", native_name: "Comune di Milano", population: 1500000, score_innovation: 9, score_sustainability: 8, score_impact: 9 },
    { name: "Lombardy", description: "The regional government of Lombardy", avatar_url: "https://example.com/avatar.jpg", type: "region", native_name: "Regione Lombardia", population: 10000000, score_innovation: 7, score_sustainability: 6, score_impact: 8 },
    { name: "Republic of Italy", description: "The Italian Republic", avatar_url: "https://example.com/avatar.jpg", type: "country", native_name: "Repubblica Italiana", population: 60000000, score_innovation: 6, score_sustainability: 5, score_impact: 7 },
    { name: "European Union", description: "The European Union", avatar_url: "https://example.com/avatar.jpg", type: "supranational", population: 450000000, score_innovation: 8, score_sustainability: 7, score_impact: 9 },
    { name: "United Nations", description: "The United Nations", avatar_url: "https://example.com/avatar.jpg", type: "supranational", score_innovation: 7, score_sustainability: 6, score_impact: 8 },
    { name: "Britz", description: "The 6th district of Berlin", avatar_url: "https://example.com/avatar.jpg", type: "neighborhood", native_name: "Bezirk Britz" },
    { name: "Neukölln", description: "The 7th district of Berlin", avatar_url: "https://example.com/avatar.jpg", type: "district", native_name: "Bezirk Neukölln", population: 300000, score_innovation: 7, score_sustainability: 6, score_impact: 8 },
    { name: "City of Berlin", description: "The city council of Berlin", avatar_url: "https://example.com/avatar.jpg", type: "city", native_name: "Stadt Berlin", population: 4000000, score_innovation: 8, score_sustainability: 7, score_impact: 9 },
    { name: "Federal Republic of Germany", description: "The federal government of Germany", avatar_url: "https://example.com/avatar.jpg", type: "country", native_name: "Bundesrepublik Deutschland", population: 80000000, score_innovation: 8, score_sustainability: 7, score_impact: 9 },
    { name: "Eixample", description: "The 2nd district of Barcelona", avatar_url: "https://example.com/avatar.jpg", type: "neighborhood", native_name: "Eixample" },
    { name: "City of Barcelona", description: "The city council of Barcelona", avatar_url: "https://example.com/avatar.jpg", type: "city", native_name: "Ajuntament de Barcelona", population: 2000000, score_innovation: 9, score_sustainability: 8, score_impact: 9 },
    { name: "Kingdom of Spain", description: "The federal government of Spain", avatar_url: "https://example.com/avatar.jpg", type: "country", native_name: "Reino de España", population: 47000000, score_innovation: 7, score_sustainability: 6, score_impact: 8 },
    { name: "1st arrondissement", description: "The 1st district of Paris", avatar_url: "https://example.com/avatar.jpg", type: "neighborhood", native_name: "1er arrondissement" },
    { name: "Paris Centre", description: "The central district of Paris", avatar_url: "https://example.com/avatar.jpg", type: "district", native_name: "Centre de Paris", population: 100000, score_innovation: 7, score_sustainability: 6, score_impact: 8 },
    { name: "City of Paris", description: "The city council of Paris", avatar_url: "https://example.com/avatar.jpg", type: "city", native_name: "Ville de Paris", population: 2200000, score_innovation: 9, score_sustainability: 8, score_impact: 9 },
    { name: "French Republic", description: "The federal government of France", avatar_url: "https://example.com/avatar.jpg", type: "country", native_name: "République française", population: 67000000, score_innovation: 8, score_sustainability: 7, score_impact: 9 },
    { name: "Leopoldstadt", description: "The 2nd district of Vienna", avatar_url: "https://example.com/avatar.jpg", type: "neighborhood", native_name: "Leopoldstadt" },
    { name: "City of Vienna", description: "The city council of Vienna", avatar_url: "https://example.com/avatar.jpg", type: "city", native_name: "Stadt Wien", population: 1900000, score_innovation: 9, score_sustainability: 8, score_impact: 9 },
    { name: "Republic of Austria", description: "The federal government of Austria", avatar_url: "https://example.com/avatar.jpg", type: "country", native_name: "Republik Österreich", population: 9000000, score_innovation: 8, score_sustainability: 7, score_impact: 9 },
    { name: "London Borough of Hackney", description: "The local government of Hackney", avatar_url: "https://example.com/avatar.jpg", type: "borough", native_name: "London Borough of Hackney" },
    { name: "City of London", description: "The city council of London", avatar_url: "https://example.com/avatar.jpg", type: "city", native_name: "City of London", population: 9000000, score_innovation: 9, score_sustainability: 8, score_impact: 9 },
    { name: "United Kingdom", description: "The federal government of the United Kingdom", avatar_url: "https://example.com/avatar.jpg", type: "country", native_name: "United Kingdom", population: 66000000, score_innovation: 8, score_sustainability: 7, score_impact: 9 },
    { name: "Bedford–Stuyvesant", description: "The neighborhood of Brooklyn", avatar_url: "https://example.com/avatar.jpg", type: "neighborhood", native_name: "Bedford–Stuyvesant" },
    { name: "Brooklyn", description: "The borough of Brooklyn", avatar_url: "https://example.com/avatar.jpg", type: "district", native_name: "Brooklyn", population: 2600000, score_innovation: 9, score_sustainability: 8, score_impact: 9 },
    { name: "City of New York", description: "The city council of New York", avatar_url: "https://example.com/avatar.jpg", type: "city", native_name: "City of New York", population: 8500000, score_innovation: 9, score_sustainability: 8, score_impact: 9 },
    { name: "State of New York", description: "The state government of New York", avatar_url: "https://example.com/avatar.jpg", type: "region", native_name: "State of New York", population: 20000000, score_innovation: 8, score_sustainability: 7, score_impact: 9 },
    { name: "United States of America", description: "The federal government of the United States", avatar_url: "https://example.com/avatar.jpg", type: "country", native_name: "United States of America", population: 330000000, score_innovation: 8, score_sustainability: 7, score_impact: 9 }
  ]

  // Create a map for entity name to id lookup
  const entityIdMap = {}

  console.log(`🌍 Inserting ${politicalEntities.length} political entities...`)

  for (const entity of politicalEntities) {
    const id = crypto.randomUUID()
    entityIdMap[entity.name] = id

    await client.query(
      `INSERT INTO political_entities (id, name, native_name, description, avatar_url, type, population, score_innovation, score_sustainability, score_impact)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        id,
        entity.name,
        entity.native_name || null,
        entity.description,
        entity.avatar_url || null,
        entity.type,
        entity.population || null,
        entity.score_innovation || null,
        entity.score_sustainability || null,
        entity.score_impact || null
      ]
    )
  }

  console.log('✅ Political entities inserted')

  // Entity relationships
  const relationships = [
    { entity: "Zone 1", related: "City of Milan", type: "parent city" },
    { entity: "Zone 1", related: "Lombardy", type: "parent region" },
    { entity: "Zone 1", related: "Republic of Italy", type: "parent country" },
    { entity: "City of Milan", related: "Lombardy", type: "parent region" },
    { entity: "City of Milan", related: "Republic of Italy", type: "parent country" },
    { entity: "Lombardy", related: "Republic of Italy", type: "parent country" },
    { entity: "Britz", related: "Neukölln", type: "parent district" },
    { entity: "Britz", related: "City of Berlin", type: "parent city" },
    { entity: "Britz", related: "Federal Republic of Germany", type: "parent country" },
    { entity: "Neukölln", related: "City of Berlin", type: "parent city" },
    { entity: "Neukölln", related: "Federal Republic of Germany", type: "parent country" },
    { entity: "City of Berlin", related: "Federal Republic of Germany", type: "parent country" },
    { entity: "Eixample", related: "City of Barcelona", type: "parent city" },
    { entity: "Eixample", related: "Kingdom of Spain", type: "parent country" },
    { entity: "City of Barcelona", related: "Kingdom of Spain", type: "parent country" },
    { entity: "1st arrondissement", related: "Paris Centre", type: "parent district" },
    { entity: "1st arrondissement", related: "City of Paris", type: "parent city" },
    { entity: "1st arrondissement", related: "French Republic", type: "parent country" },
    { entity: "Paris Centre", related: "City of Paris", type: "parent city" },
    { entity: "Paris Centre", related: "French Republic", type: "parent country" },
    { entity: "City of Paris", related: "French Republic", type: "parent country" },
    { entity: "Leopoldstadt", related: "City of Vienna", type: "parent city" },
    { entity: "Leopoldstadt", related: "Republic of Austria", type: "parent country" },
    { entity: "City of Vienna", related: "Republic of Austria", type: "parent country" },
    { entity: "London Borough of Hackney", related: "City of London", type: "parent city" },
    { entity: "London Borough of Hackney", related: "United Kingdom", type: "parent country" },
    { entity: "City of London", related: "United Kingdom", type: "parent country" },
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

  console.log(`🔗 Inserting ${relationships.length} entity relationships...`)

  for (const rel of relationships) {
    await client.query(
      `INSERT INTO entity_relationships (id, entity_id, related_entity_id, relationship_type)
       VALUES ($1, $2, $3, $4)`,
      [
        crypto.randomUUID(),
        entityIdMap[rel.entity],
        entityIdMap[rel.related],
        rel.type
      ]
    )
  }

  console.log('✅ Entity relationships inserted')

  // Policy tags
  const policyTags = {
    "country": [],
    "maturity": ["experimental", "controversial", "innovative", "established"],
    "successfulness": ["successful", "unsuccessful", "partially successful", "pending", "unknown"],
    "topic": ["speed limits", "public transportation", "road safety", "education reform", "environmental protection", "healthcare", "housing development", "employment", "tax reform", "technology innovation", "transportation", "health", "education", "housing", "economy", "environment", "energy", "justice", "social welfare"],
    "affected population": ["children", "elderly", "low-income families", "small businesses", "immigrants", "students", "unemployed"],
    "type": ["regulation", "subsidy", "infrastructure development", "tax incentive", "public awareness campaign", "penalty"],
    "timeframe": ["short-term", "long-term", "immediate", "5-year plan", "pilot program"],
    "government level": ["local", "regional", "national", "international"],
    "risks": ["poor implementation", "unintended consequences", "political opposition", "budget constraints", "public backlash", "Enforce regulations"],
    "conflicts of interest": ["Win elections", "Reward lobbyists", "Secure funding", "Advance career", "Promote ideology", "Implement policy", "Protect interests", "Serve constituents", "Build alliances"],
    "externalities": ["positive externalities", "negative externalities"]
  }

  console.log(`🏷️  Inserting policy tags...`)

  const tagIdMap = {}

  for (const [tagName, values] of Object.entries(policyTags)) {
    const tagId = crypto.randomUUID()
    tagIdMap[tagName] = tagId

    await client.query(
      `INSERT INTO policy_tags (id, name, description) VALUES ($1, $2, $3)`,
      [tagId, tagName, null]
    )

    for (const value of values) {
      await client.query(
        `INSERT INTO tag_values (id, tag_id, value, description) VALUES ($1, $2, $3, $4)`,
        [crypto.randomUUID(), tagId, value, null]
      )
    }
  }

  console.log('✅ Policy tags and values inserted')

  // Goals
  const goals = [
    "Food Security",
    "Access to Clean Water",
    "Affordable Housing",
    "Universal Healthcare Access",
    "Poverty Alleviation",
    "Public Safety and Law Enforcement",
    "Job Security and Fair Labor Standards",
    "Disaster Preparedness and Response",
    "Cybersecurity and Data Protection",
    "National Defense and Public Order",
    "International Peace and Cooperation",
    "Family and Social Relationship Support",
    "Community Engagement",
    "Social Inclusion and Anti-discrimination",
    "Mental Health and Social Services",
    "Equal Access to Education",
    "Professional Development Opportunities",
    "Recognition of Achievements",
    "Workplace Equity and Inclusivity",
    "Creativity and Innovation Support",
    "Cultural and Artistic Expression",
    "Lifelong Learning Opportunities",
    "Entrepreneurial Support and Innovation",
    "Freedom of Expression and Civil Rights",
    "Reduction of Inequality",
    "Sustainability and Environmental Protection",
    "Technology Access and Digital Literacy",
    "Political Participation and Civic Engagement",
    "International Cooperation and Diplomacy",
  ]

  console.log(`🎯 Inserting ${goals.length} goals...`)

  for (const goal of goals) {
    await client.query(
      `INSERT INTO goals (id, title, description, maslow_level) VALUES ($1, $2, $3, $4)`,
      [crypto.randomUUID(), goal, null, null]
    )
  }

  console.log('✅ Goals inserted')

  // Metrics (sample - "Traffic" category)
  const trafficCategoryId = categories.find(c => c.title === "Traffic")?.id

  if (trafficCategoryId) {
    const trafficMetrics = [
      "Land use fairness",
      "Traffic congestion",
      "Number of accidents",
      "Air pollution",
      "Noise pollution",
      "Road rules complexity",
      "Road safety infrastructure"
    ]

    console.log(`📊 Inserting ${trafficMetrics.length} metrics...`)

    for (const metric of trafficMetrics) {
      await client.query(
        `INSERT INTO metrics (id, category_id, title, description, unit) VALUES ($1, $2, $3, $4, $5)`,
        [crypto.randomUUID(), trafficCategoryId, metric, null, null]
      )
    }

    console.log('✅ Metrics inserted')
  }

  console.log('🎉 Database seeding completed successfully!')

} catch (error) {
  console.error('❌ Seeding failed:', error)
  process.exit(1)
} finally {
  await client.end()
}
