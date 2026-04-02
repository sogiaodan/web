'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/providers/auth-provider';

export function LandingHeader() {
  const { user, isLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Về Dự Án', href: '#ve-du-an' },
    { name: 'Tiện Ích', href: '#tien-ich' },
    { name: 'Liên Hệ', href: '#lien-he' },
  ];

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, href: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    if (element) {
      // Offset for sticky header
      const headerOffset = 64;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-vellum border-b border-outline-variant">
      <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between max-w-7xl">

        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity min-h-[44px] min-w-[44px]">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary overflow-hidden bg-white shadow-sm">
            <img src="/brand/icon-192.png" alt="Logo" className="h-full w-full object-contain" />
          </div>
          <span className="font-serif text-[20px] font-bold text-foreground">
            Sổ Giáo Dân
            <span className="hidden lg:inline font-sans text-sm font-normal text-outline-variant ml-2 tracking-normal">
              - Hệ thống quản lý
            </span>
          </span>
        </Link>

        {/* Center: Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleScroll(e, link.href)}
              className="font-sans text-foreground text-sm font-medium hover:text-primary transition-all duration-200 ease-in-out min-h-[44px] flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded px-2"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Right: CTA & Mobile Toggle */}
        <div className="flex items-center gap-2 md:gap-4">
          {isLoading ? (
            <div className="h-[44px] w-[100px] bg-foreground/5 animate-pulse rounded" />
          ) : user ? (
            <Link
              href="/login"
              className="bg-primary text-white font-sans text-sm font-medium px-5 h-[44px] rounded flex items-center justify-center hover:bg-primary/90 transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-vellum"
            >
              Vào Hệ Thống
            </Link>
          ) : (
            <Link
              href="/login"
              className="bg-primary text-white font-sans text-sm font-medium px-5 h-[44px] rounded flex items-center justify-center hover:bg-primary/90 transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-vellum"
            >
              Đăng Nhập
            </Link>
          )}

          <button
            className="md:hidden flex items-center justify-center h-[44px] w-[44px] text-foreground hover:bg-black/5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-vellum border-b border-outline-variant px-4 py-4 space-y-4 shadow-lg absolute left-0 right-0 top-16">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleScroll(e, link.href)}
                className="font-sans text-foreground text-base font-medium hover:text-primary transition-all duration-200 ease-in-out h-[44px] flex items-center border-b border-outline-variant/30 px-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:bg-black/5"
              >
                {link.name}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
