import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { ScoreRing } from '@/components/ui/ScoreRing'
import { Button } from '@/components/ui/Button'
import {
  getApplication,
  updateApplicationOfficerStatus,
  getOfficerStatus,
  type SavedApplication,
} from '@/services/storage'
import type { VoteSignal, Layer2Result, Layer3Result, Layer4Result } from '@/types'
import { getIndustryReferenceImages } from '@/data/industryReferenceImages'

// ─── Config ───────────────────────────────────────────────────────────────────

const REC_CONFIG = {
  pre_approve: {
    dotClass: 'bg-emerald-500',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    label: 'Good to go',
    labelColor: 'text-emerald-700',
    description: 'Signals above threshold — optional field check before disbursement.',
    loanMultiplier: 3,
  },
  needs_verification: {
    dotClass: 'bg-amber-500',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    label: 'Needs field visit',
    labelColor: 'text-amber-700',
    description: 'Some uncertainty — schedule a visit before disbursement.',
    loanMultiplier: 2,
  },
  reject: {
    dotClass: 'bg-red-500',
    bg: 'bg-red-50',
    border: 'border-red-200',
    label: 'Not approved',
    labelColor: 'text-red-700',
    description: 'High risk or weak signals — do not proceed without a fresh file.',
    loanMultiplier: 0,
  },
}

const STATUS_COLOR: Record<VoteSignal['status'], string> = {
  active: 'bg-navy-600',
  proxy: 'bg-amber-400',
  skipped: 'bg-surface-300',
}

/** Short badge text for dense layouts */
const STATUS_SHORT: Record<VoteSignal['status'], string> = {
  active: 'Live',
  proxy: 'Est.',
  skipped: '—',
}

const REC_LABEL: Record<Layer4Result['recommendation'], string> = {
  pre_approve: 'Good to go',
  needs_verification: 'Needs visit',
  reject: 'Not approved',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtInr(n: number) {
  return n >= 100000
    ? `₹${(n / 100000).toFixed(1)}L`
    : `₹${(n / 1000).toFixed(0)}K`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

// ─── Section card ─────────────────────────────────────────────────────────────

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-surface-200 p-4 sm:p-6 shadow-sm ${className}`}>
      {children}
    </div>
  )
}

/** Section header: colour bar + title (no decorative icons). */
function SectionHeading({
  title,
  sub,
  accent = 'navy',
}: {
  title: string
  sub?: string
  accent?: 'navy' | 'emerald' | 'amber' | 'blue'
}) {
  const bar =
    accent === 'emerald' ? 'border-l-emerald-600' :
    accent === 'amber' ? 'border-l-amber-500' :
    accent === 'blue' ? 'border-l-blue-600' :
    'border-l-navy-700'
  return (
    <div className={`mb-4 sm:mb-5 border-l-4 ${bar} pl-3 sm:pl-4`}>
      <h3 className="font-heading font-semibold text-navy-900 text-base sm:text-lg leading-tight">{title}</h3>
      {sub && <p className="text-xs sm:text-sm text-navy-500 mt-1 leading-snug max-w-3xl">{sub}</p>}
    </div>
  )
}

// ─── Cash flow cell ───────────────────────────────────────────────────────────

function CashFlowCell({ label, min, max, median, primary = false, sub }: {
  label: string; min: string; max: string; median?: string; primary?: boolean; sub?: string
}) {
  return (
    <div className={`rounded-lg p-3 ${primary ? 'bg-navy-900 text-white' : 'bg-surface-50 border border-surface-200'}`}>
      <p className={`text-xs mb-1 ${primary ? 'text-navy-300' : 'text-navy-400'}`}>{label}</p>
      {median && (
        <p className={`font-heading font-semibold text-base leading-none ${primary ? 'text-white' : 'text-navy-900'}`}>
          {median}
        </p>
      )}
      <p className={`text-xs mt-1 ${primary ? 'text-navy-300' : 'text-navy-500'}`}>{min} – {max}</p>
      {sub && <p className={`text-xs mt-0.5 ${primary ? 'text-navy-400' : 'text-navy-400'}`}>{sub}</p>}
    </div>
  )
}

// ─── Explainability flags ─────────────────────────────────────────────────────

function buildExplainabilityFlags(
  l2: Layer2Result, l3: Layer3Result, l4: Layer4Result,
): { text: string; type: 'positive' | 'warning' }[] {
  const flags: { text: string; type: 'positive' | 'warning' }[] = []
  const tier = l2.tierClassification.tier
  const sdi = l2.shelfAnalysis.shelfDensityIndex

  if (tier === 1) flags.push({ text: 'Tier 1 store — branded asset presence detected (Visicooler, branded racks)', type: 'positive' })
  if (tier === 2) flags.push({ text: 'Tier 2 store — sachet and plastic jar patterns confirm mid-range C/C store', type: 'positive' })
  if (tier === 3) flags.push({ text: 'Tier 3 store — bulk goods and grain sacks indicate rural store profile', type: 'warning' })

  if (sdi >= 0.7) flags.push({ text: `High shelf density (${Math.round(sdi * 100)}%) — strong working capital deployment`, type: 'positive' })
  else if (sdi < 0.4) flags.push({ text: `Low shelf density (${Math.round(sdi * 100)}%) — possible slow turnover or inspection-day stock issue`, type: 'warning' })

  if (l2.shelfAnalysis.skuCount >= 20) flags.push({ text: `High SKU diversity (${l2.shelfAnalysis.skuCount} types) — broad footfall capture capability`, type: 'positive' })

  if (!l3.gpsConsistency.flagged) flags.push({ text: 'GPS consistency verified — all images within 50m of registered address', type: 'positive' })
  else flags.push({ text: 'GPS mismatch detected — images may not be from registered address', type: 'warning' })

  if (l3.geoSignals.roadTypeScore >= 4) flags.push({ text: `High road visibility — ${l3.geoSignals.roadType} road increases footfall catchment`, type: 'positive' })

  if (l3.geoSignals.competitorCount500m > 5) flags.push({ text: `${l3.geoSignals.competitorCount500m} competitors within 500m — high micro-market competition`, type: 'warning' })

  if (l3.rentOwnership.repaymentRiskClass === 'high') flags.push({ text: `Rent-to-revenue ratio ${Math.round(l3.rentOwnership.rentToRevenueRatio * 100)}% — exceeds 20% threshold, repayment risk elevated`, type: 'warning' })
  else flags.push({ text: `Rent-to-revenue ratio ${Math.round(l3.rentOwnership.rentToRevenueRatio * 100)}% — within safe repayment band`, type: 'positive' })

  if (l4.storeScoreOutOf100 >= 65) flags.push({ text: `Store score ${l4.storeScoreOutOf100}/100 — above pre-approval threshold of 65`, type: 'positive' })

  return flags
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const OFFICER_REVIEW_LABEL: Record<
  ReturnType<typeof getOfficerStatus>,
  { label: string; bg: string; text: string; border: string }
> = {
  pending_review: {
    label: 'Awaiting review',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
  },
  approved: {
    label: 'Approved',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
  },
  rejected: {
    label: 'Rejected',
    bg: 'bg-red-50',
    text: 'text-red-800',
    border: 'border-red-200',
  },
}

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [app, setApp] = useState<SavedApplication | null>(() => (id ? getApplication(id) : null))

  const reload = useCallback(() => {
    if (id) setApp(getApplication(id))
  }, [id])

  useEffect(() => {
    reload()
  }, [reload])

  if (!app) {
    return (
      <div className="min-h-screen bg-surface-50 flex flex-col">
        <DashboardHeader />
        <div className="flex flex-col items-center justify-center flex-1 gap-5 p-8 max-w-md mx-auto text-center">
          <div className="w-16 h-2 rounded-full bg-amber-400" aria-hidden />
          <h2 className="font-heading font-semibold text-navy-900 text-xl">Application not found</h2>
          <p className="text-navy-500 text-sm">This reference ID is missing or was cleared from the browser.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 rounded-lg bg-navy-800 text-white text-sm font-medium hover:bg-navy-700 transition-colors"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    )
  }

  const { businessName, businessType, pincode, address, submittedAt,
          latitude: appLat, longitude: appLon,
          layer1Result, layer2Result, layer3Result, layer4Result } = app

  const officerStatus = getOfficerStatus(app)
  const officerBadge = OFFICER_REVIEW_LABEL[officerStatus]

  function handleApprove() {
    if (!id) return
    updateApplicationOfficerStatus(id, 'approved')
    reload()
  }

  function handleReject() {
    if (!id) return
    if (!window.confirm('Reject this application? The business owner will not see scores until a new application is submitted.')) return
    updateApplicationOfficerStatus(id, 'rejected')
    reload()
  }

  const config = REC_CONFIG[layer4Result.recommendation]
  const cf = layer4Result.cashFlowEstimate
  const monthlyIncomeMedian = Math.round((cf.monthlyIncomeMin + cf.monthlyIncomeMax) / 2)
  const loanAmount = config.loanMultiplier * monthlyIncomeMedian

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col">
      <DashboardHeader />

      <main className="flex-1 w-full max-w-[min(100%-1rem,1180px)] mx-auto px-3 sm:px-6 lg:px-10 py-6 sm:py-8 flex flex-col gap-5 sm:gap-6 pb-10">

        {/* Back + breadcrumb */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-navy-500 hover:text-navy-800 text-sm transition-colors"
          >
            <ArrowLeft size={15} />
            Applications
          </button>
          <span className="text-navy-300">›</span>
          <span className="text-sm text-navy-700 font-medium">{businessName}</span>
        </div>

        {app.isBundledDemo && (
          <div className="rounded-2xl border border-indigo-200 border-l-4 border-l-indigo-500 bg-indigo-50/90 px-4 py-3 sm:px-5">
            <p className="text-xs font-bold uppercase tracking-wide text-indigo-900">Demo case</p>
            <p className="text-sm text-indigo-900/90 mt-1 leading-snug">
              {app.bundledDemoNote ?? 'Synthetic Indian sample — not a real borrower.'}
            </p>
          </div>
        )}

        {/* Application meta strip */}
        <div className="bg-white rounded-2xl border border-surface-200 shadow-sm overflow-hidden border-t-4 border-t-navy-800">
          <div className="px-4 py-4 sm:px-6 sm:py-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h1 className="font-heading font-semibold text-xl sm:text-2xl text-navy-900 leading-tight">{businessName}</h1>
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="text-[11px] sm:text-xs font-semibold capitalize bg-surface-100 text-navy-800 px-2.5 py-1 rounded-lg border border-surface-200">{businessType}</span>
                  <span className="text-[11px] sm:text-xs font-mono bg-surface-100 text-navy-800 px-2.5 py-1 rounded-lg border border-surface-200">{pincode}</span>
                  <span className="text-[11px] sm:text-xs text-navy-600 bg-surface-50 px-2.5 py-1 rounded-lg border border-surface-200 tabular-nums">{formatDate(submittedAt)}</span>
                </div>
                <p className="text-sm text-navy-600 mt-3 leading-relaxed border-t border-surface-100 pt-3">{address}</p>
                {typeof appLat === 'number' && typeof appLon === 'number' && (
                  <p className="text-[11px] text-navy-500 mt-2 font-mono tabular-nums">
                    Shop GPS (applicant): {appLat.toFixed(5)}, {appLon.toFixed(5)}
                  </p>
                )}
              </div>
              <div className="shrink-0 sm:text-right">
                <p className="text-[10px] font-bold uppercase tracking-wider text-navy-400">Ref</p>
                <p className="font-mono text-xs sm:text-sm font-semibold text-navy-900 bg-surface-100 px-3 py-2 rounded-xl border border-surface-200 mt-1 break-all sm:max-w-[220px] sm:ml-auto">
                  {app.id}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Officer decision — approve / reject */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl border px-4 py-4 sm:px-5 sm:py-5 ${officerBadge.bg} ${officerBadge.border}`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0">
                <p className={`text-sm font-bold ${officerBadge.text}`}>{officerBadge.label}</p>
                <p className="text-xs text-navy-700 mt-1.5 leading-snug max-w-2xl">
                  {officerStatus === 'pending_review' && (
                    <>Use <strong className="text-navy-900">Approve</strong> or <strong className="text-navy-900">Reject</strong> after you read the signals below. Public applicants never see scores here.</>
                  )}
                  {officerStatus === 'approved' && (
                    <>Marked approved in this browser demo — log the real decision in core banking.</>
                  )}
                  {officerStatus === 'rejected' && (
                    <>Rejected in this session. Applicant only had their ref ID on submit — no scores shown there.</>
                  )}
                </p>
            </div>
            {officerStatus === 'pending_review' && (
              <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:flex-shrink-0 w-full sm:w-auto">
                <Button
                  size="md"
                  onClick={handleApprove}
                  className="!bg-emerald-600 hover:!bg-emerald-700 focus-visible:!ring-emerald-500 !text-white min-h-[48px] w-full sm:w-auto justify-center"
                >
                  <CheckCircle2 size={16} className="shrink-0" />
                  Approve
                </Button>
                <Button size="md" variant="danger" onClick={handleReject} className="min-h-[48px] w-full sm:w-auto justify-center">
                  Reject
                </Button>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Recommendation card ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <div className={`rounded-2xl border p-5 sm:p-6 ${config.bg} ${config.border} border-l-4 border-l-navy-900/20`}>
            <div className="flex flex-col sm:flex-row sm:items-start gap-6 flex-wrap">
              <div className="flex flex-col items-center gap-2 flex-shrink-0 mx-auto sm:mx-0">
                <ScoreRing score={layer4Result.weightedScore} size={88} strokeWidth={8} />
                <span className="text-[11px] font-semibold uppercase tracking-wide text-navy-500">Store score</span>
              </div>
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className={`inline-block w-2.5 h-2.5 rounded-full shrink-0 ${config.dotClass}`} aria-hidden />
                  <span className={`font-heading font-semibold text-lg ${config.labelColor}`}>
                    {config.label}
                  </span>
                  <span className="text-xs font-mono font-semibold text-navy-600 bg-white/70 px-2 py-0.5 rounded-md border border-black/5">
                    {layer4Result.storeScoreOutOf100}/100
                  </span>
                </div>
                <p className="text-sm text-navy-800 mt-2 leading-snug max-w-prose mx-auto sm:mx-0">{config.description}</p>
                {layer4Result.recommendation !== 'reject' && (
                  <div className="mt-4 rounded-xl border border-black/10 bg-white/70 p-4 text-center sm:text-left">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-navy-500">Indicative loan band</p>
                    <p className="font-heading font-semibold text-navy-900 text-2xl mt-1 tabular-nums">{fmtInr(loanAmount)}</p>
                    <p className="text-[11px] text-navy-500 mt-1">
                      {config.loanMultiplier}× est. monthly income · verify in field
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Layer scores strip */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.06 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4"
        >
          {[
            { label: 'Identity', score: layer1Result.overallCredibilityScore, sub: 'Layer 1' },
            { label: 'Vision', score: layer2Result.overallVisionScore, sub: 'Layer 2' },
            { label: 'Geo', score: layer3Result.overallGeoScore, sub: 'Layer 3' },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white border border-surface-200 rounded-2xl p-4 sm:p-5 flex flex-row sm:flex-col items-center gap-4 sm:gap-3 shadow-sm border-t-4 border-t-navy-700/15"
            >
              <div className="shrink-0">
                <ScoreRing score={s.score} size={56} strokeWidth={5} />
              </div>
              <div className="text-left sm:text-center min-w-0 flex-1">
                <p className="text-sm font-bold text-navy-900">{s.label}</p>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-navy-400 mt-0.5">{s.sub}</p>
                <p className="text-lg font-heading font-bold text-navy-800 mt-1 tabular-nums">{Math.round(s.score * 100)}<span className="text-sm text-navy-400">%</span></p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── Cash flow estimate ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }}>
          <Section>
            <SectionHeading
              accent="emerald"
              title="Cash flow estimate"
              sub="Blended from tier, footfall, and identity strength."
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              <CashFlowCell
                label="Daily sales" primary
                min={fmtInr(cf.dailySalesMin)} max={fmtInr(cf.dailySalesMax)} median={fmtInr(cf.dailySalesMedian)}
              />
              <CashFlowCell
                label="Monthly revenue"
                min={fmtInr(cf.monthlyRevenueMin)} max={fmtInr(cf.monthlyRevenueMax)}
              />
              <CashFlowCell
                label="Monthly income"
                min={fmtInr(cf.monthlyIncomeMin)} max={fmtInr(cf.monthlyIncomeMax)}
                sub={`${cf.assumedMarginPct}% margin`}
              />
            </div>
            <div className="rounded-xl bg-surface-50 border border-surface-200 px-4 py-3">
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wide text-navy-500">Confidence</span>
                <span className="text-sm font-heading font-bold text-navy-900 tabular-nums">{Math.round(cf.confidenceScore * 100)}%</span>
              </div>
              <div className="h-2.5 bg-surface-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.round(cf.confidenceScore * 100)}%` }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className={`h-full rounded-full ${
                    cf.confidenceScore >= 0.7 ? 'bg-emerald-500' :
                    cf.confidenceScore >= 0.5 ? 'bg-amber-500' : 'bg-red-400'
                  }`}
                />
              </div>
              <p className="text-[11px] text-navy-500 mt-2">Tier {cf.tierUsed} benchmark curve</p>
            </div>
          </Section>
        </motion.div>

        {/* ── Stored BizScore analysis (Layer 4) — vote breakdown ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.14 }}>
          <Section>
            <SectionHeading
              accent="navy"
              title="Stored BizScore analysis (Layer 4)"
              sub="Each row is one model vote; width shows strength."
            />
            <div className="flex flex-wrap items-center gap-2 mb-5 rounded-xl bg-surface-50 border border-surface-200 px-4 py-3">
              <span className="text-[11px] font-bold uppercase tracking-wide text-navy-500">Model</span>
              <span className="font-heading text-2xl font-bold text-navy-900 tabular-nums">{layer4Result.storeScoreOutOf100}</span>
              <span className="text-navy-400 text-sm">/ 100</span>
              <span className="h-4 w-px bg-surface-300 mx-1 hidden sm:block" aria-hidden />
              <span className="text-sm font-semibold text-navy-800 bg-white px-2.5 py-1 rounded-lg border border-surface-200">
                {REC_LABEL[layer4Result.recommendation]}
              </span>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-6 gap-y-4">
              {layer4Result.votes.map((vote, i) => (
                <motion.div
                  key={vote.name}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 0.2 + i * 0.05 }}
                  className="rounded-xl border border-surface-100 bg-surface-50/50 p-3 sm:p-4"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm font-semibold text-navy-900 truncate">{vote.name}</span>
                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0 ${
                        vote.status === 'active' ? 'bg-navy-100 text-navy-700' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {STATUS_SHORT[vote.status]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-medium text-navy-400 tabular-nums">{vote.weight}%</span>
                      <span className="text-lg font-heading font-bold text-navy-900 tabular-nums w-10 text-right">
                        {Math.round(vote.score * 100)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 h-2 bg-surface-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round(vote.score * 100)}%` }}
                      transition={{ duration: 0.7, delay: 0.25 + i * 0.05 }}
                      className={`h-full rounded-full ${STATUS_COLOR[vote.status]}`}
                    />
                  </div>
                  <p className="text-[11px] sm:text-xs text-navy-500 leading-snug mt-2">{vote.note}</p>
                </motion.div>
              ))}
            </div>
            <div className="mt-5 pt-4 border-t-2 border-dashed border-surface-200 flex items-center justify-between gap-3">
              <span className="text-sm font-bold text-navy-800">Weighted total</span>
              <span className="font-heading font-bold text-navy-900 text-2xl tabular-nums">
                {layer4Result.storeScoreOutOf100}<span className="text-base text-navy-400 font-semibold">/100</span>
              </span>
            </div>
          </Section>
        </motion.div>

        {/* ── Industry reference imagery (open stock — not applicant photos) ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.18 }}>
          <Section>
            <SectionHeading
              accent="blue"
              title="Industry reference imagery"
              sub={`Stock photos for “${businessType}” — not this shop.`}
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
              {getIndustryReferenceImages(businessType).map((img, i) => (
                <motion.figure
                  key={img.src}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: 0.12 + i * 0.05 }}
                  className="m-0 overflow-hidden rounded-xl border border-surface-200 bg-surface-100 shadow-sm"
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    loading="lazy"
                    decoding="async"
                    className="h-32 w-full object-cover sm:h-36"
                  />
                  <figcaption className="px-2 py-1.5 text-[10px] leading-snug text-navy-500 line-clamp-2">
                    {img.alt}
                  </figcaption>
                </motion.figure>
              ))}
            </div>
            <p className="text-[10px] text-navy-400 mt-3">
              <a href="https://www.pexels.com/license/" target="_blank" rel="noopener noreferrer" className="text-navy-600 underline underline-offset-2">Pexels</a> licence · illustrative only
            </p>
          </Section>
        </motion.div>

        {/* ── Vision signals ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.22 }}>
          <Section>
            <SectionHeading accent="navy" title="Visual signals" sub="From submitted store photos." />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
              {[
                { label: 'Store tier', value: `Tier ${layer2Result.tierClassification.tier}` },
                { label: 'Store size', value: `~${layer2Result.storeSizeEstimateSqft} sqft` },
                { label: 'SKU count', value: `${layer2Result.shelfAnalysis.skuCount} types` },
                { label: 'Shelf density', value: `${Math.round(layer2Result.shelfAnalysis.shelfDensityIndex * 100)}%` },
              ].map((m) => (
                <div key={m.label} className="bg-gradient-to-b from-surface-50 to-white border border-surface-200 rounded-xl p-3 text-center border-t-2 border-t-navy-700/10">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-navy-400">{m.label}</p>
                  <p className="font-heading font-bold text-navy-900 text-base mt-1">{m.value}</p>
                </div>
              ))}
            </div>
            {layer2Result.tierClassification.signals.length > 0 && (
              <div className="flex flex-col gap-2">
                {layer2Result.tierClassification.signals.map((s) => (
                  <div key={s.signal} className="flex items-stretch gap-3 rounded-xl bg-surface-50/80 border border-surface-100 px-3 py-2.5">
                    <div className={`w-1 rounded-full shrink-0 self-stretch min-h-[2.5rem] ${s.confidence >= 0.75 ? 'bg-emerald-500' : 'bg-amber-400'}`} aria-hidden />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-navy-900 leading-snug">{s.signal}</p>
                      <p className="hidden sm:block text-[11px] text-navy-500 mt-1">{s.proxy}</p>
                    </div>
                    <div className="flex flex-col items-end justify-center shrink-0 gap-1">
                      <div className="w-20 h-1.5 bg-surface-200 rounded-full overflow-hidden">
                        <div className="h-full bg-navy-700 rounded-full" style={{ width: `${Math.round(s.confidence * 100)}%` }} />
                      </div>
                      <span className="text-[11px] font-bold text-navy-700 tabular-nums">{Math.round(s.confidence * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </motion.div>

        {/* ── Geo signals ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.26 }}>
          <Section>
            <SectionHeading accent="amber" title="Location & catchment" sub="Pincode model + GPS check." />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {[
                { label: 'Population density', value: `${layer3Result.geoSignals.populationDensityPerSqKm.toLocaleString('en-IN')}/km²` },
                { label: 'Road type', value: layer3Result.geoSignals.roadType },
                { label: 'Road score', value: `${layer3Result.geoSignals.roadTypeScore}/5` },
                { label: 'POIs within 500m', value: String(layer3Result.geoSignals.poiCount500m) },
                { label: 'Competitors 500m', value: String(layer3Result.geoSignals.competitorCount500m) },
                { label: 'Pincode income band', value: layer3Result.geoSignals.pincodeIncomeBand },
                { label: 'Area affluence', value: `${Math.round(layer3Result.geoSignals.areaAffluenceScore * 100)}%` },
                { label: 'Est. daily footfall', value: `${layer3Result.geoSignals.pincodeAvgDailyFootfall.toLocaleString('en-IN')}` },
                { label: 'Rent/revenue ratio', value: `${Math.round(layer3Result.rentOwnership.rentToRevenueRatio * 100)}%` },
              ].map((m) => (
                <div key={m.label} className="rounded-xl border border-surface-200 bg-white p-3 border-l-4 border-l-amber-400/40">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-navy-400 leading-tight">{m.label}</p>
                  <p className="font-heading font-bold text-navy-900 text-sm mt-1 capitalize tabular-nums">{m.value}</p>
                </div>
              ))}
            </div>
            <div
              className={`mt-4 rounded-xl border px-4 py-3 sm:px-5 sm:py-4 border-l-4 ${
                layer3Result.gpsConsistency.flagged
                  ? 'border-amber-200 bg-amber-50/80 border-l-amber-500'
                  : 'border-emerald-200 bg-emerald-50/60 border-l-emerald-600'
              }`}
            >
              <p className="text-[10px] font-bold uppercase tracking-wide text-navy-500">GPS</p>
              <p className="text-sm font-bold text-navy-900 mt-1">
                {layer3Result.gpsConsistency.flagged ? 'Mismatch' : 'Aligned'}
                <span className="font-mono font-semibold text-navy-700"> · ±{layer3Result.gpsConsistency.maxDeviationMetres}m</span>
              </p>
              <p className="text-xs text-navy-600 mt-1.5 leading-snug">{layer3Result.gpsConsistency.note}</p>
            </div>
          </Section>
        </motion.div>

        {/* ── Explainability ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.3 }}>
          <Section>
            <SectionHeading accent="navy" title="Appraiser flags" sub="Quick read on strengths and watch-outs." />
            <div className="grid grid-cols-1 gap-2 sm:gap-2.5">
              {buildExplainabilityFlags(layer2Result, layer3Result, layer4Result).map((flag) => (
                <div
                  key={flag.text}
                  className="flex gap-3 rounded-xl border border-surface-100 bg-surface-50/60 px-3 py-2.5 sm:px-4"
                >
                  <div
                    className={`w-1 rounded-full shrink-0 self-stretch min-h-[2.75rem] ${
                      flag.type === 'positive' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                    aria-hidden
                  />
                  <p className="text-xs sm:text-sm text-navy-700 leading-snug pt-0.5">{flag.text}</p>
                </div>
              ))}
            </div>
          </Section>
        </motion.div>

        {/* Back */}
        <div className="flex justify-stretch sm:justify-start">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2 px-5 rounded-xl border-2 border-surface-200 bg-white text-sm font-semibold text-navy-800 hover:bg-surface-50 active:scale-[0.99] transition-transform"
          >
            <ArrowLeft size={16} className="shrink-0" />
            All applications
          </button>
        </div>

      </main>
    </div>
  )
}
