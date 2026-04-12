import { motion } from 'framer-motion'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { ScoreRing } from '@/components/ui/ScoreRing'
import { Badge } from '@/components/ui/Badge'
import type { TierClassification, StoreTier } from '@/types'
import { TIER_CONFIG } from '@/types'

interface TierCardProps {
  result: TierClassification
}

// Colour map per tier — must stay in sync with TIER_CONFIG
const TIER_STYLES: Record<
  StoreTier,
  { border: string; bg: string; badge: string; accent: string; pill: string }
> = {
  1: {
    border: 'border-emerald-200',
    bg: 'bg-emerald-50',
    badge: 'text-emerald-700',
    accent: 'text-emerald-600',
    pill: 'bg-emerald-100 text-emerald-700',
  },
  2: {
    border: 'border-amber-200',
    bg: 'bg-amber-50',
    badge: 'text-amber-700',
    accent: 'text-amber-600',
    pill: 'bg-amber-100 text-amber-700',
  },
  3: {
    border: 'border-blue-200',
    bg: 'bg-blue-50',
    badge: 'text-blue-700',
    accent: 'text-blue-600',
    pill: 'bg-blue-100 text-blue-700',
  },
}

export function TierCard({ result }: TierCardProps) {
  const styles = TIER_STYLES[result.tier]
  const config = TIER_CONFIG[result.tier]

  const fmtInr = (n: number) =>
    n >= 100000
      ? `₹${(n / 100000).toFixed(1)}L`
      : `₹${(n / 1000).toFixed(0)}K`

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`rounded-xl border p-5 ${styles.border} ${styles.bg}`}
    >
      {/* Top row */}
      <div className="flex items-start gap-4">
        <ScoreRing score={result.confidence} size={68} strokeWidth={6} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-heading font-semibold text-navy-900 text-sm`}>
              {result.tierLabel}
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles.pill}`}>
              {Math.round(result.confidence * 100)}% confidence
            </span>
          </div>

          <p className="text-xs text-navy-500 mt-1">{config.sublabel}</p>

          {/* Proxy logic */}
          <div className="mt-2 flex items-center gap-1.5">
            <span className="text-xs text-navy-400">Proxy logic:</span>
            <span className={`text-xs font-medium ${styles.accent}`}>
              {result.proxyLogic}
            </span>
          </div>
        </div>
      </div>

      {/* Daily / Monthly sales estimate */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="bg-white/70 rounded-lg p-3 border border-white">
          <p className="text-xs text-navy-400 mb-0.5">Daily sales estimate</p>
          <p className="font-heading font-semibold text-navy-900 text-sm">
            {fmtInr(result.dailySalesRange[0])} – {fmtInr(result.dailySalesRange[1])}
          </p>
        </div>
        <div className="bg-white/70 rounded-lg p-3 border border-white">
          <p className="text-xs text-navy-400 mb-0.5">Monthly sales estimate</p>
          <p className="font-heading font-semibold text-navy-900 text-sm">
            {fmtInr(result.monthlySalesRange[0])} – {fmtInr(result.monthlySalesRange[1])}
          </p>
        </div>
      </div>

      {/* SDI and SKU reference */}
      <div className="mt-3 flex gap-2 flex-wrap">
        <Badge variant="neutral">SDI: {config.sdiRange}</Badge>
        <Badge variant="neutral">SKU: {config.skuRange}</Badge>
      </div>
    </motion.div>
  )
}

// ─── All-three-tier comparison panel ─────────────────────────────────────────

export function TierComparison({ detectedTier }: { detectedTier: StoreTier }) {
  const tiers: StoreTier[] = [1, 2, 3]

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-navy-400 uppercase tracking-wider font-medium mb-1">
        Tier classification reference
      </p>
      {tiers.map((tier) => {
        const config = TIER_CONFIG[tier]
        const styles = TIER_STYLES[tier]
        const isDetected = tier === detectedTier

        return (
          <motion.div
            key={tier}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: (tier - 1) * 0.08 }}
            className={`
              flex items-start gap-3 rounded-lg px-4 py-3 border transition-all
              ${isDetected
                ? `${styles.border} ${styles.bg}`
                : 'border-surface-200 bg-white opacity-60'
              }
            `}
          >
            {/* Tier number */}
            <span
              className={`
                font-heading font-semibold text-lg leading-none flex-shrink-0 mt-0.5
                ${isDetected ? styles.accent : 'text-navy-300'}
              `}
            >
              T{tier}
            </span>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-navy-800">{config.label}</span>
                {isDetected && (
                  <span className={`text-xs font-medium ${styles.badge}`}>
                    ← detected
                  </span>
                )}
              </div>
              <p className="text-xs text-navy-400 mt-0.5">
                {config.proxyLogic} · {config.sdiRange} SDI · {config.skuRange}
              </p>
            </div>

            {isDetected
              ? <CheckCircle2 size={15} className={`${styles.accent} flex-shrink-0 mt-0.5`} />
              : <AlertCircle size={15} className="text-navy-200 flex-shrink-0 mt-0.5" />
            }
          </motion.div>
        )
      })}
    </div>
  )
}
