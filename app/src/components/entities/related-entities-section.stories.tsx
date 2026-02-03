import type { Meta, StoryObj } from '@storybook/react'
import { RelatedEntitiesSection } from './related-entities-section'

const meta = {
  title: 'Entities/RelatedEntitiesSection',
  component: RelatedEntitiesSection,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof RelatedEntitiesSection>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    relationships: {
      'parent country': [
        { id: 'ent_italy_001', slug: 'italy', name: 'Italy', type: 'country', avatarUrl: null, relationshipType: 'parent country', direction: 'outgoing' },
      ],
      'parent region': [
        { id: 'ent_lombardy_001', slug: 'lombardy', name: 'Lombardia', type: 'region', avatarUrl: null, relationshipType: 'parent region', direction: 'outgoing' },
      ],
      'contains': [
        { id: 'ent_brera_001', slug: 'brera', name: 'Brera', type: 'district', avatarUrl: null, relationshipType: 'contains', direction: 'incoming' },
        { id: 'ent_navigli_001', slug: 'navigli', name: 'Navigli', type: 'district', avatarUrl: null, relationshipType: 'contains', direction: 'incoming' },
        { id: 'ent_centro_001', slug: 'centro-storico', name: 'Centro Storico', type: 'district', avatarUrl: null, relationshipType: 'contains', direction: 'incoming' },
      ],
    },
  },
}

export const CountryOnly: Story = {
  args: {
    relationships: {
      'parent country': [
        { id: 'ent_italy_001', slug: 'italy', name: 'Italy', type: 'country', avatarUrl: null, relationshipType: 'parent country', direction: 'outgoing' },
      ],
    },
  },
}

export const ManyRelationships: Story = {
  args: {
    relationships: {
      'parent country': [
        { id: 'ent_italy_001', slug: 'italy', name: 'Italy', type: 'country', avatarUrl: null, relationshipType: 'parent country', direction: 'outgoing' },
      ],
      'parent region': [
        { id: 'ent_lazio_001', slug: 'lazio', name: 'Lazio', type: 'region', avatarUrl: null, relationshipType: 'parent region', direction: 'outgoing' },
      ],
      'sister city': [
        { id: 'ent_paris_001', slug: 'paris', name: 'Paris', type: 'city', avatarUrl: null, relationshipType: 'sister city', direction: 'outgoing' },
        { id: 'ent_nyc_001', slug: 'new-york', name: 'New York', type: 'city', avatarUrl: null, relationshipType: 'sister city', direction: 'outgoing' },
        { id: 'ent_tokyo_001', slug: 'tokyo', name: 'Tokyo', type: 'city', avatarUrl: null, relationshipType: 'sister city', direction: 'outgoing' },
      ],
      'partner': [
        { id: 'ent_milan_001', slug: 'milan', name: 'Milan', type: 'city', avatarUrl: null, relationshipType: 'partner', direction: 'outgoing' },
        { id: 'ent_naples_001', slug: 'naples', name: 'Naples', type: 'city', avatarUrl: null, relationshipType: 'partner', direction: 'outgoing' },
      ],
      'member of': [
        { id: 'ent_eu_001', slug: 'european-union', name: 'European Union', type: 'organization', avatarUrl: null, relationshipType: 'member of', direction: 'outgoing' },
        { id: 'ent_euro_001', slug: 'eurozone', name: 'Eurozone', type: 'organization', avatarUrl: null, relationshipType: 'member of', direction: 'outgoing' },
      ],
    },
  },
}

export const DistrictsOnly: Story = {
  args: {
    relationships: {
      'contains': [
        { id: 'ent_d1', slug: 'district-1', name: 'District 1', type: 'district', avatarUrl: null, relationshipType: 'contains', direction: 'incoming' },
        { id: 'ent_d2', slug: 'district-2', name: 'District 2', type: 'district', avatarUrl: null, relationshipType: 'contains', direction: 'incoming' },
        { id: 'ent_d3', slug: 'district-3', name: 'District 3', type: 'district', avatarUrl: null, relationshipType: 'contains', direction: 'incoming' },
        { id: 'ent_d4', slug: 'district-4', name: 'District 4', type: 'district', avatarUrl: null, relationshipType: 'contains', direction: 'incoming' },
        { id: 'ent_d5', slug: 'district-5', name: 'District 5', type: 'district', avatarUrl: null, relationshipType: 'contains', direction: 'incoming' },
      ],
    },
  },
}

export const Empty: Story = {
  args: {
    relationships: {},
  },
}
