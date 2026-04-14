import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { MockDataBanner } from '@/components/ui/MockDataBanner'
import { runLayer2Analysis } from '@/services/visionApi'
import type { Layer2Result, Layer1Result } from '@/types'

interface LocationState {
  images?: File[]
  businessType?: string
  businessName?: string
  pincode?: string
  address?: string
  phone?: string
  latitude?: number
  longitude?: number
  layer1Score?: number
  layer1Result?: Layer1Result
}

type Phase = 'analysing' | 'done'

export default function Layer2Page() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = (location.state ?? {}) as LocationState

  const images = state.images ?? []
  const businessType = state.businessType ?? 'grocery'
  const businessName = state.businessName ?? 'Unknown business'
  const layer1Score = state.layer1Score ?? 0.7

  const [phase, setPhase] = useState<Phase>('analysing')
  const [result, setResult] = useState<Layer2Result | null>(null)

  useEffect(() => {
    if (images.length === 0) return

    async function run() {
      setPhase('analysing')
      const analysis = await runLayer2Analysis(images, businessType)
      setResult(analysis)
      await new Promise((r) => setTimeout(r, 900))
      setPhase('done')
    }

    run()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (images.length === 0) {
    return (
      <div className="container-page py-12 sm:py-16 max-w-md mx-auto text-center flex flex-col items-center gap-4 px-4">
        <AlertTriangle size={28} className="text-amber-500" />
        <h2 className="font-heading font-semibold text-navy-900 text-lg sm:text-xl">
          No photos found
        </h2>
        <p className="text-navy-500 text-sm leading-snug">
          Start again from the assessment and capture your shop photos.
        </p>
        <Button onClick={() => navigate('/assess')} className="min-h-[48px] w-full max-w-xs justify-center">
          Back to start
        </Button>
      </div>
    )
  }

  return (
    <div className="container-page py-6 sm:py-8">
      <div className="max-w-2xl mx-auto flex flex-col gap-4 sm:gap-5 px-1 sm:px-0">

        <MockDataBanner />

        <div className="rounded-xl border-l-4 border-l-navy-800 border border-surface-200 bg-surface-50/80 px-3 py-2.5 sm:px-4">
          <p className="text-xs font-bold text-navy-900">Step 2 · Photos</p>
          <p className="text-[11px] text-navy-600 mt-0.5 leading-snug">Processing in background — no scores here; officer reviews after submit.</p>
        </div>

        <div>
          <p className="text-label mb-1">Step 2 of 4</p>
          <h1 className="font-heading font-semibold text-lg sm:text-xl lg:text-2xl text-navy-900 leading-tight">
            Checking shop photos
          </h1>
          <p className="text-navy-500 mt-1 text-xs sm:text-sm leading-snug">
            Usually under a minute.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-surface-50 rounded-xl border border-surface-200 px-3 py-2.5 sm:px-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-navy-900 truncate">{businessName}</p>
            <p className="text-xs text-navy-400 mt-0.5">
              {images.length} photo{images.length > 1 ? 's' : ''} received
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {phase === 'analysing' && (
            <motion.div
              key="analysing"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <div className="flex flex-col items-center gap-5 py-8">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-2 border-navy-100 animate-ping" />
                    <div className="relative w-16 h-16 rounded-full bg-navy-50 flex items-center justify-center">
                      <Eye size={24} className="text-navy-700" />
                    </div>
                  </div>
                  <div className="text-center px-2">
                    <p className="font-heading font-semibold text-navy-900 text-sm">
                      Processing…
                    </p>
                    <p className="text-[11px] text-navy-500 mt-1 max-w-xs mx-auto leading-snug">
                      Secure check — details only for the bank after you apply.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 w-full max-w-xs">
                    {[
                      'Photo quality',
                      'Shop layout',
                      'Loan team file',
                    ].map((step, i) => (
                      <div key={step} className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border-2 border-navy-300 border-t-navy-700 animate-spin flex-shrink-0"
                          style={{ animationDelay: `${i * 200}ms` }}
                        />
                        <span className="text-xs text-navy-400">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {phase === 'done' && result && (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <Card>
                <div className="flex flex-col items-center text-center gap-4 py-6 px-2">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200">
                    <CheckCircle2 size={28} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-heading font-semibold text-navy-900 text-base">
                      Photos saved
                    </p>
                    <p className="text-xs sm:text-sm text-navy-500 mt-2 leading-snug max-w-md mx-auto">
                      No scores on this screen — officer sees details after review.
                    </p>
                  </div>
                  <div className="w-full flex pt-2">
                    <Button
                      size="md"
                      className="min-h-[48px] w-full sm:w-auto sm:ml-auto justify-center"
                      onClick={() =>
                        navigate('/assess/layer3', {
                          state: {
                            ...state,
                            layer2Result: result,
                            layer1Score,
                            layer1Result: state.layer1Result,
                          },
                        })
                      }
                    >
                      Location step
                      <ArrowRight size={15} />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
