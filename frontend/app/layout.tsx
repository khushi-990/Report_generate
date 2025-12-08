import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Report Generator',
  description: 'Generate Material Inward and Proforma Invoice Reports',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

