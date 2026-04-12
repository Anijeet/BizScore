import type {
  Layer3Result,
  GeoSignals,
  GpsConsistency,
  RentOwnershipSignal,
  RoadType,
  StoreTier,
} from '@/types'

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

// ─────────────────────────────────────────────────────────────────────────────
// LAYER 3 — GEO + ECONOMIC HEURISTIC MODEL
//
// TODO (production): Replace each section below with real API calls.
//
// 1. POPULATION DENSITY
//    Source: WorldPop 100m-resolution GeoTIFF (free, CC BY 4.0)
//    Download: https://www.worldpop.org/geodata/listing?id=75
//    Load with rasterio in Python, buffer GPS point by 500m, sum pixels.
//    Route: POST /api/geo/population { lat, lon }
//
// 2. POI + COMPETITOR COUNT
//    Source: Overpass API (free, no key required)
//    Query: nodes with shop=grocery/convenience/supermarket within 500m
//    Query: nodes with amenity=school/hospital/bus_stop within 500m
//    Endpoint: https://overpass-api.de/api/interpreter
//    Route: POST /api/geo/poi { lat, lon }
//
// 3. ROAD TYPE
//    Source: Overpass API — highway=* tags within 50m of GPS point
//    Score map: trunk=5, primary=4, secondary=3, tertiary=2, residential=1
//    Route: POST /api/geo/road { lat, lon }
//
// 4. AREA AFFLUENCE
//    Source: OSM amenity diversity (bank, restaurant, gym, ATM) within 500m
//    Count distinct amenity types, normalize to 0–1
//    Route: POST /api/geo/affluence { lat, lon }
//
// 5. PINCODE INCOME BAND
//    Source: India Census 2011 (district-level household income data)
//    API: https://censusindia.gov.in/census.website/data/api/about
//    Supplement with RBI household income surveys by district
//    Route: POST /api/geo/pincode-income { pincode }
//
// 6. GPS CONSISTENCY
//    Already computed in image preprocessing (EXIF extraction)
//    Compare EXIF GPS from each image vs submitted GPS
//    Route: POST /api/geo/gps-verify { submittedLat, submittedLon, exifCoords[] }
// ─────────────────────────────────────────────────────────────────────────────

async function fetchGeoSignals(pincode: string, tier: StoreTier): Promise<GeoSignals> {
  await delay(1800)

  // Mock: calibrate values to tier and pincode length for demo variety
  const isPremiumPin = pincode.startsWith('1') || pincode.startsWith('4')

  const roadTypeScoreMap: Record<RoadType, number> = {
    trunk: 5, primary: 4, secondary: 3, tertiary: 2, residential: 1, service: 1,
  }

  const roadType: RoadType =
    tier === 1 ? 'primary' :
    tier === 2 ? 'secondary' :
    'tertiary'

  const popDensity =
    tier === 1 ? 18500 :
    tier === 2 ? 9200 :
    2800

  return {
    populationDensityPerSqKm: popDensity,
    roadType,
    roadTypeScore: roadTypeScoreMap[roadType],
    poiCount500m: tier === 1 ? 14 : tier === 2 ? 8 : 3,
    competitorCount500m: tier === 1 ? 4 : tier === 2 ? 3 : 1,
    areaAffluenceScore: tier === 1 ? 0.81 : tier === 2 ? 0.56 : 0.29,
    pincodeIncomeBand: isPremiumPin ? 'high' : tier === 1 ? 'mid' : 'low',
    pincodeAvgDailyFootfall: tier === 1 ? 340 : tier === 2 ? 180 : 60,
  }
}

async function verifyGpsConsistency(): Promise<GpsConsistency> {
  await delay(800)

  // Mock: passes consistency check
  // In production: compare EXIF GPS coordinates from each submitted image
  // against the submitted GPS pin. Flag if any image > 100m from pin.
  return {
    imageGpsMatches: true,
    maxDeviationMetres: 42,
    flagged: false,
    note: 'All submitted images GPS within 50m of registered address.',
  }
}

async function estimateRentOwnership(
  tier: StoreTier,
  _pincode: string
): Promise<RentOwnershipSignal> {
  await delay(600)

  // Mock: rent estimate based on tier benchmark
  // In production: correlate with local property rental indices
  // (99acres, MagicBricks API or scrape) for the pincode area.
  const rentMap: Record<StoreTier, number> = {
    1: 32000,
    2: 12000,
    3: 4500,
  }

  const rent = rentMap[tier]
  const dailySalesMedian = tier === 1 ? 13500 : tier === 2 ? 3500 : 2500
  const monthlyRevenue = dailySalesMedian * 30
  const rentRatio = rent / monthlyRevenue

  return {
    estimatedMonthlyRent: rent,
    rentToRevenueRatio: parseFloat(rentRatio.toFixed(2)),
    ownershipType: tier === 1 ? 'owned' : 'rented',
    repaymentRiskClass: rentRatio > 0.2 ? 'high' : rentRatio > 0.12 ? 'medium' : 'low',
  }
}

export async function runLayer3Analysis(
  pincode: string,
  tier: StoreTier,
): Promise<Layer3Result> {
  const [geoSignals, gpsConsistency, rentOwnership] = await Promise.all([
    fetchGeoSignals(pincode, tier),
    verifyGpsConsistency(),
    estimateRentOwnership(tier, pincode),
  ])

  // Composite footfall index:
  // Weighted blend of population density (normalised), road score, POI count,
  // competitor penalty, and area affluence.
  const popNorm = Math.min(geoSignals.populationDensityPerSqKm / 25000, 1)
  const roadNorm = geoSignals.roadTypeScore / 5
  const poiNorm = Math.min(geoSignals.poiCount500m / 20, 1)
  const competitorPenalty = Math.min(geoSignals.competitorCount500m * 0.05, 0.25)

  const geoFootfallIndex =
    popNorm * 0.35 +
    roadNorm * 0.25 +
    poiNorm * 0.25 +
    geoSignals.areaAffluenceScore * 0.15 -
    competitorPenalty

  // Overall geo score — penalise GPS mismatch and high rent risk
  const gpsPenalty = gpsConsistency.flagged ? 0.15 : 0
  const rentPenalty = rentOwnership.repaymentRiskClass === 'high' ? 0.1 : 0

  const overallGeoScore = Math.max(
    0,
    Math.min(1, geoFootfallIndex - gpsPenalty - rentPenalty)
  )

  return {
    geoSignals,
    gpsConsistency,
    rentOwnership,
    geoFootfallIndex: parseFloat(geoFootfallIndex.toFixed(3)),
    overallGeoScore: parseFloat(overallGeoScore.toFixed(3)),
  }
}
