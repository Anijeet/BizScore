import { motion } from 'framer-motion'
import { ShieldCheck, ShieldAlert, ShieldX, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ScoreRing } from '@/components/ui/ScoreRing'
import type { Layer1Result } from '@/types'

interface Layer1SummaryProps {
  result: Layer1Result
  onProceed: () => void
}

export function Layer1Summary({ result, onProceed }: Layer1SummaryProps) {
  const { overallCredibilityScore, recommendation } = result

  const config = {
    proceed: {
      icon: ShieldCheck,
      iconColor: 'text-emerald-500',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      label: 'Ready to proceed',
      description:
        'Business identity verified. All checks passed. You may proceed to image and geo analysis.',
      badgeColor: 'text-emerald-700',
    },
    review: {
      icon: ShieldAlert,
      iconColor: 'text-amber-500',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      label: 'Requires review',
      description:
        'Some checks returned partial results. Proceeding is allowed but a field verification is recommended.',
      badgeColor: 'text-amber-700',
    },
    reject: {
      icon: ShieldX,
      iconColor: 'text-red-500',
      bg: 'bg-red-50',
      border: 'border-red-200',
      label: 'Identity not verified',
      description:
        'Critical checks failed. This application should not proceed without physical verification.',
      badgeColor: 'text-red-700',
    },
  }[recommendation]

  const Icon = config.icon

  // Score breakdown weights — must match api.ts logic
  const breakdown = [
    {
      label: 'Google Business',
      score: result.businessCheck.score,
      weight: '40%',
    },
    {
      label: 'GST verification',
      score: result.gst.score,
      weight: '25%',
    },
    {
      label: 'Product match',
      score: result.productExistence.confidenceScore,
      weight: '35%',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-4"
    >
      {/* Overall result */}
      <div className={`rounded-lg p-5 border ${config.bg} ${config.border}`}>
        <div className="flex items-start gap-4">
          <ScoreRing score={overallCredibilityScore} size={72} strokeWidth={7} />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Icon size={16} className={config.iconColor} />
              <span className={`font-heading font-semibold text-sm ${config.badgeColor}`}>
                {config.label}
              </span>
            </div>
            <p className="text-sm text-navy-700 mt-1 leading-relaxed">
              {config.description}
            </p>
          </div>
        </div>
      </div>

      {/* Score breakdown */}
      <div className="bg-white border border-surface-200 rounded-lg p-4">
        <p className="text-xs font-medium text-navy-500 uppercase tracking-wider mb-3">
          Score breakdown
        </p>
        <div className="flex flex-col gap-3">
          {breakdown.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="text-sm text-navy-700 w-36 flex-shrink-0">{item.label}</span>
              <div className="flex-1 h-1.5 bg-surface-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-navy-600 transition-all duration-700"
                  style={{ width: `${Math.round(item.score * 100)}%` }}
                />
              </div>
              <span className="text-xs font-medium text-navy-700 w-8 text-right">
                {Math.round(item.score * 100)}
              </span>
              <span className="text-xs text-navy-400 w-8">{item.weight}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action */}
      {recommendation !== 'reject' && (
        <div className="flex justify-end">
          <Button onClick={onProceed} size="md">
            Proceed to image analysis
            <ArrowRight size={15} />
          </Button>
        </div>
      )}

      {recommendation === 'reject' && (
        <p className="text-xs text-red-600 text-center">
          This application cannot proceed automatically. Escalate to field verification team.
        </p>
      )}
    </motion.div>
  )
}
