import { ArrowUpRight } from 'lucide-react'

export function ExampleChips() {
  const examples = [
    "Quarterly sales results",
    "Database uptime in Nov",
    "Customer satisfaction trends"
  ]

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {examples.map((example) => (
        <button
          key={example}
          className="px-4 py-2 rounded-full bg-white shadow-sm hover:shadow-md transition-shadow duration-200 text-sm text-gray-600 flex items-center gap-1.5"
        >
          {example}
          <ArrowUpRight className="w-4 h-4" />
        </button>
      ))}
    </div>
  )
}

