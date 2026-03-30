import type { Metadata } from 'next';
import { Lora, Work_Sans } from 'next/font/google';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/components/providers/auth-provider';
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
      <body className="min-h-full flex flex-col font-sans bg-vellum text-foreground">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
