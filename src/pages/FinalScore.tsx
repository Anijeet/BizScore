import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle2, AlertTriangle, RotateCcw, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { MockDataBanner } from '@/components/ui/MockDataBanner'
import { saveApplication, generateReferenceId } from '@/services/storage'
import type { Layer4Result, Layer3Result, Layer2Result, Layer1Result } from '@/types'

interface LocationState {
  businessName?: string
  businessType?: string
  pincode?: string
  address?: string
  phone?: string
  latitude?: number
  longitude?: number
  layer1Result?: Layer1Result
  layer2Result?: Layer2Result
  layer3Result?: Layer3Result
  layer4Result?: Layer4Result
}

// ─── What happens next steps ──────────────────────────────────────────────────

const NEXT_STEPS = [
  {
    step: '1',
    title: 'Received',
    desc: 'Team has your application.',
  },
  {
    step: '2',
    title: 'Processing',
    desc: 'Details & photos — usually within 24h.',
  },
  {
    step: '3',
    title: 'Possible call',
    desc: 'Officer may ring in 2–3 working days if needed.',
  },
  {
    step: '4',
    title: 'Outcome',
    desc: 'SMS updates on your number; amounts after approval only.',
  },
]

export default function FinalScorePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = (location.state ?? {}) as LocationState

  const { businessName, businessType, pincode, address, phone,
          latitude, longitude,
          layer1Result, layer2Result, layer3Result, layer4Result } = state

  const [refId, setRefId] = useState('')
  const [copied, setCopied] = useState(false)
  const saved = useRef(false)

  useEffect(() => {
    if (!layer4Result || !layer2Result || !layer3Result || !layer1Result) return
    if (saved.current) return
    saved.current = true

    const id = generateReferenceId()
    setRefId(id)

    saveApplication({
      id,
      submittedAt: new Date().toISOString(),
      businessName: businessName ?? 'Unknown',
      businessType: businessType ?? '',
      pincode: pincode ?? '',
      address: address ?? '',
      phone: phone ?? '',
      ...(typeof latitude === 'number' && typeof longitude === 'number'
        ? { latitude, longitude }
        : {}),
      officerStatus: 'pending_review',
      layer1Result,
      layer2Result,
      layer3Result,
      layer4Result,
    })
  }, [layer1Result, layer2Result, layer3Result, layer4Result, businessName, businessType, pincode, address, phone, latitude, longitude])

  function copyRefId() {
    navigator.clipboard.writeText(refId).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ─── Missing state guard ────────────────────────────────────────────────────

  if (!layer4Result || !layer2Result || !layer3Result) {
    return (
      <div className="container-page py-12 sm:py-16 max-w-md mx-auto text-center flex flex-col items-center gap-4 px-4">
        <AlertTriangle size={28} className="text-amber-500" />
        <h2 className="font-heading font-semibold text-navy-900 text-lg sm:text-xl">
          Not finished yet
        </h2>
        <p className="text-navy-500 text-sm leading-snug">
          Finish all steps to see this screen.
        </p>
        <Button onClick={() => navigate('/assess')} className="min-h-[48px] w-full max-w-xs justify-center">
          Restart
        </Button>
      </div>
    )
  }

  // ─── Submission success screen ──────────────────────────────────────────────

  return (
    <div className="container-page py-6 sm:py-8">
      <div className="max-w-xl mx-auto flex flex-col gap-4 sm:gap-5 px-1 sm:px-0">

        {/* Mock data banner */}
        <MockDataBanner />

        {/* Success card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 sm:p-6 flex flex-col items-center text-center gap-3 sm:gap-4">
            {/* Animated checkmark */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
              className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center"
            >
              <CheckCircle2 size={32} className="text-emerald-600" />
            </motion.div>

            <div>
              <h1 className="font-heading font-semibold text-lg sm:text-xl text-emerald-800 leading-tight">
                Submitted
              </h1>
              <p className="text-emerald-800 text-xs sm:text-sm mt-1 leading-snug">
                Sent to <strong>Poonawalla Fincorp</strong>.
              </p>
            </div>

            {/* Business name */}
            {businessName && (
              <div className="bg-white rounded-xl border border-emerald-200 px-3 py-2 w-full text-left">
                <p className="text-[11px] text-navy-500 mb-0.5">Business</p>
                <p className="font-heading font-semibold text-navy-900 text-sm truncate">{businessName}</p>
              </div>
            )}

            {/* Reference ID */}
            <div className="bg-white rounded-xl border-2 border-emerald-300 px-4 py-3 sm:px-5 sm:py-4 w-full">
              <p className="text-[11px] text-navy-500 mb-1">Reference</p>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <span className="font-mono font-bold text-xl sm:text-2xl text-navy-900 tracking-widest break-all text-center">
                  {refId || '...'}
                </span>
                <button
                  onClick={copyRefId}
                  className="p-2.5 min-h-[44px] min-w-[44px] rounded-lg bg-surface-100 hover:bg-surface-200 transition-colors inline-flex items-center justify-center"
                  title="Copy reference ID"
                  type="button"
                >
                  {copied
                    ? <Check size={14} className="text-emerald-600" />
                    : <Copy size={14} className="text-navy-500" />
                  }
                </button>
              </div>
              <p className="text-[11px] text-navy-500 mt-2 leading-snug">
                Keep this for calls or branch visits.
              </p>
            </div>
          </div>
        </motion.div>

        {/* What happens next */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white border border-surface-200 rounded-xl p-4 sm:p-5"
        >
          <h2 className="font-heading font-semibold text-navy-900 text-sm mb-3">
            Next steps
          </h2>
          <div className="flex flex-col gap-3">
            {NEXT_STEPS.map((s, i) => (
              <div key={s.step} className="flex gap-2.5">
                <div className="flex flex-col items-center gap-0.5 flex-shrink-0 pt-0.5">
                  <div className="w-6 h-6 rounded-full bg-navy-800 text-white flex items-center justify-center text-[11px] font-bold">
                    {s.step}
                  </div>
                  {i < NEXT_STEPS.length - 1 && (
                    <div className="w-px flex-1 bg-surface-200 min-h-[12px]" />
                  )}
                </div>
                <div className="pb-2 min-w-0">
                  <p className="text-sm font-semibold text-navy-900">{s.title}</p>
                  <p className="text-[11px] text-navy-500 mt-0.5 leading-snug">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Contact info */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-navy-50 border border-navy-200 rounded-xl px-4 py-3 sm:px-5 sm:py-4"
        >
          <p className="text-xs font-bold text-navy-900 mb-0.5">Help</p>
          <p className="text-[11px] text-navy-600 leading-snug">
            Call support or visit a branch with ref{' '}
            <span className="font-mono font-semibold text-navy-800 break-all">{refId}</span>.
          </p>
        </motion.div>

        {/* Actions */}
        <div className="flex justify-stretch sm:justify-center">
          <Button
            variant="secondary"
            onClick={() => navigate('/assess')}
            className="min-h-[48px] w-full sm:w-auto justify-center"
          >
            <RotateCcw size={14} />
            Another application
          </Button>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 sm:px-4">
          <p className="text-xs font-bold text-amber-900 mb-0.5">Demo</p>
          <p className="text-[11px] text-amber-800 leading-snug">
            Local-only mock data — not a real loan decision.
          </p>
        </div>

      </div>
    </div>
  )
}
