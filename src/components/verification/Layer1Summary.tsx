import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
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
      dotClass: 'bg-emerald-500',
      barClass: 'border-l-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      label: 'Checks complete',
      description: 'You can go on to the photo step. Scores stay with the bank officer after full submit.',
      badgeColor: 'text-emerald-800',
    },
    review: {
      dotClass: 'bg-amber-500',
      barClass: 'border-l-amber-500',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      label: 'Needs a closer look',
      description: 'You can still continue — an officer will review everything.',
      badgeColor: 'text-amber-900',
    },
    reject: {
      dotClass: 'bg-red-500',
      barClass: 'border-l-red-500',
      bg: 'bg-red-50',
      border: 'border-red-200',
      label: 'Could not verify online',
      description: 'Double-check your details or visit a branch for help.',
      badgeColor: 'text-red-800',
    },
  }[recommendation]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-4"
    >
      <div className={`rounded-2xl p-4 sm:p-5 border ${config.bg} ${config.border} border-l-4 ${config.barClass}`}>
        <div className="flex gap-3">
          <span className={`mt-1.5 h-2.5 w-2.5 rounded-full shrink-0 ${config.dotClass}`} aria-hidden />
          <div className="min-w-0 flex-1">
            <p className={`font-heading font-bold text-sm sm:text-base ${config.badgeColor}`}>{config.label}</p>
            <p className="text-sm text-navy-700 mt-1.5 leading-snug">{config.description}</p>
          </div>
        </div>
      </div>

      {recommendation !== 'reject' && (
        <Button onClick={onProceed} size="md" className="min-h-[48px] w-full sm:w-auto sm:self-end justify-center">
          Continue to photos
          <ArrowRight size={15} />
        </Button>
      )}

      {recommendation === 'reject' && (
        <p className="text-xs text-red-700 text-center font-medium rounded-lg bg-red-50 border border-red-100 px-3 py-2">
          Fix your details or visit a branch to continue.
        </p>
      )}
    </motion.div>
  )
}
