import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { ArrowRight, CheckCircle2, TrendingUp, MapPin, Shield, Camera } from 'lucide-react'
import { Button } from '@/components/ui/Button'

// ─── Unsplash image URLs ──────────────────────────────────────────────────────
const BUSINESS_TYPES = [
  {
    label: 'Kirana stores',
    tags: ['Shelf scanning', 'SKU detection', 'Working capital'],
    img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80',
  },
  {
    label: 'Pharmacies',
    tags: ['Inventory check', 'Product match', 'Location score'],
    img: 'https://images.unsplash.com/photo-1576671081837-49000212a370?w=600&q=80',
  },
  {
    label: 'Salons',
    tags: ['Business identity', 'Geo analysis', 'Cash flow estimate'],
    img: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80',
  },
  {
    label: 'Restaurants',
    tags: ['Footfall proxy', 'Competitor density', 'Road type score'],
    img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80',
  },
  {
    label: 'Hardware stores',
    tags: ['Inventory value', 'SKU diversity', 'Area affluence'],
    img: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=600&q=80',
  },
  {
    label: 'Clinics',
    tags: ['Business check', 'GST verify', 'Demand score'],
    img: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&q=80',
  },
  {
    label: 'Clothing shops',
    tags: ['Product existence', 'Location tier', 'Revenue range'],
    img: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=600&q=80',
  },
  {
    label: 'Electronics',
    tags: ['Shelf density', 'Population density', 'Confidence score'],
    img: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=600&q=80',
  },
]

const STATS = [
  { value: '13M+', label: 'Businesses without formal credit records' },
  { value: '30s', label: 'End-to-end scoring latency' },
  { value: '85%+', label: 'Tier detection accuracy target' },
  { value: '₹0', label: 'Field visit cost for pre-qualification' },
]

const HOW_STEPS = [
  {
    number: '01',
    title: 'Submit store details',
    description:
      'Verify your mobile, enter business name and address, upload 3–5 photos from your phone camera. No gallery uploads — we need live EXIF data.',
    img: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?w=700&q=80',
    tags: ['OTP verification', 'Google Business check', 'GST lookup'],
  },
  {
    number: '02',
    title: 'AI analyses your store',
    description:
      'Computer vision reads shelf density, SKU count, and inventory value. Geo intelligence maps footfall, competitors, and road type from your GPS.',
    img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=700&q=80',
    tags: ['YOLO shelf scan', 'Overpass geo API', 'Florence-2 vision'],
  },
  {
    number: '03',
    title: 'Receive your score report',
    description:
      'Get a calibrated daily revenue range, monthly income estimate, confidence score, and risk flags — fully explainable, no black box.',
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=700&q=80',
    tags: ['Revenue range', 'Risk flags', 'Pre-approve / Review / Reject'],
  },
]

// ─── Mock score card ──────────────────────────────────────────────────────────

function MockScoreCard() {
  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div className="absolute inset-0 rounded-2xl bg-navy-600/20 blur-2xl scale-105" />
      <div className="relative bg-white rounded-2xl border border-surface-200 shadow-2xl overflow-hidden">
        {/* Titlebar */}
        <div className="bg-navy-900 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          </div>
          <span className="text-xs text-navy-300 font-mono">bizscope — assessment result</span>
          <div className="w-16" />
        </div>

        <div className="p-5 flex flex-col gap-4">
          {/* Store info */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-heading font-semibold text-navy-900 text-sm">
                Sharma General Store
              </p>
              <p className="text-xs text-navy-400">Kirana · Malviya Nagar, Delhi</p>
            </div>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Pre-approve
            </span>
          </div>

          {/* Ring + metrics */}
          <div className="flex items-center gap-5 bg-surface-50 rounded-xl p-4 border border-surface-100">
            <div className="relative flex-shrink-0">
              <svg width="72" height="72" viewBox="0 0 72 72">
                <circle cx="36" cy="36" r="30" fill="none" stroke="#e2e6ef" strokeWidth="6" />
                <circle
                  cx="36" cy="36" r="30" fill="none" stroke="#10b981" strokeWidth="6"
                  strokeDasharray="188.5" strokeDashoffset="47" strokeLinecap="round"
                  transform="rotate(-90 36 36)"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-heading font-semibold text-emerald-600">
                74
              </span>
            </div>
            <div className="flex-1 flex flex-col gap-2">
              {[
                { label: 'Daily sales', value: '₹12K – ₹19K', bold: true },
                { label: 'Monthly income', value: '₹54K – ₹86K', bold: false },
                { label: 'Confidence', value: '0.74', bold: false },
              ].map((m) => (
                <div key={m.label} className="flex justify-between">
                  <span className="text-xs text-navy-400">{m.label}</span>
                  <span className={`text-xs font-heading font-medium ${m.bold ? 'text-navy-900' : 'text-navy-600'}`}>
                    {m.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Signal bars */}
          <div className="flex flex-col gap-2">
            {[
              { label: 'Vision score', pct: 82, color: 'bg-navy-700' },
              { label: 'Geo score', pct: 71, color: 'bg-navy-500' },
              { label: 'Identity score', pct: 90, color: 'bg-emerald-500' },
            ].map((bar) => (
              <div key={bar.label} className="flex items-center gap-2">
                <span className="text-xs text-navy-400 w-24 flex-shrink-0">{bar.label}</span>
                <div className="flex-1 h-1.5 bg-surface-200 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${bar.color}`} style={{ width: `${bar.pct}%` }} />
                </div>
                <span className="text-xs font-medium text-navy-700 w-6 text-right">{bar.pct}</span>
              </div>
            ))}
          </div>

          {/* Flags */}
          <div className="flex gap-1.5 flex-wrap">
            {[
              { text: 'High footfall area', style: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
              { text: 'Standard configuration', style: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
              { text: '3 competitors nearby', style: 'bg-amber-50 text-amber-700 border-amber-200' },
            ].map((f) => (
              <span key={f.text} className={`text-xs px-2 py-0.5 rounded border ${f.style}`}>
                {f.text}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Business card ────────────────────────────────────────────────────────────

function BusinessCard({ label, tags, img }: { label: string; tags: string[]; img: string }) {
  return (
    <div className="flex-shrink-0 w-56 rounded-xl overflow-hidden border border-surface-200 bg-white group hover:shadow-card-hover transition-shadow duration-200 cursor-default">
      <div className="relative h-36 overflow-hidden">
        <img
          src={img} alt={label}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900/60 to-transparent" />
        <span className="absolute bottom-2 left-3 font-heading font-semibold text-white text-sm">
          {label}
        </span>
      </div>
      <div className="p-3 flex flex-col gap-1.5">
        {tags.map((tag) => (
          <div key={tag} className="flex items-center gap-1.5">
            <CheckCircle2 size={11} className="text-emerald-500 flex-shrink-0" />
            <span className="text-xs text-navy-500">{tag}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Feature step (alternating layout) ───────────────────────────────────────

function FeatureSection({ step, reverse = false }: { step: typeof HOW_STEPS[0]; reverse?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className={`flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-10 items-center`}
    >
      <div className="flex-1 w-full">
        <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
          <img src={step.img} alt={step.title} className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-navy-900/40" />
          <span className="absolute top-4 left-4 font-heading font-semibold text-7xl text-white/15 leading-none select-none">
            {step.number}
          </span>
          <div className="absolute bottom-4 left-4 flex gap-1.5 flex-wrap">
            {step.tags.map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded bg-white/15 backdrop-blur-sm text-white border border-white/20">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-5">
        <div>
          <p className="text-label mb-3">Step {step.number}</p>
          <h3 className="font-heading font-semibold text-2xl text-navy-900 leading-tight">
            {step.title}
          </h3>
          <p className="text-navy-500 mt-3 text-sm leading-relaxed">{step.description}</p>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="flex flex-col">

      {/* Hero */}
      <section className="bg-navy-900 border-b border-navy-800 overflow-hidden">
        <div className="container-page py-16 lg:py-24">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex-1 max-w-lg"
            >
              <span className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full bg-navy-800 text-navy-300 border border-navy-700 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                Remote business assessment — no field visit needed
              </span>
              <h1 className="font-heading font-semibold text-4xl lg:text-5xl text-white leading-tight">
                Score any business
                <br />
                <span className="text-amber-400">in 30 seconds.</span>
              </h1>
              <p className="mt-5 text-navy-300 text-base leading-relaxed">
                BizScore turns 5 photos and a GPS pin into a calibrated cash flow estimate.
                No GST return. No bank statement. No site visit. Built for NBFCs lending to
                informal businesses across India.
              </p>
              <div className="mt-8 flex gap-3">
                <Link to="/assess">
                  <Button size="lg">
                    Start assessment
                    <ArrowRight size={16} />
                  </Button>
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                {['Vision-based inventory analysis', 'Geo intelligence from GPS', 'Fraud-resistant submission'].map((s) => (
                  <div key={s} className="flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-emerald-400" />
                    <span className="text-xs text-navy-400">{s}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="flex-1 w-full"
            >
              <MockScoreCard />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-surface-200 bg-white">
        <div className="container-page py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((s, i) => (
              <motion.div
                key={s.value}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className="flex flex-col gap-1 text-center"
              >
                <span className="font-heading font-semibold text-3xl text-navy-900">{s.value}</span>
                <span className="text-xs text-navy-400 leading-relaxed">{s.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Business type carousel */}
      <section className="border-b border-surface-200 bg-surface-50 py-14">
        <div className="container-page mb-8">
          <p className="text-label mb-2">Works for any business type</p>
          <h2 className="font-heading font-semibold text-2xl text-navy-900">
            One platform, every business.
          </h2>
          <p className="text-navy-500 text-sm mt-2">
            Whether it is a kirana store, a clinic, or a salon — BizScore assesses them all
            from the same 5 photos and a pin.
          </p>
        </div>

        {/* Scrolling carousel */}
        <div className="overflow-hidden relative">
          <div className="absolute left-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-r from-surface-50 to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-l from-surface-50 to-transparent pointer-events-none" />
          <div className="flex gap-4 px-4" style={{ animation: 'marquee 30s linear infinite', width: 'max-content' }}>
            {[...BUSINESS_TYPES, ...BUSINESS_TYPES].map((b, i) => (
              <BusinessCard key={`${b.label}-${i}`} {...b} />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-surface-200 bg-white">
        <div className="container-page py-16 lg:py-20 flex flex-col gap-16">
          <div>
            <p className="text-label mb-2">How it works</p>
            <h2 className="font-heading font-semibold text-2xl text-navy-900">
              From photos to credit signal.
            </h2>
          </div>
          {HOW_STEPS.map((step, i) => (
            <FeatureSection key={step.number} step={step} reverse={i % 2 !== 0} />
          ))}
        </div>
      </section>

      {/* What you get */}
      <section className="border-b border-surface-200 bg-surface-50">
        <div className="container-page py-16">
          <div className="flex flex-col lg:flex-row gap-12 items-start">
            <div className="flex-1 max-w-md">
              <p className="text-label mb-3">The output</p>
              <h2 className="font-heading font-semibold text-2xl text-navy-900 leading-tight">
                A decision, not just a number.
              </h2>
              <p className="text-navy-500 text-sm mt-4 leading-relaxed">
                Every assessment produces a full explainability report. The loan officer sees
                exactly which signals drove the result and why — no black box.
              </p>
              <div className="mt-8 flex flex-col gap-5">
                {[
                  { icon: TrendingUp, title: 'Revenue range with uncertainty band', sub: 'Daily sales, monthly revenue, and monthly income as calibrated min–max ranges.' },
                  { icon: Shield, title: 'Credibility and fraud flags', sub: 'GPS consistency, EXIF metadata, image hash deduplication, and product mismatch detection.' },
                  { icon: MapPin, title: 'Geo and demand intelligence', sub: 'Population density, POI count, competitor proximity, road type, and area affluence.' },
                  { icon: Camera, title: 'Visual signal breakdown', sub: 'Shelf density index, SKU diversity score, and inventory value from your photos.' },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.title} className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-navy-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon size={15} className="text-navy-700" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-navy-900">{item.title}</p>
                        <p className="text-xs text-navy-500 mt-0.5 leading-relaxed">{item.sub}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="flex-1 w-full">
              <MockScoreCard />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy-900">
        <div className="container-page py-16">
          <div className="max-w-xl mx-auto text-center flex flex-col items-center gap-6">
            <h2 className="font-heading font-semibold text-3xl text-white leading-tight">
              Score a business in 30 seconds.
            </h2>
            <p className="text-navy-300 text-sm leading-relaxed">
              No field visit. No GST return. No bank statement. Just photos, a pin, and a
              decision-ready credit signal.
            </p>
            <Link to="/assess">
              <Button size="lg">
                Start free assessment
                <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="bg-surface-50 border-t border-surface-200">
        <div className="container-page py-6">
          <p className="text-xs text-navy-400 leading-relaxed max-w-2xl">
            BizScore outputs are indicative assessments based on visual and spatial signals.
            They are not credit decisions. All final lending decisions remain with the authorised
            financial institution and are subject to applicable regulations and field verification.
          </p>
        </div>
      </section>
    </div>
  )
}