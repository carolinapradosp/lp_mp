import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';
import Script from 'next/script';
import { Viewport } from 'next';
import Footer from '@/components/Footer';
import SafeHeader from '@/components/SafeHeader';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

const montSerrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Express Pharma',
  description: 'Compre agora os melhores produtos farmacêuticos com descontos incríveis!',
  icons: '/icon.png',
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {


  return (
    <html lang="pt-br" suppressHydrationWarning>
      <head>
        <Script src="https://sdk.mercadopago.com/js/v2" />

        <Script
          src="https://www.mercadopago.com/v2/security.js"
          strategy="beforeInteractive"
        />
        <meta name="viewport" content="width=device-width, user-scalable=no" />
      </head>
      <body className='flex flex-col'>
        <SafeHeader />
        <div className={`${montSerrat.variable} w-full`}>{children}</div>
        <Footer />
      </body>
    </html>
  );
}
