import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, ShieldCheck, BarChart3, MapPin, ScanSearch } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Business identity verification',
    description:
      'Validates business existence via Google Maps, GST status, and product consistency — before a single field visit.',
  },
  {
    icon: ScanSearch,
    title: 'Vision-based inventory analysis',
    description:
      'Computer vision reads shelf density, SKU diversity, and inventory value from store photos to proxy working capital.',
  },
  {
    icon: MapPin,
    title: 'Geo and economic intelligence',
    description:
      'Population density, footfall proxies, competitor mapping, and road type scoring from GPS coordinates.',
  },
  {
    icon: BarChart3,
    title: 'Calibrated cash flow estimate',
    description:
      'Outputs a daily revenue range with confidence score and risk flags — not a single guess, a calibrated band.',
  },
]

const STEPS = [
  { number: '01', label: 'Business identity', sub: 'Google Maps · GST · Product check' },
  { number: '02', label: 'Image analysis', sub: 'Shelf density · SKU count · Inventory value' },
  { number: '03', label: 'Geo intelligence', sub: 'Population · Footfall · Competitors' },
  { number: '04', label: 'Cash flow estimate', sub: 'Range · Confidence · Risk flags' },
]

export default function HomePage() {
  return (
    <div className="flex flex-col">

      {/* Hero */}
      <section className="border-b border-surface-200 bg-navy-900">
        <div className="container-page py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <span className="text-label text-navy-300 mb-4 block">
              Remote business assessment
            </span>
            <h1 className="font-heading font-semibold text-4xl text-white leading-tight">
              Score any business
              <br />
              from photos and a pin.
            </h1>
            <p className="mt-5 text-navy-300 text-base leading-relaxed max-w-xl">
              BizScore helps lenders assess kirana stores, salons, pharmacies, and other
              small businesses remotely — using computer vision, geo intelligence, and
              calibrated cash flow modeling. No GST return. No field visit needed upfront.
            </p>
            <div className="mt-8 flex gap-3 flex-wrap">
              <Link to="/assess">
                <Button size="lg" variant="primary">
                  Start assessment
                  <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-surface-200 bg-surface-50">
        <div className="container-page py-16">
          <p className="text-label mb-8">How it works</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex flex-col gap-3"
              >
                <span className="font-heading font-semibold text-3xl text-surface-200">
                  {step.number}
                </span>
                <div>
                  <p className="font-heading font-semibold text-navy-900 text-sm">
                    {step.label}
                  </p>
                  <p className="text-xs text-navy-400 mt-1">{step.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-b border-surface-200">
        <div className="container-page py-16">
          <p className="text-label mb-8">What we check</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  className="flex gap-4 p-5 rounded-lg border border-surface-200 bg-white"
                >
                  <div className="w-9 h-9 rounded-lg bg-navy-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon size={18} className="text-navy-700" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-navy-900 text-sm">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-navy-500 mt-1 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="bg-surface-50">
        <div className="container-page py-8">
          <p className="text-xs text-navy-400 leading-relaxed max-w-2xl">
            BizScore outputs are indicative assessments based on visual and spatial signals.
            They are not credit decisions. All final lending decisions remain with the
            authorised financial institution and are subject to applicable regulations.
          </p>
        </div>
      </section>
    </div>
  )
}
