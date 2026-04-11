import type {
  BusinessFormData,
  BusinessCheckResult,
  GSTResult,
  ProductExistenceResult,
} from '@/types'

// ─── Delay helper (simulates real network latency) ────────────────────────────
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// ─────────────────────────────────────────────────────────────────────────────
// GOOGLE BUSINESS VERIFICATION
//
// TODO (production): Replace this mock with a real Google Places API call.
//
// Steps to wire up:
//   1. Get a Google Places API key from console.cloud.google.com
//   2. Enable "Places API" in your project
//   3. Call: GET https://maps.googleapis.com/maps/api/place/findplacefromtext/json
//      ?input={businessName}+{address}
//      &inputtype=textquery
//      &fields=name,formatted_address,types,rating,user_ratings_total,business_status
//      &key=YOUR_API_KEY
//   4. Parse `candidates[0]` from the response
//   5. Call Place Details endpoint to get listing age (opening_hours, reviews)
//
// Note: Never expose the API key in frontend. Route through your FastAPI backend:
//   POST /api/verify/business  { businessName, address, pincode }
// ─────────────────────────────────────────────────────────────────────────────
export async function verifyBusiness(
  data: BusinessFormData
): Promise<BusinessCheckResult> {
  await delay(1800) // Simulates API round-trip

  // Mock: deterministic result based on input length for demo variety
  const exists = data.businessName.length > 4

  return {
    exists,
    name: exists ? data.businessName : '',
    address: exists ? `${data.address}, ${data.pincode}` : '',
    category: data.businessType,
    listingAgeMonths: exists ? 24 : 0,
    rating: exists ? 4.1 : 0,
    reviewCount: exists ? 38 : 0,
    score: exists ? 0.82 : 0.1,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GST VERIFICATION
//
// TODO (production): Replace this mock with the GST portal public API.
//
// Steps to wire up:
//   1. Use: GET https://services.gstin.gov.in/tools/patternvalidator?gstin={GSTIN}
//      (This validates format only — free, no auth)
//   2. For full details, use a paid GST API aggregator such as:
//      - Masters India API (mastersindia.co)
//      - RazorpayX Tax API
//      - SignalX GST API
//   3. Route through your FastAPI backend:
//      POST /api/verify/gst  { gstin }
//   4. Map response fields: legal_name, pradr (address), sts (status), rgdt (reg date)
//
// GST is optional in your form — if user skips it, return status: 'not_provided'
// and score: 0.5 (neutral, neither penalise nor reward)
// ─────────────────────────────────────────────────────────────────────────────
export async function verifyGST(gstin: string): Promise<GSTResult> {
  await delay(1400)

  if (!gstin || gstin.trim() === '') {
    return {
      verified: false,
      gstin: '',
      tradeName: '',
      registrationDate: '',
      state: '',
      status: 'not_provided',
      score: 0.5, // Neutral — most small kiranas are not GST registered
    }
  }

  // Mock: validate basic GSTIN format (15 chars, starts with 2 digits = state code)
  const gstinPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
  const isValidFormat = gstinPattern.test(gstin.toUpperCase())

  if (!isValidFormat) {
    return {
      verified: false,
      gstin,
      tradeName: '',
      registrationDate: '',
      state: '',
      status: 'cancelled',
      score: 0.1,
    }
  }

  return {
    verified: true,
    gstin: gstin.toUpperCase(),
    tradeName: 'Sample Traders Pvt Ltd',
    registrationDate: '2021-06-15',
    state: 'Karnataka',
    status: 'active',
    score: 0.9,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT EXISTENCE CHECK
//
// TODO (production): Replace this mock with your Python CV model endpoint.
//
// Steps to wire up:
//   1. Deploy your FastAPI model server
//   2. Call: POST /api/verify/products
//      Body: FormData with { images: File[], claimedBusinessType: string }
//   3. Your model runs CLIP or Florence-2 classification on each image
//   4. Returns detected product categories and match confidence
//
// This check answers: "Does this store actually sell what it claims to sell?"
// Example: A claimed pharmacy should have medicine packaging, not rice sacks.
// ─────────────────────────────────────────────────────────────────────────────
export async function checkProductExistence(
  businessType: string,
  _images: File[]
): Promise<ProductExistenceResult> {
  await delay(2200)

  // Mock: always returns a match for demo purposes
  const categoryMap: Record<string, string[]> = {
    grocery: ['packaged foods', 'beverages', 'personal care', 'staples'],
    pharmacy: ['medicines', 'healthcare products', 'vitamins'],
    salon: ['hair care products', 'styling tools', 'skincare'],
    restaurant: ['food items', 'beverages', 'kitchenware'],
    hardware: ['tools', 'pipes', 'electrical fittings'],
    electronics: ['mobile accessories', 'cables', 'devices'],
    clothing: ['apparel', 'fabrics', 'accessories'],
    stationery: ['books', 'pens', 'notebooks'],
    other: ['general goods'],
  }

  const detected = categoryMap[businessType] ?? ['general goods']

  return {
    matches: true,
    detectedCategories: detected,
    claimedCategory: businessType,
    confidenceScore: 0.84,
    notes: 'Product categories visible in images are consistent with claimed business type.',
  }
}
