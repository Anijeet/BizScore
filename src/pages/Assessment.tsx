import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, Phone, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { BusinessCheck } from '@/components/verification/BusinessCheck'
import { GSTLookup } from '@/components/verification/GSTLookup'
import { ProductExistence } from '@/components/verification/ProductExistence'
import { Layer1Summary } from '@/components/verification/Layer1Summary'
import { verifyBusiness, verifyGST, checkProductExistence } from '@/services/api'
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
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return

    const remaining = 5 - images.length
    const toAdd = files.slice(0, remaining)

    setImages((prev) => [...prev, ...toAdd])

    toAdd.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })

    // Reset input so same file can be re-selected if removed
    e.target.value = ''
  }

  function removeImage(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
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
    let product: ProductExistenceResult | null = null
    if (images.length > 0) {
      product = await checkProductExistence(form.businessType, images)
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

  const formValid =
    form.businessName.trim().length > 2 &&
    form.address.trim().length > 4 &&
    form.pincode.trim().length === 6 &&
    form.businessType !== ''

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="container-page py-10">
      <div className="max-w-2xl mx-auto flex flex-col gap-8">

        {/* Page header */}
        <div>
          <p className="text-label mb-2">Layer 1 — Business identity</p>
          <h1 className="font-heading font-semibold text-2xl text-navy-900">
            Business verification
          </h1>
          <p className="text-navy-500 mt-1.5 text-sm leading-relaxed">
            We verify your business exists, check GST status, and confirm that your store
            sells what it claims to. This takes under 30 seconds.
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
                        Verify your mobile number
                      </h2>
                      <p className="text-xs text-navy-400 mt-0.5">
                        We send a one-time code to confirm your identity before proceeding.
                      </p>
                    </div>
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
                          <p className="text-xs text-emerald-700">
                            OTP sent to +91 {phone}. Enter it below to continue.
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
              {/* Business details */}
              <Card>
                <div className="flex flex-col gap-5">
                  <h2 className="font-heading font-semibold text-navy-900 text-sm">
                    Business details
                  </h2>
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
                      label="GSTIN"
                      optional
                      placeholder="15-character GST number"
                      hint="Providing a valid GSTIN increases your credibility score."
                      value={form.gstin}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, gstin: e.target.value.toUpperCase() }))
                      }
                    />
                  </div>
                </div>
              </Card>

              {/* Image upload */}
              <Card>
                <div className="flex flex-col gap-5">
                  <div>
                    <h2 className="font-heading font-semibold text-navy-900 text-sm">
                      Store images
                    </h2>
                    <p className="text-xs text-navy-400 mt-1">
                      Upload 3–5 photos taken directly from your phone camera. Do not upload from
                      WhatsApp or gallery — this strips the location data we need.
                    </p>
                  </div>

                  <div className="divider" />

                  {/* Upload zone */}
                  {images.length < 5 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="
                        w-full border-2 border-dashed border-surface-200 rounded-lg
                        p-6 flex flex-col items-center gap-2
                        hover:border-navy-300 hover:bg-surface-50
                        transition-colors duration-150 cursor-pointer
                      "
                    >
                      <div className="w-10 h-10 rounded-full bg-surface-100 flex items-center justify-center">
                        <Upload size={18} className="text-navy-500" />
                      </div>
                      <span className="text-sm text-navy-600 font-medium">
                        Tap to upload photos
                      </span>
                      <span className="text-xs text-navy-400">
                        {images.length} of 5 uploaded · Shelves, counter, storefront
                      </span>
                    </button>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    capture="environment"
                    className="hidden"
                    onChange={handleImageChange}
                  />

                  {/* Previews */}
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {imagePreviews.map((src, i) => (
                        <div key={i} className="relative aspect-square group">
                          <img
                            src={src}
                            alt={`Store image ${i + 1}`}
                            className="w-full h-full object-cover rounded border border-surface-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(i)}
                            className="
                              absolute top-1 right-1 w-5 h-5 rounded-full
                              bg-navy-900/70 flex items-center justify-center
                              opacity-0 group-hover:opacity-100 transition-opacity
                            "
                          >
                            <X size={11} className="text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>

              {/* Submit */}
              <div className="flex justify-end">
                <Button
                  size="lg"
                  disabled={!formValid}
                  onClick={runLayer1Verification}
                >
                  Run identity verification
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
                    // TODO: navigate to Layer 2 (image + geo analysis)
                    // navigate('/assess/layer2')
                    alert('Layer 2 — Image and geo analysis coming next.')
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
