import { motion } from 'framer-motion'
import { Building2, Star, Clock, MapPin, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { ScoreRing } from '@/components/ui/ScoreRing'
import type { BusinessCheckResult, VerificationStatus } from '@/types'

interface BusinessCheckProps {
  status: VerificationStatus
  result: BusinessCheckResult | null
}

export function BusinessCheck({ status, result }: BusinessCheckProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Header row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-navy-50 flex items-center justify-center flex-shrink-0">
            <Building2 size={18} className="text-navy-700" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-navy-900 text-sm">
              Google Business verification
            </h3>
            <p className="text-xs text-navy-400 mt-0.5">
              Checks if this business exists on Google Maps and validates name, address, and category.
            </p>
          </div>
        </div>
        <StatusIcon status={status} />
      </div>

      {/* Loading state */}
      {status === 'loading' && (
        <div className="bg-surface-50 rounded-lg p-4 border border-surface-200">
          <div className="flex flex-col gap-2">
            {['w-3/4', 'w-1/2', 'w-2/3'].map((w, i) => (
              <div
                key={i}
                className={`h-3 rounded bg-surface-200 animate-pulse ${w}`}
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Result */}
      {(status === 'success' || status === 'warning' || status === 'failed') && result && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {result.exists ? (
            <div className="bg-surface-50 rounded-lg p-4 border border-surface-200">
              <div className="flex items-start gap-4">
                {/* Score ring */}
                <ScoreRing score={result.score} size={64} />

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-heading font-semibold text-navy-900 text-sm">
                      {result.name}
                    </span>
                    <Badge variant="success" dot>Listed</Badge>
                  </div>

                  <div className="flex flex-col gap-1.5 mt-2">
                    <InfoRow icon={<MapPin size={13} />} text={result.address} />
                    <InfoRow
                      icon={<Star size={13} />}
                      text={`${result.rating} rating · ${result.reviewCount} reviews`}
                    />
                    <InfoRow
                      icon={<Clock size={13} />}
                      text={`Listed for ${result.listingAgeMonths} months`}
                    />
                  </div>

                  {/* Signals */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {result.listingAgeMonths >= 12 && (
                      <Badge variant="success">Established listing</Badge>
                    )}
                    {result.rating >= 4 && (
                      <Badge variant="success">High rated</Badge>
                    )}
                    {result.reviewCount >= 20 && (
                      <Badge variant="info">Active reviews</Badge>
                    )}
                    {result.listingAgeMonths < 6 && (
                      <Badge variant="warning">New listing</Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="flex items-center gap-2">
                <XCircle size={16} className="text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">
                  No matching business found on Google Maps for this name and address.
                  Verify the details or proceed with a field visit.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function InfoRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-navy-500">
      <span className="text-navy-400 flex-shrink-0">{icon}</span>
      <span>{text}</span>
    </div>
  )
}

function StatusIcon({ status }: { status: VerificationStatus }) {
  if (status === 'idle') return null

  if (status === 'loading') {
    return (
      <div className="w-5 h-5 rounded-full border-2 border-navy-300 border-t-navy-700 animate-spin flex-shrink-0 mt-0.5" />
    )
  }

  if (status === 'success') {
    return <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" />
  }

  if (status === 'warning') {
    return <AlertCircle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
  }

  return <XCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
}
