/**
 * Real browser geolocation + reverse geocoding for the verification flow.
 *
 * Geolocation: navigator.geolocation (device GPS / network).
 * Address text: OpenStreetMap Nominatim (see https://operations.osmfoundation.org/policies/nominatim/).
 */

export interface GeolocationCoords {
  latitude: number
  longitude: number
  accuracyM: number | null
}

export interface ReverseGeocodeResult {
  addressLine: string
  pincode: string
}

function geolocationErrorMessage(code: number): string {
  switch (code) {
    case 1:
      return 'Location permission was blocked. Allow location for this site, or type your address manually.'
    case 2:
      return 'Your device could not determine a position. Try again outdoors or enter your address manually.'
    case 3:
      return 'Location request timed out. Try again or enter your address manually.'
    default:
      return 'Could not read your location. You can still enter your address manually.'
  }
}

/** Fresh reading (no cached position) for “at the shop right now”. */
export function getCurrentPositionFresh(): Promise<GeolocationPosition> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return Promise.reject(new Error('This browser does not support geolocation.'))
  }
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 30_000,
      maximumAge: 0,
    })
  })
}

export function positionToCoords(position: GeolocationPosition): GeolocationCoords {
  const { latitude, longitude, accuracy } = position.coords
  return {
    latitude,
    longitude,
    accuracyM: typeof accuracy === 'number' && Number.isFinite(accuracy) ? accuracy : null,
  }
}

type NominatimAddr = {
  house_number?: string
  road?: string
  pedestrian?: string
  neighbourhood?: string
  suburb?: string
  city?: string
  town?: string
  village?: string
  county?: string
  state?: string
  postcode?: string
  country?: string
}

function buildAddressLineFromNominatim(addr: NominatimAddr): string {
  const street = [addr.house_number, addr.road || addr.pedestrian].filter(Boolean).join(' ').trim()
  const area = addr.neighbourhood || addr.suburb
  const city = addr.city || addr.town || addr.village
  const parts: string[] = []
  if (street) parts.push(street)
  if (area) parts.push(area)
  if (city) parts.push(city)
  if (addr.state) parts.push(addr.state)
  if (addr.country) parts.push(addr.country)
  return parts.join(', ')
}

function extractIndiaPincode(postcode: string | undefined, displayName: string | undefined): string {
  if (postcode) {
    const digits = postcode.replace(/\D/g, '')
    if (digits.length >= 6) return digits.slice(0, 6)
  }
  const m = displayName?.match(/\b(\d{6})\b/)
  return m?.[1] ?? ''
}

/**
 * Reverse geocode via Nominatim. Call only after user-triggered geolocation
 * (one request per tap), per usage policy.
 */
export async function reverseGeocodeNominatim(
  latitude: number,
  longitude: number
): Promise<ReverseGeocodeResult> {
  const params = new URLSearchParams({
    lat: String(latitude),
    lon: String(longitude),
    format: 'json',
    addressdetails: '1',
    'accept-language': 'en',
  })

  const res = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`, {
    headers: { Accept: 'application/json' },
  })

  if (!res.ok) {
    throw new Error('Could not look up your address from coordinates. Try again or enter manually.')
  }

  const data = (await res.json()) as {
    display_name?: string
    address?: NominatimAddr
    error?: string
  }

  if (data.error) {
    throw new Error(data.error)
  }

  const addr = data.address ?? {}
  const built = buildAddressLineFromNominatim(addr).trim()
  const addressLine = built || (data.display_name ?? '').trim()
  if (!addressLine) {
    throw new Error('No address text returned for this location. Enter your address manually.')
  }

  const pincode = extractIndiaPincode(addr.postcode, data.display_name)

  return { addressLine, pincode }
}

export async function locateShopAddress(): Promise<GeolocationCoords & ReverseGeocodeResult> {
  let position: GeolocationPosition
  try {
    position = await getCurrentPositionFresh()
  } catch (e: unknown) {
    const err = e as GeolocationPositionError
    if (err?.code !== undefined) {
      throw new Error(geolocationErrorMessage(err.code))
    }
    throw e instanceof Error ? e : new Error('Could not read your location.')
  }

  const coords = positionToCoords(position)
  const rev = await reverseGeocodeNominatim(coords.latitude, coords.longitude)
  return { ...coords, ...rev }
}
