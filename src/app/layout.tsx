import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'IZS Annual Results',
  description: 'Annual Results Page for IZS',
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