/**
 * Stakeholder Groups Data
 * Universal stakeholder types affected by policy ideas
 */

export const stakeholderGroups = [
  // Transportation & Mobility
  { name: 'private_drivers', title: 'Private Drivers & Commuters', category: 'transportation', icon: '🚗' },
  { name: 'public_transit_riders', title: 'Public Transit Riders', category: 'transportation', icon: '🚇' },
  { name: 'cyclists', title: 'Cyclists & Micromobility Users', category: 'transportation', icon: '🚴' },
  { name: 'pedestrians', title: 'Pedestrians', category: 'transportation', icon: '🚶' },
  { name: 'commercial_transport', title: 'Commercial & Freight Transport', category: 'transportation', icon: '🚚' },

  // Residential & Community
  { name: 'zone_residents', title: 'Zone/Area Residents', category: 'residential', icon: '🏘️' },
  { name: 'homeowners', title: 'Property Owners & Landlords', category: 'residential', icon: '🏠' },
  { name: 'tenants', title: 'Renters & Tenants', category: 'residential', icon: '🔑' },
  { name: 'elderly', title: 'Elderly & Seniors', category: 'residential', icon: '👴' },
  { name: 'youth', title: 'Children & Youth', category: 'residential', icon: '👦' },
  { name: 'disabled', title: 'People with Disabilities', category: 'residential', icon: '♿' },

  // Business & Economic
  { name: 'local_businesses', title: 'Local Businesses & Retail', category: 'business', icon: '🏪' },
  { name: 'commercial_businesses', title: 'Commercial Businesses', category: 'business', icon: '🏢' },
  { name: 'large_corporations', title: 'Large Corporations', category: 'business', icon: '🏭' },
  { name: 'startups', title: 'Startups & Entrepreneurs', category: 'business', icon: '🚀' },
  { name: 'tourism_hospitality', title: 'Tourism & Hospitality', category: 'business', icon: '🏨' },

  // Employment & Labor
  { name: 'employees', title: 'Employees & Workers', category: 'employment', icon: '👷' },
  { name: 'unemployed', title: 'Unemployed & Job Seekers', category: 'employment', icon: '🔍' },
  { name: 'gig_workers', title: 'Gig & Platform Workers', category: 'employment', icon: '📱' },

  // Environment & Society
  { name: 'environment', title: 'Environment & Natural Resources', category: 'environment', icon: '🌳' },
  { name: 'general_public', title: 'General Public & Society', category: 'environment', icon: '👥' },
  { name: 'future_generations', title: 'Future Generations', category: 'environment', icon: '🌍' },

  // Government & Public Sector
  { name: 'local_government', title: 'Local Government', category: 'government', icon: '🏛️' },
  { name: 'taxpayers', title: 'Taxpayers', category: 'government', icon: '💰' },
  { name: 'public_services', title: 'Public Service Workers', category: 'government', icon: '👮' },

  // Vulnerable Groups
  { name: 'low_income', title: 'Low-Income Households', category: 'vulnerable', icon: '💵' },
  { name: 'marginalized', title: 'Marginalized Communities', category: 'vulnerable', icon: '🤝' },
  { name: 'immigrants', title: 'Immigrants & Refugees', category: 'vulnerable', icon: '🌐' },
]
