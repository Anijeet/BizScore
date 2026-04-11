import { Link, useLocation } from 'react-router-dom'

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/assess', label: 'Start assessment' },
]

export function Header() {
  const location = useLocation()

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-surface-200">
      <div className="container-page">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 no-underline group">
            {/* Icon mark */}
            <div className="w-8 h-8 rounded bg-navy-800 flex items-center justify-center flex-shrink-0">
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
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
                Business assessment platform
              </span>
            </div>
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive = location.pathname === link.to
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`
                    px-3 py-1.5 rounded text-sm font-medium transition-colors duration-150
                    ${isActive
                      ? 'bg-navy-50 text-navy-800'
                      : 'text-navy-500 hover:text-navy-800 hover:bg-surface-100'
                    }
                  `}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </header>
  )
}
