/**
 * Events data
 * Historical and recent events for Comune di Milano
 */

export const events = [
  // ========================================
  // AREA C CONGESTION CHARGE HISTORY
  // ========================================

  {
    administration: "Milan City Council 2011-2016",
    title: "Area C Congestion Charge Approved",
    description: "City council votes to implement a congestion charge zone in Milan's historic center (Cerchia dei Bastioni), replacing the previous Ecopass system",
    descriptionShort: "Council approves Area C",
    type: "legislative_session"
  },
  {
    administration: "Milan City Council 2011-2016",
    title: "Area C Goes Live",
    description: "Area C congestion charge begins operation covering the historic Cerchia dei Bastioni area. Initial fee set at €5 per day for non-exempt vehicles. Cameras installed at 43 entry points",
    descriptionShort: "Area C launches",
    type: "regulation_update"
  },
  {
    administration: "Milan City Council 2011-2016",
    title: "Area C Referendum",
    description: "Milan citizens vote in a consultative referendum confirming support for Area C congestion charge with 79.1% voting in favor",
    descriptionShort: "Referendum confirms Area C",
    type: "referendum"
  },
  {
    administration: "Milan City Council 2016-2021",
    title: "Area C Diesel Restrictions Tightened",
    description: "Entry ban extended to Euro 3 diesel vehicles without DPF filter. Euro 4 diesel vehicles face increased fees",
    descriptionShort: "Diesel restrictions tightened",
    type: "regulation_update"
  },
  {
    administration: "Milan City Council 2016-2021",
    title: "Area C Fee Increase",
    description: "Daily access fee increased from €5 to €7.50 for non-exempt vehicles. Resident exemptions reduced from 40 to 25 free entries per year",
    descriptionShort: "Fee raised to €7.50",
    type: "tax_change"
  },
  {
    administration: "Milan City Council 2021-2026",
    title: "Area C Post-COVID Reactivation",
    description: "Area C enforcement resumes after COVID-19 suspension with updated hygiene guidelines for public transport",
    descriptionShort: "Area C resumes post-COVID",
    type: "regulation_update"
  },
  {
    administration: "Milan City Council 2021-2026",
    title: "Area C Electric Vehicle Policy Update",
    description: "Extended exemptions for fully electric vehicles confirmed through 2030. Plug-in hybrids lose exemption status",
    descriptionShort: "EV exemptions extended",
    type: "regulation_update"
  },

  // ========================================
  // ATM PUBLIC TRANSPORT EVENTS
  // ========================================

  {
    administration: "Milan City Council 2006-2011",
    title: "ATM Metro Line 5 Approved",
    description: "City council approves construction of Metro Line 5 (lilac line), Milan's first driverless metro line",
    descriptionShort: "M5 construction approved",
    type: "plan_adoption"
  },
  {
    administration: "Milan City Council 2011-2016",
    title: "Metro Line 5 Opening",
    description: "First section of fully automated Metro Line 5 opens from Bignami to Zara, marking Italy's first driverless metro",
    descriptionShort: "M5 opens to public",
    type: "service_change"
  },
  {
    administration: "Milan City Council 2016-2021",
    title: "ATM Fare Structure Update",
    description: "New integrated fare system introduced with urban and suburban zones. Single urban ticket increased to €2.00",
    descriptionShort: "New fare structure",
    type: "tax_change"
  },
  {
    administration: "Milan City Council 2021-2026",
    title: "ATM Fare Update 2024",
    description: "Metro and bus fares updated for 2024 fiscal year. Single urban ticket now €2.20",
    descriptionShort: "2024 fare update",
    type: "tax_change"
  },
  {
    administration: "Milan City Council 2021-2026",
    title: "Metro Line 4 Full Opening",
    description: "Metro Line 4 (blue line) completes full route from San Cristoforo to Linate Airport",
    descriptionShort: "M4 fully operational",
    type: "service_change"
  },

  // ========================================
  // DEHORS REGULATIONS
  // ========================================

  {
    administration: "Milan City Council 2021-2026",
    title: "Dehors Temporary COVID Rules Extended",
    description: "Extended COVID-era regulations allowing expanded outdoor seating for restaurants and bars through 2024",
    descriptionShort: "Dehors rules extended",
    type: "regulation_update"
  },
  {
    administration: "Milan City Council 2021-2026",
    title: "New Permanent Dehors Regulation",
    description: "City council adopts new permanent regulation for outdoor seating, establishing design standards and fees post-COVID",
    descriptionShort: "Permanent dehors rules",
    type: "legislative_session"
  },

  // ========================================
  // RECENT EVENTS (for activity chart demo)
  // ========================================

  {
    administration: "Milan City Council 2021-2026",
    title: "Area C Enforcement Hours Extended",
    description: "Enforcement hours extended to include Saturday mornings (7:30-14:00) in addition to weekdays",
    descriptionShort: "Saturday enforcement added",
    type: "regulation_update"
  },
  {
    administration: "Milan City Council 2021-2026",
    title: "ATM Night Service Expansion",
    description: "Night bus routes expanded with increased frequency on weekends",
    descriptionShort: "Night buses expanded",
    type: "service_change"
  },
  {
    administration: "Milan City Council 2021-2026",
    title: "Area C 2025 Rate Adjustment",
    description: "Annual rate review confirms current €7.50 fee for 2025, adds new category for low-emission hybrids",
    descriptionShort: "2025 rates confirmed",
    type: "tax_change"
  }
]
