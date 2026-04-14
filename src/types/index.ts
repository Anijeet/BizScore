// ─── Verification layer types ────────────────────────────────────────────────

export type VerificationStatus = 'idle' | 'loading' | 'success' | 'warning' | 'failed'

export interface BusinessCheckResult {
  exists: boolean
  name: string
  address: string
  category: string
  listingAgeMonths: number
  rating: number
  reviewCount: number
  score: number // 0–1
}

export interface GSTResult {
  verified: boolean
  gstin: string
  tradeName: string
  registrationDate: string
  state: string
  status: 'active' | 'cancelled' | 'suspended' | 'not_provided'
  score: number // 0–1
}

export interface ProductExistenceResult {
  matches: boolean
  detectedCategories: string[]
  claimedCategory: string
  confidenceScore: number // 0–1
  notes: string
}

export interface Layer1Result {
  businessCheck: BusinessCheckResult
  gst: GSTResult
  productExistence: ProductExistenceResult
  overallCredibilityScore: number // 0–1
  recommendation: 'proceed' | 'review' | 'reject'
}

// ─── Layer 3 — Geo + economic types ──────────────────────────────────────────

export type RoadType = 'trunk' | 'primary' | 'secondary' | 'tertiary' | 'residential' | 'service'

export interface GeoSignals {
  populationDensityPerSqKm: number
  roadType: RoadType
  roadTypeScore: number          // 1–5
  poiCount500m: number           // demand generators within 500m
  competitorCount500m: number    // rival stores within 500m
  areaAffluenceScore: number     // 0–1 derived from OSM amenity diversity
  pincodeIncomeBand: 'high' | 'mid' | 'low'
  pincodeAvgDailyFootfall: number
}

export interface GpsConsistency {
  imageGpsMatches: boolean
  maxDeviationMetres: number
  flagged: boolean
  note: string
}

export interface RentOwnershipSignal {
  estimatedMonthlyRent: number    // ₹
  rentToRevenueRatio: number      // 0–1, > 0.2 is a risk flag
  ownershipType: 'rented' | 'owned' | 'unknown'
  repaymentRiskClass: 'low' | 'medium' | 'high'
}

export interface Layer3Result {
  geoSignals: GeoSignals
  gpsConsistency: GpsConsistency
  rentOwnership: RentOwnershipSignal
  geoFootfallIndex: number        // 0–1 composite demand score
  overallGeoScore: number         // 0–1 feeds Layer 4 voting
}

// ─── Layer 4 — Voting system types ───────────────────────────────────────────

export interface VoteSignal {
  name: string
  score: number        // 0–1
  weight: number       // percentage weight in final vote
  status: 'active' | 'proxy' | 'skipped'
  note: string
}

export interface Layer4Result {
  votes: VoteSignal[]
  weightedScore: number            // 0–1 final store score
  storeScoreOutOf100: number       // 0–100 for display
  recommendation: 'pre_approve' | 'needs_verification' | 'reject'
  cashFlowEstimate: CashFlowEstimate
}

export interface CashFlowEstimate {
  dailySalesMin: number
  dailySalesMax: number
  dailySalesMedian: number
  monthlyRevenueMin: number
  monthlyRevenueMax: number
  monthlyIncomeMin: number
  monthlyIncomeMax: number
  assumedMarginPct: number
  confidenceScore: number
  tierUsed: StoreTier
}

export type StoreTier = 1 | 2 | 3

export interface DetectedVisualSignal {
  signal: string        // e.g. "Amul visicooler detected"
  confidence: number    // 0–1
  tier: StoreTier       // which tier this signal maps to
  proxy: string         // what it proxies, e.g. "Branded asset presence"
}

export interface ShelfAnalysis {
  shelfDensityIndex: number  // 0–1, percentage of shelf space occupied
  skuCount: number           // number of distinct product types detected
  estimatedInventoryValue: number  // ₹ approximate
  detectedObjects: string[]  // list of detected item types
}

export interface TierClassification {
  tier: StoreTier
  tierLabel: string          // "Tier 1 — A/B class" etc.
  proxyLogic: string         // what signal drove this classification
  confidence: number         // 0–1
  dailySalesRange: [number, number]   // [min, max] in ₹
  monthlySalesRange: [number, number] // [min, max] in ₹
  signals: DetectedVisualSignal[]
}

export interface Layer2Result {
  tierClassification: TierClassification
  shelfAnalysis: ShelfAnalysis
  storeSizeEstimateSqft: number
  lightingQualityScore: number  // 0–1, affects confidence
  imageCount: number
  overallVisionScore: number    // 0–1, feeds into Layer 4 voting
}

// ─── Form input types ─────────────────────────────────────────────────────────

export interface BusinessFormData {
  businessName: string
  address: string
  pincode: string
  phone: string
  businessType: string
  gstin: string // optional
  /** Set when the applicant uses browser geolocation at the shop (WGS84). */
  latitude?: number
  longitude?: number
}

// ─── Business types for dropdown ─────────────────────────────────────────────

export const BUSINESS_TYPES = [
  { value: 'grocery', label: 'Grocery / Kirana store' },
  { value: 'pharmacy', label: 'Pharmacy' },
  { value: 'salon', label: 'Salon / Beauty parlour' },
  { value: 'restaurant', label: 'Restaurant / Dhaba' },
  { value: 'hardware', label: 'Hardware store' },
  { value: 'electronics', label: 'Electronics shop' },
  { value: 'clothing', label: 'Clothing / Textile' },
  { value: 'stationery', label: 'Stationery / Books' },
  { value: 'other', label: 'Other' },
] as const

// ─── Tier definitions (static reference) ─────────────────────────────────────

export const TIER_CONFIG = {
  1: {
    label: 'Tier 1 — A/B class store',
    sublabel: 'Wide road · Affluent colony · Branded assets',
    proxyLogic: 'Presence of branded assets',
    color: 'emerald',
    dailyRange: [10000, 17000] as [number, number],
    monthlyRange: [300000, 500000] as [number, number],
    signals: [
      'Amul / Kwality Wall\'s deep freezer',
      'Coca-Cola Visicooler detected',
      'Lays / Kurkure branded racks',
      'Wide road visibility from storefront',
      'Shelf density index > 70%',
    ],
    sdiRange: '70–95%',
    skuRange: '20+ distinct types',
  },
  2: {
    label: 'Tier 2 — C/C store',
    sublabel: 'Alley corner shop · Urban residential',
    proxyLogic: 'Stock density',
    color: 'amber',
    dailyRange: [2000, 5000] as [number, number],
    monthlyRange: [60000, 150000] as [number, number],
    signals: [
      'Sachets (shampoo/biscuit) hanging from ceiling',
      'Plastic jars of candies/toffees at counter',
      'Mixed FMCG categories visible',
      'Counter-based display layout',
      'Shelf density index 40–70%',
    ],
    sdiRange: '40–70%',
    skuRange: '8–20 types',
  },
  3: {
    label: 'Tier 3 — Rural store',
    sublabel: 'Village shop · Semi-urban lane',
    proxyLogic: 'Stock variety',
    color: 'blue',
    dailyRange: [2000, 5000] as [number, number],
    monthlyRange: [40000, 100000] as [number, number],
    signals: [
      'Sacks filled with grain on floor',
      'Large tins of oil / edible fat',
      'Large packs of Surf / soap',
      'Sparse shelving with bulk goods',
      'Shelf density index < 40%',
    ],
    sdiRange: '< 40%',
    skuRange: 'Under 8 categories',
  },
} as const

