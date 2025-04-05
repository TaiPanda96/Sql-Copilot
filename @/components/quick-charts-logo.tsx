export function QuickChartsLogo({
  className = "",
  size = "medium",
}: { className?: string; size?: "small" | "medium" | "large" }) {
  const getSize = () => {
    switch (size) {
      case "small":
        return { width: 32, height: 32 }
      case "large":
        return { width: 120, height: 120 }
      default:
        return { width: 64, height: 64 }
    }
  }

  const { width, height } = getSize()

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <svg width={width} height={height} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Base shape */}
        <rect x="4" y="4" width="56" height="56" rx="4" fill="#C0C0C0" stroke="#808080" strokeWidth="1" />

        {/* Colorful chart elements */}
        <rect x="12" y="36" width="8" height="16" fill="#5B9BD5" />
        <rect x="24" y="28" width="8" height="24" fill="#ED7D31" />
        <rect x="36" y="20" width="8" height="32" fill="#70AD47" />
        <rect x="48" y="12" width="8" height="40" fill="#FFC000" />

        {/* Grid lines */}
        <line x1="8" y1="44" x2="56" y2="44" stroke="#808080" strokeWidth="1" />
        <line x1="8" y1="36" x2="56" y2="36" stroke="#808080" strokeWidth="1" />
        <line x1="8" y1="28" x2="56" y2="28" stroke="#808080" strokeWidth="1" />
        <line x1="8" y1="20" x2="56" y2="20" stroke="#808080" strokeWidth="1" />
        <line x1="8" y1="12" x2="56" y2="12" stroke="#808080" strokeWidth="1" />
      </svg>

      {/* 3D effect border */}
      <div
        className="absolute inset-0 border-t-2 border-l-2 border-white border-r-2 border-b-2 border-r-gray-600 border-b-gray-600 pointer-events-none"
        style={{ borderRadius: "4px" }}
      ></div>
    </div>
  )
}

