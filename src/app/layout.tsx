import type { Metadata } from 'next';
import { Lora, Work_Sans } from 'next/font/google';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/components/providers/auth-provider';
import { SystemAdminProvider } from '@/components/providers/system-admin-provider';
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

export const metadata: Metadata = {
  title: 'Sổ Giáo Dân | Parish Management System',
  description: 'Hệ thống quản trị giáo xứ hiện đại và an toàn.',
  manifest: '/brand/manifest.json',
  icons: {
    icon: '/brand/favicon.ico',
    apple: '/brand/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
          <AuthProvider>
            {children}
          </AuthProvider>
        </SystemAdminProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
