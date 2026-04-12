import type { Layer2Result, StoreTier, TierClassification, ShelfAnalysis } from '@/types'
import { TIER_CONFIG } from '@/types'

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

// ─────────────────────────────────────────────────────────────────────────────
// LAYER 2 — VISION MODEL
//
// TODO (production): Replace each sub-function below with real FastAPI calls.
//
// Your Python model friend's endpoints will be:
//   POST /api/vision/tier-detect      → TierClassification
//   POST /api/vision/shelf-analysis   → ShelfAnalysis
//   POST /api/vision/store-size       → { sqft: number }
//
// All accept: FormData with { images: File[], businessType: string }
//
// Model stack on Python side:
//   - YOLO-World or YOLOv8 for object detection
//   - Florence-2 for open-vocab product classification
//   - Grounded SAM 2 for shelf segmentation (SDI calculation)
//   - CLAHE preprocessing for low-light images
//
// Wire up by replacing the mock bodies below with:
//   const res = await fetch(`${VITE_API_URL}/api/vision/tier-detect`, {
//     method: 'POST', body: formData
//   })
//   return await res.json()
// ─────────────────────────────────────────────────────────────────────────────

// ── Tier detection ─────────────────────────────────────────────────────────

// Determines store tier from visual signals in uploaded images.
// In production: YOLO-World detects branded assets (Visicooler, Lays racks)
// for Tier 1, sachet/plastic jar patterns for Tier 2, sack/bulk goods for Tier 3.
async function detectTier(
  imageCount: number,
  _businessType: string
): Promise<TierClassification> {
  await delay(2000)

  // Mock: deterministic tier based on image count for demo variety
  // Replace with actual model output in production
  const tier: StoreTier =
    imageCount >= 4 ? 1 :
    imageCount >= 2 ? 2 :
    3

  const config = TIER_CONFIG[tier]

  return {
    tier,
    tierLabel: config.label,
    proxyLogic: config.proxyLogic,
    confidence: tier === 1 ? 0.87 : tier === 2 ? 0.74 : 0.68,
    dailySalesRange: config.dailyRange,
    monthlySalesRange: config.monthlyRange,
    signals: config.signals.map((signal, i) => ({
      signal,
      confidence: 0.9 - i * 0.05,
      tier,
      proxy: config.proxyLogic,
    })),
  }
}

// ── Shelf analysis ─────────────────────────────────────────────────────────

// Calculates SDI and SKU count from shelf images.
// In production: Grounded SAM 2 segments shelf vs empty space → SDI ratio.
// YOLO-World counts distinct product categories → SKU diversity score.
// BigBasket 28K dataset maps detected products to ₹ price bands → inventory value.
async function analyseShelf(tier: StoreTier): Promise<ShelfAnalysis> {
  await delay(1500)

  // Mock values calibrated to tier benchmarks from CARE Ratings / BCG data
  const tierValues = {
    1: {
      sdi: 0.82,
      skuCount: 28,
      inventoryValue: 145000,
      objects: [
        'Amul deep freezer', 'Coca-Cola Visicooler', 'Lays racks',
        'Packaged snacks', 'Beverages', 'Personal care', 'Dairy products',
      ],
    },
    2: {
      sdi: 0.58,
      skuCount: 14,
      inventoryValue: 45000,
      objects: [
        'Sachets (shampoo/biscuit)', 'Plastic jars (candy)', 'FMCG packs',
        'Staples', 'Packaged foods', 'Soap bars',
      ],
    },
    3: {
      sdi: 0.34,
      skuCount: 6,
      inventoryValue: 22000,
      objects: [
        'Grain sacks', 'Large oil tins', 'Bulk soap packs',
        'Loose grains', 'Staple commodities',
      ],
    },
  }[tier]

  return {
    shelfDensityIndex: tierValues.sdi,
    skuCount: tierValues.skuCount,
    estimatedInventoryValue: tierValues.inventoryValue,
    detectedObjects: tierValues.objects,
  }
}

// ── Store size estimation ──────────────────────────────────────────────────

// Estimates floor area from images using monocular depth estimation.
// In production: Depth Anything v2 generates depth map → volume estimation
// → calibrated to known object sizes (standard shelf = 180cm height).
async function estimateStoreSize(tier: StoreTier): Promise<number> {
  await delay(600)
  // Mock: typical sqft per tier
  return tier === 1 ? 420 : tier === 2 ? 220 : 110
}

// ── Lighting quality ───────────────────────────────────────────────────────

// Low lighting reduces detection confidence. CLAHE preprocessing helps but
// confidence penalty still applies for very dark images.
async function scoreLighting(imageCount: number): Promise<number> {
  await delay(400)
  // Mock: more images submitted → higher lighting coverage score
  return Math.min(0.95, 0.5 + imageCount * 0.1)
}

// ── Master Layer 2 runner ──────────────────────────────────────────────────

export async function runLayer2Analysis(
  images: File[],
  businessType: string
): Promise<Layer2Result> {
  const imageCount = images.length

  // Run in sequence so UI can show progressive results
  const tierResult = await detectTier(imageCount, businessType)
  const shelfResult = await analyseShelf(tierResult.tier)
  const storeSizeSqft = await estimateStoreSize(tierResult.tier)
  const lightingScore = await scoreLighting(imageCount)

  // Overall vision score: weighted combination of tier confidence,
  // SDI quality, and lighting. Feeds Layer 4 voting system.
  const overallVisionScore =
    tierResult.confidence * 0.50 +
    shelfResult.shelfDensityIndex * 0.30 +
    lightingScore * 0.20

  return {
    tierClassification: tierResult,
    shelfAnalysis: shelfResult,
    storeSizeEstimateSqft: storeSizeSqft,
    lightingQualityScore: lightingScore,
    imageCount,
    overallVisionScore,
  }
}
