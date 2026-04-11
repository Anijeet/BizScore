interface ScoreRingProps {
  score: number // 0–1
  size?: number
  strokeWidth?: number
}

export function ScoreRing({ score, size = 72, strokeWidth = 6 }: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - score * circumference

  const getColor = () => {
    if (score >= 0.75) return '#10b981' // emerald
    if (score >= 0.5) return '#f59e0b'  // amber
    return '#ef4444'                     // red
  }

  const percentage = Math.round(score * 100)

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e6ef"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <span
        className="absolute text-sm font-heading font-semibold"
        style={{ color: getColor() }}
      >
        {percentage}
      </span>
    </div>
  )
}
