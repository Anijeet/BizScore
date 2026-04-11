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

// ─── Form input types ─────────────────────────────────────────────────────────

export interface BusinessFormData {
  businessName: string
  address: string
  pincode: string
  phone: string
  businessType: string
  gstin: string // optional
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
