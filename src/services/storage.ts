import type { Layer1Result, Layer2Result, Layer3Result, Layer4Result } from '@/types'

// ─── Application record ───────────────────────────────────────────────────────

export type OfficerApplicationStatus = 'pending_review' | 'approved' | 'rejected'

export interface SavedApplication {
  id: string              // BS-2024-XXXX
  submittedAt: string     // ISO date string
  businessName: string
  businessType: string
  pincode: string
  address: string
  phone?: string
  /** Set when officer acts; missing on legacy records = treat as pending_review */
  officerStatus?: OfficerApplicationStatus
  layer1Result: Layer1Result
  layer2Result: Layer2Result
  layer3Result: Layer3Result
  layer4Result: Layer4Result
}

const APPS_KEY = 'bizscope_applications'
const AUTH_KEY = 'bizscope_officer_auth'

// ─── Reference ID generator ───────────────────────────────────────────────────

export function generateReferenceId(): string {
  const year = new Date().getFullYear()
  const num = String(Math.floor(Math.random() * 8999) + 1000)
  return `BS-${year}-${num}`
}

// ─── Application CRUD ─────────────────────────────────────────────────────────

export function saveApplication(app: SavedApplication): void {
  const existing = getApplications()
  // Avoid duplicate IDs
  const filtered = existing.filter((a) => a.id !== app.id)
  const withStatus: SavedApplication = {
    ...app,
    officerStatus: app.officerStatus ?? 'pending_review',
  }
  filtered.unshift(withStatus)
  try {
    localStorage.setItem(APPS_KEY, JSON.stringify(filtered))
  } catch {
    // localStorage quota exceeded — drop oldest entries
    const trimmed = filtered.slice(0, 20)
    localStorage.setItem(APPS_KEY, JSON.stringify(trimmed))
  }
}

export function getApplications(): SavedApplication[] {
  try {
    const raw = localStorage.getItem(APPS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as SavedApplication[]
    return parsed.map((a) => ({
      ...a,
      officerStatus: a.officerStatus ?? 'pending_review',
    }))
  } catch {
    return []
  }
}

export function updateApplicationOfficerStatus(
  id: string,
  status: OfficerApplicationStatus,
): SavedApplication | null {
  const apps = getApplications()
  const idx = apps.findIndex((a) => a.id === id)
  if (idx < 0) return null
  const updated = { ...apps[idx], officerStatus: status }
  apps[idx] = updated
  localStorage.setItem(APPS_KEY, JSON.stringify(apps))
  return updated
}

export function getOfficerStatus(app: SavedApplication): OfficerApplicationStatus {
  return app.officerStatus ?? 'pending_review'
}

export function getApplication(id: string): SavedApplication | null {
  return getApplications().find((a) => a.id === id) ?? null
}

export function clearApplications(): void {
  localStorage.removeItem(APPS_KEY)
}

// ─── Officer authentication (mock) ───────────────────────────────────────────

const OFFICER_EMAIL = 'officer@bizscore.in'
const OFFICER_PASSWORD = 'demo123'

export function verifyOfficerCredentials(email: string, password: string): boolean {
  return (
    email.trim().toLowerCase() === OFFICER_EMAIL &&
    password === OFFICER_PASSWORD
  )
}

export function setOfficerAuth(): void {
  localStorage.setItem(AUTH_KEY, '1')
}

export function isOfficerLoggedIn(): boolean {
  return localStorage.getItem(AUTH_KEY) === '1'
}

export function clearOfficerAuth(): void {
  localStorage.removeItem(AUTH_KEY)
}
