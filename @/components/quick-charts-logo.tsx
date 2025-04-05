export function QuickChartsLogo({
  className = "",
  size = "medium",
}: { className?: string; size?: "small" | "medium" | "large" }) {
  const getSize = () => {
    switch (size) {
      case "small":
        return { width: 24, height: 24 }
      case "large":
        return { width: 120, height: 120 }
      default:
        return { width: 48, height: 48 }
    }
  }

  const { width, height } = getSize()

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <img src="/images/logo.png" alt="Quick Charts Logo" width={width} height={height} className="object-contain" />
    </div>
  )
}

