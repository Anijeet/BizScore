import { runLayer4Voting } from '@/services/votingEngine'
import type { Layer1Result, Layer2Result, Layer3Result } from '@/types'

/** Fixed IDs so storage merge can dedupe; not real businesses or GSTINs. */
export const BUNDLED_INDIAN_DEMO_IDS = ['BS-2026-IN-DEMO-01', 'BS-2026-IN-DEMO-02'] as const

const DEMO_NOTE =
  'Bundled Indian demo case — synthetic data for hackathon / officer UI only. Not a real borrower or filing.'

function mumbaiKiranaLayers(): { l1: Layer1Result; l2: Layer2Result; l3: Layer3Result } {
  const l1: Layer1Result = {
    businessCheck: {
      exists: true,
      name: 'Sharma Kirana & General Stores',
      address: 'Shop 12, Turner Road, Bandra West, Mumbai — listed on Google Maps',
      category: 'Grocery / kirana',
      listingAgeMonths: 38,
      rating: 4.4,
      reviewCount: 214,
      score: 0.89,
    },
    gst: {
      verified: true,
      gstin: '27AABCS1234F1Z5',
      tradeName: 'SHARMA KIRANA AND GENERAL STORES',
      registrationDate: '2019-04-12',
      state: 'Maharashtra',
      status: 'active',
      score: 0.91,
    },
    productExistence: {
      matches: true,
      detectedCategories: ['FMCG', 'packaged foods', 'dairy', 'beverages', 'staples'],
      claimedCategory: 'Grocery / Kirana store',
      confidenceScore: 0.87,
      notes: 'Shelf imagery aligns with kirana assortment; Amul / Britannia / local brands visible in demo pack.',
    },
    overallCredibilityScore: 0.88,
    recommendation: 'proceed',
  }

  const l2: Layer2Result = {
    tierClassification: {
      tier: 1,
      tierLabel: 'Tier 1 — A/B class',
      proxyLogic: 'Branded cold chain + high shelf density on Linking Road catchment',
      confidence: 0.86,
      dailySalesRange: [12000, 16500],
      monthlySalesRange: [360000, 495000],
      signals: [
        {
          signal: 'Amul deep freezer visible near billing counter',
          confidence: 0.91,
          tier: 1,
          proxy: 'Branded cold-chain presence',
        },
        {
          signal: 'Coca-Cola Visicooler facing main road window',
          confidence: 0.88,
          tier: 1,
          proxy: 'Beverage brand distribution depth',
        },
        {
          signal: 'Stacked Kurkure / Lay’s racks with front-facing facings',
          confidence: 0.84,
          tier: 1,
          proxy: 'Organised trade FMCG',
        },
      ],
    },
    shelfAnalysis: {
      shelfDensityIndex: 0.83,
      skuCount: 26,
      estimatedInventoryValue: 420000,
      detectedObjects: [
        'rice bags (India Gate / Daawat)',
        'edible oil tins',
        'biscuit jars',
        'soft drinks PET',
        'dairy pouches',
      ],
    },
    storeSizeEstimateSqft: 580,
    lightingQualityScore: 0.81,
    imageCount: 5,
    overallVisionScore: 0.86,
  }

  const l3: Layer3Result = {
    geoSignals: {
      populationDensityPerSqKm: 19800,
      roadType: 'trunk',
      roadTypeScore: 5,
      poiCount500m: 44,
      competitorCount500m: 5,
      areaAffluenceScore: 0.79,
      pincodeIncomeBand: 'high',
      pincodeAvgDailyFootfall: 6800,
    },
    gpsConsistency: {
      imageGpsMatches: true,
      maxDeviationMetres: 28,
      flagged: false,
      note: 'GPS clusters within 30m of registered Shop 12, Turner Road, Bandra West (400050).',
    },
    rentOwnership: {
      estimatedMonthlyRent: 48000,
      rentToRevenueRatio: 0.11,
      ownershipType: 'rented',
      repaymentRiskClass: 'low',
    },
    geoFootfallIndex: 0.88,
    overallGeoScore: 0.84,
  }

  return { l1, l2, l3 }
}

function bengaluruPharmacyLayers(): { l1: Layer1Result; l2: Layer2Result; l3: Layer3Result } {
  const l1: Layer1Result = {
    businessCheck: {
      exists: true,
      name: 'Sri Lakshmi Medicals & Surgicals',
      address: '45th Cross, 8th Block Jayanagar, Bengaluru — UPI and card accepted',
      category: 'Pharmacy',
      listingAgeMonths: 22,
      rating: 4.1,
      reviewCount: 96,
      score: 0.78,
    },
    gst: {
      verified: true,
      gstin: '29AABCL5678H1Z2',
      tradeName: 'SRI LAKSHMI MEDICALS',
      registrationDate: '2021-08-03',
      state: 'Karnataka',
      status: 'active',
      score: 0.82,
    },
    productExistence: {
      matches: true,
      detectedCategories: ['OTC medicines', 'surgicals', 'wellness', 'baby care'],
      claimedCategory: 'Pharmacy',
      confidenceScore: 0.76,
      notes: 'Schedule H/H1X not verified in demo; stock mix matches neighbourhood chemist profile.',
    },
    overallCredibilityScore: 0.71,
    recommendation: 'review',
  }

  const l2: Layer2Result = {
    tierClassification: {
      tier: 2,
      tierLabel: 'Tier 2 — C/C class',
      proxyLogic: 'Counter-led layout, sachet strips, mixed OTC facings',
      confidence: 0.68,
      dailySalesRange: [3200, 4800],
      monthlySalesRange: [96000, 144000],
      signals: [
        {
          signal: 'Paracetamol / cough syrup sachets hanging at counter',
          confidence: 0.8,
          tier: 2,
          proxy: 'High-rotation OTC pattern',
        },
        {
          signal: 'Plastic jars with lozenges and vitamins near billing',
          confidence: 0.72,
          tier: 2,
          proxy: 'Impulse health SKU mix',
        },
        {
          signal: 'Mixed generic and branded strips (Cipla / Sun style packs)',
          confidence: 0.71,
          tier: 2,
          proxy: 'Pharma wholesale linkage (demo assumption)',
        },
      ],
    },
    shelfAnalysis: {
      shelfDensityIndex: 0.52,
      skuCount: 12,
      estimatedInventoryValue: 165000,
      detectedObjects: [
        'blister packs',
        'surgical masks box',
        'glucose tins',
        'baby soap shelf',
      ],
    },
    storeSizeEstimateSqft: 320,
    lightingQualityScore: 0.58,
    imageCount: 5,
    overallVisionScore: 0.58,
  }

  const l3: Layer3Result = {
    geoSignals: {
      populationDensityPerSqKm: 9800,
      roadType: 'secondary',
      roadTypeScore: 3,
      poiCount500m: 14,
      competitorCount500m: 9,
      areaAffluenceScore: 0.48,
      pincodeIncomeBand: 'mid',
      pincodeAvgDailyFootfall: 2600,
    },
    gpsConsistency: {
      imageGpsMatches: false,
      maxDeviationMetres: 135,
      flagged: true,
      note:
        'One capture appears ~130m from registered Jayanagar address — possible lane behind main cross; field visit recommended (demo scenario).',
    },
    rentOwnership: {
      estimatedMonthlyRent: 32000,
      rentToRevenueRatio: 0.23,
      ownershipType: 'rented',
      repaymentRiskClass: 'high',
    },
    geoFootfallIndex: 0.46,
    overallGeoScore: 0.48,
  }

  return { l1, l2, l3 }
}

/** Two rich Indian-market scenarios; Layer 4 from the same voting engine as live flow. */
export function buildBundledIndianDemoApplications() {
  const mumbai = mumbaiKiranaLayers()
  const bengaluru = bengaluruPharmacyLayers()

  return [
    {
      id: BUNDLED_INDIAN_DEMO_IDS[0],
      submittedAt: '2026-04-02T10:15:00+05:30',
      businessName: 'Sharma Kirana & General Stores',
      businessType: 'grocery',
      pincode: '400050',
      address: 'Shop 12, Turner Road, Bandra West, Mumbai, Maharashtra',
      phone: '+91 98201 23456',
      officerStatus: 'pending_review' as const,
      isBundledDemo: true,
      bundledDemoNote: DEMO_NOTE,
      layer1Result: mumbai.l1,
      layer2Result: mumbai.l2,
      layer3Result: mumbai.l3,
      layer4Result: runLayer4Voting(mumbai.l1, mumbai.l2, mumbai.l3),
    },
    {
      id: BUNDLED_INDIAN_DEMO_IDS[1],
      submittedAt: '2026-04-08T14:40:00+05:30',
      businessName: 'Sri Lakshmi Medicals & Surgicals',
      businessType: 'pharmacy',
      pincode: '560011',
      address: '45th Cross, 8th Block Jayanagar, Bengaluru, Karnataka',
      phone: '+91 98765 43210',
      officerStatus: 'pending_review' as const,
      isBundledDemo: true,
      bundledDemoNote: DEMO_NOTE,
      layer1Result: bengaluru.l1,
      layer2Result: bengaluru.l2,
      layer3Result: bengaluru.l3,
      layer4Result: runLayer4Voting(bengaluru.l1, bengaluru.l2, bengaluru.l3),
    },
  ]
}
