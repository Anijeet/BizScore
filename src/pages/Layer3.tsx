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
      <div className="container-page py-16 max-w-xl mx-auto text-center flex flex-col items-center gap-5">
        <AlertTriangle size={32} className="text-amber-500" />
        <h2 className="font-heading font-semibold text-navy-900 text-xl">
          Missing previous step
        </h2>
        <p className="text-navy-500 text-sm">
          Please complete the assessment from the beginning.
        </p>
        <Button onClick={() => navigate('/assess')}>Start assessment</Button>
      </div>
    )
  }

  return (
    <div className="container-page py-8">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">

        <MockDataBanner />

        <div className="bg-navy-50 border border-navy-200 rounded-lg px-4 py-3">
          <p className="text-xs font-semibold text-navy-800 mb-0.5">Step 3 of 4 — Location check</p>
          <p className="text-xs text-navy-600 leading-relaxed">
            We verify your pincode and area in the background. Location scores and maps are only shown to the bank officer, not on this screen.
          </p>
        </div>

        <div>
          <p className="text-label mb-1.5">Step 3 of 4</p>
          <h1 className="font-heading font-semibold text-xl lg:text-2xl text-navy-900">
            Checking your location
          </h1>
          <p className="text-navy-500 mt-1.5 text-sm leading-relaxed">
            Please wait while we process your address and pincode.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-surface-50 rounded-lg border border-surface-200 px-4 py-3">
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
                  <div className="text-center">
                    <p className="font-heading font-semibold text-navy-900 text-sm">
                      Checking your area…
                    </p>
                    <p className="text-xs text-navy-400 mt-1 max-w-xs mx-auto">
                      This step runs in the background. You do not need to see technical details here.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 w-full max-w-xs">
                    {[
                      'Looking up your pincode',
                      'Checking area and road information',
                      'Preparing your file for the loan team',
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
                          Location check complete
                        </p>
                        <p className="text-sm text-navy-500 mt-2 leading-relaxed max-w-md mx-auto">
                          Your application file is ready to send to Poonawalla Fincorp.
                          Tap below to submit — you will get a reference number. Any score or loan estimate is shown only to the bank officer until they approve your case.
                        </p>
                      </div>
                      <div className="w-full flex justify-end pt-2">
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
                          Submit application
                          <ArrowRight size={15} />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={28} className="text-amber-500" />
                      <p className="text-sm text-navy-600">
                        We could not finish this step. Please go back and complete business details from the start.
                      </p>
                      <Button size="md" onClick={() => navigate('/assess')}>
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
