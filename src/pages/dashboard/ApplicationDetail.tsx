import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, ShieldCheck, ShieldAlert, ShieldX,
  TrendingUp, BarChart3, AlertTriangle, CheckCircle2,
  MapPin, Eye, Calendar, Building2, Gavel,
} from 'lucide-react'
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

// ─── Config ───────────────────────────────────────────────────────────────────

const REC_CONFIG = {
  pre_approve: {
    icon: ShieldCheck,
    iconColor: 'text-emerald-500',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    label: 'Good to go',
    labelColor: 'text-emerald-700',
    description: 'All signals pass threshold. Application can be fast-tracked for loan disbursement. Field verification optional.',
    loanMultiplier: 3,
  },
  needs_verification: {
    icon: ShieldAlert,
    iconColor: 'text-amber-500',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    label: 'Needs field visit',
    labelColor: 'text-amber-700',
    description: 'Score is acceptable but some signals have uncertainty. Schedule a field visit before disbursement.',
    loanMultiplier: 2,
  },
  reject: {
    icon: ShieldX,
    iconColor: 'text-red-500',
    bg: 'bg-red-50',
    border: 'border-red-200',
    label: 'Not approved',
    labelColor: 'text-red-700',
    description: 'Insufficient signal quality or high fraud risk detected. Do not proceed without complete re-submission.',
    loanMultiplier: 0,
  },
}

const STATUS_COLOR: Record<VoteSignal['status'], string> = {
  active: 'bg-navy-600',
  proxy: 'bg-amber-400',
  skipped: 'bg-surface-300',
}

const STATUS_LABEL: Record<VoteSignal['status'], string> = {
  active: 'Live signal',
  proxy: 'Proxy / estimated',
  skipped: 'Not available',
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
    <div className={`bg-white rounded-xl border border-surface-200 p-5 ${className}`}>
      {children}
    </div>
  )
}

function SectionTitle({ icon: Icon, title, sub }: { icon: React.ElementType; title: string; sub?: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon size={16} className="text-navy-600 flex-shrink-0" />
      <div>
        <h3 className="font-heading font-semibold text-navy-900 text-sm">{title}</h3>
        {sub && <p className="text-xs text-navy-400">{sub}</p>}
      </div>
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
    label: 'Awaiting your review',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
  },
  approved: {
    label: 'Application approved',
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
  },
  rejected: {
    label: 'Application rejected',
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
        <div className="flex flex-col items-center justify-center flex-1 gap-5 p-8">
          <AlertTriangle size={32} className="text-amber-500" />
          <h2 className="font-heading font-semibold text-navy-900 text-xl">Application not found</h2>
          <p className="text-navy-500 text-sm">The application ID does not exist or has been cleared.</p>
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
  const Icon = config.icon
  const cf = layer4Result.cashFlowEstimate
  const monthlyIncomeMedian = Math.round((cf.monthlyIncomeMin + cf.monthlyIncomeMax) / 2)
  const loanAmount = config.loanMultiplier * monthlyIncomeMedian

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col">
      <DashboardHeader />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-6">

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

        {/* Application meta strip */}
        <div className="bg-white rounded-xl border border-surface-200 px-5 py-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="font-heading font-semibold text-xl text-navy-900">{businessName}</h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-navy-500">
                <span className="flex items-center gap-1 capitalize">
                  <Building2 size={12} /> {businessType}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={12} /> {address} · {pincode}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={12} /> {formatDate(submittedAt)}
                </span>
              </div>
            </div>
            <span className="font-mono text-xs bg-surface-100 px-3 py-1.5 rounded-lg text-navy-700 font-medium">
              {app.id}
            </span>
          </div>
        </div>

        {/* Officer decision — approve / reject */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-xl border px-5 py-4 ${officerBadge.bg} ${officerBadge.border}`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/80 border border-surface-200 flex items-center justify-center flex-shrink-0">
                <Gavel size={18} className="text-navy-700" />
              </div>
              <div>
                <p className={`text-sm font-semibold ${officerBadge.text}`}>{officerBadge.label}</p>
                <p className="text-xs text-navy-600 mt-1 leading-relaxed max-w-xl">
                  {officerStatus === 'pending_review' && (
                    <>
                      Review the BizScore report below. When you <strong>approve</strong>, the applicant may be informed
                      that their file passed officer review (in production, via SMS or branch process).
                      Scores are never shown to the business on the public form — only here.
                    </>
                  )}
                  {officerStatus === 'approved' && (
                    <>You approved this application. Record your next steps in the core banking system (demo: status saved in this browser only).</>
                  )}
                  {officerStatus === 'rejected' && (
                    <>You rejected this application. The business side does not show scores; they only saw submission confirmation with their reference ID.</>
                  )}
                </p>
              </div>
            </div>
            {officerStatus === 'pending_review' && (
              <div className="flex flex-wrap gap-2 sm:flex-shrink-0">
                <Button
                  size="md"
                  onClick={handleApprove}
                  className="!bg-emerald-600 hover:!bg-emerald-700 focus-visible:!ring-emerald-500 !text-white"
                >
                  <CheckCircle2 size={16} />
                  Approve application
                </Button>
                <Button size="md" variant="danger" onClick={handleReject}>
                  Reject application
                </Button>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Recommendation card ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <div className={`rounded-xl border p-6 ${config.bg} ${config.border}`}>
            <div className="flex items-start gap-5 flex-wrap">
              <div className="flex flex-col items-center gap-2 flex-shrink-0">
                <ScoreRing score={layer4Result.weightedScore} size={84} strokeWidth={8} />
                <span className="text-xs text-navy-500">Store score</span>
              </div>
              <div className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-2 flex-wrap">
                  <Icon size={18} className={config.iconColor} />
                  <span className={`font-heading font-semibold text-base ${config.labelColor}`}>
                    {config.label}
                  </span>
                  <span className="text-xs text-navy-500 font-mono">
                    {layer4Result.storeScoreOutOf100} / 100
                  </span>
                </div>
                <p className="text-sm text-navy-700 mt-2 leading-relaxed">{config.description}</p>
                {layer4Result.recommendation !== 'reject' && (
                  <div className="mt-4 bg-white/60 rounded-lg border border-white p-3">
                    <p className="text-xs text-navy-400 mb-1">Indicative loan eligibility</p>
                    <p className="font-heading font-semibold text-navy-900 text-lg">{fmtInr(loanAmount)}</p>
                    <p className="text-xs text-navy-400 mt-0.5">
                      {config.loanMultiplier}× estimated monthly income · subject to field verification
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
          className="grid grid-cols-3 gap-3"
        >
          {[
            { label: 'Identity score', score: layer1Result.overallCredibilityScore, sub: 'Layer 1' },
            { label: 'Vision score', score: layer2Result.overallVisionScore, sub: 'Layer 2' },
            { label: 'Geo score', score: layer3Result.overallGeoScore, sub: 'Layer 3' },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-surface-200 rounded-xl p-3 flex flex-col items-center gap-2">
              <ScoreRing score={s.score} size={52} strokeWidth={5} />
              <div className="text-center">
                <p className="text-xs font-medium text-navy-800">{s.label}</p>
                <p className="text-xs text-navy-400">{s.sub}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── Cash flow estimate ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }}>
          <Section>
            <SectionTitle
              icon={TrendingUp}
              title="Cash flow estimate"
              sub="Tier benchmark × geo footfall index × layer 1 credibility"
            />
            <div className="grid grid-cols-3 gap-3 mb-4">
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
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-navy-400">Confidence score</span>
                <span className="text-xs font-medium text-navy-700">{Math.round(cf.confidenceScore * 100)}%</span>
              </div>
              <div className="h-1.5 bg-surface-200 rounded-full overflow-hidden">
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
              <p className="text-xs text-navy-400 mt-1.5">Tier {cf.tierUsed} benchmark</p>
            </div>
          </Section>
        </motion.div>

        {/* ── Vote breakdown ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.14 }}>
          <Section>
            <SectionTitle
              icon={BarChart3}
              title="Multi-model vote breakdown"
              sub="Weighted scoring across all available signals"
            />
            <div className="flex flex-col gap-3">
              {layer4Result.votes.map((vote, i) => (
                <motion.div
                  key={vote.name}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 0.2 + i * 0.05 }}
                  className="flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-navy-800">{vote.name}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        vote.status === 'active' ? 'bg-navy-50 text-navy-500' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {STATUS_LABEL[vote.status]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-navy-400">{vote.weight}%</span>
                      <span className="text-sm font-heading font-semibold text-navy-900 w-8 text-right">
                        {Math.round(vote.score * 100)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 h-2 bg-surface-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round(vote.score * 100)}%` }}
                      transition={{ duration: 0.7, delay: 0.25 + i * 0.05 }}
                      className={`h-full rounded-full ${STATUS_COLOR[vote.status]}`}
                    />
                  </div>
                  <p className="text-xs text-navy-400 leading-relaxed">{vote.note}</p>
                  {i < layer4Result.votes.length - 1 && <div className="border-t border-surface-100 mt-1" />}
                </motion.div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-surface-200 flex items-center justify-between">
              <span className="text-sm font-medium text-navy-700">Weighted store score</span>
              <span className="font-heading font-semibold text-navy-900 text-lg">
                {layer4Result.storeScoreOutOf100} / 100
              </span>
            </div>
          </Section>
        </motion.div>

        {/* ── Vision signals ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.18 }}>
          <Section>
            <SectionTitle icon={Eye} title="Visual signals" sub="Detected from store photos" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {[
                { label: 'Store tier', value: `Tier ${layer2Result.tierClassification.tier}` },
                { label: 'Store size', value: `~${layer2Result.storeSizeEstimateSqft} sqft` },
                { label: 'SKU count', value: `${layer2Result.shelfAnalysis.skuCount} types` },
                { label: 'Shelf density', value: `${Math.round(layer2Result.shelfAnalysis.shelfDensityIndex * 100)}%` },
              ].map((m) => (
                <div key={m.label} className="bg-surface-50 border border-surface-200 rounded-lg p-3 text-center">
                  <p className="text-xs text-navy-400">{m.label}</p>
                  <p className="font-heading font-semibold text-navy-900 text-sm mt-0.5">{m.value}</p>
                </div>
              ))}
            </div>
            {layer2Result.tierClassification.signals.length > 0 && (
              <div className="flex flex-col gap-1.5">
                {layer2Result.tierClassification.signals.map((s) => (
                  <div key={s.signal} className="flex items-center gap-3 py-1.5 border-b border-surface-100 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-navy-800">{s.signal}</p>
                      <p className="text-xs text-navy-400 mt-0.5">Proxy: {s.proxy}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="w-16 h-1 bg-surface-200 rounded-full overflow-hidden">
                        <div className="h-full bg-navy-600 rounded-full" style={{ width: `${Math.round(s.confidence * 100)}%` }} />
                      </div>
                      <span className="text-xs text-navy-500 w-7 text-right">{Math.round(s.confidence * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </motion.div>

        {/* ── Geo signals ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.22 }}>
          <Section>
            <SectionTitle icon={MapPin} title="Geo and location signals" sub="Based on pincode and GPS coordinates" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
                <div key={m.label} className="bg-surface-50 border border-surface-200 rounded-lg p-3">
                  <p className="text-xs text-navy-400">{m.label}</p>
                  <p className="font-heading font-semibold text-navy-900 text-sm mt-0.5 capitalize">{m.value}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-3 bg-surface-50 border border-surface-200 rounded-lg px-4 py-3">
              <div>
                <p className="text-xs text-navy-400">GPS consistency</p>
                <p className="text-sm font-medium text-navy-900 mt-0.5">
                  {layer3Result.gpsConsistency.flagged
                    ? `⚠ Mismatch — max deviation ${layer3Result.gpsConsistency.maxDeviationMetres}m`
                    : `✓ Verified — within ${layer3Result.gpsConsistency.maxDeviationMetres}m`}
                </p>
                <p className="text-xs text-navy-400 mt-0.5">{layer3Result.gpsConsistency.note}</p>
              </div>
            </div>
          </Section>
        </motion.div>

        {/* ── Explainability ── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.26 }}>
          <Section>
            <SectionTitle icon={BarChart3} title="Explainability — appraiser flags" />
            <div className="grid grid-cols-1 gap-2">
              {buildExplainabilityFlags(layer2Result, layer3Result, layer4Result).map((flag) => (
                <div key={flag.text} className="flex items-start gap-2">
                  {flag.type === 'positive'
                    ? <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                    : <AlertTriangle size={13} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  }
                  <span className="text-xs text-navy-600 leading-relaxed">{flag.text}</span>
                </div>
              ))}
            </div>
          </Section>
        </motion.div>

        {/* Back */}
        <div className="flex justify-start">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-surface-200 bg-white text-sm text-navy-600 hover:bg-surface-50 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to all applications
          </button>
        </div>

      </main>
    </div>
  )
}
