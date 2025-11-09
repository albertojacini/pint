'use server'

import { db } from '@/lib/db/client'
import {
  ideas,
  effects,
  measurables,
  contributions,
  goals,
  provisions,
  politicalEntities,
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
      provisionsCount: sql<number>`count(distinct ${provisions.id})`,
    })
    .from(ideas)
    .leftJoin(categories, eq(ideas.categoryId, categories.id))
    .leftJoin(effects, eq(ideas.id, effects.ideaId))
    .leftJoin(provisions, eq(ideas.id, provisions.ideaId))
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
      title: effects.title,
      description: effects.description,
      mechanism: effects.mechanism,
      measurableId: measurables.id,
      measurableTitle: measurables.title,
      measurableDescription: measurables.description,
      measurableUnit: measurables.unit,
    })
    .from(effects)
    .innerJoin(measurables, eq(effects.measurableId, measurables.id))
    .where(eq(effects.ideaId, id))

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

  // Get provisions inspired by this idea
  const ideaProvisions = await db
    .select({
      provisionId: provisions.id,
      provisionTitle: provisions.title,
      provisionDescription: provisions.description,
      type: provisions.type,
      status: provisions.status,
      effectiveFrom: provisions.effectiveFrom,
      effectiveUntil: provisions.effectiveUntil,
      entityId: politicalEntities.id,
      entityName: politicalEntities.name,
      entityType: politicalEntities.type,
    })
    .from(provisions)
    .innerJoin(politicalEntities, eq(provisions.entityId, politicalEntities.id))
    .where(eq(provisions.ideaId, id))
    .orderBy(provisions.status, provisions.effectiveFrom)

  return {
    idea,
    effects: ideaEffects,
    goalContributions,
    provisions: ideaProvisions,
  }
}
