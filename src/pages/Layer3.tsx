import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, ArrowRight, AlertTriangle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ScoreRing } from '@/components/ui/ScoreRing'
import { MockDataBanner } from '@/components/ui/MockDataBanner'
import { GeoPanel } from '@/components/verification/GeoPanel'
import { runLayer3Analysis } from '@/services/geoApi'
import { runLayer4Voting } from '@/services/votingEngine'
import type { Layer3Result, Layer2Result, Layer1Result, Layer4Result } from '@/types'

interface LocationState {
  images?: File[]
  businessType?: string
  businessName?: string
  pincode?: string
  address?: string
  layer1Score?: number
  layer1Result?: Layer1Result
  layer2Result?: Layer2Result
}

type Phase = 'analysing' | 'done'

export default function Layer3Page() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = (location.state ?? {}) as LocationState

  const pincode = state.pincode ?? '110001'
  const businessName = state.businessName ?? 'Unknown business'
  const layer1Score = state.layer1Score ?? 0.7
  const layer2Result = state.layer2Result
  const layer1Result = state.layer1Result

  const [phase, setPhase] = useState<Phase>('analysing')
  const [layer3Result, setLayer3Result] = useState<Layer3Result | null>(null)
  const [layer4Result, setLayer4Result] = useState<Layer4Result | null>(null)

  useEffect(() => {
    if (!layer2Result) return

    async function run() {
      setPhase('analysing')
      const geo = await runLayer3Analysis(pincode, layer2Result!.tierClassification.tier)
      setLayer3Result(geo)

      // Run Layer 4 voting immediately after geo — needs all three layers
      if (layer1Result) {
        const vote = runLayer4Voting(layer1Result, layer2Result!, geo)
        setLayer4Result(vote)
      }

      setPhase('done')
    }

    run()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!layer2Result) {
    return (
      <div className="container-page py-16 max-w-xl mx-auto text-center flex flex-col items-center gap-5">
        <AlertTriangle size={32} className="text-amber-500" />
        <h2 className="font-heading font-semibold text-navy-900 text-xl">
          Missing previous layer data
        </h2>
        <p className="text-navy-500 text-sm">
          Layer 3 requires Layer 2 results. Please complete the assessment from the beginning.
        </p>
        <Button onClick={() => navigate('/assess')}>Start assessment</Button>
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
          <p className="text-xs font-semibold text-navy-800 mb-0.5">Step 3 of 4 — Location check</p>
          <p className="text-xs text-navy-600 leading-relaxed">
            We are now checking your shop's location. This tells us how busy the area is,
            how many other shops are nearby, what kind of road your shop is on,
            and whether your area is a high-income or low-income zone.
          </p>
        </div>

        {/* Header */}
        <div>
          <p className="text-label mb-1.5">Step 3 of 4 — Location check</p>
          <h1 className="font-heading font-semibold text-xl lg:text-2xl text-navy-900">
            Checking your location
          </h1>
          <p className="text-navy-500 mt-1.5 text-sm leading-relaxed">
            We look at your pincode and area to understand how much foot traffic your shop gets
            and what the income level is in your neighbourhood.
          </p>
        </div>

        {/* Context strip */}
        <div className="flex items-center gap-3 bg-surface-50 rounded-lg border border-surface-200 px-4 py-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-navy-900 truncate">{businessName}</p>
            <p className="text-xs text-navy-400 mt-0.5">
              Pincode: {pincode} · {layer2Result.tierClassification.tierLabel}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-navy-400">Vision</p>
              <p className="text-xs font-medium text-navy-700">{Math.round(layer2Result.overallVisionScore * 100)}</p>
            </div>
            <ScoreRing score={layer1Score} size={40} strokeWidth={4} />
          </div>
        </div>

        <AnimatePresence mode="wait">

          {/* Analysing */}
          {phase === 'analysing' && (
            <motion.div
              key="analysing"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Card>
                <div className="flex flex-col items-center gap-5 py-8">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-2 border-navy-100 animate-ping" />
                    <div className="relative w-16 h-16 rounded-full bg-navy-50 flex items-center justify-center">
                      <MapPin size={24} className="text-navy-700" />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="font-heading font-semibold text-navy-900 text-sm">
                      Fetching geo intelligence
                    </p>
                    <p className="text-xs text-navy-400 mt-1">
                      Querying Overpass API, WorldPop, and census income data...
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 w-full max-w-xs">
                    {[
                      'Checking how many people live in your area',
                      'Counting nearby shops and demand points',
                      'Checking what type of road your shop is on',
                      'Looking up income levels for your pincode',
                      'Estimating rent cost and repayment risk',
                    ].map((step, i) => (
                      <div key={step} className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border-2 border-navy-300 border-t-navy-700 animate-spin flex-shrink-0"
                          style={{ animationDelay: `${i * 180}ms` }}
                        />
                        <span className="text-xs text-navy-400">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Results */}
          {phase === 'done' && layer3Result && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="flex flex-col gap-5"
            >
              {/* Geo signals */}
              <Card padding="sm">
                <div className="px-2 pt-2 pb-2">
                  <h3 className="font-heading font-semibold text-navy-900 text-sm mb-1">
                    Location signals
                  </h3>
                  <p className="text-xs text-navy-400 mb-4">
                    These details are based on your shop's pincode and area —
                    they help us estimate how many customers visit your type of shop.
                  </p>
                  <GeoPanel result={layer3Result} />
                </div>
              </Card>

              {/* Geo score summary */}
              <Card>
                <div className="flex items-center gap-4">
                  <ScoreRing score={layer3Result.overallGeoScore} size={72} strokeWidth={7} />
                  <div className="flex-1">
                    <p className="font-heading font-semibold text-navy-900 text-sm">
                      Location score: {Math.round(layer3Result.overallGeoScore * 100)} / 100
                    </p>
                    <p className="text-xs text-navy-500 mt-1 leading-relaxed">
                      Based on how busy your area is, your road visibility, and whether your
                      estimated rent is affordable for your income level.
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex justify-end">
                  <Button
                    size="md"
                    onClick={() =>
                      navigate('/assess/score', {
                        state: {
                          ...state,
                          layer3Result,
                          layer4Result,
                        },
                      })
                    }
                  >
                    View final score
                    <ArrowRight size={15} />
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
