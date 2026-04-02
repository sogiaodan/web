import Link from 'next/link';
import { Mail, MapPin, Phone } from 'lucide-react';
import { CONTACT_INFO, PROJECT_LINKS } from '@/lib/configs';

const contactListData = [
  {
    icon: <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />,
    text: CONTACT_INFO.address,
  },
  {
    icon: <Phone className="h-4 w-4 flex-shrink-0 mt-0.5" />,
    text: CONTACT_INFO.phone,
  },
  {
    icon: <Mail className="h-4 w-4 flex-shrink-0 mt-0.5" />,
    text: CONTACT_INFO.email,
  },
];

export function LandingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#1C1917] text-white">
      {/* Main Footer Grid */}
      <div className="container mx-auto px-4 max-w-7xl py-14 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 lg:gap-16 text-center md:text-left">

          {/* Column 1: Logo + About + Social */}
          <div className="flex flex-col items-center md:items-start gap-5">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2.5 hover:opacity-90 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/80 overflow-hidden bg-white/10 shadow-sm">
                <img src="/brand/icon-192.png" alt="Logo" className="h-full w-full object-contain" />
              </div>
              <span className="font-serif text-[20px] font-bold text-white">
                Sổ Giáo Dân
              </span>
            </Link>

            {/* About */}
            <p className="font-sans text-[14px] text-white/70 leading-relaxed max-w-xs">
              Giải pháp số hóa công tác quản lý giáo xứ, lưu giữ truyền thống và gắn kết mọi thành
              viên trong đại gia đình đức tin.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3">
              <a
                href={`mailto:${CONTACT_INFO.email}`}
                aria-label="Email"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/40 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col items-center md:items-start gap-5">
            <h3 className="font-sans text-[13px] font-bold uppercase tracking-[0.12em] text-white/50">
              Liên Kết
            </h3>
            <nav className="flex flex-col items-center md:items-start gap-3">
              {PROJECT_LINKS.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="font-sans text-[14px] text-white/70 hover:text-white transition-colors duration-200 min-h-[44px] md:min-h-0 flex items-center focus-visible:outline-none focus-visible:underline"
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Column 3: Contact Info */}
          <div className="flex flex-col items-center md:items-start gap-5">
            <h3 className="font-sans text-[13px] font-bold uppercase tracking-[0.12em] text-white/50">
              Thông Tin
            </h3>
            <ul className="flex flex-col gap-4">
              {contactListData.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start justify-center md:justify-start gap-3 font-sans text-[14px] text-white/70 leading-relaxed"
                >
                  <span className="text-white/50 pt-0.5">{item.icon}</span>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 max-w-7xl py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-center">
          <p className="font-sans text-[13px] text-white/40">
            © {currentYear} Sổ Giáo Dân. Tất cả quyền được bảo lưu.
          </p>
          <p className="font-sans text-[13px] text-white/30">
            Phát triển với ❤️ cho Giáo Hội Việt Nam
          </p>
        </div>
      </div>
    </footer>
  );
}
