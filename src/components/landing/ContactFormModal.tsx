'use client';

import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { X, Send } from 'lucide-react';
import { API_BASE_URL } from '@/lib/configs';

// ─── Zod schema ─────────────────────────────────────────────────────────────
const contactSchema = z.object({
  full_name: z
    .string()
    .min(1, 'Họ tên không được để trống')
    .max(200, 'Họ tên tối đa 200 ký tự'),
  email: z.email('Email không hợp lệ').max(200, 'Email tối đa 200 ký tự'),
  parish_name: z.string().max(200, 'Tên giáo xứ tối đa 200 ký tự').optional(),
  message: z
    .string()
    .min(1, 'Nội dung không được để trống')
    .max(2000, 'Nội dung tối đa 2000 ký tự'),
});

type ContactFormData = z.infer<typeof contactSchema>;

// ─── Props ───────────────────────────────────────────────────────────────────
interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Field helper ────────────────────────────────────────────────────────────
function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1.5 font-sans text-[12px] text-red-600">
      {message}
    </p>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────
export function ContactFormModal({ isOpen, onClose }: ContactFormModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  // Focus first input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => firstInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // ─── Submit handler ─────────────────────────────────────────────────────
  const onSubmit = async (data: ContactFormData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/landing/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (res.status === 429) {
        toast.error('Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.');
        return;
      }

      if (!res.ok) {
        const errorMsg =
          json?.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
        toast.error(errorMsg);
        return;
      }

      toast.success(
        'Yêu cầu của bạn đã được ghi nhận. Chúng tôi sẽ liên hệ sớm nhất.'
      );
      reset();
      onClose();
    } catch {
      toast.error('Không thể kết nối tới máy chủ. Vui lòng thử lại sau.');
    }
  };

  // ─── UI ─────────────────────────────────────────────────────────────────
  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-modal-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Modal Panel */}
      <div className="relative z-10 w-full max-w-lg bg-[#FDFBF7] rounded shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-primary px-6 py-5 flex items-start justify-between gap-4">
          <div>
            <h2
              id="contact-modal-title"
              className="font-serif text-[22px] font-bold text-white leading-tight"
            >
              Liên Hệ Tư Vấn
            </h2>
            <p className="font-sans text-[13px] text-white/80 mt-1 leading-snug">
              Điền thông tin để chúng tôi liên hệ với bạn sớm nhất.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng hộp thoại"
            className="flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-full text-white/80 hover:bg-white/15 hover:text-white transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="px-6 py-6 flex flex-col gap-5"
        >
          {/* Họ tên */}
          <div>
            <label
              htmlFor="contact-full-name"
              className="block font-sans text-[12px] font-bold uppercase tracking-[0.08em] text-foreground/70 mb-2"
            >
              Họ Tên <span className="text-primary">*</span>
            </label>
            <input
              id="contact-full-name"
              type="text"
              autoComplete="name"
              placeholder="Nguyễn Văn A"
              {...register('full_name')}
              ref={(e) => {
                register('full_name').ref(e);
                (firstInputRef as React.MutableRefObject<HTMLInputElement | null>).current = e;
              }}
              className="w-full h-11 px-4 font-sans text-[14px] text-foreground bg-white border border-outline-variant rounded placeholder:text-foreground/40 hover:border-foreground/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-200"
            />
            <FieldError message={errors.full_name?.message} />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="contact-email"
              className="block font-sans text-[12px] font-bold uppercase tracking-[0.08em] text-foreground/70 mb-2"
            >
              Email <span className="text-primary">*</span>
            </label>
            <input
              id="contact-email"
              type="email"
              autoComplete="email"
              placeholder="nguyenvana@gmail.com"
              {...register('email')}
              className="w-full h-11 px-4 font-sans text-[14px] text-foreground bg-white border border-outline-variant rounded placeholder:text-foreground/40 hover:border-foreground/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-200"
            />
            <FieldError message={errors.email?.message} />
          </div>

          {/* Giáo xứ (optional) */}
          <div>
            <label
              htmlFor="contact-parish"
              className="block font-sans text-[12px] font-bold uppercase tracking-[0.08em] text-foreground/70 mb-2"
            >
              Giáo Xứ{' '}
              <span className="text-foreground/40 normal-case tracking-normal font-normal">
                (không bắt buộc)
              </span>
            </label>
            <input
              id="contact-parish"
              type="text"
              placeholder="Giáo xứ Tân Định"
              {...register('parish_name')}
              className="w-full h-11 px-4 font-sans text-[14px] text-foreground bg-white border border-outline-variant rounded placeholder:text-foreground/40 hover:border-foreground/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-200"
            />
            <FieldError message={errors.parish_name?.message} />
          </div>

          {/* Nội dung */}
          <div>
            <label
              htmlFor="contact-message"
              className="block font-sans text-[12px] font-bold uppercase tracking-[0.08em] text-foreground/70 mb-2"
            >
              Nội Dung <span className="text-primary">*</span>
            </label>
            <textarea
              id="contact-message"
              rows={4}
              placeholder="Chúng tôi muốn tìm hiểu thêm về hệ thống quản lý giáo dân..."
              {...register('message')}
              className="w-full px-4 py-3 font-sans text-[14px] text-foreground bg-white border border-outline-variant rounded placeholder:text-foreground/40 hover:border-foreground/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-200 resize-none leading-relaxed"
            />
            <FieldError message={errors.message?.message} />
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 font-sans text-[13px] font-medium text-foreground/70 border border-outline-variant rounded hover:bg-black/5 hover:text-foreground transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              Huỷ
            </button>
            <button
              type="submit"
              id="contact-submit-btn"
              disabled={isSubmitting}
              className="flex-1 h-11 font-sans text-[13px] font-bold uppercase tracking-wide text-white bg-primary rounded hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span
                    className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin"
                    aria-hidden="true"
                  />
                  Đang gửi...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Gửi Yêu Cầu
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
