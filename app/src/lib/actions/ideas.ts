'use server'

import { db } from '@/lib/db/client'
import {
  ideas,
  effects,
  measurables,
  contributions,
  goals,
  policies,
  politicalEntities,
  administrations,
  categories
} from '@/lib/db/schema'
import { eq, sql, inArray } from 'drizzle-orm'

export async function getIdeas() {
  const ideasWithStats = await db
    .select({
      id: ideas.id,
      title: ideas.title,
      description: ideas.description,
      categoryId: ideas.categoryId,
      categoryTitle: categories.title,
      effectsCount: sql<number>`count(distinct ${effects.id})`,
      policiesCount: sql<number>`count(distinct ${policies.id})`,
    })
    .from(ideas)
    .leftJoin(categories, eq(ideas.categoryId, categories.id))
    .leftJoin(effects, eq(ideas.id, effects.ideaId))
    .leftJoin(policies, eq(ideas.id, policies.ideaId))
    .groupBy(ideas.id, categories.title)
    .orderBy(ideas.title)

  return ideasWithStats
}

export async function getIdea(id: string) {
  // Get the idea with category
  const [idea] = await db
    .select({
      id: ideas.id,
      title: ideas.title,
      description: ideas.description,
      categoryId: ideas.categoryId,
      categoryTitle: categories.title,
    })
    .from(ideas)
    .leftJoin(categories, eq(ideas.categoryId, categories.id))
    .where(eq(ideas.id, id))

  if (!idea) return null

  // Get effects with measurables
  const ideaEffects = await db
    .select({
      effectId: effects.id,
      direction: effects.direction,
      intensity: effects.intensity,
      confidence: effects.confidence,
      evidenceDescription: effects.evidenceDescription,
      measurableId: measurables.id,
      measurableTitle: measurables.title,
      measurableDescription: measurables.description,
      measurableUnit: measurables.unit,
    })
    .from(effects)
    .innerJoin(measurables, eq(effects.measurableId, measurables.id))
    .where(eq(effects.ideaId, id))
    .orderBy(effects.confidence, effects.intensity)

  // Get contributions to goals (through measurables)
  const measurableIds = ideaEffects.map(e => e.measurableId)

  const goalContributions = measurableIds.length > 0
    ? await db
        .select({
          measurableId: contributions.measurableId,
          goalId: goals.id,
          goalTitle: goals.title,
          goalDescription: goals.description,
          goalMaslowLevel: goals.maslowLevel,
          contributionType: contributions.contributionType,
          weight: contributions.weight,
          contributionDescription: contributions.description,
        })
        .from(contributions)
        .innerJoin(goals, eq(contributions.goalId, goals.id))
        .where(inArray(contributions.measurableId, measurableIds))
        .orderBy(contributions.weight)
    : []

  // Get policies implementing this idea
  const ideaPolicies = await db
    .select({
      policyId: policies.id,
      policyTitle: policies.title,
      policyDescription: policies.description,
      status: policies.status,
      startDate: policies.startDate,
      endDate: policies.endDate,
      budgetAllocated: policies.budgetAllocated,
      budgetCurrency: policies.budgetCurrency,
      entityId: politicalEntities.id,
      entityName: politicalEntities.name,
      entityType: politicalEntities.type,
      administrationName: administrations.name,
    })
    .from(policies)
    .innerJoin(politicalEntities, eq(policies.entityId, politicalEntities.id))
    .leftJoin(administrations, eq(policies.administrationId, administrations.id))
    .where(eq(policies.ideaId, id))
    .orderBy(policies.status, policies.startDate)

  return {
    idea,
    effects: ideaEffects,
    goalContributions,
    policies: ideaPolicies,
  }
}
