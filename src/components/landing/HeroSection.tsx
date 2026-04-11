'use client';

import Image from 'next/image';

function smoothScrollTo(targetId: string) {
  const element = document.getElementById(targetId);
  if (element) {
    const headerOffset = 64;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.scrollY - headerOffset;
    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
  }
}

export function HeroSection() {
  return (
    <section className="relative w-full min-h-[560px] md:min-h-[700px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0 bg-[#1A1A1A]">
        <Image
          src="/images/hero-bg.webp"
          alt="Nội thất nhà thờ"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Dark overlay ~60% opacity */}
        <div className="absolute inset-0 bg-black/60 z-10" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-20 flex flex-col items-center justify-center text-center max-w-4xl py-20">
        {/* Single <h1> for SEO — spec mandates exactly one per page */}
        <h1 className="font-serif text-[28px] md:text-[48px] font-bold text-white mb-6 leading-[1.2] drop-shadow-sm">
          Sổ Giáo Dân: Số Hóa Đức Tin, Kết Nối Cộng Đồng
        </h1>

        <p className="font-sans text-[14px] md:text-[18px] text-white/95 max-w-[600px] mb-10 leading-relaxed font-normal drop-shadow-sm">
          Giải pháp số hóa công tác quản lý giáo xứ, lưu giữ truyền thống và gắn kết mọi thành
          viên trong đại gia đình đức tin.
        </p>

        {/* Primary CTA — full-width on mobile, auto on desktop */}
        <button
          id="hero-cta-btn"
          onClick={() => smoothScrollTo('ve-du-an')}
          className="w-full sm:w-auto bg-primary text-white font-sans text-sm md:text-base font-medium px-8 min-h-[48px] rounded flex items-center justify-center gap-2 hover:bg-white hover:text-primary border border-transparent hover:border-primary transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black mb-12 shadow-lg group"
        >
          KHÁM PHÁ NGAY{' '}
          <span className="text-xl leading-none group-hover:translate-x-1 transition-transform duration-200">
            ▸
          </span>
        </button>

        <p className="font-sans text-[14px] md:text-[16px] text-white/80 italic font-light mt-0 tracking-wide px-4">
          &ldquo;Lời Chúa là ngọn đèn soi cho con bước...&rdquo;
        </p>
      </div>
    </section>
  );
}
