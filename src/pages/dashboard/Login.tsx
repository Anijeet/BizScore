import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react'
import { verifyOfficerCredentials, setOfficerAuth } from '@/services/storage'

export default function DashboardLoginPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }

    setLoading(true)
    await new Promise((r) => setTimeout(r, 900)) // simulate auth delay

    if (verifyOfficerCredentials(email, password)) {
      setOfficerAuth()
      navigate('/dashboard', { replace: true })
    } else {
      setError('Invalid email or password. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-navy-900 flex flex-col items-center justify-center px-4 py-12">

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 18 18" fill="none">
                <rect x="2" y="9" width="4" height="7" rx="1" fill="white" opacity="0.6" />
                <rect x="7" y="5" width="4" height="11" rx="1" fill="white" opacity="0.8" />
                <rect x="12" y="2" width="4" height="14" rx="1" fill="white" />
              </svg>
            </div>
          </div>
          <h1 className="font-heading font-semibold text-white text-xl">
            Poonawalla Fincorp
          </h1>
          <p className="text-navy-400 text-sm mt-1">Loan Officer Portal</p>
        </div>

        {/* Login form */}
        <div className="bg-white rounded-2xl p-6 shadow-2xl">
          <h2 className="font-heading font-semibold text-navy-900 text-base mb-1">
            Sign in to your account
          </h2>
          <p className="text-xs text-navy-400 mb-6">
            Use your officer credentials to access the application dashboard.
          </p>

          {/* Demo credentials hint */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5 mb-5">
            <p className="text-xs font-semibold text-blue-800 mb-1">Demo credentials</p>
            <p className="text-xs text-blue-700 font-mono">
              officer@bizscore.in
            </p>
            <p className="text-xs text-blue-700 font-mono">
              demo123
            </p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-navy-700">Email address</label>
              <input
                type="email"
                placeholder="officer@bizscore.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-surface-200 rounded-lg px-3 py-2.5 text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-navy-700">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-surface-200 rounded-lg px-3 py-2.5 pr-10 text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5"
              >
                <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-700">{error}</p>
              </motion.div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-navy-800 hover:bg-navy-700 disabled:bg-navy-300 text-white font-medium text-sm py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading
                ? <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                : <ShieldCheck size={15} />
              }
              {loading ? 'Signing in...' : 'Sign in to dashboard'}
            </button>
          </form>
        </div>

        {/* Footer note */}
        <p className="text-xs text-navy-500 text-center mt-6">
          This portal is for authorised Poonawalla Fincorp loan officers only.
          <br />
          Powered by <span className="text-navy-300">BizScore</span>
        </p>
      </motion.div>
    </div>
  )
}
