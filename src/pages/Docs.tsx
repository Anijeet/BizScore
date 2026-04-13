import { Link } from 'react-router-dom'
import { BookOpen, Building2, Shield, Database, ArrowRight } from 'lucide-react'

export default function DocsPage() {
  return (
    <div className="container-page py-10 lg:py-14 max-w-3xl">
      <div className="flex items-start gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-navy-800 flex items-center justify-center flex-shrink-0">
          <BookOpen className="text-white" size={20} />
        </div>
        <div>
          <h1 className="font-heading font-semibold text-2xl text-navy-900 tracking-tight">
            Hackathon guide
          </h1>
          <p className="text-sm text-navy-500 mt-1">
            BizScore demo: two experiences — business owners complete a verification flow; loan officers review submissions in a dashboard.
          </p>
        </div>
      </div>

      <div className="space-y-10 text-sm text-navy-700 leading-relaxed">
        <section className="rounded-2xl border border-surface-200 bg-surface-50/80 p-5 lg:p-6">
          <h2 className="font-heading font-semibold text-navy-900 text-base flex items-center gap-2 mb-3">
            <Building2 size={18} className="text-navy-600" />
            Business owner (public site)
          </h2>
          <p className="mb-4">
            No login. Anyone can walk through the assessment. When the flow finishes, the application is stored in the browser so officers can see it after signing in.
          </p>
          <div className="overflow-x-auto rounded-xl border border-surface-200 bg-white">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-surface-200 bg-surface-50">
                  <th className="px-3 py-2 font-semibold text-navy-800">Route</th>
                  <th className="px-3 py-2 font-semibold text-navy-800">What it does</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                <tr>
                  <td className="px-3 py-2 font-mono text-navy-900">/</td>
                  <td className="px-3 py-2">Landing page — product overview and entry to verification.</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-mono text-navy-900">/assess</td>
                  <td className="px-3 py-2">Layer 1 — identity, business details, optional GST, guided captures.</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-mono text-navy-900">/assess/layer2</td>
                  <td className="px-3 py-2">Layer 2 — shop photos and shelf / product signals.</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-mono text-navy-900">/assess/layer3</td>
                  <td className="px-3 py-2">Layer 3 — location and area context.</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-mono text-navy-900">/assess/score</td>
                  <td className="px-3 py-2">Final score report; submitting here saves an application for the officer queue.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <Link
            to="/assess"
            className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-navy-800 hover:text-navy-600"
          >
            Start verification <ArrowRight size={14} />
          </Link>
        </section>

        <section className="rounded-2xl border border-surface-200 bg-white p-5 lg:p-6 shadow-sm">
          <h2 className="font-heading font-semibold text-navy-900 text-base flex items-center gap-2 mb-3">
            <Shield size={18} className="text-navy-600" />
            Loan officer (dashboard)
          </h2>
          <p className="mb-4">
            Protected area. Officers sign in with demo credentials, then see every application saved from completed business flows on this device. They can open a case, read the automated signals, and mark approve or reject.
          </p>
          <div className="overflow-x-auto rounded-xl border border-surface-200">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-surface-200 bg-surface-50">
                  <th className="px-3 py-2 font-semibold text-navy-800">Route</th>
                  <th className="px-3 py-2 font-semibold text-navy-800">What it does</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                <tr>
                  <td className="px-3 py-2 font-mono text-navy-900">/dashboard/login</td>
                  <td className="px-3 py-2">Officer sign-in (mock auth).</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-mono text-navy-900">/dashboard</td>
                  <td className="px-3 py-2">Application inbox, search, stats, clear demo data.</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 font-mono text-navy-900">/dashboard/applications/:id</td>
                  <td className="px-3 py-2">Single application — layers, score, officer decision.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
            <p className="text-xs font-semibold text-blue-900 mb-2">Demo officer credentials</p>
            <p className="text-xs text-blue-800">
              <span className="font-medium">Email:</span>{' '}
              <span className="font-mono">officer@bizscore.in</span>
            </p>
            <p className="text-xs text-blue-800 mt-0.5">
              <span className="font-medium">Password:</span>{' '}
              <span className="font-mono">demo123</span>
            </p>
            <p className="text-xs text-blue-700 mt-2">
              These values are checked in the frontend only (see <code className="font-mono bg-blue-100/80 px-1 rounded">src/services/storage.ts</code>) for hackathon demonstration — not production security.
            </p>
          </div>
          <Link
            to="/dashboard/login"
            className="inline-flex items-center gap-1.5 mt-4 text-sm font-medium text-navy-800 hover:text-navy-600"
          >
            Open officer login <ArrowRight size={14} />
          </Link>
        </section>

        <section className="rounded-2xl border border-surface-200 bg-surface-50/80 p-5 lg:p-6">
          <h2 className="font-heading font-semibold text-navy-900 text-base flex items-center gap-2 mb-3">
            <Database size={18} className="text-navy-600" />
            Data and APIs
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-navy-700">
            <li>Applications and officer session flags live in <strong>localStorage</strong> on this browser.</li>
            <li>Completing the score step creates a reference ID (for example <span className="font-mono">BS-2026-XXXX</span>) and queues the record for the dashboard.</li>
            <li>External checks and vision calls may use mock or demo backends where noted in the UI (hackathon scope).</li>
          </ul>
        </section>

        <p className="text-xs text-navy-400">
          You are reading <span className="font-mono text-navy-500">/docs</span> — the same overview is summarized in the project README.
        </p>
      </div>
    </div>
  )
}
