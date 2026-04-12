import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ShieldCheck, ShieldAlert, ShieldX, RotateCcw,
  TrendingUp, BarChart3, AlertTriangle, CheckCircle2,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ScoreRing } from '@/components/ui/ScoreRing'
import { MockDataBanner } from '@/components/ui/MockDataBanner'
import type { Layer4Result, Layer3Result, Layer2Result, VoteSignal } from '@/types'

interface LocationState {
  businessName?: string
  businessType?: string
  pincode?: string
  layer2Result?: Layer2Result
  layer3Result?: Layer3Result
  layer4Result?: Layer4Result
}

const RECOMMENDATION_CONFIG = {
  pre_approve: {
    icon: ShieldCheck,
    iconColor: 'text-emerald-500',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    label: 'Good to go',
    labelColor: 'text-emerald-700',
    description:
      'Your shop passed all our checks. Based on our analysis, this business looks strong and can be considered for a loan without needing a field visit.',
    loanMultiplier: 3,
  },
  needs_verification: {
    icon: ShieldAlert,
    iconColor: 'text-amber-500',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    label: 'Needs a field visit',
    labelColor: 'text-amber-700',
    description:
      'Your score is good but some details need a quick in-person check before a loan can be approved. A loan officer may visit your shop.',
    loanMultiplier: 2,
  },
  reject: {
    icon: ShieldX,
    iconColor: 'text-red-500',
    bg: 'bg-red-50',
    border: 'border-red-200',
    label: 'Not approved',
    labelColor: 'text-red-700',
    description:
      'We could not confirm enough details about your shop in this assessment. Please resubmit with better photos and complete information.',
    loanMultiplier: 0,
  },
}

const STATUS_COLOR: Record<VoteSignal['status'], string> = {
  active: 'bg-navy-600',
  proxy: 'bg-amber-400',
  skipped: 'bg-surface-300',
}

const STATUS_LABEL: Record<VoteSignal['status'], string> = {
  active: 'Checked',
  proxy: 'Estimated (demo)',
  skipped: 'Not checked',
}

export default function FinalScorePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = (location.state ?? {}) as LocationState

  const { businessName, layer2Result, layer3Result, layer4Result } = state

  if (!layer4Result || !layer2Result || !layer3Result) {
    return (
      <div className="container-page py-16 max-w-xl mx-auto text-center flex flex-col items-center gap-5">
        <AlertTriangle size={32} className="text-amber-500" />
        <h2 className="font-heading font-semibold text-navy-900 text-xl">
          Assessment incomplete
        </h2>
        <p className="text-navy-500 text-sm">
          Please complete all layers before viewing the final score.
        </p>
        <Button onClick={() => navigate('/assess')}>Restart assessment</Button>
      </div>
    )
  }

  const config = RECOMMENDATION_CONFIG[layer4Result.recommendation]
  const Icon = config.icon
  const cf = layer4Result.cashFlowEstimate

  const fmtInr = (n: number) =>
    n >= 100000
      ? `₹${(n / 100000).toFixed(1)}L`
      : `₹${(n / 1000).toFixed(0)}K`

  // Loan eligibility estimate
  const monthlyIncomeMedian = Math.round((cf.monthlyIncomeMin + cf.monthlyIncomeMax) / 2)
  const loanAmount = config.loanMultiplier * monthlyIncomeMedian

  return (
    <div className="container-page py-8">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">

        {/* Mock data banner */}
        <MockDataBanner />

        {/* What's happening */}
        <div className="bg-navy-50 border border-navy-200 rounded-lg px-4 py-3">
          <p className="text-xs font-semibold text-navy-800 mb-0.5">Step 4 of 4 — Your score report</p>
          <p className="text-xs text-navy-600 leading-relaxed">
            All checks are complete. Below is your business score report — it shows your estimated sales,
            income range, and an overall recommendation based on all the checks we ran.
          </p>
        </div>

        {/* Header */}
        <div>
          <p className="text-label mb-1.5">Step 4 of 4 — Assessment complete</p>
          <h1 className="font-heading font-semibold text-xl lg:text-2xl text-navy-900">
            Your business score report
          </h1>
          <p className="text-navy-500 mt-1.5 text-sm">
            {businessName ?? 'Your business'} · All checks done
          </p>
        </div>

        {/* ── Primary recommendation card ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className={`rounded-xl border p-6 ${config.bg} ${config.border}`}>
            <div className="flex items-start gap-5">
              {/* Score ring */}
              <div className="flex flex-col items-center gap-2 flex-shrink-0">
                <ScoreRing score={layer4Result.weightedScore} size={84} strokeWidth={8} />
                <span className="text-xs text-navy-500">Store score</span>
              </div>

              {/* Result */}
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Icon size={18} className={config.iconColor} />
                  <span className={`font-heading font-semibold text-base ${config.labelColor}`}>
                    {config.label}
                  </span>
                  <span className="text-xs text-navy-500 font-mono">
                    {layer4Result.storeScoreOutOf100} / 100
                  </span>
                </div>
                <p className="text-sm text-navy-700 mt-2 leading-relaxed">
                  {config.description}
                </p>

                  {/* Loan eligibility */}
                  {layer4Result.recommendation !== 'reject' && (
                    <div className="mt-4 bg-white/60 rounded-lg border border-white p-3">
                      <p className="text-xs text-navy-400 mb-1">Estimated loan amount you may qualify for</p>
                      <p className="font-heading font-semibold text-navy-900 text-lg">
                        {fmtInr(loanAmount)}
                      </p>
                      <p className="text-xs text-navy-400 mt-0.5">
                        {config.loanMultiplier}× your estimated monthly income · subject to lender verification
                      </p>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Cash flow estimate ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
        >
          <Card>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={16} className="text-navy-600" />
              <h3 className="font-heading font-semibold text-navy-900 text-sm">
                Estimated sales and income
              </h3>
            </div>
            <p className="text-xs text-navy-400 mb-4 leading-relaxed">
              These are estimates based on your shop type, location, and photos.
              They are a range — your actual numbers may be higher or lower.
            </p>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <CashFlowCell
                label="Daily sales"
                min={fmtInr(cf.dailySalesMin)}
                max={fmtInr(cf.dailySalesMax)}
                median={fmtInr(cf.dailySalesMedian)}
                primary
              />
              <CashFlowCell
                label="Monthly revenue"
                min={fmtInr(cf.monthlyRevenueMin)}
                max={fmtInr(cf.monthlyRevenueMax)}
              />
              <CashFlowCell
                label="Monthly income"
                min={fmtInr(cf.monthlyIncomeMin)}
                max={fmtInr(cf.monthlyIncomeMax)}
                sub={`${cf.assumedMarginPct}% margin`}
              />
            </div>

            {/* Confidence bar */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-navy-400">Confidence score</span>
                <span className="text-xs font-medium text-navy-700">
                  {Math.round(cf.confidenceScore * 100)}%
                </span>
              </div>
              <div className="h-1.5 bg-surface-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.round(cf.confidenceScore * 100)}%` }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className={`h-full rounded-full ${
                    cf.confidenceScore >= 0.7 ? 'bg-emerald-500' :
                    cf.confidenceScore >= 0.5 ? 'bg-amber-500' :
                    'bg-red-400'
                  }`}
                />
              </div>
              <p className="text-xs text-navy-400 mt-1.5">
                Tier {cf.tierUsed} benchmark · Geo footfall index · Layer 1 credibility
              </p>
            </div>
          </Card>
        </motion.div>

        {/* ── Layer 4 voting breakdown ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.14 }}
        >
          <Card>
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 size={16} className="text-navy-600" />
              <h3 className="font-heading font-semibold text-navy-900 text-sm">
                How we calculated your score
              </h3>
            </div>
            <p className="text-xs text-navy-400 mb-4 leading-relaxed">
              Your final score is made up of several checks — each one is given a different weight.
              Higher weight means it matters more to your overall score.
            </p>

            <div className="flex flex-col gap-3">
              {layer4Result.votes.map((vote, i) => (
                <motion.div
                  key={vote.name}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: 0.2 + i * 0.06 }}
                  className="flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-navy-800">{vote.name}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        vote.status === 'active'
                          ? 'bg-navy-50 text-navy-500'
                          : 'bg-amber-50 text-amber-600'
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

                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-surface-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.round(vote.score * 100)}%` }}
                        transition={{ duration: 0.7, delay: 0.25 + i * 0.06 }}
                        className={`h-full rounded-full ${STATUS_COLOR[vote.status]}`}
                      />
                    </div>
                  </div>

                  <p className="text-xs text-navy-400 leading-relaxed">{vote.note}</p>

                  {i < layer4Result.votes.length - 1 && (
                    <div className="border-t border-surface-100 mt-1" />
                  )}
                </motion.div>
              ))}
            </div>

            {/* Weighted total */}
            <div className="mt-4 pt-4 border-t border-surface-200 flex items-center justify-between">
              <span className="text-sm font-medium text-navy-700">Weighted store score</span>
              <span className="font-heading font-semibold text-navy-900 text-lg">
                {layer4Result.storeScoreOutOf100} / 100
              </span>
            </div>
          </Card>
        </motion.div>

        {/* ── Factor breakdown (explainability) ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card padding="sm">
            <div className="px-2 pt-2 pb-2">
              <h3 className="font-heading font-semibold text-navy-900 text-sm mb-1">
                Why you got this score
              </h3>
              <p className="text-xs text-navy-400 mb-3 leading-relaxed">
                Here are the main reasons behind your score — both good points and things to watch out for.
              </p>
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
            </div>
          </Card>
        </motion.div>

        {/* ── Actions ── */}
        <div className="flex gap-3 justify-end flex-wrap">
          <Button
            variant="secondary"
            onClick={() => navigate('/assess')}
          >
            <RotateCcw size={14} />
            New assessment
          </Button>
        </div>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          <p className="text-xs font-semibold text-amber-800 mb-1">Important notice</p>
          <p className="text-xs text-amber-700 leading-relaxed">
            This is a demo report using sample data — not a real credit assessment.
            All scores and figures shown here are mock values for demonstration only.
            Actual loan decisions are made by the authorised financial institution after proper verification.
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function CashFlowCell({
  label, min, max, median, primary = false, sub,
}: {
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
      <p className={`text-xs mt-1 ${primary ? 'text-navy-300' : 'text-navy-500'}`}>
        {min} – {max}
      </p>
      {sub && <p className={`text-xs mt-0.5 ${primary ? 'text-navy-400' : 'text-navy-400'}`}>{sub}</p>}
    </div>
  )
}

function buildExplainabilityFlags(
  l2: Layer2Result,
  l3: Layer3Result,
  l4: Layer4Result,
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
