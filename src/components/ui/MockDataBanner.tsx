interface MockDataBannerProps {
  showOtpHint?: boolean
}

export function MockDataBanner({ showOtpHint = false }: MockDataBannerProps) {
  return (
    <div className="w-full rounded-xl border border-amber-200/90 bg-gradient-to-r from-amber-50 to-amber-50/50 px-3 py-3 sm:px-4">
      <div className="flex flex-wrap items-center gap-2 mb-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-200/90 text-amber-950">Demo</span>
        <span className="text-[10px] font-semibold text-amber-900/90">Sample data only</span>
      </div>
      <p className="text-xs text-amber-900/90 leading-snug">
        Not a real lender decision.
        {showOtpHint && (
          <>
            {' '}
            OTP: <span className="font-mono font-bold bg-amber-200/80 px-1.5 py-0.5 rounded text-amber-950">1234</span>
          </>
        )}
      </p>
    </div>
  )
}
