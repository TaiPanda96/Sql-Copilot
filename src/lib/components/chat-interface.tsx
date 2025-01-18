"use client"

import { useState } from "react"
import { SendHorizontal } from 'lucide-react'
import { Button } from "shadcn/components/ui/button"

export function ChatInterface() {
  const [input, setInput] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Handle chat submission and AI interaction
    setInput("")
  }

  return (
    <div className="max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
          placeholder="Ask a follow up or tell us what adjustments you want to make..."
          className="flex-1"
        />
        <Button type="submit" size="icon">
          <SendHorizontal className="h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}

