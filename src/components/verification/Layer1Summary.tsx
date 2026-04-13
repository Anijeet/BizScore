import { motion } from 'framer-motion'
import { ShieldCheck, ShieldAlert, ShieldX, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { Layer1Result } from '@/types'

interface Layer1SummaryProps {
  result: Layer1Result
  onProceed: () => void
}

export function Layer1Summary({ result, onProceed }: Layer1SummaryProps) {
  const { recommendation } = result

  const config = {
    proceed: {
      icon: ShieldCheck,
      iconColor: 'text-emerald-500',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      label: 'Checks completed',
      description:
        'Your business details have been received. You can continue to the photo step. Final scores and loan amounts are not shown here — only a Poonawalla officer sees them after you submit your full application.',
      badgeColor: 'text-emerald-700',
    },
    review: {
      icon: ShieldAlert,
      iconColor: 'text-amber-500',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      label: 'Some checks need review',
      description:
        'We received your details, but a few items may need a closer look by the bank team. You may still continue; an officer will decide after you submit.',
      badgeColor: 'text-amber-700',
    },
    reject: {
      icon: ShieldX,
      iconColor: 'text-red-500',
      bg: 'bg-red-50',
      border: 'border-red-200',
      label: 'Could not verify online',
      description:
        'We could not match your details with our online checks. Please check your information or visit a branch for help before continuing.',
      badgeColor: 'text-red-700',
    },
  }[recommendation]

  const Icon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-4"
    >
      <div className={`rounded-lg p-5 border ${config.bg} ${config.border}`}>
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${config.bg} border ${config.border}`}>
            <Icon size={20} className={config.iconColor} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`font-heading font-semibold text-sm ${config.badgeColor}`}>
                {config.label}
              </span>
            </div>
            <p className="text-sm text-navy-700 mt-2 leading-relaxed">
              {config.description}
            </p>
          </div>
        </div>
      </div>

      {recommendation !== 'reject' && (
        <div className="flex justify-end">
          <Button onClick={onProceed} size="md">
            Continue to photo step
            <ArrowRight size={15} />
          </Button>
        </div>
      )}

      {recommendation === 'reject' && (
        <p className="text-xs text-red-600 text-center">
          This application cannot proceed automatically. Please correct your details or visit a branch.
        </p>
      )}
    </motion.div>
  )
}
