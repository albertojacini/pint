import type { Metadata } from 'next'
import { Noto_Sans } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { Navbar } from '@/components/navigation/navbar'
import { Footer } from '@/components/navigation/footer'
import { BottomNav } from '@/components/navigation/bottom-nav'

const notoSans = Noto_Sans({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Pint - Public Interface',
  description:
    'A public policies platform for up-to-date information about public administrations and political collaboration',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={notoSans.className}>
        <Navbar />
        <main className="container pt-8 pb-16 md:pb-8">{children}</main>
        <Footer />
        <BottomNav />
        <Toaster />
      </body>
    </html>
  )
}
