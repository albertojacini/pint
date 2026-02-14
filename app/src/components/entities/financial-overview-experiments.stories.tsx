'use client'

import type { Meta, StoryObj } from '@storybook/react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { TrendChart } from '@/components/custom-ui/trend-chart'

const meta: Meta = {
  title: 'Entities/FinancialOverviewExperiments',
  parameters: {
    layout: 'padded',
  },
}

export default meta

// Comune di Milano — bilancio data (in millions of EUR)
// 2023–2024: Consuntivo (actual). 2025: Previsione (forecast). 2016–2022: estimated/fake.
const data = [
  // Fake — estimated backwards from 2023 actuals (~2–4% growth, COVID dip 2020)
  {
    year: '2016',
    entrateTributarie: 1180,
    entrateExtraTributarie: 1020,
    trasferimentiCorrenti: 360,
    entrateContoCapitale: 380,
    altreEntrate: 520,
    speseCorrenti: 2280,
    speseContoCapitale: 820,
    speseContoTerzi: 480,
    altreSpese: 160,
  },
  {
    year: '2017',
    entrateTributarie: 1220,
    entrateExtraTributarie: 1080,
    trasferimentiCorrenti: 380,
    entrateContoCapitale: 410,
    altreEntrate: 550,
    speseCorrenti: 2370,
    speseContoCapitale: 900,
    speseContoTerzi: 500,
    altreSpese: 165,
  },
  {
    year: '2018',
    entrateTributarie: 1270,
    entrateExtraTributarie: 1150,
    trasferimentiCorrenti: 400,
    entrateContoCapitale: 440,
    altreEntrate: 580,
    speseCorrenti: 2460,
    speseContoCapitale: 980,
    speseContoTerzi: 520,
    altreSpese: 170,
  },
  {
    year: '2019',
    entrateTributarie: 1330,
    entrateExtraTributarie: 1230,
    trasferimentiCorrenti: 420,
    entrateContoCapitale: 470,
    altreEntrate: 610,
    speseCorrenti: 2560,
    speseContoCapitale: 1060,
    speseContoTerzi: 540,
    altreSpese: 175,
  },
  {
    year: '2020',
    entrateTributarie: 1250,
    entrateExtraTributarie: 1050,
    trasferimentiCorrenti: 450,
    entrateContoCapitale: 350,
    altreEntrate: 560,
    speseCorrenti: 2500,
    speseContoCapitale: 850,
    speseContoTerzi: 480,
    altreSpese: 180,
  },
  {
    year: '2021',
    entrateTributarie: 1320,
    entrateExtraTributarie: 1200,
    trasferimentiCorrenti: 470,
    entrateContoCapitale: 450,
    altreEntrate: 640,
    speseCorrenti: 2620,
    speseContoCapitale: 1200,
    speseContoTerzi: 530,
    altreSpese: 185,
  },
  {
    year: '2022',
    entrateTributarie: 1400,
    entrateExtraTributarie: 1330,
    trasferimentiCorrenti: 490,
    entrateContoCapitale: 520,
    altreEntrate: 720,
    speseCorrenti: 2790,
    speseContoCapitale: 1550,
    speseContoTerzi: 580,
    altreSpese: 195,
  },
  // Real — Consuntivo 2023
  {
    year: '2023',
    entrateTributarie: 1471.9,
    entrateExtraTributarie: 1452.9,
    trasferimentiCorrenti: 518.7,
    entrateContoCapitale: 574.27,
    altreEntrate: 834.06,
    speseCorrenti: 2976.96,
    speseContoCapitale: 1968.05,
    speseContoTerzi: 623.67,
    altreSpese: 211.65,
  },
  // Real — Consuntivo 2024
  {
    year: '2024',
    entrateTributarie: 1535.37,
    entrateExtraTributarie: 1685.8,
    trasferimentiCorrenti: 619.63,
    entrateContoCapitale: 413.15,
    altreEntrate: 706.76,
    speseCorrenti: 3123.96,
    speseContoCapitale: 2112.45,
    speseContoTerzi: 357.16,
    altreSpese: 348.28,
  },
  // Real — Previsione 2025
  {
    year: '2025*',
    entrateTributarie: 1500.85,
    entrateExtraTributarie: 1635.38,
    trasferimentiCorrenti: 708.74,
    entrateContoCapitale: 3582.78,
    altreEntrate: 1560.97,
    speseCorrenti: 3711.02,
    speseContoCapitale: 3874.97,
    speseContoTerzi: 375.24,
    altreSpese: 1247.67,
  },
]

const REVENUE_COLORS = {
  entrateTributarie: '#1d4ed8',
  entrateExtraTributarie: '#3b82f6',
  trasferimentiCorrenti: '#60a5fa',
  entrateContoCapitale: '#93c5fd',
  altreEntrate: '#bfdbfe',
}

const EXPENSE_COLORS = {
  speseCorrenti: '#b91c1c',
  speseContoCapitale: '#ef4444',
  speseContoTerzi: '#fb923c',
  altreSpese: '#fdba74',
}

const fmtM = (v: number) => `€${Math.round(v).toLocaleString()}M`
const fmtAxis = (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)}B` : `${Math.round(v)}M`)

// ─── Entrate (Revenue) — Stacked Area ───

function EntrateChart() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Entrate — Comune di Milano</h3>
        <p className="text-sm text-muted-foreground">
          Stacked area, millions EUR. *2025 = forecast.
        </p>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="year" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={fmtAxis} />
          <Tooltip formatter={(v) => (typeof v === 'number' ? fmtM(v) : v)} />
          <Legend />
          <Area
            type="linear"
            dataKey="entrateTributarie"
            name="Tributarie"
            stackId="1"
            fill="none"
            stroke={REVENUE_COLORS.entrateTributarie}
            dot={{ r: 3 }}
          />
          <Area
            type="linear"
            dataKey="entrateExtraTributarie"
            name="Extra-tributarie"
            stackId="1"
            fill="none"
            stroke={REVENUE_COLORS.entrateExtraTributarie}
            dot={{ r: 3 }}
          />
          <Area
            type="linear"
            dataKey="trasferimentiCorrenti"
            name="Trasferimenti"
            stackId="1"
            fill="none"
            stroke={REVENUE_COLORS.trasferimentiCorrenti}
            dot={{ r: 3 }}
          />
          <Area
            type="linear"
            dataKey="entrateContoCapitale"
            name="Conto capitale"
            stackId="1"
            fill="none"
            stroke={REVENUE_COLORS.entrateContoCapitale}
            dot={{ r: 3 }}
          />
          <Area
            type="linear"
            dataKey="altreEntrate"
            name="Altre entrate"
            stackId="1"
            fill="none"
            stroke={REVENUE_COLORS.altreEntrate}
            dot={{ r: 3 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export const Entrate: StoryObj = {
  render: () => <EntrateChart />,
}

// ─── Uscite (Expenses) — Stacked Area ───

function UsciteChart() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Uscite — Comune di Milano</h3>
        <p className="text-sm text-muted-foreground">
          Stacked area, millions EUR. *2025 = forecast.
        </p>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="year" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={fmtAxis} />
          <Tooltip formatter={(v) => (typeof v === 'number' ? fmtM(v) : v)} />
          <Legend />
          <Area
            type="linear"
            dataKey="speseCorrenti"
            name="Correnti"
            stackId="1"
            fill="none"
            stroke={EXPENSE_COLORS.speseCorrenti}
            dot={{ r: 3 }}
          />
          <Area
            type="linear"
            dataKey="speseContoCapitale"
            name="Conto capitale"
            stackId="1"
            fill="none"
            stroke={EXPENSE_COLORS.speseContoCapitale}
            dot={{ r: 3 }}
          />
          <Area
            type="linear"
            dataKey="speseContoTerzi"
            name="Conto terzi"
            stackId="1"
            fill="none"
            stroke={EXPENSE_COLORS.speseContoTerzi}
            dot={{ r: 3 }}
          />
          <Area
            type="linear"
            dataKey="altreSpese"
            name="Altre spese"
            stackId="1"
            fill="none"
            stroke={EXPENSE_COLORS.altreSpese}
            dot={{ r: 3 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export const Uscite: StoryObj = {
  render: () => <UsciteChart />,
}

// ─── Combined: both charts together ───

function Combined() {
  return (
    <div className="space-y-10">
      <EntrateChart />
      <UsciteChart />
    </div>
  )
}

export const EntratEUscite: StoryObj = {
  render: () => <Combined />,
}

// ─── Sparkline trend cards ───

const taxRevenue = data.map((d) => d.entrateTributarie)
const currentExpenses = data.map((d) => d.speseCorrenti)
const totalRevenue = data.map(
  (d) =>
    d.entrateTributarie +
    d.entrateExtraTributarie +
    d.trasferimentiCorrenti +
    d.entrateContoCapitale +
    d.altreEntrate
)
const totalExpenses = data.map(
  (d) => d.speseCorrenti + d.speseContoCapitale + d.speseContoTerzi + d.altreSpese
)
const years = data.map((d) => d.year)

function TrendsV2() {
  return (
    <div className="grid grid-cols-2 gap-4 max-w-lg">
      <TrendChart label="Tax Revenue" values={taxRevenue} years={years} />
      <TrendChart label="Current Expenses" values={currentExpenses} years={years} />
    </div>
  )
}

export const TrendsGreen: StoryObj = {
  render: () => <TrendsV2 />,
}

// ─── V5: 4-card grid, totals + breakdowns ───

function TrendsV5() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-3xl">
      <TrendChart label="Total Revenue" values={totalRevenue} years={years} color="#1d4ed8" />
      <TrendChart label="Tax Revenue" values={taxRevenue} years={years} color="#3b82f6" />
      <TrendChart label="Total Expenses" values={totalExpenses} years={years} color="#b91c1c" />
      <TrendChart label="Current Expenses" values={currentExpenses} years={years} color="#ef4444" />
    </div>
  )
}

export const TrendsGrid: StoryObj = {
  render: () => <TrendsV5 />,
}
