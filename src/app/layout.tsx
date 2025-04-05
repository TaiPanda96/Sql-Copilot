import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SheetProvider } from "@/contexts/sheet-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Quick Charts - AI Chart Generator",
  description: "Let AI build you the perfect chart",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} overflow-hidden h-screen`}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <SheetProvider>{children}</SheetProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

