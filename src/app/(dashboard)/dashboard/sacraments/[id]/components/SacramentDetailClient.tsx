'use client';

import { useState } from 'react';
import { SacramentType } from '@/types/sacrament';
import { SacramentForm } from '../../new/components/SacramentForm';
import { Edit3, Share2, Info, Download, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/components/providers/auth-provider';
import { useSacramentDetailQuery, useSacramentsQuery } from '../../queries/useSacramentQuery';
import { useParishQuery } from '@/lib/queries/useSettingsQueries';
import { SacramentListResponse } from '@/types/sacrament';

export function SacramentDetailClient({ id }: { id: string }) {
  const { user } = useAuth();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'EDITOR';
  const [isEditing, setIsEditing] = useState(false);

  const { data: sacrament, isLoading, error } = useSacramentDetailQuery(id, false);
  const { data: parishResponse } = useParishQuery(!!sacrament);
  const parishInfo = parishResponse?.data;

  const { data: sacramentsData } = useSacramentsQuery(
    sacrament?.parishioner?.id
      ? { parishioner_id: sacrament.parishioner.id, type: 'BAPTISM' }
      : undefined
  );

  const baptism = (sacramentsData as SacramentListResponse)?.items?.find(
    (s) => s.type === 'BAPTISM'
  );

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !sacrament) {
    return (
      <div className="bg-surface border border-outline rounded p-8 text-center text-on-surface-variant font-body">
        Không thể tải dữ liệu bí tích.
      </div>
    );
  }

  const initialData = {
    parishioner_id: sacrament.parishioner?.id || '',
    date: sacrament.date || '',
    place: '',
    minister_id: sacrament.minister?.id || '',
    godparent_name: sacrament.godparent_name || '',
    book_no: sacrament.book_no || '',
    page_no: sacrament.page_no || '',
    registry_number: sacrament.registry_number || '',
    note: '',
  };

  const getSacramentName = () => {
    switch (sacrament.type) {
      case 'BAPTISM': return 'Rửa Tội';
      case 'EUCHARIST': return 'Rước Lễ';
      case 'CONFIRMATION': return 'Thêm Sức';
      default: return 'Bí tích';
    }
  };

  if (isEditing) {
    return (
      <div className="bg-surface p-4 md:p-6 rounded-lg border border-outline">
        <h2 className="font-display font-bold text-2xl text-on-surface mb-6">Chỉnh sửa Bí tích</h2>
        <SacramentForm
          type={sacrament.type as SacramentType}
          id={sacrament.id}
          initialData={initialData}
          initialParishioner={sacrament.parishioner}
          readOnly={false}
        />
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="text-sm font-bold text-on-surface-variant hover:text-on-surface"
          >
            Quay lại Chi tiết
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-on-surface mb-1">
          {canEdit ? 'Chỉnh sửa Bí tích' : 'Chi tiết Bí tích'}
        </h1>
        <p className="text-on-surface-variant font-body text-sm">
          Hồ sơ Bí tích của: <span className="font-bold">{sacrament.parishioner?.christian_name} {sacrament.parishioner?.full_name}</span>
        </p>
      </div>
      {/* Mobile Distinctive Header */}
      <div className="md:hidden relative bg-gradient-to-br from-[#E2A45C] to-[#C2410C] rounded-lg p-6 shadow-sm overflow-hidden text-center mb-6">
        <div className="relative z-10">
          <div className="w-16 h-16 mx-auto bg-surface rounded-lg mb-3 flex items-center justify-center text-primary font-bold overflow-hidden shadow-md">
            {/* Fallback to initials if no avatar */}
            {sacrament.parishioner.christian_name?.[0]}{sacrament.parishioner.full_name?.[0]}
          </div>
          <h2 className="font-display font-bold text-2xl text-[#1C1917] mb-1">
            {sacrament.parishioner.christian_name} {sacrament.parishioner.full_name}
          </h2>
          <p className="text-[#1C1917]/70 font-mono text-[10px] uppercase tracking-widest mb-4">
            ACTIVE • ID: SHP-2024-{sacrament.parishioner.id.substring(0, 4)}
          </p>

          <div className="flex gap-2">
            {canEdit && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 bg-primary text-white py-3 rounded-sm font-bold text-sm flex items-center justify-center gap-2 shadow-sm"
              >
                <Edit3 className="w-4 h-4" /> Chỉnh sửa
              </button>
            )}
            <button className="w-12 h-12 shrink-0 bg-[#E2A45C]/30 text-[#1C1917] border border-[#1C1917]/20 rounded-sm flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Main Content (Left Column) */}
        <div className="col-span-1 md:col-span-8 space-y-6">

          {/* Card 1: Desktop Information (Hidden on mobile) */}
          <div className="hidden md:block bg-surface border border-outline rounded-sm p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-medium uppercase tracking-widest text-on-surface-variant mb-1 block">
                  THÔNG TIN NGƯỜI LÃNH NHẬN
                </span>
                <span className="text-sm font-bold text-primary block">{sacrament.parishioner.christian_name}</span>
                <h2 className="font-display font-bold text-3xl text-on-surface">
                  {sacrament.parishioner.full_name}
                </h2>
              </div>
              {canEdit && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-sm font-bold text-sm flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" /> Chỉnh sửa
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-6 border-t border-outline">
              <div>
                <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest block mb-1">Ngày sinh</span>
                <span className="text-sm font-body text-on-surface">{formatDate(sacrament.parishioner.birth_date)}</span>
              </div>
              <div>
                <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest block mb-1">Giới tính</span>
                <span className="text-sm font-body text-on-surface">{(sacrament.parishioner as { gender?: string }).gender === 'MALE' ? 'Nam' : 'Nữ'}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Ceremony Details */}
          <div className="bg-surface border border-outline rounded-md md:rounded-sm p-0 md:p-6 overflow-hidden">
            {/* Header matching mobile design */}
            <div className="px-4 py-3 md:p-0 flex items-center gap-2 border-b border-outline md:border-b-0 md:mb-6">
              <div className="text-primary"><IconSacrament /></div>
              <h3 className="font-display font-bold text-base md:text-xl text-on-surface">
                Chi tiết Bí tích {getSacramentName()}
              </h3>
            </div>

            <div className="p-4 md:p-0">
              <div className="grid grid-cols-2 gap-4 md:gap-6 mb-4">
                <div>
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest block mb-1">NGÀY NHẬN</span>
                  <span className="text-sm md:text-base font-medium text-on-surface font-body">{formatDate(sacrament.date)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest block mb-1">ĐỊA ĐIỂM</span>
                  <span className="text-sm md:text-base font-medium text-on-surface font-body">Nhà thờ Chính Tòa</span>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest block mb-1">LINH MỤC CHỦ SỰ</span>
                  <span className="text-sm md:text-base font-medium text-primary font-body">
                    {sacrament.minister ? `Lm. ${sacrament.minister.full_name}` : '-'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest block mb-1">NGƯỜI ĐỠ ĐẦU</span>
                  <span className="text-sm md:text-base font-medium text-on-surface font-body">{sacrament.godparent_name || '-'}</span>
                </div>
              </div>

              <div className="bg-[#FAF6F6] rounded p-3 flex items-center justify-between mt-4">
                <span className="text-xs text-on-surface-variant font-body italic">Lần cuối cập nhật: {formatDate((sacrament as { updated_at?: string }).updated_at || new Date().toISOString())}</span>
                <Info className="w-4 h-4 text-on-surface-variant/50" />
              </div>
            </div>
          </div>

          {/* Mobile Archive Book (Moved down on mobile) */}
          <div className="bg-surface border border-outline rounded-md p-0 md:hidden">
            <div className="px-4 py-3 flex items-center gap-2 border-b border-outline">
              <div className="text-primary">📖</div>
              <h3 className="font-display font-bold text-base text-on-surface">Thông tin Sổ Bộ</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex justify-between items-end border-b border-outline/30 pb-2">
                <span className="text-sm font-body text-on-surface-variant">Số quyển (Book No.)</span>
                <span className="text-base font-bold text-primary">{sacrament.book_no || '-'}</span>
              </div>
              <div className="flex justify-between items-end border-b border-outline/30 pb-2">
                <span className="text-sm font-body text-on-surface-variant">Số trang (Page No.)</span>
                <span className="text-base font-bold text-on-surface">{sacrament.page_no || '-'}</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-sm font-body text-on-surface-variant">Số thứ tự (Entry No.)</span>
                <span className="text-base font-bold text-on-surface">{sacrament.registry_number || '-'}</span>
              </div>
            </div>
          </div>

          {/* Left column empty or you can keep other cards here */}
        </div>

        {/* Sidebar Space (Right Column) */}
        <div className="hidden md:block col-span-4 space-y-6">
          {/* Desktop Archive Book */}
          <div className="bg-surface border border-outline rounded-sm p-6">
            <div className="flex justify-between items-start mb-6">
              <h3 className="font-display font-bold text-lg text-on-surface flex items-center gap-2">
                📖 Sổ Bộ Lưu Trữ
              </h3>
              <span className="bg-red-600 text-white text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-sm">Dữ liệu gốc</span>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs font-medium uppercase tracking-widest text-on-surface-variant block mb-1">SỐ SỔ</span>
                <span className="text-lg font-bold text-on-surface block">{sacrament.book_no || '-'}</span>
              </div>
              <div>
                <span className="text-xs font-medium uppercase tracking-widest text-on-surface-variant block mb-1">SỐ TRANG</span>
                <span className="text-3xl font-display font-bold text-on-surface block">{sacrament.page_no || '-'}</span>
              </div>
              <div>
                <span className="text-xs font-medium uppercase tracking-widest text-on-surface-variant block mb-1">SỐ DANH BỘ</span>
                <span className="text-3xl font-display font-bold text-primary block">#{sacrament.registry_number || '-'}</span>
              </div>

              <div className="pt-4 border-t border-outline/50 mt-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">✓ XÁC THỰC BỞI VĂN PHÒNG GIÁO XỨ</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Width Certificate Section */}
      <div className="mt-8 space-y-6">
        <div className="bg-surface border border-outline rounded-md md:rounded-sm p-0 md:p-6 pb-0 overflow-hidden">
          <div className="px-4 py-3 md:pt-0 md:px-0 flex items-center justify-between border-b border-outline md:border-b-0 md:mb-6">
            <div className="flex items-center gap-2">
            </div>
            <button 
              onClick={() => window.print()}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-sm font-bold text-sm flex items-center gap-2 shadow-md transition-all active:scale-95"
            >
              <Download className="w-4 h-4" /> IN CHỨNG CHỈ (A4)
            </button>
          </div>
          
            <div className="bg-[#E7E5E4]/30 p-4 md:p-12 flex justify-center overflow-x-auto min-h-[600px]">
               <div className="shadow-2xl hover:shadow-primary/10 transition-shadow">
                  <PrintableCertificate 
                    sacrament={sacrament} 
                    baptism={baptism} 
                    parishInfo={parishInfo} 
                  />
               </div>
            </div>

          <div className="bg-on-surface px-6 py-3 flex items-center justify-between text-surface print:hidden">
            <div className="flex items-center gap-4">
               <span className="text-xs font-bold uppercase tracking-widest opacity-80 italic">Mẫu phôi chuẩn A4</span>
               <div className="h-4 w-[1px] bg-surface/20"></div>
               <span className="text-[10px] opacity-60">Vui lòng kiểm tra kỹ thông tin trước khi in ấn thực tế.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconSacrament() {
  return (
    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v4h4v2h-4v4h-2v-4H7V9h4z" />
    </svg>
  );
}

function PrintableCertificate({ sacrament, baptism, parishInfo }: { 
  sacrament: { 
    type: string; 
    parishioner: { 
      christian_name: string; 
      full_name: string; 
      birth_date: string; 
      birth_place?: string; 
    }; 
    date: string; 
    place: string; 
    minister?: { full_name: string }; 
    godparent_name?: string; 
    book_no?: string; 
    page_no?: string; 
    registry_number?: string; 
  }; 
  baptism?: { date: string | null; place?: string | null }; 
  parishInfo?: { diocese?: string | null; deanery?: string | null; name?: string | null }; 
}) {
  const isConfirmation = sacrament.type === 'CONFIRMATION';
  const isBaptism = sacrament.type === 'BAPTISM';
  
  const title = isConfirmation ? 'GIẤY CHỨNG NHẬN THÊM SỨC' : 
                isBaptism ? 'GIẤY CHỨNG NHẬN RỬA TỘI' : 'GIẤY CHỨNG NHẬN BÍ TÍCH';

  const typeText = isConfirmation ? 'BÍ TÍCH THÊM SỨC' : 
                   isBaptism ? 'BÍ TÍCH RỬA TỘI' : 'BÍ TÍCH';

  return (
    <div className="certificate-print-area bg-white text-black p-8 md:p-12 shadow-2xl relative overflow-hidden print:shadow-none" 
         style={{ width: '210mm', minHeight: '297mm', border: '12px double #B91C1C' }}>
      
      {/* Red Corner Decorations */}
      <div className="absolute top-2 left-2 w-16 h-16 border-t-2 border-l-2 border-[#B91C1C]"></div>
      <div className="absolute top-2 right-2 w-16 h-16 border-t-2 border-r-2 border-[#B91C1C]"></div>
      <div className="absolute bottom-2 left-2 w-16 h-16 border-b-2 border-l-2 border-[#B91C1C]"></div>
      <div className="absolute bottom-2 right-2 w-16 h-16 border-b-2 border-r-2 border-[#B91C1C]"></div>

      <div className="flex flex-col h-full font-sans text-[#1C1917]">
        {/* Header Content */}
        <div className="flex justify-between text-[10px] font-bold mb-8 uppercase tracking-tight opacity-70">
          <p>
            GIÁO PHẬN {parishInfo?.diocese ? <span className="text-black font-black ml-1">{parishInfo.diocese}</span> : '..............................'}
          </p>
          <div className="text-center">
             <p className="mb-0.5 font-bold">
               GIÁO HẠT {parishInfo?.deanery ? <span className="text-black font-black ml-1">{parishInfo.deanery}</span> : '..............................'}
             </p>
          </div>
          <p>
            GIÁO XỨ {parishInfo?.name ? <span className="text-black font-black ml-1">{parishInfo.name}</span> : '..............................'}
          </p>
        </div>

        <div className="text-center mb-10">
          <div className="flex justify-center gap-1 text-[#B91C1C] mb-2 opacity-50">
             <span className="text-xs">♦</span> <span className="text-xs">♦</span> <span className="text-xs">♦</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[#B91C1C] tracking-tighter uppercase whitespace-nowrap leading-tight">
            {title}
          </h1>
          <div className="flex justify-center gap-1 text-[#B91C1C] mt-2 opacity-50">
             <span className="text-xs">♦</span> <span className="text-xs">♦</span> <span className="text-xs">♦</span>
          </div>
        </div>

        <div className="space-y-6 text-sm md:text-base leading-relaxed px-4 md:px-12">
          <div className="flex items-end gap-2 text-base">
            <span className="whitespace-nowrap font-medium text-black/60">Tôi linh mục:</span>
            <div className="flex-1 border-b border-dotted border-black/30 min-h-[1.2rem]">
               {/* Left blank for manual entry */}
            </div>
          </div>
          
          <p className="text-center font-black text-[#B91C1C] text-xl my-4 uppercase tracking-[0.2em] opacity-80">CHỨNG NHẬN</p>

          <div className="flex items-end gap-2">
            <span className="whitespace-nowrap font-medium text-black/60">Anh (Chị):</span>
            <div className="flex-1 border-b border-dotted border-black px-4 font-black uppercase text-2xl text-[#1A1A1A] tracking-tight">
              {sacrament.parishioner.christian_name} {sacrament.parishioner.full_name}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
             <div className="flex items-end gap-2">
               <span className="whitespace-nowrap font-medium text-black/60">Sinh ngày:</span>
               <div className="flex-1 border-b border-dotted border-black/30 px-2 font-bold">
                 {formatDate(sacrament.parishioner.birth_date)}
               </div>
             </div>
             <div className="flex items-end gap-2">
               <span className="whitespace-nowrap font-medium text-black/60">Tại:</span>
               <div className="flex-1 border-b border-dotted border-black/30 px-2 font-bold text-center">
                 {sacrament.parishioner.birth_place || ''}
               </div>
             </div>
          </div>

          {!isBaptism && (
            <div className="grid grid-cols-2 gap-8">
               <div className="flex items-end gap-2">
                 <span className="whitespace-nowrap font-medium text-black/60 text-sm">Rửa tội ngày:</span>
                 <div className="flex-1 border-b border-dotted border-black px-2 font-bold text-[#1A1A1A]">
                   {baptism ? formatDate(baptism.date) : ''}
                 </div>
               </div>
               <div className="flex items-end gap-2">
                 <span className="whitespace-nowrap font-medium text-black/60 text-sm">Tại:</span>
                 <div className="flex-1 border-b border-dotted border-black px-2 font-bold text-[#1A1A1A] text-center">
                   {baptism ? (baptism.place || '') : ''}
                 </div>
               </div>
            </div>
          )}

          <div className="bg-[#B91C1C]/5 py-2.5 rounded-sm border-y border-[#B91C1C]/30 my-4">
            <p className="text-center font-black text-[#B91C1C] text-base md:text-lg uppercase tracking-wider whitespace-nowrap">
              ĐÃ ĐƯỢC LÃNH NHẬN {typeText}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8">
             <div className="flex items-end gap-2">
               <span className="whitespace-nowrap font-medium text-black/60">Vào ngày:</span>
               <div className="flex-1 border-b border-dotted border-black/80 px-4 font-black text-xl text-[#1A1A1A]">
                 {formatDate(sacrament.date)}
               </div>
             </div>
             <div className="flex items-end gap-2">
               <span className="whitespace-nowrap font-medium text-black/60">Tại:</span>
               <div className="flex-1 border-b border-dotted border-black/30 px-2 font-bold">
                 {sacrament.place || ''}
               </div>
             </div>
          </div>

          <div className="flex items-end gap-2 pt-2">
            <span className="whitespace-nowrap font-medium text-black/60">Do:</span>
            <div className="flex-1 border-b border-dotted border-black/30 px-4 font-bold">
              {sacrament.minister ? `Lm. ${sacrament.minister.full_name}` : ''}
            </div>
          </div>

          <div className="flex items-end gap-2">
            <span className="whitespace-nowrap font-medium text-black/60">Người đỡ đầu:</span>
            <div className="flex-1 border-b border-dotted border-black px-4 font-bold">
              {sacrament.godparent_name || ''}
            </div>
          </div>

          <div className="flex gap-4 text-[10px] mt-10 pt-4 border-t border-black/5">
            <span className="whitespace-nowrap italic font-medium opacity-50">Trích sổ bộ Bí Tích Giáo xứ Tân Thịnh:</span>
            <div className="flex-1 font-bold text-center tracking-[0.1em]">
               QUYỂN: {sacrament.book_no || '....'} — TRANG: {sacrament.page_no || '....'} — SỐ: {sacrament.registry_number || '....'}
            </div>
          </div>

          <div className="flex justify-end mt-12 text-center">
             <div className="w-80">
               <p className="text-[10px] italic mb-1 opacity-60">Giáo xứ Tân Thịnh, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}</p>
               <p className="text-sm font-black uppercase mb-1 tracking-tight text-[#1C1917]">LINH MỤC CHÁNH XỨ</p>
               <div className="h-20 mb-2 relative">
                 <div className="absolute inset-0 flex items-center justify-center opacity-5 select-none grayscale">
                    <svg viewBox="0 0 100 40" className="w-32 h-16 opacity-20"><path d="M10,20 Q30,10 50,30 T90,20" fill="none" stroke="black" strokeWidth="0.5"/></svg>
                 </div>
               </div>
               <p className="font-bold text-xl uppercase opacity-20">
                  ......................................
               </p>
             </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          /* Hide everything by default */
          :global(body), :global(html), :global(#__next), :global(.dashboard-layout) {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          :global(header), :global(nav), :global(aside), :global(button), :global(.print-hidden) {
            display: none !important;
          }
          body * {
            visibility: hidden;
          }
          /* Show only the certificate area */
          .certificate-print-area, .certificate-print-area * {
            visibility: visible;
          }
          .certificate-print-area {
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 210mm !important;
            height: 297mm !important;
            margin: 0;
            padding: 25mm !important;
            box-shadow: none !important;
            border-width: 15px !important;
            -webkit-print-color-adjust: exact;
            background: white !important;
            z-index: 9999;
          }
        }
      `}</style>
    </div>
  );
}
