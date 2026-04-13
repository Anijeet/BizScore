import { Link, useNavigate } from 'react-router-dom'
import { LogOut, LayoutDashboard } from 'lucide-react'
import { clearOfficerAuth } from '@/services/storage'

export function DashboardHeader() {
  const navigate = useNavigate()

  function handleLogout() {
    clearOfficerAuth()
    navigate('/dashboard/login')
  }

  return (
    <header className="sticky top-0 z-50 bg-navy-900 border-b border-navy-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 lg:h-16 gap-4">

          {/* Branding */}
          <Link to="/dashboard" className="flex items-center gap-3 no-underline">
            {/* PFL-style mark */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-amber-500 flex items-center justify-center flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <rect x="2" y="9" width="4" height="7" rx="1" fill="white" opacity="0.6" />
                  <rect x="7" y="5" width="4" height="11" rx="1" fill="white" opacity="0.8" />
                  <rect x="12" y="2" width="4" height="14" rx="1" fill="white" />
                </svg>
              </div>
              <div>
                <p className="font-heading font-semibold text-white text-sm leading-tight">
                  Poonawalla Fincorp
                </p>
                <p className="text-navy-400 text-xs leading-none mt-0.5">
                  Loan Officer Portal
                </p>
              </div>
            </div>

            {/* Separator + BizScore badge */}
            <div className="hidden sm:flex items-center gap-2 ml-2">
              <span className="w-px h-5 bg-navy-700" />
              <span className="text-xs text-navy-400 flex items-center gap-1">
                <LayoutDashboard size={11} />
                BizScore
              </span>
            </div>
          </Link>

          {/* Demo badge */}
          <div className="hidden sm:flex items-center">
            <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
              Demo mode
            </span>
          </div>

          {/* Officer info + logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-medium text-white">Loan Officer</p>
              <p className="text-xs text-navy-400">officer@bizscore.in</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-navy-300 hover:text-white text-xs font-medium transition-colors"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
