interface MockDataBannerProps {
  showOtpHint?: boolean
}

export function MockDataBanner({ showOtpHint = false }: MockDataBannerProps) {
  return (
    <div className="w-full bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-start gap-3">
      <span className="text-amber-500 text-sm flex-shrink-0 mt-0.5">⚠</span>
      <div>
        <p className="text-xs font-semibold text-amber-800">Demo mode — sample data only</p>
        <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
          This is a demo version. All results shown are mock data and not real assessments.
          {showOtpHint && (
            <>
              {' '}For the OTP step, enter code{' '}
              <span className="font-bold bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-mono">
                1234
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
