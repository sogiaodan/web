'use client';
import Image from 'next/image';

import { useState } from 'react';
import { SacramentType } from '@/types/sacrament';
import { SacramentForm } from '../../new/components/SacramentForm';
import { Edit3, Share2, Info, Download, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/components/providers/auth-provider';
import { useSacramentDetailQuery } from '../../queries/useSacramentQuery';

export function SacramentDetailClient({ id }: { id: string }) {
  const { user } = useAuth();
  const canEdit = user?.role === 'ADMIN' || user?.role === 'EDITOR';
  const [isEditing, setIsEditing] = useState(false);

  const { data: sacrament, isLoading, error } = useSacramentDetailQuery(id, false);

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

          {/* Scanned Certificate */}
          <div className="bg-surface border border-outline rounded-md md:rounded-sm p-0 md:p-6 pb-0 overflow-hidden">
             <div className="px-4 py-3 md:p-0 flex items-center justify-between border-b border-outline md:border-b-0 md:mb-6">
                <div className="flex items-center gap-2">
                   <div className="text-primary">📄</div>
                   <h3 className="font-display font-bold text-base md:text-xl text-on-surface">Bản quét Chứng chỉ</h3>
                </div>
                <button className="text-[10px] font-bold text-primary uppercase flex items-center gap-1">
                   <Download className="w-3 h-3" /> Xem
                </button>
             </div>
             <div className="mx-4 mb-4 md:m-0 h-auto mt-4 relative bg-surface rounded shadow-md overflow-hidden border border-outline/30 flex items-center justify-center p-2">
                <DigitalCertificatePreview sacrament={sacrament} />
             </div>
             <div className="bg-black/80 px-4 py-2 flex items-center justify-between text-white rounded-b-md md:rounded-b-sm">
                <span className="text-xs font-bold">Chứng nhận.pdf</span>
                <span className="text-[10px] text-white/70 uppercase">Cần thiết lập</span>
             </div>
          </div>
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
    </div>
  );
}

function IconSacrament() {
  return (
    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v4h4v2h-4v4h-2v-4H7V9h4z"/>
    </svg>
  );
}

function DigitalCertificatePreview({ sacrament }: { sacrament: any }) {
  const getSacramentLabel = () => {
    switch (sacrament.type) {
      case 'BAPTISM': return 'RỬA TỘI';
      case 'EUCHARIST': return 'THÁNH THỂ';
      case 'CONFIRMATION': return 'THÊM SỨC';
      default: return 'BÍ TÍCH';
    }
  };

  return (
    <div className="relative w-full aspect-[1/1.414] max-w-[500px] overflow-hidden rounded-sm shadow-xl font-serif">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image 
          src="/certificate-bg.png" 
          alt="Certificate Background" 
          fill 
          className="object-cover"
          priority
        />
      </div>

      {/* Content Overlay */}
      <div className="absolute inset-0 flex flex-col items-center pt-[20%] px-[10%] text-[#1C1917] select-none scale-[0.9] md:scale-100 origin-top">
        <h4 className="text-[10px] md:text-xs font-bold tracking-[0.2em] mb-1 opacity-80">CHỨNG CHỈ BÍ TÍCH</h4>
        <h2 className="text-xl md:text-3xl font-bold mb-8 text-[#92400E]">{getSacramentLabel()}</h2>

        <div className="w-full space-y-4 text-center">
          <div>
            <p className="text-[9px] md:text-[11px] uppercase tracking-wider mb-1 opacity-70 italic">Chứng nhận người lãnh nhận</p>
            <p className="text-lg md:text-2xl font-bold decoration-[#92400E]/30">
              {sacrament.parishioner.christian_name} {sacrament.parishioner.full_name}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm md:text-base">
            <div>
              <p className="text-[9px] md:text-[11px] opacity-70 mb-0.5">Sinh ngày</p>
              <p className="font-bold">{formatDate(sacrament.parishioner.birth_date)}</p>
            </div>
            <div>
              <p className="text-[9px] md:text-[11px] opacity-70 mb-0.5">Tại</p>
              <p className="font-bold">Giáo xứ Tân Thịnh</p>
            </div>
          </div>

          <div className="pt-2">
            <p className="text-[9px] md:text-[11px] opacity-70 mb-1">Con ông & bà</p>
            <p className="text-xs md:text-sm font-medium italic">
              {sacrament.parishioner.father ? `${sacrament.parishioner.father.christian_name} ${sacrament.parishioner.father.full_name}` : '..........'}
              <br />
              {sacrament.parishioner.mother ? `${sacrament.parishioner.mother.christian_name} ${sacrament.parishioner.mother.full_name}` : '..........'}
            </p>
          </div>

          <div className="pt-4 border-t border-[#1C1917]/10">
            <p className="text-[10px] md:text-[12px] font-bold mb-2">ĐÃ LÃNH NHẬN BÍ TÍCH {getSacramentLabel()}</p>
            <div className="flex justify-center gap-4 text-xs md:text-sm">
              <span>Ngày: <span className="font-bold">{formatDate(sacrament.date)}</span></span>
              <span>Tại: <span className="font-bold">{sacrament.place || 'Giáo xứ'}</span></span>
            </div>
          </div>

          <div className="pt-2 text-xs md:text-sm">
            <p className="opacity-70 text-[9px] md:text-[11px] mb-0.5">Linh mục chủ sự</p>
            <p className="font-bold">{sacrament.minister ? `Lm. ${sacrament.minister.full_name}` : '..........'}</p>
          </div>

          <div className="pt-8 flex justify-between items-end px-4">
            <div className="text-[8px] md:text-[10px] opacity-50 text-left">
              <p>Mã HS: #{sacrament.id.substring(0, 8).toUpperCase()}</p>
              <p>Sổ: {sacrament.book_no || '-'} | Trang: {sacrament.page_no || '-'}</p>
            </div>
            <div className="text-center italic">
              <p className="text-[9px] md:text-[10px]">Tân Thịnh, {formatDate(new Date().toISOString())}</p>
              <div className="h-10 md:h-14"></div>
              <p className="text-[10px] md:text-xs font-bold">VĂN PHÒNG GIÁO XỨ</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative corners or borders can be added here if not in bg */}
    </div>
  );
}
