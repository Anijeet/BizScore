import { motion } from 'framer-motion'
import { Package, LayoutGrid, Layers, Lightbulb, CheckCircle2 } from 'lucide-react'
import type { Layer2Result } from '@/types'

interface VisualSignalsPanelProps {
  result: Layer2Result
}

export function VisualSignalsPanel({ result }: VisualSignalsPanelProps) {
  const { shelfAnalysis, storeSizeEstimateSqft, lightingQualityScore, imageCount } = result
  const { shelfDensityIndex, skuCount, estimatedInventoryValue, detectedObjects } = shelfAnalysis

  const fmtInr = (n: number) =>
    n >= 100000
      ? `₹${(n / 100000).toFixed(1)}L`
      : `₹${(n / 1000).toFixed(0)}K`

  return (
    <div className="flex flex-col gap-5">

      {/* Metric grid */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard
          icon={<Layers size={15} className="text-navy-600" />}
          label="Shelf density index"
          value={`${Math.round(shelfDensityIndex * 100)}%`}
          sub="% of shelf space occupied"
          bar
          barValue={shelfDensityIndex}
          barColor={
            shelfDensityIndex >= 0.7 ? 'bg-emerald-500' :
            shelfDensityIndex >= 0.4 ? 'bg-amber-500' :
            'bg-blue-500'
          }
        />

        <MetricCard
          icon={<LayoutGrid size={15} className="text-navy-600" />}
          label="SKU diversity score"
          value={`${skuCount}`}
          sub="distinct product types"
          bar
          barValue={Math.min(skuCount / 30, 1)}
          barColor="bg-navy-600"
        />

        <MetricCard
          icon={<Package size={15} className="text-navy-600" />}
          label="Estimated inventory"
          value={fmtInr(estimatedInventoryValue)}
          sub="approximate stock value"
        />

        <MetricCard
          icon={<Lightbulb size={15} className="text-navy-600" />}
          label="Lighting quality"
          value={`${Math.round(lightingQualityScore * 100)}%`}
          sub={`${imageCount} image${imageCount > 1 ? 's' : ''} analysed`}
          bar
          barValue={lightingQualityScore}
          barColor={lightingQualityScore >= 0.7 ? 'bg-emerald-500' : 'bg-amber-500'}
        />
      </div>

      {/* Detected objects */}
      <div className="bg-surface-50 rounded-lg border border-surface-200 p-4">
        <p className="text-xs text-navy-500 font-medium mb-3">
          Objects detected in images
        </p>
        <div className="flex flex-col gap-2">
          {detectedObjects.map((obj, i) => (
            <motion.div
              key={obj}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: i * 0.05 }}
              className="flex items-center gap-2"
            >
              <CheckCircle2 size={13} className="text-navy-400 flex-shrink-0" />
              <span className="text-xs text-navy-700">{obj}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Store size estimate */}
      <div className="flex items-center gap-3 bg-navy-50 rounded-lg border border-navy-100 px-4 py-3">
        <div className="flex flex-col gap-0.5">
          <p className="text-xs text-navy-400">Estimated store size</p>
          <p className="font-heading font-semibold text-navy-900 text-sm">
            ~{storeSizeEstimateSqft} sq ft
          </p>
        </div>
        <div className="ml-auto text-xs text-navy-400 text-right max-w-[160px]">
          Derived from depth estimation across submitted images
        </div>
      </div>
    </div>
  )
}

// ─── Metric card ──────────────────────────────────────────────────────────────

function MetricCard({
  icon,
  label,
  value,
  sub,
  bar = false,
  barValue = 0,
  barColor = 'bg-navy-600',
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub: string
  bar?: boolean
  barValue?: number
  barColor?: string
}) {
  return (
    <div className="bg-white rounded-lg border border-surface-200 p-3 flex flex-col gap-2">
      <div className="flex items-center gap-1.5 text-navy-500">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="font-heading font-semibold text-navy-900 text-lg leading-none">
        {value}
      </p>
      {bar && (
        <div className="h-1 bg-surface-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${barColor} transition-all duration-700`}
            style={{ width: `${Math.round(barValue * 100)}%` }}
          />
        </div>
      )}
      <p className="text-xs text-navy-400">{sub}</p>
    </div>
  )
}
