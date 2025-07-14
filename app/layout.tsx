import './globals.css'
import { Toaster } from 'react-hot-toast'
import { Metadata } from 'next'
import GoogleMapsProvider from '../components/providers/GoogleMapsProvider'

export const metadata: Metadata = {
  title: 'SBS TRAVEL - Premium Transfer Hizmeti | Antalya VIP Transfer',
  description: 'Antalya\'da premium transfer hizmeti. Havalimanı transferi, VIP araç kiralama, güvenli ve konforlu yolculuk. 7/24 hizmet, profesyonel şoförler.',
  keywords: 'antalya transfer, havalimanı transferi, vip transfer, premium araç kiralama, antalya taxi, güvenli transfer',
  authors: [{ name: 'SBS TRAVEL' }],
  creator: 'SBS TRAVEL',
  publisher: 'SBS TRAVEL',
  robots: 'index, follow',
  openGraph: {
    title: 'SBS TRAVEL - Premium Transfer Hizmeti',
    description: 'Antalya\'da premium transfer hizmeti. Güvenli, konforlu ve profesyonel.',
    url: 'https://sbstravel.com',
    siteName: 'SBS TRAVEL',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'SBS TRAVEL Premium Transfer',
      },
    ],
    locale: 'tr_TR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SBS TRAVEL - Premium Transfer Hizmeti',
    description: 'Antalya\'da premium transfer hizmeti. Güvenli, konforlu ve profesyonel.',
    images: ['/og-image.jpg'],
  },
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#3B82F6',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body className="font-sans antialiased">
        <GoogleMapsProvider>
          {children}
        </GoogleMapsProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  )
}