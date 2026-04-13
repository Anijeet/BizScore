import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Phone, ArrowRight, Info } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { MockDataBanner } from '@/components/ui/MockDataBanner'
import { BusinessCheck } from '@/components/verification/BusinessCheck'
import { GSTLookup } from '@/components/verification/GSTLookup'
import { ProductExistence } from '@/components/verification/ProductExistence'
import { Layer1Summary } from '@/components/verification/Layer1Summary'
import { verifyBusiness, verifyGST, checkProductExistence } from '@/services/api'
import { GuidedCameraCapture } from '@/components/GuidedCameraCapture'
import { BUSINESS_TYPES } from '@/types'
import type {
  BusinessFormData,
  BusinessCheckResult,
  GSTResult,
  ProductExistenceResult,
  Layer1Result,
  VerificationStatus,
} from '@/types'

// ─── OTP step ─────────────────────────────────────────────────────────────────

type Step = 'otp' | 'form' | 'verifying' | 'done'

export default function AssessmentPage() {
  const [step, setStep] = useState<Step>('otp')
  const navigate = useNavigate()

  // OTP state
  const [phone, setPhone] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpError, setOtpError] = useState('')

  // Form state
  const [form, setForm] = useState<BusinessFormData>({
    businessName: '',
    address: '',
    pincode: '',
    phone: '',
    businessType: '',
    gstin: '',
  })

  const TOTAL_PHOTOS = 5
  const [images, setImages] = useState<(File | null)[]>(Array(TOTAL_PHOTOS).fill(null))
  const [imagePreviews, setImagePreviews] = useState<(string | null)[]>(Array(TOTAL_PHOTOS).fill(null))

  // Verification state
  const [businessStatus, setBusinessStatus] = useState<VerificationStatus>('idle')
  const [gstStatus, setGstStatus] = useState<VerificationStatus>('idle')
  const [productStatus, setProductStatus] = useState<VerificationStatus>('idle')
  const [businessResult, setBusinessResult] = useState<BusinessCheckResult | null>(null)
  const [gstResult, setGstResult] = useState<GSTResult | null>(null)
  const [productResult, setProductResult] = useState<ProductExistenceResult | null>(null)
  const [layer1Result, setLayer1Result] = useState<Layer1Result | null>(null)

  // ─── OTP handlers ─────────────────────────────────────────────────────────

  async function handleSendOtp() {
    if (phone.length < 10) {
      setOtpError('Enter a valid 10-digit mobile number.')
      return
    }
    setOtpError('')
    setOtpLoading(true)

    // TODO (production): Replace with real OTP API.
    // Route through FastAPI: POST /api/auth/send-otp { phone }
    // Use services like Twilio, MSG91, or Fast2SMS.
    await new Promise((r) => setTimeout(r, 1200))
    setOtpSent(true)
    setOtpLoading(false)
  }

  async function handleVerifyOtp() {
    if (otp.length < 4) {
      setOtpError('Enter the OTP sent to your number.')
      return
    }
    setOtpError('')
    setOtpLoading(true)

    // TODO (production): Replace with real OTP verification.
    // Route through FastAPI: POST /api/auth/verify-otp { phone, otp }
    // Mock: any 4+ digit OTP passes.
    await new Promise((r) => setTimeout(r, 900))
    setForm((f) => ({ ...f, phone }))
    setStep('form')
    setOtpLoading(false)
  }

  // ─── Image handlers ────────────────────────────────────────────────────────

  function handleCapture(index: number, file: File, preview: string) {
    setImages((prev) => {
      const next = [...prev]
      next[index] = file
      return next
    })
    setImagePreviews((prev) => {
      const next = [...prev]
      next[index] = preview
      return next
    })
  }

  function handleRemove(index: number) {
    setImages((prev) => {
      const next = [...prev]
      next[index] = null
      return next
    })
    setImagePreviews((prev) => {
      const next = [...prev]
      next[index] = null
      return next
    })
  }

  // ─── Verification runner ───────────────────────────────────────────────────

  async function runLayer1Verification() {
    if (!form.businessName || !form.address || !form.pincode || !form.businessType) return

    setStep('verifying')

    // Run all three checks. They run sequentially so the UI reveals results
    // one at a time — this looks better than parallel and matches the layered
    // architecture we described to judges.

    // 1. Business check
    setBusinessStatus('loading')
    const biz = await verifyBusiness(form)
    setBusinessResult(biz)
    setBusinessStatus(biz.exists ? 'success' : 'failed')

    // 2. GST check
    setGstStatus('loading')
    const gst = await verifyGST(form.gstin)
    setGstResult(gst)
    setGstStatus(
      gst.status === 'not_provided' ? 'success' :
        gst.verified ? 'success' : 'failed'
    )

    // 3. Product existence (only if images uploaded)
    setProductStatus(images.length > 0 ? 'loading' : 'idle')
    const capturedImages = images.filter((f): f is File => f !== null)
    let product: ProductExistenceResult | null = null
    if (images.length > 0) {
      product = await checkProductExistence(form.businessType, capturedImages)
      setProductResult(product)
      setProductStatus(product.matches ? 'success' : 'warning')
    }

    // Compute overall credibility score
    // Weights: business 40%, GST 25%, product 35%
    const bizScore = biz.score
    const gstScore = gst.score
    const prodScore = product?.confidenceScore ?? 0.5 // neutral if no images

    const overall =
      bizScore * 0.40 +
      gstScore * 0.25 +
      prodScore * 0.35

    const recommendation: Layer1Result['recommendation'] =
      overall >= 0.65 ? 'proceed' :
        overall >= 0.40 ? 'review' :
          'reject'

    setLayer1Result({
      businessCheck: biz,
      gst,
      productExistence: product ?? {
        matches: false,
        detectedCategories: [],
        claimedCategory: form.businessType,
        confidenceScore: 0.5,
        notes: 'No images provided.',
      },
      overallCredibilityScore: overall,
      recommendation,
    })

    setStep('done')
  }

  // ─── Form validation ───────────────────────────────────────────────────────

  const allPhotosCaptured = images.every(Boolean)

  const formValid =
    form.businessName.trim().length > 2 &&
    form.address.trim().length > 4 &&
    form.pincode.trim().length === 6 &&
    form.businessType !== '' &&
    allPhotosCaptured

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="container-page py-8">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">

        {/* Mock data banner */}
        <MockDataBanner showOtpHint />

        {/* Step progress */}
        <div className="flex items-center gap-1 text-xs">
          {[
            { label: 'Step 1', title: 'Verify identity', active: step === 'otp' || step === 'form' || step === 'verifying' || step === 'done' },
            { label: 'Step 2', title: 'Fill shop details', active: step === 'form' || step === 'verifying' || step === 'done' },
            { label: 'Step 3', title: 'Checking...', active: step === 'verifying' || step === 'done' },
          ].map((s, i) => (
            <div key={s.label} className="flex items-center gap-1">
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-colors ${s.active ? 'bg-navy-800 text-white' : 'bg-surface-100 text-navy-400'
                }`}>
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${s.active ? 'bg-white/20' : 'bg-surface-200'
                  }`}>{i + 1}</span>
                <span className="hidden sm:inline font-medium">{s.title}</span>
              </div>
              {i < 2 && <span className="text-surface-300">›</span>}
            </div>
          ))}
        </div>

        {/* Page header */}
        <div>
          <p className="text-label mb-1.5">Step 1 of 4 — Identity check</p>
          <h1 className="font-heading font-semibold text-xl lg:text-2xl text-navy-900">
            Verify your mobile number
          </h1>
          <p className="text-navy-500 mt-1.5 text-sm leading-relaxed">
            We first check who you are, then verify that your shop is real.
            This step takes less than a minute.
          </p>
        </div>

        {/* ── Step 1: OTP ── */}
        <AnimatePresence mode="wait">
          {step === 'otp' && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <div className="flex flex-col gap-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-navy-50 flex items-center justify-center">
                      <Phone size={18} className="text-navy-700" />
                    </div>
                    <div>
                      <h2 className="font-heading font-semibold text-navy-900 text-sm">
                        Enter your mobile number
                      </h2>
                      <p className="text-xs text-navy-400 mt-0.5">
                        We will send a 4-digit code to your mobile to confirm it is you.
                      </p>
                    </div>
                  </div>

                  {/* Demo hint */}
                  <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5">
                    <Info size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700 leading-relaxed">
                      <strong>Demo mode:</strong> Enter any mobile number and use OTP{' '}
                      <span className="font-mono font-bold bg-blue-100 px-1.5 py-0.5 rounded text-blue-800">1234</span>{' '}
                      to continue.
                    </p>
                  </div>

                  <div className="divider" />

                  <div className="flex flex-col gap-4">
                    <Input
                      label="Mobile number"
                      type="tel"
                      placeholder="10-digit number"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      disabled={otpSent}
                      error={!otpSent ? otpError : undefined}
                    />

                    {!otpSent && (
                      <Button
                        onClick={handleSendOtp}
                        loading={otpLoading}
                        disabled={phone.length < 10}
                      >
                        Send OTP
                      </Button>
                    )}

                    {otpSent && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col gap-4"
                      >
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                          <p className="text-xs text-emerald-700 font-medium mb-0.5">
                            OTP sent to +91 {phone}
                          </p>
                          <p className="text-xs text-emerald-600">
                            Demo mode: use code{' '}
                            <span className="font-mono font-bold bg-emerald-100 px-1.5 py-0.5 rounded">1234</span>
                          </p>
                        </div>

                        <Input
                          label="Enter OTP"
                          type="text"
                          inputMode="numeric"
                          placeholder="4-digit code"
                          maxLength={6}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                          error={otpError}
                        />

                        <div className="flex gap-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setOtpSent(false)
                              setOtp('')
                            }}
                          >
                            Change number
                          </Button>
                          <Button
                            onClick={handleVerifyOtp}
                            loading={otpLoading}
                            disabled={otp.length < 4}
                          >
                            Verify and continue
                            <ArrowRight size={15} />
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* ── Step 2: Business form ── */}
          {step === 'form' && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-5"
            >
              {/* Step context */}
              <div className="bg-navy-50 border border-navy-200 rounded-lg px-4 py-3">
                <p className="text-xs font-semibold text-navy-800 mb-0.5">Step 2 — Your shop details</p>
                <p className="text-xs text-navy-600 leading-relaxed">
                  Fill in your shop name, address, and the type of shop you run.
                  We use this to check if your business appears on Google Maps and GST records.
                </p>
              </div>

              {/* Business details */}
              <Card>
                <div className="flex flex-col gap-5">
                  <div>
                    <h2 className="font-heading font-semibold text-navy-900 text-sm">
                      Shop information
                    </h2>
                    <p className="text-xs text-navy-400 mt-1">
                      Enter the details exactly as they appear on your shop sign or business registration.
                    </p>
                  </div>
                  <div className="divider" />

                  <div className="flex flex-col gap-4">
                    <Input
                      label="Business name"
                      placeholder="As it appears on your signboard"
                      value={form.businessName}
                      onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
                    />

                    <Select
                      label="Business type"
                      placeholder="Select type"
                      options={BUSINESS_TYPES as unknown as { value: string; label: string }[]}
                      value={form.businessType}
                      onChange={(e) => setForm((f) => ({ ...f, businessType: e.target.value }))}
                    />

                    <Input
                      label="Address"
                      placeholder="Street, locality, landmark"
                      value={form.address}
                      onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                    />

                    <Input
                      label="Pincode"
                      type="text"
                      inputMode="numeric"
                      placeholder="6-digit pincode"
                      maxLength={6}
                      value={form.pincode}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, pincode: e.target.value.replace(/\D/g, '') }))
                      }
                    />

                    <Input
                      label="GST number (GSTIN)"
                      optional
                      placeholder="15-character GST number"
                      hint="Optional — but adding your GST number gives you a higher trust score."
                      value={form.gstin}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, gstin: e.target.value.toUpperCase() }))
                      }
                    />
                  </div>
                </div>
              </Card>

              {/* Step 3 context */}
              <div className="bg-navy-50 border border-navy-200 rounded-lg px-4 py-3">
                <p className="text-xs font-semibold text-navy-800 mb-0.5">Step 3 — Take shop photos</p>
                <p className="text-xs text-navy-600 leading-relaxed">
                  Take 3 to 5 photos of your shop right now using your phone camera.
                  Include: shelves, counter, shop entrance. Our AI will scan these to check your stock and shop quality.
                </p>
              </div>

              {/* Image upload */}
<Card>
  <div className="flex flex-col gap-5">
    <div>
      <h2 className="font-heading font-semibold text-navy-900 text-sm">
        Shop photos
      </h2>
      <p className="text-xs text-navy-400 mt-1">
        Take 5 photos using your camera right now — no gallery uploads allowed.
        Each photo has specific instructions shown before you capture.
      </p>
    </div>

    <div className="divider" />

    <GuidedCameraCapture
      images={images}
      previews={imagePreviews}
      onCapture={handleCapture}
      onRemove={handleRemove}
    />
  </div>
</Card>

              {/* Submit */}
              <div className="flex flex-col gap-3">
              {!formValid && (
  <p className="text-xs text-navy-400 text-center">
    {!allPhotosCaptured
      ? `${images.filter(Boolean).length} of 5 photos taken — capture all 5 to continue.`
      : 'Fill in shop name, type, address, and pincode to continue.'}
  </p>
)}
<Button
  size="lg"
  disabled={!formValid}           // now includes allPhotosCaptured
  onClick={runLayer1Verification}
>
  Check my business
  <ArrowRight size={16} />
</Button>
              </div>
            </motion.div>
          )}

          {/* ── Step 3 & 4: Verifying / Done ── */}
          {(step === 'verifying' || step === 'done') && (
            <motion.div
              key="verifying"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-4"
            >
              {/* What's happening */}
              <div className="bg-navy-50 border border-navy-200 rounded-lg px-4 py-3">
                <p className="text-xs font-semibold text-navy-800 mb-0.5">
                  {step === 'verifying' ? 'Checking your business...' : 'Step 4 — Verification complete'}
                </p>
                <p className="text-xs text-navy-600 leading-relaxed">
                  {step === 'verifying'
                    ? 'We are running 3 checks: confirming your business exists, looking up GST records, and scanning your shop photos for what you sell.'
                    : 'All checks are done. Review your results below and proceed to the next step.'}
                </p>
              </div>

              {/* Verification checks */}
              <Card>
                <div className="flex flex-col gap-6">
                  <BusinessCheck status={businessStatus} result={businessResult} />

                  {businessStatus !== 'idle' && (
                    <>
                      <div className="divider" />
                      <GSTLookup status={gstStatus} result={gstResult} />
                    </>
                  )}

                  {gstStatus !== 'idle' && (
                    <>
                      <div className="divider" />
                      <ProductExistence
                        status={productStatus}
                        result={productResult}
                        imagesUploaded={images.length}
                      />
                    </>
                  )}
                </div>
              </Card>

              {/* Summary */}
              {step === 'done' && layer1Result && (
                <Layer1Summary
                  result={layer1Result}
                  onProceed={() => {
                    navigate('/assess/layer2', {
                      state: {
                        images,
                        businessType: form.businessType,
                        businessName: form.businessName,
                        layer1Score: layer1Result?.overallCredibilityScore ?? 0.7,
                        layer1Result: layer1Result,
                        pincode: form.pincode,
                        address: form.address,
                        phone: form.phone,
                      },
                    })
                  }}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
