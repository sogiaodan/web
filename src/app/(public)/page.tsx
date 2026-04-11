import type { Metadata } from 'next';
import { Suspense } from 'react';
import { API_BASE_URL, APP_BASE_URL } from '@/lib/configs';

import { LandingHeader } from '@/components/landing/LandingHeader';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { VaticanNewsSection } from '@/components/landing/VaticanNewsSection';
import { ContactCTASection } from '@/components/landing/ContactCTASection';
import { LandingFooter } from '@/components/landing/LandingFooter';

// ─── SEO & Open Graph Metadata ────────────────────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL(APP_BASE_URL),
  title: 'Sổ Giáo Dân - Hệ thống quản lý giáo xứ hiện đại',
  description:
    'Giải pháp số hóa công tác quản lý giáo xứ, lưu giữ truyền thống và gắn kết mọi thành viên trong đại gia đình đức tin.',
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: 'https://giaodan.io.vn',
    siteName: 'Sổ Giáo Dân',
    title: 'Sổ Giáo Dân - Hệ thống quản lý giáo xứ hiện đại',
    description:
      'Giải pháp số hóa công tác quản lý giáo xứ, lưu giữ truyền thống và gắn kết mọi thành viên trong đại gia đình đức tin.',
    images: [
      {
        url: '/images/hero-bg.webp',
        width: 1200,
        height: 630,
        alt: 'Sổ Giáo Dân - Hệ thống quản lý giáo xứ',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sổ Giáo Dân - Hệ thống quản lý giáo xứ hiện đại',
    description:
      'Giải pháp số hóa công tác quản lý giáo xứ, lưu giữ truyền thống và gắn kết mọi thành viên trong đại gia đình đức tin.',
    images: ['/images/hero-bg.webp'],
  },
  alternates: {
    canonical: 'https://giaodan.io.vn',
  },
};

// ─── Skeleton Loaders ─────────────────────────────────────────────────────────

function SpiritualLifeSkeleton() {
  return (
    <section className="w-full py-16 md:py-24 bg-gradient-to-br from-[#E05C3A] to-primary">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="h-10 w-56 bg-white/20 rounded mb-12 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/10 rounded p-6 animate-pulse min-h-[240px]" />
          ))}
        </div>
      </div>
    </section>
  );
}

function VaticanNewsSkeleton() {
  return (
    <section className="w-full py-16 md:py-24 bg-vellum border-t border-outline-variant/30">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col items-center mb-12 gap-3">
          <div className="h-4 w-32 bg-foreground/10 rounded animate-pulse" />
          <div className="h-10 w-72 bg-foreground/10 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded overflow-hidden border border-outline-variant/30 animate-pulse">
              <div className="w-full aspect-[16/10] bg-foreground/10" />
              <div className="p-6 flex flex-col gap-3">
                <div className="h-3 w-20 bg-foreground/10 rounded" />
                <div className="h-6 bg-foreground/10 rounded" />
                <div className="h-4 bg-foreground/5 rounded" />
                <div className="h-4 w-4/5 bg-foreground/5 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── ISR configuration ───────────────────────────────────────────────────────
// This page uses ISR — Next.js will revalidate the page every 5 minutes.
// Individual async Server Components (SpiritualLife, VaticanNews) also set
// `next: { revalidate: 300 }` on their own fetch calls for fine-grained control.
export const revalidate = 300;

// ─── Page Component ───────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <main className="flex flex-col min-h-screen">
      {/* Sticky Navigation */}
      <LandingHeader />

      {/* ① Hero — static, priority image loaded immediately */}
      <HeroSection />


      {/* ③ Features — static content, no async data */}
      <FeaturesSection />

      {/* ④ Vatican News — async RSC, streams in with skeleton fallback */}
      <Suspense fallback={<VaticanNewsSkeleton />}>
        <VaticanNewsSection />
      </Suspense>

      {/* ⑤ Contact CTA Banner — client component (manages modal state) */}
      <ContactCTASection />

      {/* ⑥ Footer */}
      <LandingFooter />
    </main>
  );
}
