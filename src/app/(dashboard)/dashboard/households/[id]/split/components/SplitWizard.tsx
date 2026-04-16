'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Image from 'next/image';
import { Household, ParishionerSummary, Zone } from '@/types/household';
import { DatePicker } from '@/components/dashboard/shared/DatePicker';

type WizardState = {
  personA: ParishionerSummary | null;
  personB: ParishionerSummary | null;
  headId: string;
  spouseId: string;
  householdCode: string;
  address: string;
  zoneId: string;
  bookIssueDate: string;
}

import { useSplitHousehold } from '../../../queries/useHouseholdMutations';

export function SplitWizard({ originHousehold, zones }: { originHousehold: Household, zones: Zone[] }) {
  const router = useRouter();
  const [step, setStep] = useState(2); // Start at 2 to match HTML design precisely
  
  const splitHouseholdMutation = useSplitHousehold(originHousehold.id);

  // Initial mock state to render step 2 exactly like HTML
  const members = originHousehold.current_members || [];
  const defaultPersonA = members[0] || originHousehold.head || null;
  const defaultPersonB = originHousehold.spouse || null;

  const [wizardData, setWizardData] = useState<WizardState>({
    personA: defaultPersonA,
    personB: defaultPersonB,
    headId: defaultPersonA?.id || '',
    spouseId: defaultPersonB?.id || '',
    householdCode: 'HG-2023-0892',
    address: '',
    zoneId: '',
    bookIssueDate: new Date().toISOString().split('T')[0]
  });

  const handleNext = () => setStep(prev => Math.min(prev + 1, 3));
  const handleBack = () => {
    if (step === 1) router.back();
    else setStep(prev => Math.max(prev - 1, 1));
  };

  const handleConfirm = async () => {
    try {
      const payload = {
        new_household: {
          household_code: wizardData.householdCode,
          address: wizardData.address,
          zone_id: wizardData.zoneId,
          book_issue_date: wizardData.bookIssueDate
        },
        head_id: wizardData.headId,
        spouse_id: wizardData.spouseId,
        member_ids: [wizardData.personA?.id, wizardData.personB?.id].filter(Boolean)
      };

      const result = await splitHouseholdMutation.mutateAsync(payload);

      toast.success('Tách hộ thành công');
      router.push(`/dashboard/households/${result.id || ''}`);
      
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Đã có lỗi xảy ra');
    }
  };

  const isSubmitting = splitHouseholdMutation.isPending;

  return (
    <div className="relative min-h-screen">
      <div className="max-w-5xl mx-auto p-8 pt-10">
        
        {/* Progress Indicator */}
        <div className="mb-8 md:mb-14 text-center">
          <div className="relative flex justify-between items-center max-w-xs md:max-w-2xl mx-auto">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-outline-variant -translate-y-1/2 z-0"></div>
            <div 
              className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-300"
              style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
            ></div>
            
            {[1, 2, 3].map(i => (
              <div key={i} className="relative z-10 flex flex-col items-center">
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold ring-4 ring-background transition-colors text-sm ${i <= step ? 'bg-primary text-white' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                  {i}
                </div>
                {/* Full label on desktop, abbreviated on mobile */}
                <span className={`mt-2 text-[9px] md:text-[10px] font-bold uppercase tracking-tighter hidden sm:block ${i <= step ? 'text-primary' : 'text-on-surface-variant'}`}>
                  {i === 1 ? 'Chọn đôi hôn phối' : i === 2 ? 'Thiết lập Hộ giáo mới' : 'Xem trước & Xác nhận'}
                </span>
                <span className={`mt-2 text-[9px] font-bold uppercase tracking-tighter sm:hidden ${i <= step ? 'text-primary' : 'text-on-surface-variant'}`}>
                  {i === 1 ? 'Chọn' : i === 2 ? 'Thiết lập' : 'Xác nhận'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Wizard Main Content — stacks to single column on mobile, sidebar below form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 pb-32">
          {/* Left Form Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {step === 1 && (
              <section className="bg-surface border border-outline p-8 shadow-sm">
                <h2 className="text-xl font-serif font-bold text-primary border-b border-outline-variant pb-4 mb-6">Bước 1: Chọn đôi hôn phối</h2>
                <div className="p-4 border border-outline-variant bg-surface-container/50 text-sm text-muted rounded">
                  {/* Mock UI for Step 1 as we are focusing on Step 2 per HTML */}
                  Tính năng tìm kiếm và chọn Giáo dân đang được tích hợp. Nhấn Tiếp tục để sang Bước 2.
                </div>
              </section>
            )}

            {(step === 2 || step === 3) && (
              <section className="bg-surface border border-outline p-8 shadow-sm">
                <h2 className="text-xl font-serif font-bold text-primary border-b border-outline-variant pb-4 mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[24px]">family_restroom</span>
                  Thông tin Hộ giáo mới
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted uppercase tracking-wide">Mã Hộ giáo mới</label>
                    <input 
                      value={wizardData.householdCode}
                      onChange={e => setWizardData(prev => ({...prev, householdCode: e.target.value}))}
                      disabled={step === 3}
                      className="w-full border-outline rounded focus:ring-primary focus:border-primary font-mono text-sm disabled:bg-surface-container" 
                      type="text" 
                    />
                  </div>
                  <div className="space-y-2">
                    <DatePicker
                      label="Ngày lập hộ"
                      value={wizardData.bookIssueDate}
                      onChange={(val) => setWizardData(prev => ({ ...prev, bookIssueDate: val }))}
                      disabled={step === 3}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-bold text-muted uppercase tracking-wide">Giáo khu</label>
                    <select 
                      value={wizardData.zoneId}
                      onChange={e => setWizardData(prev => ({...prev, zoneId: e.target.value}))}
                      disabled={step === 3}
                      className="w-full border-outline rounded focus:ring-primary focus:border-primary text-sm disabled:bg-surface-container"
                    >
                      <option value="">Chọn giáo khu</option>
                      {zones.map(z => (
                        <option key={z.id} value={z.id}>{z.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-bold text-muted uppercase tracking-wide">Địa chỉ thường trú</label>
                    <textarea 
                      value={wizardData.address}
                      onChange={e => setWizardData(prev => ({...prev, address: e.target.value}))}
                      disabled={step === 3}
                      className="w-full border-outline rounded focus:ring-primary focus:border-primary text-sm disabled:bg-surface-container" 
                      placeholder="Nhập địa chỉ đầy đủ..." 
                      rows={2}
                    ></textarea>
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  <h3 className="text-sm font-bold text-muted uppercase tracking-widest flex items-center gap-2">Vai trò trong gia đình</h3>
                  <div className="grid grid-cols-1 gap-4">
                    
                    {wizardData.personA && (
                      <div className="flex items-center justify-between p-4 border border-outline bg-surface-container/50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-outline-variant overflow-hidden flex items-center justify-center shrink-0">
                            {wizardData.personA.avatar_url ? (
                              <div className="relative w-full h-full">
                                <Image 
                                  src={wizardData.personA.avatar_url} 
                                  alt="Person A" 
                                  fill 
                                  className="object-cover" 
                                />
                              </div>
                            ) : (
                              <span className="font-bold text-muted">{wizardData.personA.full_name?.charAt(0)}</span>
                            )}
                          </div>
                          <div>
                            <p className="font-serif font-bold text-text-main">{wizardData.personA.christian_name} {wizardData.personA.full_name}</p>
                            <p className="text-xs text-muted italic">Mã: {wizardData.personA.parishioner_code || 'Chưa rõ'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                              type="radio" 
                              name="roleA" 
                              checked={wizardData.headId === wizardData.personA.id}
                              onChange={() => setWizardData(prev => ({...prev, headId: wizardData.personA!.id, spouseId: wizardData.personB?.id || ''}))}
                              disabled={step === 3}
                              className="text-primary focus:ring-primary disabled:opacity-50" 
                            />
                            <span className="text-sm font-medium">Chủ hộ</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                              type="radio" 
                              name="roleA" 
                              checked={wizardData.spouseId === wizardData.personA.id}
                              onChange={() => setWizardData(prev => ({...prev, spouseId: wizardData.personA!.id, headId: wizardData.personB?.id || ''}))}
                              disabled={step === 3}
                              className="text-primary focus:ring-primary disabled:opacity-50" 
                            />
                            <span className="text-sm font-medium">Vợ/Chồng</span>
                          </label>
                        </div>
                      </div>
                    )}

                    {wizardData.personB && (
                      <div className="flex items-center justify-between p-4 border border-outline bg-surface-container/50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-outline-variant overflow-hidden flex items-center justify-center shrink-0">
                            {wizardData.personB.avatar_url ? (
                              <div className="relative w-full h-full">
                                <Image 
                                  src={wizardData.personB.avatar_url} 
                                  alt="Person B" 
                                  fill 
                                  className="object-cover" 
                                />
                              </div>
                            ) : (
                              <span className="font-bold text-muted">{wizardData.personB.full_name?.charAt(0)}</span>
                            )}
                          </div>
                          <div>
                            <p className="font-serif font-bold text-text-main">{wizardData.personB.christian_name} {wizardData.personB.full_name}</p>
                            <p className="text-xs text-muted italic">Mã: {wizardData.personB.parishioner_code || 'Chưa rõ'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                              type="radio" 
                              name="roleB" 
                              checked={wizardData.headId === wizardData.personB.id}
                              onChange={() => setWizardData(prev => ({...prev, headId: wizardData.personB!.id, spouseId: wizardData.personA?.id || ''}))}
                              disabled={step === 3}
                              className="text-primary focus:ring-primary disabled:opacity-50" 
                            />
                            <span className="text-sm font-medium">Chủ hộ</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                              type="radio" 
                              name="roleB" 
                              checked={wizardData.spouseId === wizardData.personB.id}
                              onChange={() => setWizardData(prev => ({...prev, spouseId: wizardData.personB!.id, headId: wizardData.personA?.id || ''}))}
                              disabled={step === 3}
                              className="text-primary focus:ring-primary disabled:opacity-50" 
                            />
                            <span className="text-sm font-medium">Vợ/Chồng</span>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Right Sidebar Preview */}
          <div className="space-y-6">
            <div className="bg-[#F5F5F4] border border-outline-variant p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 -rotate-45 translate-x-8 -translate-y-8"></div>
              <h2 className="text-lg font-serif font-bold text-text-main mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">history_edu</span>
                Dự kiến thay đổi
              </h2>
              
              <div className="space-y-4">
                <div className="bg-surface p-4 border border-outline rounded-sm shadow-sm">
                  <p className="text-[10px] text-muted font-bold uppercase tracking-widest mb-2">Truy xuất nguồn gốc</p>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted">Origin Household (G)</span>
                      <span className="font-mono bg-surface-container px-1 text-text-main">{originHousehold.household_code}</span>
                    </div>
                    {wizardData.personB && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted">Origin Household (B)</span>
                        <span className="font-mono bg-surface-container px-1 text-text-main">Hộ B chưa rõ</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-dashed border-outline-variant">
                    <p className="text-[10px] text-[#059669] font-bold uppercase mb-1">Cập nhật hệ thống</p>
                    <p className="text-xs text-muted leading-relaxed italic">
                      &quot;Cập nhật <span className="font-bold">household_id</span> mới. Giữ nguyên <span className="font-bold">origin_household_id</span> để theo dõi dòng tộc.&quot;
                    </p>
                  </div>
                </div>
                
                <div className="bg-primary/5 p-4 border border-primary/20 rounded-sm">
                  <p className="text-xs text-primary font-bold mb-1">Lưu ý quan trọng</p>
                  <p className="text-xs text-muted leading-relaxed">
                    Việc tách hộ sẽ tự động cập nhật trạng thái hôn nhân của hai giáo dân trong sổ cái lưu trữ.
                  </p>
                </div>
              </div>
            </div>

            <div className={`p-6 border flex items-center justify-between ${step === 3 ? 'bg-primary/5 border-primary text-primary' : 'bg-surface border-outline'}`}>
              <div>
                <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Trạng thái hồ sơ</p>
                <p className="text-lg font-serif font-bold mt-1">
                  {step === 3 ? 'Sắp hoàn tất' : 'Chờ xác nhận'}
                </p>
              </div>
              <span className={`material-symbols-outlined text-4xl ${step === 3 ? 'text-primary' : 'text-outline-variant'}`}>
                {step === 3 ? 'check_circle' : 'pending_actions'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar — full-width stacked on mobile, inline on desktop */}
      <footer className="fixed bottom-0 left-0 right-0 bg-surface border-t border-outline flex items-center z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.03)] lg:pl-64">
        <div className="max-w-5xl mx-auto w-full px-4 md:px-8 py-3 md:py-0 md:h-20 flex items-center justify-between gap-3">
          <button 
            onClick={handleBack}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 md:px-6 py-2.5 border border-primary/20 text-muted hover:bg-surface-container transition-all text-sm font-medium rounded-sm disabled:opacity-50 min-h-[48px]"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            <span className="hidden sm:inline">Quay lại</span>
          </button>
          
          <div className="flex items-center gap-3 flex-1 sm:flex-none justify-end">
            {step < 3 ? (
               <button 
                onClick={handleNext}
                className="flex-1 sm:flex-none min-h-[48px] px-6 md:px-8 py-2.5 bg-primary text-white font-bold hover:bg-primary/90 transition-all text-sm tracking-wide rounded-sm"
              >
                Tiếp tục
              </button>
            ) : (
              <button 
                onClick={handleConfirm}
                disabled={isSubmitting || !wizardData.headId || !wizardData.spouseId || !wizardData.address}
                className="flex-1 sm:flex-none min-h-[48px] px-6 md:px-8 py-2.5 bg-primary text-white font-bold hover:bg-primary/90 transition-all text-sm tracking-wide shadow-lg flex items-center justify-center gap-2 rounded-sm disabled:opacity-50"
              >
                {isSubmitting ? 'Đang xử lý...' : 'Xác nhận & Lưu hồ sơ'}
                <span className="material-symbols-outlined text-[18px]">save_as</span>
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
