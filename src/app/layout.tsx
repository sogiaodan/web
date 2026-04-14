import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Lora, Work_Sans } from 'next/font/google';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/components/providers/auth-provider';
import { SystemAdminProvider } from '@/components/providers/system-admin-provider';
import { apiServerFetch } from '@/lib/api-server';
import { GetMeResponse } from '@/lib/auth-api';
import Providers from './providers';
import IOSInstallBanner from '@/components/pwa/IOSInstallBanner';
import './globals.css';

const lora = Lora({
  subsets: ['vietnamese', 'latin'],
  variable: '--font-lora',
  display: 'swap',
});

const workSans = Work_Sans({
  subsets: ['vietnamese', 'latin'],
  variable: '--font-work-sans',
  display: 'swap',
});

// Viewport config is separate from Metadata in Next.js 14+
export const viewport: Viewport = {
  themeColor: '#8B2635',
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  viewportFit: 'cover', // Respect iPhone notch / safe areas
};

export const metadata: Metadata = {
  title: 'Sổ Giáo Dân | Parish Management System',
  description: 'Hệ thống quản trị giáo xứ hiện đại và an toàn.',
  manifest: '/brand/manifest.json',
  icons: {
    icon: '/brand/favicon.ico',
    apple: '/brand/apple-touch-icon.png',
  },
  // Tell iOS this is a full-screen capable web app
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Sổ Giáo Dân',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Pre-fetch user session once at the root to avoid client-side "pop-in"
  // and eliminate redundant /me requests across components.
  const meRes = await apiServerFetch<GetMeResponse>('/api/v1/auth/me');
  const initialUser = meRes?.data?.user || null;

  return (
    <html
      lang="vi"
      className={`${lora.variable} ${workSans.variable} h-full antialiased`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-vellum text-foreground">
        {/* Register PWA Service Worker only in production to avoid dev caching issues */}
        {process.env.NODE_ENV === 'production' && (
          <Script id="register-sw" strategy="afterInteractive">
            {`
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .catch(function(err) {
                      console.error('[PWA] Service worker registration failed:', err);
                    });
                });
              }
            `}
          </Script>
        )}
        <SystemAdminProvider>
          <AuthProvider initialUser={initialUser}>
            <Providers>
              {children}
            </Providers>
          </AuthProvider>
        </SystemAdminProvider>
        <Toaster position="top-right" richColors />
        <IOSInstallBanner />
      </body>
    </html>
  );
}
