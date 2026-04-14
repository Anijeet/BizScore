import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

const LAYER_STEPS = [
  { path: '/assess', label: '1', title: 'Identity' },
  { path: '/assess/layer2', label: '2', title: 'Photos' },
  { path: '/assess/layer3', label: '3', title: 'Location' },
  { path: '/assess/score', label: '4', title: 'Score' },
]

export function Header() {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const isAssessment = location.pathname.startsWith('/assess')
  const currentLayerIdx = LAYER_STEPS.findIndex((s) => s.path === location.pathname)

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [menuOpen])

  const navLinkClass = (active: boolean) =>
    `block w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-150 ${
      active ? 'bg-navy-50 text-navy-800' : 'text-navy-600 hover:bg-surface-100 hover:text-navy-900'
    }`

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-surface-200 shadow-sm">
        <div className="container-page">
          <div className="flex items-center justify-between h-14 lg:h-16 gap-2 min-w-0">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center gap-2 no-underline group flex-shrink-0 min-w-0"
            >
              <div className="w-8 h-8 rounded bg-navy-800 flex items-center justify-center flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                  <rect x="2" y="9" width="4" height="7" rx="1" fill="white" opacity="0.5" />
                  <rect x="7" y="5" width="4" height="11" rx="1" fill="white" opacity="0.75" />
                  <rect x="12" y="2" width="4" height="14" rx="1" fill="white" />
                </svg>
              </div>
              <div className="min-w-0">
                <span className="font-heading font-semibold text-navy-900 text-base tracking-tight truncate block">
                  BizScore
                </span>
                <span className="hidden sm:block text-xs text-navy-400 leading-none mt-0.5">
                  Business assessment
                </span>
              </div>
            </Link>

            {/* Assessment step progress */}
            {isAssessment && currentLayerIdx >= 0 && (
              <div className="flex-1 min-w-0 overflow-x-auto overscroll-x-contain flex justify-center [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex items-center gap-0.5 sm:gap-1 flex-nowrap px-1 py-0.5">
                  {LAYER_STEPS.map((step, i) => {
                    const isPast = i < currentLayerIdx
                    const isCurrent = i === currentLayerIdx
                    const isFuture = i > currentLayerIdx
                    return (
                      <div key={step.path} className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                        <div
                          className={`
                          flex items-center gap-1 px-1.5 sm:px-2.5 py-1 rounded-full text-xs font-medium transition-all
                          ${isCurrent ? 'bg-navy-800 text-white' :
                            isPast ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            'text-navy-300 bg-surface-100'}
                        `}
                        >
                          <span
                            className={`
                            w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0
                            ${isCurrent ? 'bg-white/20 text-white' :
                              isPast ? 'bg-emerald-500 text-white' :
                              'bg-surface-200 text-navy-400'}
                          `}
                          >
                            {isPast ? '✓' : step.label}
                          </span>
                          <span className={`hidden sm:inline ${isFuture ? 'opacity-50' : ''}`}>
                            {step.title}
                          </span>
                        </div>
                        {i < LAYER_STEPS.length - 1 && (
                          <span className={`text-xs flex-shrink-0 ${isPast ? 'text-emerald-400' : 'text-surface-300'}`}>
                            ›
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Desktop nav */}
              <nav className="hidden lg:flex items-center gap-1">
                <Link
                  to="/"
                  className={`
                  px-2.5 py-1.5 rounded text-sm font-medium transition-colors duration-150
                  ${location.pathname === '/'
                    ? 'bg-navy-50 text-navy-800'
                    : 'text-navy-500 hover:text-navy-800 hover:bg-surface-100'}
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
                    : 'text-navy-500 hover:text-navy-800 hover:bg-surface-100'}
                `}
                >
                  Docs
                </Link>
                <Link
                  to="/dashboard"
                  className={`
                  px-3 py-1.5 rounded text-sm font-medium border transition-colors duration-150
                  ${location.pathname.startsWith('/dashboard')
                    ? 'bg-navy-50 text-navy-800 border-navy-200'
                    : 'bg-surface-100 text-navy-800 border-surface-200 hover:bg-surface-200 hover:border-surface-300'}
                `}
                >
                  Officer Dashboard
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

              {/* Mobile / tablet menu */}
              <button
                type="button"
                className="lg:hidden flex items-center justify-center w-11 h-11 rounded-lg border border-surface-200 bg-white text-navy-800 hover:bg-surface-50 transition-colors"
                aria-expanded={menuOpen}
                aria-controls="site-nav-drawer"
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                onClick={() => setMenuOpen((o) => !o)}
              >
                {menuOpen ? <X size={22} strokeWidth={2} /> : <Menu size={22} strokeWidth={2} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Slide-over nav (mobile & tablet) */}
      {menuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden" id="site-nav-drawer">
          <button
            type="button"
            className="absolute inset-0 bg-navy-900/50 backdrop-blur-[1px]"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          />
          <nav
            className="absolute top-0 right-0 bottom-0 w-[min(20rem,88vw)] max-w-full bg-white shadow-2xl border-l border-surface-200 flex flex-col pt-4 pb-6 motion-safe:transition-transform motion-safe:duration-200"
            aria-label="Main navigation"
          >
            <div className="flex items-center justify-between px-4 pb-3 border-b border-surface-100">
              <span className="text-sm font-bold text-navy-900">Menu</span>
              <button
                type="button"
                className="flex items-center justify-center w-10 h-10 rounded-lg text-navy-600 hover:bg-surface-100"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex flex-col gap-1 px-3 pt-4 overflow-y-auto">
              <Link to="/" className={navLinkClass(location.pathname === '/')} onClick={() => setMenuOpen(false)}>
                Home
              </Link>
              <Link to="/docs" className={navLinkClass(location.pathname === '/docs')} onClick={() => setMenuOpen(false)}>
                Docs
              </Link>
              <Link
                to="/dashboard"
                className={navLinkClass(location.pathname.startsWith('/dashboard'))}
                onClick={() => setMenuOpen(false)}
              >
                Officer Dashboard
              </Link>
              {!isAssessment && (
                <Link
                  to="/assess"
                  className="block w-full text-center px-4 py-3 rounded-lg text-sm font-medium bg-navy-800 text-white hover:bg-navy-700 mt-2"
                  onClick={() => setMenuOpen(false)}
                >
                  Start Verification
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  )
}
