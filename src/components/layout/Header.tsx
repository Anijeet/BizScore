import { Link, useLocation } from 'react-router-dom'

const LAYER_STEPS = [
  { path: '/assess', label: '1', title: 'Identity' },
  { path: '/assess/layer2', label: '2', title: 'Photos' },
  { path: '/assess/layer3', label: '3', title: 'Location' },
  { path: '/assess/score', label: '4', title: 'Score' },
]

export function Header() {
  const location = useLocation()
  const isAssessment = location.pathname.startsWith('/assess')
  const currentLayerIdx = LAYER_STEPS.findIndex((s) => s.path === location.pathname)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-surface-200 shadow-sm">
      <div className="container-page">
        <div className="flex items-center justify-between h-14 lg:h-16 gap-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 no-underline group flex-shrink-0">
            <div className="w-8 h-8 rounded bg-navy-800 flex items-center justify-center flex-shrink-0">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="2" y="9" width="4" height="7" rx="1" fill="white" opacity="0.5" />
                <rect x="7" y="5" width="4" height="11" rx="1" fill="white" opacity="0.75" />
                <rect x="12" y="2" width="4" height="14" rx="1" fill="white" />
              </svg>
            </div>
            <div>
              <span className="font-heading font-semibold text-navy-900 text-base tracking-tight">
                BizScore
              </span>
              <span className="hidden sm:block text-xs text-navy-400 leading-none mt-0.5">
                Business assessment
              </span>
            </div>
          </Link>

          {/* Assessment step progress — shown during assessment flow */}
          {isAssessment && currentLayerIdx >= 0 && (
            <div className="flex items-center gap-0.5 sm:gap-1 flex-1 justify-center max-w-sm mx-auto">
              {LAYER_STEPS.map((step, i) => {
                const isPast = i < currentLayerIdx
                const isCurrent = i === currentLayerIdx
                const isFuture = i > currentLayerIdx
                return (
                  <div key={step.path} className="flex items-center gap-0.5 sm:gap-1">
                    <div className={`
                      flex items-center gap-1 px-1.5 sm:px-2.5 py-1 rounded-full text-xs font-medium transition-all
                      ${isCurrent ? 'bg-navy-800 text-white' :
                        isPast ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        'text-navy-300 bg-surface-100'}
                    `}>
                      <span className={`
                        w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0
                        ${isCurrent ? 'bg-white/20 text-white' :
                          isPast ? 'bg-emerald-500 text-white' :
                          'bg-surface-200 text-navy-400'}
                      `}>
                        {isPast ? '✓' : step.label}
                      </span>
                      <span className={`hidden sm:inline ${isFuture ? 'opacity-50' : ''}`}>
                        {step.title}
                      </span>
                    </div>
                    {i < LAYER_STEPS.length - 1 && (
                      <span className={`text-xs ${isPast ? 'text-emerald-400' : 'text-surface-300'}`}>›</span>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Nav — hidden during assessment on mobile to save space */}
          <nav className={`flex items-center gap-1 flex-shrink-0 ${isAssessment ? 'hidden sm:flex' : 'flex'}`}>
            <Link
              to="/"
              className={`
                px-2.5 py-1.5 rounded text-sm font-medium transition-colors duration-150
                ${location.pathname === '/'
                  ? 'bg-navy-50 text-navy-800'
                  : 'text-navy-500 hover:text-navy-800 hover:bg-surface-100'
                }
              `}
            >
              Home
            </Link>
            <Link
              to="/docs"
              className={`
                px-2.5 py-1.5 rounded text-sm font-medium transition-colors duration-150
                ${location.pathname === '/docs'
                  ? 'bg-navy-50 text-navy-800'
                  : 'text-navy-500 hover:text-navy-800 hover:bg-surface-100'
                }
              `}
            >
              Docs
            </Link>
            {!isAssessment && (
              <Link
                to="/assess"
                className="px-3 py-1.5 rounded bg-navy-800 text-white text-sm font-medium hover:bg-navy-700 transition-colors duration-150"
              >
                Start Verification
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
