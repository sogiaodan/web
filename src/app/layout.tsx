import type { Metadata } from 'next';
import { Lora, Work_Sans } from 'next/font/google';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/components/providers/auth-provider';
import { SystemAdminProvider } from '@/components/providers/system-admin-provider';
import { serverFetch } from '@/lib/api-server';
import { GetMeResponse } from '@/lib/auth-api';
import './globals.css';

export const runtime = 'edge';

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

export const metadata: Metadata = {
  title: 'Sổ Giáo Dân | Parish Management System',
  description: 'Hệ thống quản trị giáo xứ hiện đại và an toàn.',
  manifest: '/brand/manifest.json',
  icons: {
    icon: '/brand/favicon.ico',
    apple: '/brand/apple-touch-icon.png',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Pre-fetch user session once at the root to avoid client-side "pop-in"
  // and eliminate redundant /me requests across components.
  const meRes = await serverFetch<GetMeResponse>('/api/v1/auth/me');
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
        <SystemAdminProvider>
          <AuthProvider initialUser={initialUser}>
            {children}
          </AuthProvider>
        </SystemAdminProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
