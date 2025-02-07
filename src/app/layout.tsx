import { initNightwind } from '@/lib/nightwind';
import Script from 'next/script';
import './globals.css';
import type { Metadata } from 'next';

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
      {/* Add nightwind init script */}
      <Script strategy="beforeInteractive">{`
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      `}</Script>
      <body>
        <script dangerouslySetInnerHTML={{ __html: 'nightwind.init();' }} />
        {children}
      </body>
    </html>
  );
}