import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
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
  { value: '13M+', label: 'Shops thin on credit history' },
  { value: '30s', label: 'Typical run time' },
  { value: '85%+', label: 'Tier detection goal' },
  { value: '₹0', label: 'Pre-check visit cost' },
]

const HOW_STEPS = [
  {
    number: '01',
    title: 'Verify & tell us about the shop',
    description: 'Mobile OTP, shop name and address, then 5 quick camera photos — usually under 2 minutes.',
    img: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?w=700&q=80',
    tags: ['OTP', 'Identity', 'GST optional'],
  },
  {
    number: '02',
    title: 'We analyse photos & area',
    description: 'Shelf signals and your pincode help estimate demand — you stay on one simple flow.',
    img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=700&q=80',
    tags: ['Vision', 'Location', 'Stock cues'],
  },
  {
    number: '03',
    title: 'You get a clear report',
    description: 'Sales range and flags in plain language — no spreadsheet jargon.',
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=700&q=80',
    tags: ['Daily sales band', 'Income range', 'Risks'],
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
            <span className="text-emerald-600 text-xs" aria-hidden>·</span>
            <span className="text-xs text-navy-600 font-medium">{tag}</span>
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
          <p className="text-navy-600 mt-2 text-sm leading-snug">{step.description}</p>
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
        <div className="container-page py-12 sm:py-16 lg:py-20">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-14">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex-1 max-w-lg"
            >
              <div className="flex flex-wrap gap-2 mb-5">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/25 text-amber-200 border border-amber-400/30">Demo</span>
                <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-white/10 text-navy-100 border border-white/15">Sample data</span>
              </div>
              <h1 className="font-heading font-semibold text-3xl sm:text-4xl lg:text-5xl text-white leading-[1.1]">
                Score your shop
                <br />
                <span className="text-amber-400">in about a minute.</span>
              </h1>
              <p className="mt-3 text-navy-200 text-sm sm:text-base leading-snug max-w-md">
                Five photos + basics. No bank statements or branch visit for this step.
              </p>
              <div className="mt-6">
                <Link to="/assess">
                  <Button size="lg" className="min-h-[48px] w-full sm:w-auto justify-center">
                    Start assessment
                    <ArrowRight size={16} />
                  </Button>
                </Link>
              </div>
              <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2">
                {['Shelf & stock signals', 'Area footfall proxy', 'Phone-only flow'].map((s) => (
                  <span key={s} className="text-xs text-navy-300 border-l-2 border-emerald-400/60 pl-2">
                    {s}
                  </span>
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
        <div className="container-page py-8 sm:py-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {STATS.map((s, i) => (
              <motion.div
                key={s.value}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className="flex flex-col gap-1 text-center rounded-xl border border-surface-200 border-t-4 border-t-navy-800/80 bg-surface-50/50 py-4 px-2"
              >
                <span className="font-heading font-bold text-2xl sm:text-3xl text-navy-900 tabular-nums">{s.value}</span>
                <span className="text-[11px] sm:text-xs text-navy-600 font-medium leading-snug px-1">{s.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Business type carousel */}
      <section className="border-b border-surface-200 bg-surface-50 py-10 sm:py-12">
        <div className="container-page mb-6 sm:mb-8">
          <div className="border-l-4 border-navy-800 pl-3 sm:pl-4 max-w-xl">
            <p className="text-label mb-1">Shop types</p>
            <h2 className="font-heading font-semibold text-xl sm:text-2xl text-navy-900 leading-tight">
              Kirana, salon, pharmacy, and more
            </h2>
            <p className="text-navy-600 text-sm mt-1.5 leading-snug">
              Same flow — signals change with what you sell.
            </p>
          </div>
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
        <div className="container-page py-12 sm:py-16 lg:py-20 flex flex-col gap-12 sm:gap-14">
          <div className="border-l-4 border-emerald-600 pl-3 sm:pl-4 max-w-xl">
            <p className="text-label mb-1">How it works</p>
            <h2 className="font-heading font-semibold text-xl sm:text-2xl text-navy-900 leading-tight">
              Three steps on your phone
            </h2>
            <p className="text-navy-600 text-sm mt-1.5 leading-snug">
              No paperwork queue — you stay in the browser.
            </p>
          </div>
          {HOW_STEPS.map((step, i) => (
            <FeatureSection key={step.number} step={step} reverse={i % 2 !== 0} />
          ))}
        </div>
      </section>

      {/* What you get */}
      <section className="border-b border-surface-200 bg-surface-50">
        <div className="container-page py-12 sm:py-16">
          <div className="flex flex-col lg:flex-row gap-10 lg:gap-12 items-start">
            <div className="flex-1 max-w-md">
              <div className="border-l-4 border-navy-800 pl-3 sm:pl-4">
                <p className="text-label mb-1">What you get</p>
                <h2 className="font-heading font-semibold text-xl sm:text-2xl text-navy-900 leading-tight">
                  Plain-language report
                </h2>
                <p className="text-navy-600 text-sm mt-2 leading-snug">
                  Ranges and flags instead of dense tables.
                </p>
              </div>
              <div className="mt-6 flex flex-col gap-3">
                {[
                  { title: 'Sales bands', sub: 'Typical day and month ranges for your tier.' },
                  { title: 'Trust checks', sub: 'Business listing + optional GST + photo match.' },
                  { title: 'Catchment read', sub: 'Footfall proxy, competitors, road type.' },
                  { title: 'Shelf read', sub: 'Density, SKU mix, stock feel from photos.' },
                ].map((item) => (
                  <div key={item.title} className="rounded-xl border border-surface-200 bg-white px-4 py-3 border-l-4 border-l-emerald-500/70">
                    <p className="text-sm font-bold text-navy-900">{item.title}</p>
                    <p className="text-xs text-navy-600 mt-0.5 leading-snug">{item.sub}</p>
                  </div>
                ))}
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
        <div className="container-page py-12 sm:py-14">
          <div className="max-w-lg mx-auto text-center flex flex-col items-center gap-4 px-2">
            <h2 className="font-heading font-semibold text-2xl sm:text-3xl text-white leading-tight">
              Ready when you are
            </h2>
            <p className="text-navy-200 text-sm leading-snug">
              Phone + address + five photos. Roughly two minutes.
            </p>
            <Link to="/assess" className="w-full sm:w-auto">
              <Button size="lg" className="min-h-[48px] w-full sm:w-auto justify-center">
                Start assessment
                <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="bg-amber-50 border-t border-amber-200">
        <div className="container-page py-4 sm:py-5">
          <div className="max-w-3xl flex flex-wrap gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-200/90 text-amber-950">Demo</span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white/80 border border-amber-100 text-amber-950">Mock scores</span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white/80 border border-amber-100 text-amber-950">Not a credit decision</span>
          </div>
          <p className="text-xs text-amber-900/90 leading-snug max-w-3xl">
            Lenders make the final call — this flow is for demonstration only.
          </p>
        </div>
      </section>
    </div>
  )
}
