'use client';

import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { ContactFormModal } from './ContactFormModal';

export function ContactCTASection() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <section id="lien-he" className="w-full bg-primary py-16 md:py-20 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 to-transparent opacity-50 pointer-events-none" />

        <div className="container mx-auto px-4 max-w-4xl flex flex-col items-center justify-center text-center relative z-10">
          <h2 className="font-serif text-[24px] md:text-[36px] font-bold text-white mb-4 leading-tight">
            Bạn Cần Tư Vấn Về Hệ Thống?
          </h2>
          <p className="font-sans text-[15px] md:text-[18px] text-white/90 mb-10 max-w-2xl leading-relaxed">
            Hãy để chúng tôi đồng hành cùng Giáo xứ của bạn trong công cuộc số hóa và quản lý mục vụ một cách chuyên nghiệp, an toàn và bền vững.
          </p>

          <button
            id="open-contact-modal-btn"
            className="font-sans text-[14px] md:text-[15px] font-bold text-white uppercase tracking-wide px-8 min-h-[48px] border-2 border-white rounded hover:bg-white hover:text-primary transition-all duration-300 ease-in-out flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary w-full sm:w-auto shadow-lg hover:shadow-xl"
            onClick={() => setIsModalOpen(true)}
          >
            <MessageCircle className="h-5 w-5 stroke-[2]" />
            LIÊN HỆ VỚI CHÚNG TÔI
          </button>
        </div>
      </section>

      <ContactFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
