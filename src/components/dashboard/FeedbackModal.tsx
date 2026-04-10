'use client';

import { useState } from 'react';
import { X, Copy, CheckCircle2, Mail } from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { useParishQuery } from '@/lib/queries/useSettingsQueries';
import { CONTACT_INFO } from '@/lib/configs';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const { user } = useAuth();
  const { data: parishData } = useParishQuery(isOpen); // Only fetch if open
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const parishName = parishData?.data?.name || user?.church_name || 'Đang cập nhật...';

  const template = `Tiêu đề: [Góp ý/Báo lỗi] - [Tên tính năng hoặc vấn đề]

Nội dung:
1. Thông tin người gửi (Vui lòng giữ nguyên):
- Họ tên: ${user?.name || ''}
- Email: ${user?.email || ''}
- Giáo xứ: ${parishName}

2. Vấn đề hoặc tính năng liên quan (Use case):
- [Mô tả ngữ cảnh hoặc tính năng đang sử dụng, ví dụ: Khi tôi đang cập nhật hồ sơ giáo dân...]

3. Mô tả chi tiết:
- [Ghi rõ những gì bạn đang gặp vấn đề hoặc mong muốn cải thiện]

4. Hình ảnh đính kèm (nếu có):
- [Xin vui lòng đính kèm ảnh chụp màn hình bị lỗi hoặc khu vực cần cải thiện]`;

  const handleCopy = () => {
    navigator.clipboard.writeText(template);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const mailToUrl = `mailto:${CONTACT_INFO.email}?subject=${encodeURIComponent('[Góp ý/Báo lỗi]')}&body=${encodeURIComponent(template)}`;

  return (
    <>
      <div className="fixed inset-0 z-[100] bg-foreground/50 transition-opacity" onClick={onClose} />
      <div className="fixed left-[50%] top-[50%] z-[110] w-full max-w-[calc(100vw-32px)] md:max-w-2xl translate-x-[-50%] translate-y-[-50%] flex flex-col max-h-[90vh]">
        <div className="bg-background rounded shadow-xl flex flex-col overflow-hidden">
          <div className="px-6 py-5 border-b border-outline flex items-center justify-between shrink-0 bg-surface">
            <div>
              <h3 className="font-serif text-lg font-bold text-foreground">
                Góp ý & Báo lỗi
              </h3>
              <p className="text-sm text-muted mt-1 font-sans">
                Hiện tại chúng tôi hỗ trợ nhận phản hồi qua email.
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-muted hover:text-foreground transition-colors p-2 -mr-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="px-6 py-6 overflow-y-auto flex-1 custom-scrollbar bg-background">
            <p className="text-sm text-foreground mb-4 font-sans">
              Vui lòng copy mẫu dưới đây hoặc bấm nút <strong>Gửi Email</strong> trực tiếp để chúng tôi có đủ thông tin hỗ trợ bạn nhanh nhất.
            </p>

            <div className="relative bg-surface border border-outline rounded p-4 font-mono text-sm text-foreground whitespace-pre-wrap select-all">
              {template}
            </div>
          </div>

          <div className="px-6 py-4 bg-surface border-t border-outline flex flex-col sm:flex-row items-center justify-end gap-3 shrink-0">
            <button
              onClick={handleCopy}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded px-4 py-2 text-sm font-medium text-foreground hover:bg-hover-bg border border-outline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[48px] sm:min-h-[40px] transition-colors"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Đã copy
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 text-muted group-hover:text-foreground" />
                  Copy mẫu
                </>
              )}
            </button>
            <a
              href={mailToUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[48px] sm:min-h-[40px] transition-colors"
            >
              <Mail className="h-4 w-4" />
              Gửi Email
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
