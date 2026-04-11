import { motion } from 'framer-motion'
import { FileText, Calendar, MapPin, CheckCircle2, XCircle, AlertCircle, Info } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { ScoreRing } from '@/components/ui/ScoreRing'
import type { GSTResult, VerificationStatus } from '@/types'

interface GSTLookupProps {
  status: VerificationStatus
  result: GSTResult | null
}

export function GSTLookup({ status, result }: GSTLookupProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Header row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-navy-50 flex items-center justify-center flex-shrink-0">
            <FileText size={18} className="text-navy-700" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-navy-900 text-sm">
              GST verification
            </h3>
            <p className="text-xs text-navy-400 mt-0.5">
              Optional. Validates GSTIN format and registration status. Increases confidence score if verified.
            </p>
          </div>
        </div>
        <StatusIcon status={status} />
      </div>

      {/* Loading state */}
      {status === 'loading' && (
        <div className="bg-surface-50 rounded-lg p-4 border border-surface-200">
          <div className="flex flex-col gap-2">
            {['w-2/3', 'w-1/2'].map((w, i) => (
              <div
                key={i}
                className={`h-3 rounded bg-surface-200 animate-pulse ${w}`}
                style={{ animationDelay: `${i * 120}ms` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Not provided */}
      {status === 'success' && result?.status === 'not_provided' && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-surface-50 rounded-lg p-4 border border-surface-200"
        >
          <div className="flex items-start gap-2">
            <Info size={15} className="text-navy-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-navy-600">
                GSTIN not provided. This is common for small businesses below the GST threshold.
              </p>
              <p className="text-xs text-navy-400 mt-1">
                Confidence score is set to neutral (0.5). Providing a valid GSTIN increases it to 0.9.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Invalid format */}
      {(status === 'failed' || status === 'warning') && result && result.status !== 'not_provided' && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-red-50 rounded-lg p-4 border border-red-200"
        >
          <div className="flex items-center gap-2">
            <XCircle size={15} className="text-red-500 flex-shrink-0" />
            <div>
              <p className="text-sm text-red-700 font-medium">Invalid GSTIN</p>
              <p className="text-xs text-red-600 mt-0.5">
                The provided GSTIN does not match the required 15-character format or is not active.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Verified */}
      {status === 'success' && result?.verified && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-surface-50 rounded-lg p-4 border border-surface-200"
        >
          <div className="flex items-start gap-4">
            <ScoreRing score={result.score} size={64} />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-heading font-semibold text-navy-900 text-sm">
                  {result.tradeName}
                </span>
                <Badge variant="success" dot>Active</Badge>
              </div>

              <div className="flex flex-col gap-1.5 mt-2">
                <InfoRow
                  icon={<FileText size={13} />}
                  label="GSTIN"
                  text={result.gstin}
                  mono
                />
                <InfoRow
                  icon={<MapPin size={13} />}
                  label="State"
                  text={result.state}
                />
                <InfoRow
                  icon={<Calendar size={13} />}
                  label="Registered"
                  text={formatDate(result.registrationDate)}
                />
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                <Badge variant="success">GST compliant</Badge>
                {isOlderThan(result.registrationDate, 12) && (
                  <Badge variant="info">Registered over 1 year</Badge>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function InfoRow({
  icon,
  label,
  text,
  mono = false,
}: {
  icon: React.ReactNode
  label: string
  text: string
  mono?: boolean
}) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-navy-500">
      <span className="text-navy-400 flex-shrink-0">{icon}</span>
      <span className="text-navy-400">{label}:</span>
      <span className={mono ? 'font-mono text-navy-700' : ''}>{text}</span>
    </div>
  )
}

function formatDate(iso: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function isOlderThan(iso: string, months: number): boolean {
  if (!iso) return false
  const reg = new Date(iso)
  const cutoff = new Date()
  cutoff.setMonth(cutoff.getMonth() - months)
  return reg < cutoff
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
