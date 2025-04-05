import Link from "next/link"
import { BarChart3 } from "lucide-react"

export function Header() {
  return (
    <header className="w-full bg-excel98-primary text-white p-4">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <BarChart3 className="h-6 w-6" />
          <span className="font-bold text-xl">Quick Charts</span>
        </Link>
      </div>
    </header>
  )
}

