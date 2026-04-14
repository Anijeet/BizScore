import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Search, X, Loader2,
} from 'lucide-react'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { getApplications, clearApplications, getOfficerStatus } from '@/services/storage'
import type { SavedApplication } from '@/services/storage'
import { getIndustryReferenceImages } from '@/data/industryReferenceImages'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TIER_COLORS: Record<number, string> = {
  1: 'bg-emerald-100 text-emerald-800',
  2: 'bg-amber-100 text-amber-800',
  3: 'bg-blue-100 text-blue-800',
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function ApplicationInfoModal({
  app,
  onClose,
}: {
  app: SavedApplication
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy-900/45 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="app-info-modal-title"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl max-w-xl w-full max-h-[min(90vh,720px)] overflow-y-auto shadow-xl border border-surface-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between gap-3 px-5 py-4 border-b border-surface-200 bg-white rounded-t-2xl">
          <h2 id="app-info-modal-title" className="font-heading font-semibold text-navy-900 text-base pr-2">
            Application details
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-navy-500 hover:bg-surface-100 transition-colors flex-shrink-0"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-5 text-sm text-navy-700">
          {app.isBundledDemo && (
            <div className="rounded-xl border-l-4 border-indigo-500 bg-indigo-50/90 px-3 py-2.5">
              <p className="text-xs font-medium text-indigo-900">Demo record</p>
              <p className="text-[11px] text-indigo-800/90 mt-0.5 leading-snug">
                {app.bundledDemoNote ?? 'Synthetic sample — not a real business.'}
              </p>
            </div>
          )}

          <section className="rounded-xl bg-surface-50 border border-surface-200 p-4">
            <div className="border-l-4 border-navy-700 pl-3 mb-3">
              <h3 className="font-heading font-semibold text-navy-900 text-sm">Overview</h3>
            </div>
            <p className="font-medium text-navy-900 text-sm leading-snug">{app.businessName}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-[11px] font-mono bg-white border border-surface-200 px-2 py-1 rounded-md text-navy-800">{app.id}</span>
              <span className="text-[11px] capitalize bg-white border border-surface-200 px-2 py-1 rounded-md text-navy-700">{app.businessType}</span>
              <span className="text-[11px] bg-white border border-surface-200 px-2 py-1 rounded-md text-navy-700">{app.pincode}</span>
              {app.phone && (
                <span className="text-[11px] bg-white border border-surface-200 px-2 py-1 rounded-md text-navy-700">{app.phone}</span>
              )}
            </div>
            <p className="text-xs text-navy-600 mt-3 leading-relaxed border-t border-surface-200 pt-3">{app.address}</p>
            <p className="text-[11px] text-navy-400 mt-2">{formatDate(app.submittedAt)}</p>
          </section>

          <section>
            <div className="border-l-4 border-emerald-600 pl-3 mb-3">
              <h3 className="font-heading font-semibold text-navy-900 text-sm">Industry photos</h3>
              <p className="text-[11px] text-navy-500 mt-0.5">Stock images for this category — not this shop. Full scores after <span className="font-semibold text-navy-700">Start AI analysis</span>.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {getIndustryReferenceImages(app.businessType).map((img) => (
                <figure
                  key={img.src}
                  className="m-0 overflow-hidden rounded-xl border border-surface-200 bg-surface-100 shadow-sm"
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    loading="lazy"
                    decoding="async"
                    className="h-24 w-full object-cover sm:h-28"
                  />
                  <figcaption className="px-2 py-1.5 text-[10px] leading-snug text-navy-500 line-clamp-2">
                    {img.alt}
                  </figcaption>
                </figure>
              ))}
            </div>
            <p className="text-[10px] text-navy-400 mt-2">
              <a href="https://www.pexels.com/license/" target="_blank" rel="noopener noreferrer" className="text-navy-600 underline underline-offset-2">Pexels</a> licence
            </p>
          </section>
        </div>

        <div className="px-5 py-3 border-t border-surface-100 bg-surface-50 rounded-b-2xl">
          <p className="text-[11px] text-navy-500">
            <span className="font-semibold text-navy-800">Start AI analysis</span>
            {' → '}
            full report for <span className="font-mono text-navy-700">{app.id}</span>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

// ─── Stats bar ────────────────────────────────────────────────────────────────

function StatsBar({ apps }: { apps: SavedApplication[] }) {
  const total = apps.length
  const pendingOfficer = apps.filter((a) => getOfficerStatus(a) === 'pending_review').length
  const approvedOfficer = apps.filter((a) => getOfficerStatus(a) === 'approved').length
  const rejectedOfficer = apps.filter((a) => getOfficerStatus(a) === 'rejected').length

  const items = [
    { label: 'In queue', value: total, color: 'text-navy-900', bar: 'border-l-navy-700' },
    { label: 'Needs you', value: pendingOfficer, color: 'text-amber-600', bar: 'border-l-amber-500' },
    { label: 'Approved', value: approvedOfficer, color: 'text-emerald-600', bar: 'border-l-emerald-500' },
    { label: 'Rejected', value: rejectedOfficer, color: 'text-red-500', bar: 'border-l-red-400' },
  ] as const

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      {items.map((s) => (
        <div
          key={s.label}
          className={`bg-white rounded-xl border border-surface-200 border-l-4 ${s.bar} pl-4 pr-3 py-3 shadow-sm`}
        >
          <p className={`font-heading font-semibold text-2xl tabular-nums ${s.color}`}>{s.value}</p>
          <p className="text-[11px] text-navy-500 mt-0.5 font-medium">{s.label}</p>
        </div>
      ))}
    </div>
  )
}

function OfficerStatusBadge({ app }: { app: SavedApplication }) {
  const s = getOfficerStatus(app)
  const cfg =
    s === 'approved'
      ? { label: 'Approved', bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' }
      : s === 'rejected'
        ? { label: 'Rejected', bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' }
        : { label: 'Open', bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' }
  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {cfg.label}
    </span>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const AI_ANALYSIS_MS_MIN = 1200
const AI_ANALYSIS_MS_MAX = 2200

export default function DashboardPage() {
  const navigate = useNavigate()
  const [apps, setApps] = useState<SavedApplication[]>(() => getApplications())
  const [search, setSearch] = useState('')
  const [filterRec, setFilterRec] = useState<string>('all')
  const [filterOfficer, setFilterOfficer] = useState<string>('all')
  const [infoModalApp, setInfoModalApp] = useState<SavedApplication | null>(null)
  const [aiRunningId, setAiRunningId] = useState<string | null>(null)

  function refresh() {
    setApps(getApplications())
  }

  function handleClearAll() {
    if (window.confirm('Clear all demo applications? This cannot be undone.')) {
      clearApplications()
      setApps(getApplications())
    }
  }

  async function handleStartAiAnalysis(app: SavedApplication) {
    if (aiRunningId) return
    setAiRunningId(app.id)
    const delay = AI_ANALYSIS_MS_MIN + Math.random() * (AI_ANALYSIS_MS_MAX - AI_ANALYSIS_MS_MIN)
    await new Promise((r) => setTimeout(r, delay))
    setAiRunningId(null)
    navigate(`/dashboard/applications/${app.id}`)
  }

  // Filter logic
  const filtered = apps.filter((app) => {
    const matchSearch =
      search === '' ||
      app.businessName.toLowerCase().includes(search.toLowerCase()) ||
      app.id.toLowerCase().includes(search.toLowerCase()) ||
      app.pincode.includes(search) ||
      app.businessType.toLowerCase().includes(search.toLowerCase())

    const matchRec =
      filterRec === 'all' || app.layer4Result.recommendation === filterRec

    const matchOfficer =
      filterOfficer === 'all' || getOfficerStatus(app) === filterOfficer

    return matchSearch && matchRec && matchOfficer
  })

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col">
      <DashboardHeader />

      {infoModalApp && (
        <ApplicationInfoModal app={infoModalApp} onClose={() => setInfoModalApp(null)} />
      )}

      <main className="flex-1 w-full max-w-[min(100%-1rem,1480px)] mx-auto px-3 sm:px-6 lg:px-10 py-6 sm:py-8 flex flex-col gap-5 sm:gap-6">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="border-l-4 border-navy-800 pl-3 sm:pl-4">
            <h1 className="font-heading font-semibold text-2xl sm:text-3xl text-navy-900 tracking-tight">
              Applications
            </h1>
            <p className="text-navy-500 text-sm mt-1 max-w-xl">
              Officer queue — browser demo only.
            </p>
          </div>
          <div className="flex flex-wrap items-stretch gap-2 sm:justify-end">
            <button
              type="button"
              onClick={refresh}
              className="min-h-[44px] px-4 py-2 rounded-xl border border-surface-200 bg-white text-sm text-navy-700 font-medium hover:bg-surface-50 active:scale-[0.99] transition-colors"
            >
              Refresh
            </button>
            {apps.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="min-h-[44px] px-4 py-2 rounded-xl border border-red-200 bg-white text-sm text-red-600 font-medium hover:bg-red-50 active:scale-[0.99] transition-colors"
              >
                Clear queue
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        {apps.length > 0 && <StatsBar apps={apps} />}

        {/* Demo strip — scannable, minimal copy */}
        <div className="rounded-xl border border-amber-200/80 bg-gradient-to-r from-amber-50 to-amber-50/40 px-4 py-3 sm:px-5">
          <div className="flex flex-wrap gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-200/80 text-amber-900">Demo</span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white/80 border border-amber-100 text-amber-900">Local storage only</span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white/80 border border-amber-100 text-amber-900">Indian samples included</span>
          </div>
          <p className="text-xs text-amber-900/85 leading-snug max-w-4xl">
            Nothing leaves this browser. Pre-loaded rows are fictional Indian scenarios for UI testing.
          </p>
        </div>

        {/* Search + filter bar */}
        {apps.length > 0 && (
          <div className="rounded-2xl bg-white border border-surface-200 p-4 sm:p-5 shadow-sm">
            <div className="border-l-4 border-navy-600 pl-3 mb-4">
              <p className="font-heading font-semibold text-navy-900 text-sm">Filters</p>
              <p className="text-[11px] text-navy-500 mt-0.5">Narrow the list</p>
            </div>
            <div className="relative mb-5">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 pointer-events-none" />
              <input
                type="search"
                enterKeyHint="search"
                placeholder="Name, ref ID, pincode…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full min-h-[48px] border border-surface-200 rounded-xl pl-11 pr-3 text-base sm:text-sm text-navy-900 bg-surface-50/50 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:bg-white"
              />
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-navy-400 mb-2">Model outcome</p>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { value: 'all', label: 'All' },
                    { value: 'pre_approve', label: 'Good to go' },
                    { value: 'needs_verification', label: 'Needs visit' },
                    { value: 'reject', label: 'Declined' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFilterRec(opt.value)}
                      className={`min-h-[40px] px-3.5 rounded-xl text-sm font-medium transition-colors border ${
                        filterRec === opt.value
                          ? 'bg-navy-800 text-white border-navy-800 shadow-sm'
                          : 'bg-surface-50 text-navy-600 border-surface-200 hover:border-navy-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-px bg-surface-100" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-navy-400 mb-2">Your decision</p>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { value: 'all', label: 'All' },
                    { value: 'pending_review', label: 'Open' },
                    { value: 'approved', label: 'Approved' },
                    { value: 'rejected', label: 'Rejected' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFilterOfficer(opt.value)}
                      className={`min-h-[40px] px-3.5 rounded-xl text-sm font-medium transition-colors border ${
                        filterOfficer === opt.value
                          ? 'bg-navy-800 text-white border-navy-800 shadow-sm'
                          : 'bg-surface-50 text-navy-600 border-surface-200 hover:border-navy-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Applications table / cards */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <div className="w-16 h-2 rounded-full bg-surface-300 max-w-[120px] mx-auto" aria-hidden />
            <div>
              <p className="font-heading font-semibold text-navy-900 text-base">
                {apps.length === 0 ? 'No applications yet' : 'No results found'}
              </p>
              <p className="text-navy-500 text-sm mt-1">
                {apps.length === 0
                  ? 'Applications submitted by business owners will appear here.'
                  : 'Try a different search term or filter.'}
              </p>
            </div>
            {apps.length === 0 && (
              <a
                href="/"
                className="text-xs text-navy-500 underline underline-offset-2"
              >
                Go to business owner side to submit a demo application
              </a>
            )}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden lg:block bg-white rounded-2xl border border-surface-200 shadow-sm overflow-x-auto">
              <table className="w-full text-sm min-w-[860px] table-fixed">
                <colgroup>
                  <col className="w-[22%]" />
                  <col className="w-[16%]" />
                  <col className="w-[8%]" />
                  <col className="w-[12%]" />
                  <col className="w-[11%]" />
                  <col className="w-[31%]" />
                </colgroup>
                <thead>
                  <tr className="border-b border-surface-200 bg-surface-50/90">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-navy-500 uppercase tracking-wide">
                      Business
                    </th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-navy-500 uppercase tracking-wide">
                      Ref ID
                    </th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-navy-500 uppercase tracking-wide">
                      Tier
                    </th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-navy-500 uppercase tracking-wide">
                      Officer
                    </th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-navy-500 uppercase tracking-wide">
                      Date
                    </th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-navy-500 uppercase tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((app, i) => {
                    const tier = app.layer2Result.tierClassification.tier
                    const aiBusy = aiRunningId === app.id
                    const aiLocked = aiRunningId !== null && aiRunningId !== app.id
                    return (
                      <motion.tr
                        key={app.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: i * 0.04 }}
                        className="border-b border-surface-100 last:border-0 hover:bg-surface-50/80 transition-colors align-top"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-navy-900 leading-snug">{app.businessName}</p>
                            {app.isBundledDemo && (
                              <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 border border-indigo-200/80 shrink-0">
                                Demo
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-navy-500 mt-1 capitalize tabular-nums">{app.businessType} · {app.pincode}</p>
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-mono text-[11px] text-navy-700 bg-surface-100 px-2 py-1 rounded-md inline-block max-w-full break-all">
                            {app.id}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${TIER_COLORS[tier] ?? 'bg-surface-100 text-navy-600'}`}>
                            T{tier}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <OfficerStatusBadge app={app} />
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-xs text-navy-500 tabular-nums whitespace-nowrap">{formatDate(app.submittedAt)}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-row flex-wrap items-center gap-2 justify-end xl:justify-start">
                            <button
                              type="button"
                              disabled={aiBusy || aiLocked}
                              onClick={() => handleStartAiAnalysis(app)}
                              className="min-h-[40px] inline-flex items-center justify-center px-4 py-2 rounded-xl bg-navy-800 text-white text-sm font-medium hover:bg-navy-700 disabled:opacity-45 disabled:cursor-not-allowed transition-colors shadow-sm"
                            >
                              {aiBusy ? (
                                <span className="inline-flex items-center gap-2">
                                  <Loader2 size={16} className="animate-spin shrink-0" />
                                  Working…
                                </span>
                              ) : (
                                'Start AI analysis'
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => setInfoModalApp(app)}
                              className="min-h-[40px] inline-flex items-center justify-center px-4 py-2 rounded-xl border-2 border-surface-200 bg-white text-sm font-medium text-navy-800 hover:border-navy-200 hover:bg-surface-50 transition-colors"
                            >
                              More info
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="lg:hidden flex flex-col gap-3">
              {filtered.map((app, i) => {
                const tier = app.layer2Result.tierClassification.tier
                const aiBusy = aiRunningId === app.id
                const aiLocked = aiRunningId !== null && aiRunningId !== app.id
                return (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.05 }}
                    className="bg-white border border-surface-200 rounded-2xl p-4 shadow-sm border-l-4 border-l-navy-700"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-navy-900 text-base leading-snug">{app.businessName}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {app.isBundledDemo && (
                            <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                              Demo
                            </span>
                          )}
                          <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md ${TIER_COLORS[tier] ?? 'bg-surface-100 text-navy-600'}`}>
                            Tier {tier}
                          </span>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-surface-100 text-navy-600 capitalize">
                            {app.businessType}
                          </span>
                        </div>
                        <p className="text-xs font-mono text-navy-600 mt-2 break-all bg-surface-50 rounded-lg px-2 py-1.5 border border-surface-100">{app.id}</p>
                        <p className="text-xs text-navy-500 mt-1 tabular-nums">{app.pincode} · {formatDate(app.submittedAt)}</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-surface-100 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase text-navy-400">Officer</span>
                        <OfficerStatusBadge app={app} />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          disabled={aiBusy || aiLocked}
                          onClick={() => handleStartAiAnalysis(app)}
                          className="min-h-[48px] w-full inline-flex items-center justify-center rounded-xl bg-navy-800 text-white text-sm font-semibold hover:bg-navy-700 disabled:opacity-45 disabled:cursor-not-allowed active:scale-[0.99] transition-transform"
                        >
                          {aiBusy ? (
                            <span className="inline-flex items-center gap-2">
                              <Loader2 size={18} className="animate-spin" />
                              Working…
                            </span>
                          ) : (
                            'Start AI analysis'
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setInfoModalApp(app)}
                          className="min-h-[48px] w-full inline-flex items-center justify-center rounded-xl border-2 border-surface-200 bg-white text-sm font-semibold text-navy-800 hover:bg-surface-50 active:scale-[0.99] transition-transform"
                        >
                          More info
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Count */}
            <p className="text-xs text-navy-400 text-center">
              Showing {filtered.length} of {apps.length} application{apps.length !== 1 ? 's' : ''}
            </p>
          </>
        )}

        {/* Quick link for demo */}
        <div className="rounded-2xl border border-navy-200 bg-gradient-to-br from-navy-50 to-white px-4 py-4 sm:px-6 sm:py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="border-l-4 border-navy-700 pl-3">
            <p className="text-sm font-bold text-navy-900">Try the business flow</p>
            <p className="text-xs text-navy-600 mt-0.5 max-w-md">Submit from the public site — it shows up in this queue.</p>
          </div>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[48px] items-center justify-center px-5 rounded-xl bg-navy-800 text-white text-sm font-semibold hover:bg-navy-700 text-center shrink-0"
          >
            Open business side
          </a>
        </div>

      </main>
    </div>
  )
}
