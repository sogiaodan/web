'use client';

import { Users, Home, ArrowRight, PlusCircle, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

interface OnboardingStateProps {
  mutate: () => void;
}

export default function OnboardingState({ mutate }: OnboardingStateProps) {
  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[900px] mx-auto w-full">
      <div className="bg-surface border border-outline rounded-sm p-8 md:p-12 text-center shadow-sm relative overflow-hidden">
        {/* Subtle decorative accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none" />
        
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
            <LayoutDashboard className="h-10 w-10 text-primary" />
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
          Chào mừng đến với Sổ Giáo Dân
        </h1>
        
        <p className="text-muted text-lg max-w-2xl mx-auto mb-10 leading-relaxed font-sans">
          Hệ thống đã sẵn sàng, nhưng hiện tại chưa có dữ liệu nào được ghi nhận. 
          Hãy bắt đầu bằng cách thiết lập hộ gia đình đầu tiên cho giáo xứ của bạn.
        </p>

        <div className="max-w-sm mx-auto">
          <Link 
            href="/dashboard/households/add"
            className="group flex flex-col items-center p-8 border border-outline hover:border-primary/30 bg-vellum hover:bg-primary/5 transition-all rounded-sm text-center shadow-sm"
          >
            <div className="h-14 w-14 rounded-sm bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Home className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-serif font-bold text-foreground mb-3">Tạo Hộ Giáo</h3>
            <p className="text-sm text-muted font-sans mb-6">Thiết lập hộ gia đình mới và bắt đầu quản lý nhân khẩu tập trung.</p>
            <div className="mt-auto flex items-center text-primary font-bold">
              Tạo ngay <ArrowRight className="ml-2 h-5 w-5" />
            </div>
          </Link>
        </div>

        <button 
          onClick={() => mutate()}
          className="mt-12 text-muted hover:text-primary text-sm flex items-center mx-auto transition-colors font-sans underline underline-offset-4"
        >
          Làm mới dữ liệu
        </button>
      </div>
    </div>
  );
}
