import type {
  Layer1Result,
  Layer2Result,
  Layer3Result,
  Layer4Result,
  VoteSignal,
  CashFlowEstimate,
  StoreTier,
} from '@/types'
import { TIER_CONFIG } from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// LAYER 4 — MULTI-MODEL WEIGHTED VOTING SYSTEM
//
// Each signal casts a weighted vote. The weighted sum becomes the store score.
// This mirrors how a credit committee triangulates multiple data points.
//
// Vote weights (must sum to 100):
//   Vision model         → 30%  (tier confidence, SDI, SKU)
//   Geo model            → 25%  (footfall, road, population, POI)
//   Economic heuristic   → 20%  (cash flow pre-analysis, rent ratio)
//   Creditworthiness     → 15%  (GST + Google Business proxy — replaces CIBIL)
//   Cash flow signal     → 10%  (tier × pincode income × daily sales range)
//
// Note: Aadhaar OTP is treated as a binary gate (pass/fail) not a vote weight.
// Mobile OTP already verified in Layer 1.
// ─────────────────────────────────────────────────────────────────────────────

// ── Cash flow pre-analysis (runs before vote, feeds economic heuristic) ──────

function buildCashFlowEstimate(
  tier: StoreTier,
  geoFootfallIndex: number,
  layer1Score: number,
): CashFlowEstimate {
  const config = TIER_CONFIG[tier]
  const [baseMin, baseMax] = config.dailyRange

  // Scale within tier range using geo footfall index
  const rangeWidth = baseMax - baseMin
  const median = baseMin + rangeWidth * geoFootfallIndex

  // Apply uncertainty band: ±35% for Tier 3, ±25% for Tier 2, ±20% for Tier 1
  const bandPct = tier === 1 ? 0.20 : tier === 2 ? 0.25 : 0.35

  const dailyMin = Math.round(median * (1 - bandPct))
  const dailyMax = Math.round(median * (1 + bandPct))
  const dailyMedian = Math.round(median)

  // Margin: 17% blended (calibrated to CARE Ratings kirana benchmarks)
  const margin = 0.17

  // Confidence: blend of tier confidence, geo quality, and layer 1 credibility
  const confidence = parseFloat(
    (0.50 * geoFootfallIndex + 0.30 * layer1Score + 0.20 * (tier === 1 ? 0.9 : tier === 2 ? 0.75 : 0.65)).toFixed(2)
  )

  return {
    dailySalesMin: dailyMin,
    dailySalesMax: dailyMax,
    dailySalesMedian: dailyMedian,
    monthlyRevenueMin: dailyMin * 30,
    monthlyRevenueMax: dailyMax * 30,
    monthlyIncomeMin: Math.round(dailyMin * 30 * margin),
    monthlyIncomeMax: Math.round(dailyMax * 30 * margin),
    assumedMarginPct: Math.round(margin * 100),
    confidenceScore: confidence,
    tierUsed: tier,
  }
}

// ── Build vote signals ────────────────────────────────────────────────────────

function buildVotes(
  l1: Layer1Result,
  l2: Layer2Result,
  l3: Layer3Result,
  cashFlow: CashFlowEstimate,
): VoteSignal[] {
  // Economic heuristic: cash flow viability vs rent burden
  const rentRisk = l3.rentOwnership.repaymentRiskClass
  const economicScore =
    cashFlow.confidenceScore * (rentRisk === 'low' ? 1 : rentRisk === 'medium' ? 0.85 : 0.65)

  // Creditworthiness proxy (replaces CIBIL — see note above)
  const creditProxy = l1.overallCredibilityScore

  // Cash flow signal: normalise daily median against tier ceiling
  const tierCeiling = TIER_CONFIG[l2.tierClassification.tier].dailyRange[1]
  const cashFlowSignal = Math.min(cashFlow.dailySalesMedian / tierCeiling, 1)

  return [
    {
      name: 'Vision model',
      score: l2.overallVisionScore,
      weight: 30,
      status: 'active',
      note: `Tier ${l2.tierClassification.tier} detected · SDI ${Math.round(l2.shelfAnalysis.shelfDensityIndex * 100)}% · ${l2.shelfAnalysis.skuCount} SKUs`,
    },
    {
      name: 'Geo model',
      score: l3.overallGeoScore,
      weight: 25,
      status: 'active',
      note: `${l3.geoSignals.roadType} road · ${l3.geoSignals.poiCount500m} POIs · pop ${(l3.geoSignals.populationDensityPerSqKm / 1000).toFixed(1)}K/km²`,
    },
    {
      name: 'Economic heuristic',
      score: parseFloat(economicScore.toFixed(2)),
      weight: 20,
      status: 'active',
      note: `Rent-to-revenue ${Math.round(l3.rentOwnership.rentToRevenueRatio * 100)}% · risk class: ${rentRisk}`,
    },
    {
      name: 'Creditworthiness proxy',
      score: creditProxy,
      weight: 15,
      status: 'proxy',
      note: `Google Business + GST verification score (replaces CIBIL in production)`,
    },
    {
      name: 'Cash flow signal',
      score: parseFloat(cashFlowSignal.toFixed(2)),
      weight: 10,
      status: 'active',
      note: `Daily median ₹${cashFlow.dailySalesMedian.toLocaleString('en-IN')} · confidence ${Math.round(cashFlow.confidenceScore * 100)}%`,
    },
  ]
}

// ── Master Layer 4 runner ─────────────────────────────────────────────────────

export function runLayer4Voting(
  l1: Layer1Result,
  l2: Layer2Result,
  l3: Layer3Result,
): Layer4Result {
  const cashFlow = buildCashFlowEstimate(
    l2.tierClassification.tier,
    l3.geoFootfallIndex,
    l1.overallCredibilityScore,
  )

  const votes = buildVotes(l1, l2, l3, cashFlow)

  // Weighted sum
  const weightedScore = votes.reduce(
    (acc, v) => acc + (v.score * v.weight) / 100,
    0
  )

  const storeScore = Math.round(weightedScore * 100)

  const recommendation: Layer4Result['recommendation'] =
    storeScore >= 65 ? 'pre_approve' :
    storeScore >= 40 ? 'needs_verification' :
    'reject'

  return {
    votes,
    weightedScore: parseFloat(weightedScore.toFixed(3)),
    storeScoreOutOf100: storeScore,
    recommendation,
    cashFlowEstimate: cashFlow,
  }
}
