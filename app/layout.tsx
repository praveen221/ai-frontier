import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ai-frontier.vercel.app';

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
    images: [{ url: '/og.svg', width: 1200, height: 630, alt: 'AI Frontier' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Frontier',
    description: 'Browse the entire AI ecosystem, layer by layer.',
    images: ['/og.svg'],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(()=>{try{const t=localStorage.getItem('theme');const d=t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen antialiased">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
