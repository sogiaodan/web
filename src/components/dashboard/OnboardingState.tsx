'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Home, LayoutDashboard, CheckCircle2, Map, ChevronRight, User } from 'lucide-react';
import Link from 'next/link';

interface DashboardMetrics {
  total_priests: number;
  total_zones: number;
  total_parishioners: number;
  total_households: number;
}

interface OnboardingStateProps {
  mutate: () => void;
  metrics: DashboardMetrics;
}

export default function OnboardingState({ mutate, metrics }: OnboardingStateProps) {
  const [isZoneSkipped, setIsZoneSkipped] = useState(false);

  useEffect(() => {
    const skipped = localStorage.getItem('sgd_onboarding_skip_zone');
    if (skipped === 'true') {
      queueMicrotask(() => {
        setIsZoneSkipped(true);
      });
    }
  }, []);

  const isMounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const handleSkipZone = () => {
    localStorage.setItem('sgd_onboarding_skip_zone', 'true');
    setIsZoneSkipped(true);
  };

  const step1Done = metrics.total_priests > 0;
  // Step 2 is only done if step 1 is done AND (zones > 0 OR skipped)
  const step2Done = metrics.total_zones > 0 || isZoneSkipped;
  const step3Done = metrics.total_households > 0;

  // Determine current active step (the first one not done)
  let activeStep = 1;
  if (step1Done) activeStep = 2;
  if (step1Done && step2Done) activeStep = 3;

  // Disable SSR hydration mismatch by rendering a skeleton or nothing until mounted
  if (!isMounted) return null;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[800px] mx-auto w-full">
      <div className="bg-surface border border-outline rounded-sm p-8 md:p-12 shadow-sm relative overflow-hidden">
        {/* Subtle decorative accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none" />
        
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
            <LayoutDashboard className="h-10 w-10 text-primary" />
          </div>
        </div>

        <h1 className="text-3xl font-serif font-bold text-foreground mb-4 text-center">
          Chào mừng đến với Sổ Giáo Dân
        </h1>
        
        <p className="text-muted text-base max-w-2xl mx-auto mb-10 leading-relaxed font-sans text-center">
          Hệ thống đã sẵn sàng. Để bắt đầu sử dụng, hãy làm theo 3 bước thiết lập cơ bản dưới đây để chuẩn bị dữ liệu nền tảng cho giáo xứ của bạn.
        </p>

        <div className="max-w-2xl mx-auto space-y-4">
          
          {/* STEP 1: Cha Xứ */}
          <div className={`border rounded-sm p-6 transition-all ${activeStep === 1 ? 'border-primary ring-1 ring-primary/20 bg-primary/5' : step1Done ? 'border-outline bg-surface-container-low opacity-70' : 'border-outline opacity-50 bg-surface'}`}>
            <div className="flex items-start gap-4">
              <div className="shrink-0 mt-1">
                {step1Done ? (
                  <CheckCircle2 className="h-8 w-8 text-[#16A34A]" />
                ) : (
                  <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center font-bold font-sans text-sm ${activeStep === 1 ? 'border-primary text-primary' : 'border-muted text-muted'}`}>1</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`text-lg font-bold font-serif mb-1 ${step1Done ? 'text-muted line-through decoration-1' : 'text-foreground'}`}>Thêm Linh Mục</h3>
                <p className="text-sm font-sans text-muted mb-4">Mỗi giáo xứ cần có ít nhất một linh mục (Cha xứ/Cha phó) để thực hiện các bí tích cho giáo dân.</p>
                {activeStep === 1 && !step1Done && (
                  <Link 
                    href="/settings/priests"
                    className="inline-flex items-center justify-center rounded-sm bg-primary px-5 py-2 font-sans text-sm font-semibold text-white shadow-sm hover:bg-primary/90 transition-colors"
                  >
                    Tạo Linh mục <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                )}
              </div>
              <div className="hidden sm:flex shrink-0 p-3 bg-vellum rounded-full">
                <User className="h-6 w-6 text-primary/60" />
              </div>
            </div>
          </div>

          {/* STEP 2: Giáo Khu */}
          <div className={`border rounded-sm p-6 transition-all ${activeStep === 2 ? 'border-primary ring-1 ring-primary/20 bg-primary/5' : step2Done ? 'border-outline bg-surface-container-low opacity-70' : 'border-outline opacity-50 bg-surface'}`}>
            <div className="flex items-start gap-4">
              <div className="shrink-0 mt-1">
                {step2Done ? (
                  <CheckCircle2 className="h-8 w-8 text-[#16A34A]" />
                ) : (
                  <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center font-bold font-sans text-sm ${activeStep === 2 ? 'border-primary text-primary' : 'border-muted text-muted'}`}>2</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`text-lg font-bold font-serif mb-1 ${step2Done ? 'text-muted line-through decoration-1' : 'text-foreground'}`}>Tạo Giáo Khu</h3>
                <p className="text-sm font-sans text-muted mb-4">Chia hệ thống thành các giáo khu để dễ quản lý. Nếu giáo xứ của bạn nhỏ và không chia giáo khu, bạn có thể bỏ qua bước này.</p>
                {activeStep === 2 && !step2Done && (
                  <div className="flex items-center gap-3">
                    <Link 
                      href="/dashboard/zones"
                      className="inline-flex items-center justify-center rounded-sm bg-primary px-5 py-2 font-sans text-sm font-semibold text-white shadow-sm hover:bg-primary/90 transition-colors"
                    >
                      Thiết lập Giáo khu <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                    <button 
                      onClick={handleSkipZone}
                      className="inline-flex items-center justify-center rounded-sm bg-transparent border border-outline px-5 py-2 font-sans text-sm font-medium text-foreground hover:bg-hover-bg transition-colors"
                    >
                      Bỏ qua
                    </button>
                  </div>
                )}
              </div>
              <div className="hidden sm:flex shrink-0 p-3 bg-vellum rounded-full">
                <Map className="h-6 w-6 text-primary/60" />
              </div>
            </div>
          </div>

          {/* STEP 3: Hộ Giáo */}
          <div className={`border rounded-sm p-6 transition-all ${activeStep === 3 ? 'border-primary ring-1 ring-primary/20 bg-primary/5' : step3Done ? 'border-outline bg-surface-container-low opacity-70' : 'border-outline opacity-50 bg-surface'}`}>
            <div className="flex items-start gap-4">
              <div className="shrink-0 mt-1">
                {step3Done ? (
                  <CheckCircle2 className="h-8 w-8 text-[#16A34A]" />
                ) : (
                  <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center font-bold font-sans text-sm ${activeStep === 3 ? 'border-primary text-primary' : 'border-muted text-muted'}`}>3</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`text-lg font-bold font-serif mb-1 ${step3Done ? 'text-muted line-through decoration-1' : 'text-foreground'}`}>Tạo Hộ Giáo Đầu Tiên</h3>
                <p className="text-sm font-sans text-muted mb-4">Thiết lập dữ liệu nhân khẩu bắt đầu từ việc tạo hộ gia đình. Bước này hoàn thành khi hộ giáo đầu tiên được tạo.</p>
                {activeStep === 3 && !step3Done && (
                  <Link 
                    href="/dashboard/households/add"
                    className="inline-flex items-center justify-center rounded-sm bg-primary px-5 py-2 font-sans text-sm font-semibold text-white shadow-sm hover:bg-primary/90 transition-colors"
                  >
                    Tạo Hộ Giáo <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                )}
              </div>
              <div className="hidden sm:flex shrink-0 p-3 bg-vellum rounded-full">
                <Home className="h-6 w-6 text-primary/60" />
              </div>
            </div>
          </div>

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
