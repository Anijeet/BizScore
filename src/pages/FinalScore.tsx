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
  layer1Result?: Layer1Result
  layer2Result?: Layer2Result
  layer3Result?: Layer3Result
  layer4Result?: Layer4Result
}

// ─── What happens next steps ──────────────────────────────────────────────────

const NEXT_STEPS = [
  {
    step: '1',
    title: 'Application received',
    desc: 'Poonawalla Fincorp has received your application and it is being reviewed by our team.',
  },
  {
    step: '2',
    title: 'Initial assessment',
    desc: 'Our system will process your shop details and photos within 24 hours.',
  },
  {
    step: '3',
    title: 'Loan officer contact',
    desc: 'A loan officer may call you within 2–3 working days if additional information is needed.',
  },
  {
    step: '4',
    title: 'Decision',
    desc: 'After an officer reviews your file, you will get updates by SMS on the number you registered. Any score or loan estimate is shared only after approval.',
  },
]

export default function FinalScorePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = (location.state ?? {}) as LocationState

  const { businessName, businessType, pincode, address, phone,
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
      officerStatus: 'pending_review',
      layer1Result,
      layer2Result,
      layer3Result,
      layer4Result,
    })
  }, [layer1Result, layer2Result, layer3Result, layer4Result, businessName, businessType, pincode, address, phone])

  function copyRefId() {
    navigator.clipboard.writeText(refId).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ─── Missing state guard ────────────────────────────────────────────────────

  if (!layer4Result || !layer2Result || !layer3Result) {
    return (
      <div className="container-page py-16 max-w-xl mx-auto text-center flex flex-col items-center gap-5">
        <AlertTriangle size={32} className="text-amber-500" />
        <h2 className="font-heading font-semibold text-navy-900 text-xl">
          Assessment incomplete
        </h2>
        <p className="text-navy-500 text-sm">
          Please complete all steps before viewing this page.
        </p>
        <Button onClick={() => navigate('/assess')}>Restart assessment</Button>
      </div>
    )
  }

  // ─── Submission success screen ──────────────────────────────────────────────

  return (
    <div className="container-page py-8">
      <div className="max-w-xl mx-auto flex flex-col gap-6">

        {/* Mock data banner */}
        <MockDataBanner />

        {/* Success card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex flex-col items-center text-center gap-4">
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
              <h1 className="font-heading font-semibold text-xl text-emerald-800">
                Application submitted!
              </h1>
              <p className="text-emerald-700 text-sm mt-1">
                Your application has been sent to <strong>Poonawalla Fincorp</strong>.
              </p>
            </div>

            {/* Business name */}
            {businessName && (
              <div className="bg-white rounded-lg border border-emerald-200 px-4 py-2.5 w-full">
                <p className="text-xs text-navy-400 mb-0.5">Business name</p>
                <p className="font-heading font-semibold text-navy-900 text-sm">{businessName}</p>
              </div>
            )}

            {/* Reference ID */}
            <div className="bg-white rounded-xl border-2 border-emerald-300 px-5 py-4 w-full">
              <p className="text-xs text-navy-400 mb-1.5">Your reference number</p>
              <div className="flex items-center justify-center gap-2">
                <span className="font-mono font-bold text-2xl text-navy-900 tracking-widest">
                  {refId || '...'}
                </span>
                <button
                  onClick={copyRefId}
                  className="p-1.5 rounded-lg bg-surface-100 hover:bg-surface-200 transition-colors"
                  title="Copy reference ID"
                >
                  {copied
                    ? <Check size={14} className="text-emerald-600" />
                    : <Copy size={14} className="text-navy-500" />
                  }
                </button>
              </div>
              <p className="text-xs text-navy-400 mt-2">
                Save this number — you may need it when speaking to our team.
              </p>
            </div>
          </div>
        </motion.div>

        {/* What happens next */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white border border-surface-200 rounded-xl p-5"
        >
          <h2 className="font-heading font-semibold text-navy-900 text-sm mb-4">
            What happens next?
          </h2>
          <div className="flex flex-col gap-4">
            {NEXT_STEPS.map((s, i) => (
              <div key={s.step} className="flex gap-3">
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div className="w-6 h-6 rounded-full bg-navy-800 text-white flex items-center justify-center text-xs font-bold">
                    {s.step}
                  </div>
                  {i < NEXT_STEPS.length - 1 && (
                    <div className="w-px flex-1 bg-surface-200 min-h-[16px]" />
                  )}
                </div>
                <div className="pb-3">
                  <p className="text-sm font-medium text-navy-900">{s.title}</p>
                  <p className="text-xs text-navy-500 mt-0.5 leading-relaxed">{s.desc}</p>
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
          className="bg-navy-50 border border-navy-200 rounded-xl px-5 py-4"
        >
          <p className="text-xs font-semibold text-navy-800 mb-1">Need help?</p>
          <p className="text-xs text-navy-600 leading-relaxed">
            If you have questions about your application, call Poonawalla Fincorp customer support
            or visit your nearest branch with your reference number{' '}
            <span className="font-mono font-semibold text-navy-800">{refId}</span>.
          </p>
        </motion.div>

        {/* Actions */}
        <div className="flex justify-center">
          <Button
            variant="secondary"
            onClick={() => navigate('/assess')}
          >
            <RotateCcw size={14} />
            Submit another application
          </Button>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          <p className="text-xs font-semibold text-amber-800 mb-1">Important notice</p>
          <p className="text-xs text-amber-700 leading-relaxed">
            This is a demo version — data is stored locally on this device only and not sent to any server.
            All results are mock data. Actual loan decisions are made by Poonawalla Fincorp after proper verification.
          </p>
        </div>

      </div>
    </div>
  )
}
