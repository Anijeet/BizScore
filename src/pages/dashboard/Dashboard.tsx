import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Search, ChevronRight, InboxIcon, RefreshCw,
  ShieldCheck, ShieldAlert, ShieldX, TrendingUp,
} from 'lucide-react'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { getApplications, clearApplications, getOfficerStatus } from '@/services/storage'
import type { SavedApplication } from '@/services/storage'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const REC_CONFIG = {
  pre_approve: {
    label: 'Good to go',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: ShieldCheck,
    iconColor: 'text-emerald-500',
  },
  needs_verification: {
    label: 'Needs visit',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: ShieldAlert,
    iconColor: 'text-amber-500',
  },
  reject: {
    label: 'Not approved',
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    icon: ShieldX,
    iconColor: 'text-red-500',
  },
}

const TIER_COLORS: Record<number, string> = {
  1: 'bg-emerald-100 text-emerald-800',
  2: 'bg-amber-100 text-amber-800',
  3: 'bg-blue-100 text-blue-800',
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatScore(score: number) {
  return Math.round(score * 100)
}

// ─── Stats bar ────────────────────────────────────────────────────────────────

function StatsBar({ apps }: { apps: SavedApplication[] }) {
  const total = apps.length
  const pendingOfficer = apps.filter((a) => getOfficerStatus(a) === 'pending_review').length
  const approvedOfficer = apps.filter((a) => getOfficerStatus(a) === 'approved').length
  const rejectedOfficer = apps.filter((a) => getOfficerStatus(a) === 'rejected').length

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {[
        { label: 'Total applications', value: total, color: 'text-navy-900' },
        { label: 'Awaiting your review', value: pendingOfficer, color: 'text-amber-600' },
        { label: 'Approved by you', value: approvedOfficer, color: 'text-emerald-600' },
        { label: 'Rejected by you', value: rejectedOfficer, color: 'text-red-500' },
      ].map((s) => (
        <div key={s.label} className="bg-white rounded-xl border border-surface-200 px-4 py-3">
          <p className={`font-heading font-semibold text-2xl ${s.color}`}>{s.value}</p>
          <p className="text-xs text-navy-400 mt-0.5">{s.label}</p>
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
        : { label: 'Pending review', bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' }
  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {cfg.label}
    </span>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const navigate = useNavigate()
  const [apps, setApps] = useState<SavedApplication[]>(() => getApplications())
  const [search, setSearch] = useState('')
  const [filterRec, setFilterRec] = useState<string>('all')
  const [filterOfficer, setFilterOfficer] = useState<string>('all')

  function refresh() {
    setApps(getApplications())
  }

  function handleClearAll() {
    if (window.confirm('Clear all demo applications? This cannot be undone.')) {
      clearApplications()
      setApps([])
    }
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

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-6">

        {/* Page header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-heading font-semibold text-2xl text-navy-900">
              Applications
            </h1>
            <p className="text-navy-500 text-sm mt-1">
              All BizScore submissions received from business owners.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refresh}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-surface-200 bg-white text-xs text-navy-600 hover:bg-surface-50 transition-colors"
            >
              <RefreshCw size={13} />
              Refresh
            </button>
            {apps.length > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 bg-white text-xs text-red-600 hover:bg-red-50 transition-colors"
              >
                Clear demo data
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        {apps.length > 0 && <StatsBar apps={apps} />}

        {/* Mock data notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-start gap-3">
          <span className="text-amber-500 text-base flex-shrink-0">⚠</span>
          <p className="text-xs text-amber-700 leading-relaxed">
            <strong>Demo mode:</strong> Applications are stored in your browser's local storage only.
            No data is sent to any server. In production this would connect to a secure FastAPI backend with a PostgreSQL database.
          </p>
        </div>

        {/* Search + filter bar */}
        {apps.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
                <input
                  type="text"
                  placeholder="Search by name, ref ID, pincode…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full border border-surface-200 rounded-lg pl-9 pr-3 py-2 text-sm text-navy-900 bg-white focus:outline-none focus:ring-2 focus:ring-navy-400"
                />
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-navy-500 mb-2">BizScore recommendation</p>
              <div className="flex gap-2 flex-wrap">
                {[
                  { value: 'all', label: 'All' },
                  { value: 'pre_approve', label: 'Good to go' },
                  { value: 'needs_verification', label: 'Needs visit' },
                  { value: 'reject', label: 'Not approved' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setFilterRec(opt.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                      filterRec === opt.value
                        ? 'bg-navy-800 text-white border-navy-800'
                        : 'bg-white text-navy-500 border-surface-200 hover:bg-surface-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-navy-500 mb-2">Your review status</p>
              <div className="flex gap-2 flex-wrap">
                {[
                  { value: 'all', label: 'All' },
                  { value: 'pending_review', label: 'Pending review' },
                  { value: 'approved', label: 'Approved' },
                  { value: 'rejected', label: 'Rejected' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setFilterOfficer(opt.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                      filterOfficer === opt.value
                        ? 'bg-navy-800 text-white border-navy-800'
                        : 'bg-white text-navy-500 border-surface-200 hover:bg-surface-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Applications table / cards */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
            <div className="w-14 h-14 rounded-full bg-surface-100 flex items-center justify-center">
              <InboxIcon size={24} className="text-navy-300" />
            </div>
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
            <div className="hidden lg:block bg-white rounded-xl border border-surface-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-200 bg-surface-50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-navy-500 uppercase tracking-wide">
                      Business
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-navy-500 uppercase tracking-wide">
                      Ref ID
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-navy-500 uppercase tracking-wide">
                      Tier
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-navy-500 uppercase tracking-wide">
                      Score
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-navy-500 uppercase tracking-wide">
                      Recommendation
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-navy-500 uppercase tracking-wide">
                      Officer
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-navy-500 uppercase tracking-wide">
                      Date
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((app, i) => {
                    const rec = REC_CONFIG[app.layer4Result.recommendation]
                    const RecIcon = rec.icon
                    const tier = app.layer2Result.tierClassification.tier
                    return (
                      <motion.tr
                        key={app.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: i * 0.04 }}
                        onClick={() => navigate(`/dashboard/applications/${app.id}`)}
                        className="border-b border-surface-100 last:border-0 hover:bg-surface-50 cursor-pointer transition-colors"
                      >
                        <td className="px-5 py-4">
                          <p className="font-medium text-navy-900">{app.businessName}</p>
                          <p className="text-xs text-navy-400 mt-0.5 capitalize">{app.businessType} · {app.pincode}</p>
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-mono text-xs text-navy-600 bg-surface-100 px-2 py-1 rounded">
                            {app.id}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${TIER_COLORS[tier] ?? 'bg-surface-100 text-navy-600'}`}>
                            Tier {tier}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-surface-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  app.layer4Result.weightedScore >= 0.65 ? 'bg-emerald-500' :
                                  app.layer4Result.weightedScore >= 0.4 ? 'bg-amber-500' : 'bg-red-400'
                                }`}
                                style={{ width: `${formatScore(app.layer4Result.weightedScore)}%` }}
                              />
                            </div>
                            <span className="font-heading font-semibold text-navy-900 text-sm">
                              {formatScore(app.layer4Result.weightedScore)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${rec.bg} ${rec.text} ${rec.border}`}>
                            <RecIcon size={12} className={rec.iconColor} />
                            {rec.label}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <OfficerStatusBadge app={app} />
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-xs text-navy-400">{formatDate(app.submittedAt)}</span>
                        </td>
                        <td className="px-4 py-4">
                          <ChevronRight size={16} className="text-navy-400" />
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
                const rec = REC_CONFIG[app.layer4Result.recommendation]
                const RecIcon = rec.icon
                const tier = app.layer2Result.tierClassification.tier
                return (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.05 }}
                    onClick={() => navigate(`/dashboard/applications/${app.id}`)}
                    className="bg-white border border-surface-200 rounded-xl p-4 cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-navy-900 text-sm">{app.businessName}</p>
                        <p className="text-xs text-navy-400 mt-0.5 capitalize">{app.businessType} · {app.pincode}</p>
                        <p className="text-xs text-navy-400 mt-0.5 font-mono">{app.id}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="font-heading font-semibold text-navy-900">
                          {formatScore(app.layer4Result.weightedScore)}
                        </span>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${TIER_COLORS[tier] ?? 'bg-surface-100 text-navy-600'}`}>
                          T{tier}
                        </span>
                        <ChevronRight size={16} className="text-navy-400" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-surface-100">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${rec.bg} ${rec.text} ${rec.border}`}>
                          <RecIcon size={12} className={rec.iconColor} />
                          {rec.label}
                        </div>
                        <OfficerStatusBadge app={app} />
                      </div>
                      <span className="text-xs text-navy-400">{formatDate(app.submittedAt)}</span>
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
        <div className="bg-navy-50 border border-navy-200 rounded-xl px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm font-semibold text-navy-800">Want to test the flow?</p>
            <p className="text-xs text-navy-500 mt-0.5">
              Open the business owner side in another tab and submit an application — it will appear here.
            </p>
          </div>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-navy-800 text-white text-xs font-medium hover:bg-navy-700 transition-colors flex-shrink-0"
          >
            <TrendingUp size={13} />
            Open business side
          </a>
        </div>

      </main>
    </div>
  )
}
