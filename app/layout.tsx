import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'AI Frontier — Directory of the AI ecosystem',
    template: '%s · AI Frontier',
  },
  description:
    'An end-to-end directory of the AI stack: chips, clouds, data, models, tooling, applications, safety, and policy. Every figure is sourced.',
  openGraph: {
    title: 'AI Frontier',
    description: 'Browse the entire AI ecosystem, layer by layer.',
    type: 'website',
    url: '/',
    images: [{ url: '/og/default.png', width: 1200, height: 630, alt: 'AI Frontier' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Frontier',
    description: 'Browse the entire AI ecosystem, layer by layer.',
    images: ['/og/default.png'],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="dns-prefetch" href="https://www.google.com" />
        <link rel="preconnect" href="https://www.google.com" crossOrigin="" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(()=>{try{const t=localStorage.getItem('theme');const d=t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:bg-background focus:px-3 focus:py-2"
        >
          Skip to content
        </a>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
