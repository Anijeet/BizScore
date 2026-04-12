import { motion } from 'framer-motion'
import { MapPin, Navigation, Building2, Car, Users, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react'
import type { Layer3Result, RoadType } from '@/types'

interface GeoPanelProps {
  result: Layer3Result
}

const ROAD_LABELS: Record<RoadType, string> = {
  trunk: 'National highway',
  primary: 'State / arterial road',
  secondary: 'District road',
  tertiary: 'Local road',
  residential: 'Residential street',
  service: 'Service lane',
}

const ROAD_SCORE_COLOR: Record<number, string> = {
  5: 'bg-emerald-500',
  4: 'bg-emerald-400',
  3: 'bg-amber-500',
  2: 'bg-amber-400',
  1: 'bg-red-400',
}

export function GeoPanel({ result }: GeoPanelProps) {
  const { geoSignals, gpsConsistency, rentOwnership, geoFootfallIndex } = result

  const fmtInr = (n: number) =>
    n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${(n / 1000).toFixed(0)}K`

  return (
    <div className="flex flex-col gap-5">

      {/* GPS consistency */}
      <div className={`rounded-lg border p-4 flex items-start gap-3 ${
        gpsConsistency.flagged
          ? 'bg-red-50 border-red-200'
          : 'bg-emerald-50 border-emerald-200'
      }`}>
        {gpsConsistency.flagged
          ? <AlertTriangle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
          : <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0 mt-0.5" />
        }
        <div>
          <p className={`text-xs font-medium ${gpsConsistency.flagged ? 'text-red-700' : 'text-emerald-700'}`}>
            GPS consistency: {gpsConsistency.flagged ? 'Mismatch detected' : 'Verified'}
          </p>
          <p className="text-xs text-navy-500 mt-0.5">{gpsConsistency.note}</p>
          <p className="text-xs text-navy-400 mt-0.5">
            Max deviation: {gpsConsistency.maxDeviationMetres}m from submitted pin
          </p>
        </div>
      </div>

      {/* Geo signals grid */}
      <div className="grid grid-cols-2 gap-3">
        <GeoMetric
          icon={<Users size={14} />}
          label="Population density"
          value={`${(geoSignals.populationDensityPerSqKm / 1000).toFixed(1)}K`}
          sub="per sq km (500m radius)"
        />
        <GeoMetric
          icon={<Car size={14} />}
          label="Road type"
          value={ROAD_LABELS[geoSignals.roadType]}
          sub={`Score: ${geoSignals.roadTypeScore}/5`}
          barValue={geoSignals.roadTypeScore / 5}
          barColor={ROAD_SCORE_COLOR[geoSignals.roadTypeScore] ?? 'bg-navy-500'}
        />
        <GeoMetric
          icon={<MapPin size={14} />}
          label="Demand generators"
          value={`${geoSignals.poiCount500m} POIs`}
          sub="Schools, offices, bus stops within 500m"
        />
        <GeoMetric
          icon={<Building2 size={14} />}
          label="Competitors nearby"
          value={`${geoSignals.competitorCount500m} stores`}
          sub="Similar shops within 500m"
          flagHigh={geoSignals.competitorCount500m > 5}
        />
        <GeoMetric
          icon={<TrendingUp size={14} />}
          label="Area affluence"
          value={`${Math.round(geoSignals.areaAffluenceScore * 100)}%`}
          sub="OSM amenity diversity score"
          barValue={geoSignals.areaAffluenceScore}
          barColor={
            geoSignals.areaAffluenceScore >= 0.7 ? 'bg-emerald-500' :
            geoSignals.areaAffluenceScore >= 0.4 ? 'bg-amber-500' :
            'bg-red-400'
          }
        />
        <GeoMetric
          icon={<Navigation size={14} />}
          label="Pincode income band"
          value={geoSignals.pincodeIncomeBand.charAt(0).toUpperCase() + geoSignals.pincodeIncomeBand.slice(1)}
          sub={`Avg daily footfall: ~${geoSignals.pincodeAvgDailyFootfall} persons`}
        />
      </div>

      {/* Footfall index */}
      <div className="bg-surface-50 rounded-lg border border-surface-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-navy-700">Geo footfall index</p>
          <span className="font-heading font-semibold text-navy-900 text-sm">
            {Math.round(geoFootfallIndex * 100)} / 100
          </span>
        </div>
        <div className="h-2 bg-surface-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.round(geoFootfallIndex * 100)}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full rounded-full ${
              geoFootfallIndex >= 0.65 ? 'bg-emerald-500' :
              geoFootfallIndex >= 0.4 ? 'bg-amber-500' :
              'bg-red-400'
            }`}
          />
        </div>
        <p className="text-xs text-navy-400 mt-2">
          Composite of population density (35%), road type (25%), POI count (25%), affluence (15%), minus competitor penalty.
        </p>
      </div>

      {/* Rent / ownership signal */}
      <div className={`rounded-lg border p-4 ${
        rentOwnership.repaymentRiskClass === 'low'
          ? 'bg-emerald-50 border-emerald-200'
          : rentOwnership.repaymentRiskClass === 'medium'
          ? 'bg-amber-50 border-amber-200'
          : 'bg-red-50 border-red-200'
      }`}>
        <p className="text-xs font-medium text-navy-700 mb-2">Rent and ownership signal</p>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="text-xs text-navy-400">Est. monthly rent</p>
            <p className="font-heading font-semibold text-navy-900 text-sm mt-0.5">
              {fmtInr(rentOwnership.estimatedMonthlyRent)}
            </p>
          </div>
          <div>
            <p className="text-xs text-navy-400">Rent-to-revenue</p>
            <p className="font-heading font-semibold text-navy-900 text-sm mt-0.5">
              {Math.round(rentOwnership.rentToRevenueRatio * 100)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-navy-400">Repayment risk</p>
            <p className={`font-heading font-semibold text-sm mt-0.5 capitalize ${
              rentOwnership.repaymentRiskClass === 'low' ? 'text-emerald-700' :
              rentOwnership.repaymentRiskClass === 'medium' ? 'text-amber-700' :
              'text-red-700'
            }`}>
              {rentOwnership.repaymentRiskClass}
            </p>
          </div>
        </div>
        {rentOwnership.repaymentRiskClass === 'high' && (
          <p className="text-xs text-red-600 mt-2">
            Rent exceeds 20% of estimated revenue. High repayment risk — flag for field review.
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Metric card ──────────────────────────────────────────────────────────────

function GeoMetric({
  icon, label, value, sub,
  barValue, barColor, flagHigh = false,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub: string
  barValue?: number
  barColor?: string
  flagHigh?: boolean
}) {
  return (
    <div className="bg-white rounded-lg border border-surface-200 p-3 flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5 text-navy-400 text-xs">{icon}{label}</div>
      <p className={`font-heading font-semibold text-sm leading-tight ${flagHigh ? 'text-amber-600' : 'text-navy-900'}`}>
        {value}
      </p>
      {barValue !== undefined && (
        <div className="h-1 bg-surface-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${barColor}`}
            style={{ width: `${Math.round(barValue * 100)}%` }}
          />
        </div>
      )}
      <p className="text-xs text-navy-400 leading-tight">{sub}</p>
    </div>
  )
}
