"use client"

import { useEffect, useState } from "react"

export function AsciiBackground() {
  const [asciiArt, setAsciiArt] = useState<string>("")

  useEffect(() => {
    fetch('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ascii-art-7ftypmCBvjuw92kxoPOI9ekFBiJtCc.txt')
      .then(response => response.text())
      .then(text => setAsciiArt(text))
      .catch(error => console.error('Error loading ASCII art:', error))
  }, [])

  return (
    <pre 
      className="fixed inset-0 -z-10 text-[#838383] opacity-20 overflow-hidden whitespace-pre font-mono text-xs leading-[1.2]"
      style={{ 
        fontFamily: 'monospace',
        userSelect: 'none'
      }}
    >
      {asciiArt}
    </pre>
  )
}

