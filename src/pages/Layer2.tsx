import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, ArrowRight, AlertTriangle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ScoreRing } from '@/components/ui/ScoreRing'
import { MockDataBanner } from '@/components/ui/MockDataBanner'
import { TierCard, TierComparison } from '@/components/verification/TierCard'
import { VisualSignalsPanel } from '@/components/verification/VisualSignalsPanel'
import { runLayer2Analysis } from '@/services/visionApi'
import type { Layer2Result, Layer1Result } from '@/types'

// Layer 2 receives images and businessType passed via router state from Layer 1.
// If state is missing (direct navigation), we show a fallback.
interface LocationState {
  images?: File[]
  businessType?: string
  businessName?: string
  pincode?: string
  address?: string
  layer1Score?: number
  layer1Result?: Layer1Result
}

type Phase = 'analysing' | 'tier' | 'signals' | 'done'

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
  const [tierStatus, setTierStatus] = useState<'idle' | 'loading' | 'success'>('idle')

  // Auto-run analysis on mount
  useEffect(() => {
    if (images.length === 0) return

    async function run() {
      // Phase 1: tier detection
      setTierStatus('loading')
      setPhase('analysing')

      const analysis = await runLayer2Analysis(images, businessType)
      setResult(analysis)
      setTierStatus('success')
      setPhase('tier')

      // Short pause then reveal signals
      await new Promise((r) => setTimeout(r, 600))
      setPhase('signals')

      await new Promise((r) => setTimeout(r, 400))
      setPhase('done')
    }

    run()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // No images — user navigated directly
  if (images.length === 0) {
    return (
      <div className="container-page py-16 max-w-xl mx-auto text-center flex flex-col items-center gap-5">
        <AlertTriangle size={32} className="text-amber-500" />
        <h2 className="font-heading font-semibold text-navy-900 text-xl">
          No images to analyse
        </h2>
        <p className="text-navy-500 text-sm">
          Layer 2 requires images submitted in Layer 1. Please start from the beginning.
        </p>
        <Button onClick={() => navigate('/assess')}>
          Go to Layer 1
        </Button>
      </div>
    )
  }

  return (
    <div className="container-page py-8">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">

        {/* Mock data banner */}
        <MockDataBanner />

        {/* What's happening */}
        <div className="bg-navy-50 border border-navy-200 rounded-lg px-4 py-3">
          <p className="text-xs font-semibold text-navy-800 mb-0.5">Step 2 of 4 — Photo analysis</p>
          <p className="text-xs text-navy-600 leading-relaxed">
            We are scanning your shop photos to figure out what type of shop you have,
            how much stock is on your shelves, and the estimated value of your inventory.
            This helps us calculate your likely daily sales.
          </p>
        </div>

        {/* Page header */}
        <div>
          <p className="text-label mb-1.5">Step 2 of 4 — Photo analysis</p>
          <h1 className="font-heading font-semibold text-xl lg:text-2xl text-navy-900">
            Scanning your shop photos
          </h1>
          <p className="text-navy-500 mt-1.5 text-sm leading-relaxed">
            Our AI looks at your shop images to check what you sell, how full your shelves are,
            and what kind of shop you run.
          </p>
        </div>

        {/* Context strip */}
        <div className="flex items-center gap-3 bg-surface-50 rounded-lg border border-surface-200 px-4 py-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-navy-900 truncate">{businessName}</p>
            <p className="text-xs text-navy-400 mt-0.5">
              {images.length} image{images.length > 1 ? 's' : ''} submitted · {businessType}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-navy-400">Layer 1 score</span>
            <ScoreRing score={layer1Score} size={40} strokeWidth={4} />
          </div>
        </div>

        <AnimatePresence mode="wait">

          {/* ── Analysing state ── */}
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
                  {/* Animated scan icon */}
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-2 border-navy-100 animate-ping" />
                    <div className="relative w-16 h-16 rounded-full bg-navy-50 flex items-center justify-center">
                      <Eye size={24} className="text-navy-700" />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="font-heading font-semibold text-navy-900 text-sm">
                      Analysing store images
                    </p>
                    <p className="text-xs text-navy-400 mt-1">
                      Running object detection and shelf segmentation...
                    </p>
                  </div>
                  {/* Analysis steps */}
                  <div className="flex flex-col gap-2 w-full max-w-xs">
                    {[
                      'Improving image quality for better results',
                      'Detecting products and objects in photos',
                      'Measuring how full the shelves are',
                      'Counting product types and variety',
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

          {/* ── Results ── */}
          {(phase === 'tier' || phase === 'signals' || phase === 'done') && result && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col gap-5"
            >
              {/* Tier classification */}
              <Card padding="sm">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2 px-2 pt-2">
                    <div className="w-8 h-8 rounded-lg bg-navy-50 flex items-center justify-center">
                      <Eye size={16} className="text-navy-700" />
                    </div>
                    <div>
                      <h3 className="font-heading font-semibold text-navy-900 text-sm">
                        Tier classification
                      </h3>
                      <p className="text-xs text-navy-400">Based on proxy logic from visual signals</p>
                    </div>
                    {tierStatus === 'loading' && (
                      <div className="ml-auto w-4 h-4 rounded-full border-2 border-navy-300 border-t-navy-700 animate-spin" />
                    )}
                  </div>

                  <TierCard result={result.tierClassification} />
                </div>
              </Card>

              {/* Detected signals per tier */}
              <Card padding="sm">
                <div className="px-2 pt-2 pb-1">
                  <h3 className="font-heading font-semibold text-navy-900 text-sm mb-1">
                    What we found in your photos
                  </h3>
                  <p className="text-xs text-navy-400 mb-4">
                    These are items our AI identified in your shop photos.
                    The percentage shows how confident we are about each one.
                  </p>
                  <div className="flex flex-col gap-2">
                    {result.tierClassification.signals.map((s, i) => (
                      <motion.div
                        key={s.signal}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.25, delay: i * 0.06 }}
                        className="flex items-center gap-3 py-2 border-b border-surface-100 last:border-0"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-navy-800">{s.signal}</p>
                          <p className="text-xs text-navy-400 mt-0.5">Proxy: {s.proxy}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="w-16 h-1 bg-surface-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-navy-600 rounded-full"
                              style={{ width: `${Math.round(s.confidence * 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-navy-500 w-7 text-right">
                            {Math.round(s.confidence * 100)}%
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Tier comparison reference */}
              <Card padding="sm">
                <div className="px-2 pt-2">
                  <TierComparison detectedTier={result.tierClassification.tier} />
                </div>
              </Card>

              {/* Shelf analysis */}
              {(phase === 'signals' || phase === 'done') && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  <Card padding="sm">
                    <div className="px-2 pt-2 pb-2">
                      <h3 className="font-heading font-semibold text-navy-900 text-sm mb-1">
                        Shelf and stock analysis
                      </h3>
                      <p className="text-xs text-navy-400 mb-4">
                        How full your shelves are and how many different products you sell —
                        these two signals go into your final business score.
                      </p>
                      <VisualSignalsPanel result={result} />
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Vision score summary + proceed */}
              {phase === 'done' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  <Card>
                    <div className="flex items-center gap-4">
                      <ScoreRing score={result.overallVisionScore} size={72} strokeWidth={7} />
                      <div className="flex-1">
                        <p className="font-heading font-semibold text-navy-900 text-sm">
                          Photo analysis score: {Math.round(result.overallVisionScore * 100)} / 100
                        </p>
                        <p className="text-xs text-navy-500 mt-1 leading-relaxed">
                          Based on your shop type confidence, how full your shelves are,
                          and photo quality. This score is used in your final business assessment.
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 flex justify-end">
                      <Button
                        size="md"
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
                        Proceed to geo analysis
                        <ArrowRight size={15} />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
