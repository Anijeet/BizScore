import { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Camera,
  Store,
  Package,
  MapPin,
  QrCode,
  X,
  AlertCircle,
  CheckCircle2,
  FlipHorizontal,
  ZoomIn,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

// ─── Step definitions ─────────────────────────────────────────────────────────

interface PhotoStep {
  title: string
  subtitle: string
  description: string
  Icon: React.ElementType
  tip: string
  color: 'blue' | 'purple' | 'green' | 'orange'
  checklist: string[]
  overlayHint: string // Short hint shown as in-camera overlay
}

const PHOTO_STEPS: PhotoStep[] = [
  {
    title: 'Store front',
    subtitle: 'Shop name must be visible',
    description:
      'Stand in front of your store so the shop name on the signboard is clearly readable in the frame.',
    Icon: Store,
    tip: 'Step back 3–5 metres so the full signboard and entrance are visible.',
    color: 'blue',
    overlayHint: 'Frame the full storefront — signboard must be readable',
    checklist: [
      'Stand 3–5 metres away from the entrance',
      'Full signboard / shop name must be readable',
      'Include the door, windows, and front wall in the frame',
    ],
  },
  {
    title: 'Products inside — view 1',
    subtitle: 'Shelves or display counter',
    description:
      'Go inside and point the camera at your main product shelf or display counter.',
    Icon: Package,
    tip: 'Turn on store lights if needed. Keep your hand away from the products.',
    color: 'purple',
    overlayHint: 'Show shelves with products clearly visible',
    checklist: [
      'Stand inside the store facing the main shelf or counter',
      'Products on the shelf must be clearly visible',
      'Ensure good lighting — avoid dark or blurry frames',
    ],
  },
  {
    title: 'Products inside — view 2',
    subtitle: 'Different angle or section',
    description:
      'Move to a different section or angle of the store and take a second interior photo.',
    Icon: Package,
    tip: 'A wider shot showing more of the store works best here.',
    color: 'purple',
    overlayHint: 'Different angle — wider view of the store interior',
    checklist: [
      'Choose a different section or angle from view 1',
      'A wider shot showing the aisle or full interior is ideal',
      'Both shelves and floor should be visible',
    ],
  },
  {
    title: 'Road in front of store',
    subtitle: 'Street view for location',
    description:
      'Stand at the entrance facing outward and take a photo of the road or street in front of your store.',
    Icon: MapPin,
    tip: 'Include any visible road signs, buildings, or landmarks — this helps verify your location.',
    color: 'green',
    overlayHint: 'Capture the road & any nearby landmarks',
    checklist: [
      'Stand at the store entrance facing the road',
      'Capture the road or street clearly in frame',
      'Include nearby buildings, road signs, or landmarks if possible',
    ],
  },
  {
    title: 'UPI QR Code / Payment display',
    subtitle: 'Merchant ID verification',
    description:
      'Take a close-up photo of your UPI QR code or payment gateway display. The full QR must be in frame.',
    Icon: QrCode,
    tip: 'Hold the camera 20–30 cm away. Avoid glare, blur, or covering any part of the QR code.',
    color: 'orange',
    overlayHint: 'Move close — full QR code must fill the frame',
    checklist: [
      'Find your UPI QR code stand or payment display',
      'Hold the camera 20–30 cm away from the QR code',
      'The full QR code must be visible — no edges cut off',
      'Ensure there is no glare, blur, or reflection on the QR',
    ],
  },
]

// ─── Color map ────────────────────────────────────────────────────────────────

const COLOR_MAP = {
  blue:   { bg: 'bg-blue-50',    border: 'border-blue-200',    icon: 'text-blue-500'    },
  purple: { bg: 'bg-purple-50',  border: 'border-purple-200',  icon: 'text-purple-500'  },
  green:  { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'text-emerald-500' },
  orange: { bg: 'bg-orange-50',  border: 'border-orange-200',  icon: 'text-orange-500'  },
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface GuidedCameraCaptureProps {
  images: (File | null)[]
  previews: (string | null)[]
  onCapture: (index: number, file: File, preview: string) => void
  onRemove: (index: number) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function GuidedCameraCapture({
  images,
  previews,
  onCapture,
  onRemove,
}: GuidedCameraCaptureProps) {
  // Instruction sheet state
  const [activeStep, setActiveStep] = useState<number | null>(null)

  // Camera modal state
  const [cameraOpen, setCameraOpen]   = useState(false)
  const [cameraIndex, setCameraIndex] = useState<number | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [cameraReady, setCameraReady] = useState(false)
  const [facingMode, setFacingMode]   = useState<'environment' | 'user'>('environment')
  const [flashFrame, setFlashFrame]   = useState(false)

  const videoRef  = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // ── Stream management ──────────────────────────────────────────────────────

  async function startStream(facing: 'environment' | 'user') {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setCameraReady(false)
    setCameraError(null)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facing }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err: unknown) {
      const name = err instanceof DOMException ? err.name : ''
      setCameraError(
        name === 'NotAllowedError'
          ? 'Camera permission denied. Please tap "Allow" when the browser asks, then try again.'
          : 'Could not start camera. Make sure no other app is using it, then try again.',
      )
    }
  }

  // Open camera: close instruction sheet first, then request getUserMedia
  function openCamera(index: number) {
    setActiveStep(null)
    setCameraIndex(index)
    setCameraError(null)
    setCameraReady(false)
    setFacingMode('environment')
    setCameraOpen(true)
  }

  function closeCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setCameraOpen(false)
    setCameraIndex(null)
    setCameraReady(false)
    setCameraError(null)
  }

  async function flipCamera() {
    const next = facingMode === 'environment' ? 'user' : 'environment'
    setFacingMode(next)
    await startStream(next)
  }

  // Start stream when modal opens; stop on close/unmount
  useEffect(() => {
    if (cameraOpen) {
      startStream(facingMode)
    }
    return () => {
      if (!cameraOpen) {
        streamRef.current?.getTracks().forEach((t) => t.stop())
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraOpen])

  // ── Capture ────────────────────────────────────────────────────────────────

  function capturePhoto() {
    if (!videoRef.current || !canvasRef.current || cameraIndex === null) return

    const video  = videoRef.current
    const canvas = canvasRef.current
    canvas.width  = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0)

    // Brief white flash
    setFlashFrame(true)
    setTimeout(() => setFlashFrame(false), 180)

    canvas.toBlob(
      (blob) => {
        if (!blob) return
        const file    = new File([blob], `shop_photo_${cameraIndex + 1}.jpg`, { type: 'image/jpeg' })
        const preview = canvas.toDataURL('image/jpeg', 0.85)
        onCapture(cameraIndex, file, preview)
        closeCamera()
      },
      'image/jpeg',
      0.85,
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const capturedCount  = images.filter(Boolean).length
  const currentStep    = cameraIndex !== null ? PHOTO_STEPS[cameraIndex] : null

  return (
    <>
      {/* Hidden canvas — only used for frame capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* ── Slot list ── */}
      <div className="flex flex-col gap-3">

        {/* Progress */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-navy-500 font-medium">{capturedCount} of 5 photos taken</span>
          <span className={capturedCount === 5 ? 'text-emerald-600 font-semibold' : 'text-navy-400'}>
            {capturedCount === 5 ? '✓ All photos complete' : `${5 - capturedCount} more needed`}
          </span>
        </div>
        <div className="w-full h-1.5 bg-surface-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-navy-800 rounded-full"
            animate={{ width: `${(capturedCount / 5) * 100}%` }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          />
        </div>

        {/* Slots */}
        <div className="flex flex-col gap-2 mt-1">
          {PHOTO_STEPS.map((step, index) => {
            const captured = !!images[index]
            const preview  = previews[index]
            const colors   = COLOR_MAP[step.color]

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div
                  className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors ${
                    captured
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-white border-surface-200 hover:border-navy-300 hover:bg-surface-50'
                  }`}
                >
                  {/* Thumbnail or icon */}
                  <div className="flex-shrink-0">
                    {captured && preview ? (
                      <div className="relative w-12 h-12 rounded overflow-hidden ring-1 ring-emerald-300">
                        <img src={preview} alt={step.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center">
                          <CheckCircle2 size={16} className="text-emerald-600 drop-shadow" />
                        </div>
                      </div>
                    ) : (
                      <div className={`w-12 h-12 rounded flex items-center justify-center ${colors.bg} border ${colors.border}`}>
                        <step.Icon size={20} className={colors.icon} />
                      </div>
                    )}
                  </div>

                  {/* Labels */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-semibold text-navy-800">
                        {index + 1}. {step.title}
                      </span>
                      {captured && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-medium">
                          ✓ Done
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-navy-500 mt-0.5 leading-relaxed">{step.subtitle}</p>
                  </div>

                  {/* Action */}
                  <div className="flex-shrink-0">
                    {captured ? (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setActiveStep(index)}
                          className="text-[11px] text-navy-500 hover:text-navy-700 underline underline-offset-2"
                        >
                          Retake
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemove(index)}
                          className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-50 text-navy-400 hover:text-red-500 transition-colors"
                          aria-label="Remove photo"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setActiveStep(index)}
                        className="flex items-center gap-1.5 text-[11px] font-medium text-navy-700 bg-navy-50 hover:bg-navy-100 border border-navy-200 px-2.5 py-1.5 rounded-md transition-colors"
                      >
                        <Camera size={12} />
                        Capture
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          INSTRUCTION BOTTOM SHEET
      ══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {activeStep !== null && (
          <>
            <motion.div
              key="inst-bd"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-navy-900/60 z-40 backdrop-blur-[2px]"
              onClick={() => setActiveStep(null)}
            />

            <motion.div
              key="inst-sheet"
              initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
              className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-2xl p-5 max-w-lg mx-auto"
              style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom, 2rem))' }}
            >
              <div className="w-10 h-1 rounded-full bg-surface-200 mx-auto mb-4" />

              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-semibold text-navy-400 uppercase tracking-widest">
                  Photo {activeStep + 1} of 5
                </span>
                <button
                  type="button"
                  onClick={() => setActiveStep(null)}
                  className="w-7 h-7 rounded-full bg-surface-100 flex items-center justify-center text-navy-500 hover:bg-surface-200 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              {(() => {
                const step   = PHOTO_STEPS[activeStep]
                const colors = COLOR_MAP[step.color]
                return (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors.bg} border ${colors.border}`}>
                        <step.Icon size={22} className={colors.icon} />
                      </div>
                      <div>
                        <h3 className="font-heading font-semibold text-navy-900 text-base leading-tight">{step.title}</h3>
                        <p className="text-xs text-navy-400 mt-0.5">{step.subtitle}</p>
                      </div>
                    </div>

                    <div className="bg-navy-50 border border-navy-200 rounded-xl p-4">
                      <p className="text-sm text-navy-700 leading-relaxed font-medium mb-3">{step.description}</p>
                      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                        <AlertCircle size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
                        <p className="text-[11px] text-amber-700 leading-relaxed">
                          <strong>Tip: </strong>{step.tip}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <p className="text-[11px] font-semibold text-navy-500 uppercase tracking-wide">
                        Before you open the camera:
                      </p>
                      {step.checklist.map((item, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-navy-800 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <p className="text-xs text-navy-600 leading-relaxed">{item}</p>
                        </div>
                      ))}
                    </div>

                    {/* This triggers getUserMedia — NOT a file picker */}
                    <Button size="lg" onClick={() => openCamera(activeStep)}>
                      <Camera size={16} />
                      Open camera &amp; take photo
                    </Button>

                    <p className="text-center text-[11px] text-navy-400 leading-relaxed">
                      Your browser will ask permission to access the camera. No gallery involved.
                    </p>
                  </div>
                )
              })()}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════════════
          FULLSCREEN IN-BROWSER CAMERA MODAL  (getUserMedia stream)
      ══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {cameraOpen && (
          <motion.div
            key="camera"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black flex flex-col"
          >
            {/* Top bar */}
            <div
              className="relative z-10 flex items-center justify-between px-4 pb-3"
              style={{ paddingTop: 'max(1rem, env(safe-area-inset-top, 1rem))' }}
            >
              <button
                type="button"
                onClick={closeCamera}
                className="w-9 h-9 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white"
              >
                <X size={18} />
              </button>

              {currentStep && (
                <p className="flex-1 mx-3 text-white text-xs font-semibold text-center leading-tight">
                  Photo {cameraIndex! + 1} of 5 — {currentStep.title}
                </p>
              )}

              <button
                type="button"
                onClick={flipCamera}
                className="w-9 h-9 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white"
                aria-label="Flip camera"
              >
                <FlipHorizontal size={18} />
              </button>
            </div>

            {/* Video feed */}
            <div className="relative flex-1 overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                onCanPlay={() => setCameraReady(true)}
              />

              {/* White flash on capture */}
              <AnimatePresence>
                {flashFrame && (
                  <motion.div
                    initial={{ opacity: 0.9 }} animate={{ opacity: 0 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="absolute inset-0 bg-white pointer-events-none"
                  />
                )}
              </AnimatePresence>

              {/* Spinner while stream initialises */}
              {!cameraReady && !cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 gap-3">
                  <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <p className="text-white/60 text-xs">Starting camera…</p>
                </div>
              )}

              {/* Error */}
              {cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 gap-4 px-8">
                  <div className="w-14 h-14 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center">
                    <AlertCircle size={24} className="text-red-400" />
                  </div>
                  <p className="text-white text-sm text-center font-medium leading-relaxed">{cameraError}</p>
                  <button
                    type="button"
                    onClick={() => startStream(facingMode)}
                    className="px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm"
                  >
                    Try again
                  </button>
                </div>
              )}

              {/* Overlay hint */}
              {cameraReady && currentStep && (
                <div className="absolute top-3 inset-x-0 flex justify-center pointer-events-none">
                  <div className="flex items-center gap-1.5 bg-black/60 border border-white/20 backdrop-blur-sm rounded-full px-3 py-1.5">
                    <ZoomIn size={11} className="text-white/70" />
                    <span className="text-white text-[11px] font-medium">{currentStep.overlayHint}</span>
                  </div>
                </div>
              )}

              {/* Viewfinder corners */}
              {cameraReady && (
                <div className="absolute inset-8 pointer-events-none">
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white/60 rounded-tl" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white/60 rounded-tr" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white/60 rounded-bl" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white/60 rounded-br" />
                </div>
              )}
            </div>

            {/* Bottom controls */}
            <div
              className="relative z-10 flex items-center justify-center py-8 bg-gradient-to-t from-black/70 to-transparent"
              style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom, 2rem))' }}
            >
              {/* Progress dots */}
              <div className="absolute left-6 flex gap-1.5 items-center">
                {PHOTO_STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-full transition-all duration-200 ${
                      i === cameraIndex
                        ? 'w-4 h-2 bg-white'
                        : images[i]
                        ? 'w-2 h-2 bg-emerald-400'
                        : 'w-2 h-2 bg-white/30'
                    }`}
                  />
                ))}
              </div>

              {/* Shutter */}
              <button
                type="button"
                onClick={capturePhoto}
                disabled={!cameraReady || !!cameraError}
                className={`
                  w-16 h-16 rounded-full border-4 border-white
                  flex items-center justify-center
                  transition-transform duration-100 active:scale-90
                  ${cameraReady && !cameraError ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}
                `}
                aria-label="Take photo"
              >
                <div className={`w-11 h-11 rounded-full bg-white border-2 ${cameraReady && !cameraError ? 'border-navy-200' : 'border-white/30'}`} />
              </button>

              <button
                type="button"
                onClick={closeCamera}
                className="absolute right-6 text-white/60 text-xs"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}