import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { MockDataBanner } from '@/components/ui/MockDataBanner'
import { runLayer3Analysis } from '@/services/geoApi'
import { runLayer4Voting } from '@/services/votingEngine'
import type { Layer3Result, Layer2Result, Layer1Result, Layer4Result } from '@/types'

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
  layer2Result?: Layer2Result
}

type Phase = 'analysing' | 'done'

export default function Layer3Page() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = (location.state ?? {}) as LocationState

  const pincode = state.pincode ?? '110001'
  const businessName = state.businessName ?? 'Unknown business'
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

      if (layer1Result) {
        const vote = runLayer4Voting(layer1Result, layer2Result!, geo)
        setLayer4Result(vote)
      }

      await new Promise((r) => setTimeout(r, 800))
      setPhase('done')
    }

    run()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!layer2Result) {
    return (
      <div className="container-page py-12 sm:py-16 max-w-md mx-auto text-center flex flex-col items-center gap-4 px-4">
        <AlertTriangle size={28} className="text-amber-500" />
        <h2 className="font-heading font-semibold text-navy-900 text-lg sm:text-xl">
          Previous step missing
        </h2>
        <p className="text-navy-500 text-sm leading-snug">
          Complete the flow from the start.
        </p>
        <Button onClick={() => navigate('/assess')} className="min-h-[48px] w-full max-w-xs justify-center">
          Start assessment
        </Button>
      </div>
    )
  }

  return (
    <div className="container-page py-6 sm:py-8">
      <div className="max-w-2xl mx-auto flex flex-col gap-4 sm:gap-5 px-1 sm:px-0">

        <MockDataBanner />

        <div className="rounded-xl border-l-4 border-l-emerald-600 border border-surface-200 bg-emerald-50/40 px-3 py-2.5 sm:px-4">
          <p className="text-xs font-bold text-navy-900">Step 3 · Area from PIN</p>
          <p className="text-[11px] text-navy-700 mt-0.5 leading-snug">
            Uses the pincode you entered earlier — we do not ask for GPS again here. Officer-only signals in this demo build.
          </p>
        </div>

        <div>
          <p className="text-label mb-1">Step 3 of 4</p>
          <h1 className="font-heading font-semibold text-lg sm:text-xl lg:text-2xl text-navy-900 leading-tight">
            Checking your area
          </h1>
          <p className="text-navy-500 mt-1 text-xs sm:text-sm leading-snug">
            Pincode-based models (not a second location prompt).
          </p>
        </div>

        <div className="flex items-center gap-3 bg-surface-50 rounded-xl border border-surface-200 px-3 py-2.5 sm:px-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-navy-900 truncate">{businessName}</p>
            <p className="text-xs text-navy-400 mt-0.5">
              Pincode: {pincode}
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
            >
              <Card>
                <div className="flex flex-col items-center gap-5 py-8">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-2 border-navy-100 animate-ping" />
                    <div className="relative w-16 h-16 rounded-full bg-navy-50 flex items-center justify-center">
                      <MapPin size={24} className="text-navy-700" />
                    </div>
                  </div>
                  <div className="text-center px-2">
                    <p className="font-heading font-semibold text-navy-900 text-sm">
                      Running area models…
                    </p>
                    <p className="text-[11px] text-navy-500 mt-1 max-w-xs mx-auto leading-snug">
                      From your submitted PIN — not reading device GPS again.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 w-full max-w-xs">
                    {[
                      'Pincode',
                      'Area / roads',
                      'Loan file',
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

          {phase === 'done' && layer3Result && (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <Card>
                <div className="flex flex-col items-center text-center gap-4 py-6 px-2">
                  {layer4Result ? (
                    <>
                      <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center border border-emerald-200">
                        <CheckCircle2 size={28} className="text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-heading font-semibold text-navy-900 text-base">
                          Location done
                        </p>
                        <p className="text-xs sm:text-sm text-navy-500 mt-2 leading-snug max-w-md mx-auto">
                          Next: submit — you get a reference ID. Scores stay with the officer until approval.
                        </p>
                      </div>
                      <div className="w-full flex pt-2">
                        <Button
                          size="md"
                          className="min-h-[48px] w-full sm:w-auto sm:ml-auto justify-center"
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
                          Submit
                          <ArrowRight size={15} />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={28} className="text-amber-500" />
                      <p className="text-sm text-navy-600 leading-snug px-2">
                        Could not finish — restart from the assessment.
                      </p>
                      <Button size="md" className="min-h-[48px] justify-center" onClick={() => navigate('/assess')}>
                        Start again
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
