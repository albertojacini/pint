import type { Metadata } from 'next'
import { Noto_Sans } from 'next/font/google'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import { Toaster } from '@/components/ui/toaster'
import { Navbar } from '@/components/navigation/navbar'
import { EarlyPreviewBanner } from '@/components/navigation/early-preview-banner'
import { Footer } from '@/components/navigation/footer'
import { BottomNav } from '@/components/navigation/bottom-nav'

const notoSans = Noto_Sans({ subsets: ['latin'] })

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })
  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      type: 'website',
      siteName: 'Pint',
    },
    twitter: {
      card: 'summary',
      title: t('title'),
      description: t('description'),
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params

  if (!routing.locales.includes(locale as any)) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body className={notoSans.className}>
        <NextIntlClientProvider messages={messages}>
          <Navbar />
          <EarlyPreviewBanner />
          <main className="container pt-8 pb-16 md:pb-8">{children}</main>
          <Footer />
          <BottomNav />
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
