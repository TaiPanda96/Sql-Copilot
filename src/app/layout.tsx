import type { Metadata } from "next"
import { ThemeProvider } from "next-themes"
import { Inter } from "next/font/google"
import type React from "react"
import { SheetProvider } from "../../contexts/sheet-context"
import "./globals.css"

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
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <SheetProvider>{children}</SheetProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

