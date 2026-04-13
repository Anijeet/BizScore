import { motion } from 'framer-motion'
import { ScanSearch, CheckCircle2, XCircle, AlertCircle, Tag } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import type { ProductExistenceResult, VerificationStatus } from '@/types'

interface ProductExistenceProps {
  status: VerificationStatus
  result: ProductExistenceResult | null
  imagesUploaded: number
}

export function ProductExistence({ status, result, imagesUploaded }: ProductExistenceProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Header row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-navy-50 flex items-center justify-center flex-shrink-0">
            <ScanSearch size={18} className="text-navy-700" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-navy-900 text-sm">
              Product existence check
            </h3>
            <p className="text-xs text-navy-400 mt-0.5">
              Verifies that the products visible in images match the claimed business type.
            </p>
          </div>
        </div>
        <StatusIcon status={status} />
      </div>

      {/* No images uploaded notice */}
      {status === 'idle' && imagesUploaded === 0 && (
        <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
          <p className="text-xs text-amber-700">
            Upload at least one store image to run product existence check.
          </p>
        </div>
      )}

      {/* Loading state */}
      {status === 'loading' && (
        <div className="bg-surface-50 rounded-lg p-4 border border-surface-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded bg-surface-200 animate-pulse" />
            <div className="flex-1 flex flex-col gap-1.5">
              <div className="h-3 rounded bg-surface-200 animate-pulse w-1/2" />
              <div className="h-3 rounded bg-surface-200 animate-pulse w-1/3" />
            </div>
          </div>
          <p className="text-xs text-navy-400">
            Analysing {imagesUploaded} image{imagesUploaded > 1 ? 's' : ''} with vision model...
          </p>
        </div>
      )}

      {/* Result */}
      {(status === 'success' || status === 'warning' || status === 'failed') && result && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {result.matches ? (
            <div className="bg-surface-50 rounded-lg p-4 border border-surface-200">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-heading font-semibold text-navy-900 text-sm">
                      Products match claimed type
                    </span>
                    <Badge variant="success" dot>Consistent</Badge>
                  </div>

                  <p className="text-xs text-navy-500 mt-1.5">{result.notes}</p>

                  {/* Detected categories */}
                  <div className="mt-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Tag size={12} className="text-navy-400" />
                      <span className="text-xs text-navy-400">Detected categories</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {result.detectedCategories.map((cat) => (
                        <Badge key={cat} variant="neutral">{cat}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3">
                    <ConfidenceLabel score={result.confidenceScore} />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="flex items-start gap-2">
                <XCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-red-700 font-medium">
                    Product mismatch detected
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    The products visible in the submitted images do not match the claimed business type.
                    This may indicate incorrect business type selection or fraudulent image submission.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {result.detectedCategories.map((cat) => (
                      <Badge key={cat} variant="error">{cat}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}

/** Qualitative only — no percentage shown to business owners */
function ConfidenceLabel({ score }: { score: number }) {
  const label =
    score >= 0.8 ? 'Photo check: strong match with your shop type' :
    score >= 0.6 ? 'Photo check: reasonable match with your shop type' :
    'Photo check: unclear match — a bank officer will review'

  return (
    <p className="text-xs text-navy-500 leading-relaxed">{label}</p>
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
