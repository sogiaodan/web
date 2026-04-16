'use client';

import { useState, useSyncExternalStore } from 'react';
import { X, Share, PlusSquare } from 'lucide-react';

const emptySubscribe = () => () => {};

export default function IOSInstallBanner() {
  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [dismissed, setDismissed] = useState(false);

  if (!isClient || dismissed) return null;

  // 1. Check if it's iOS
  const nav = navigator as unknown as { standalone?: boolean };
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !((window as unknown) as { MSStream?: unknown }).MSStream;
  
  // 2. Check if already installed
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || nav.standalone;

  // 3. Check if user dismissed it before in this session
  const isDismissedLocal = localStorage.getItem('ios-pwa-banner-dismissed');

  if (!isIOS || isStandalone || isDismissedLocal) return null;

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('ios-pwa-banner-dismissed', 'true');
  };

  return (
    <div className="fixed bottom-6 left-4 right-4 z-[200] md:left-auto md:right-8 md:w-96 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-surface border border-outline shadow-[0_4px_20px_-2px_rgba(28,25,23,0.08)] rounded-md overflow-hidden relative corner-accent">
        <button 
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 text-muted hover:text-primary transition-colors"
          aria-label="Đóng"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-5">
          <h3 className="font-serif text-lg font-bold text-foreground mb-2">
            Cài đặt Sổ Giáo Dân
          </h3>
          
          <p className="font-sans text-sm text-muted mb-4 leading-relaxed">
            Để trải nghiệm như một ứng dụng chuyên nghiệp trên iPhone, hãy thêm vào màn hình chính:
          </p>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-foreground bg-primary/5 p-3 rounded-sm border border-primary/10">
              <div className="flex-shrink-0 w-8 h-8 bg-surface border border-outline rounded flex items-center justify-center">
                <Share className="w-4 h-4 text-primary" />
              </div>
              <p className="font-sans">
                1. Nhấn nút <strong>Chia sẻ</strong> trên trình duyệt
              </p>
            </div>

            <div className="flex items-center gap-3 text-sm text-foreground bg-primary/5 p-3 rounded-sm border border-primary/10">
              <div className="flex-shrink-0 w-8 h-8 bg-surface border border-outline rounded flex items-center justify-center">
                <PlusSquare className="w-4 h-4 text-primary" />
              </div>
              <p className="font-sans">
                2. Chọn <strong>Thêm vào Màn hình chính</strong>
              </p>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="mt-5 w-full bg-primary text-white font-sans text-sm font-medium py-2.5 rounded hover:bg-primary/90 transition-colors"
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
}
