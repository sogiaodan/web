import Image from 'next/image';

interface CertificatePreviewProps {
  certificateType: string;
  issueDate: string;
  certificateNo: string;
  issuedBy: string;
  parishionerName?: string;
  parishName: string;
}

export default function CertificatePreviewCard({
  certificateType,
  issueDate,
  certificateNo,
  issuedBy,
  parishionerName,
  parishName,
}: CertificatePreviewProps) {
  // Format date if needed
  const formattedDate = issueDate ? new Date(issueDate).toLocaleDateString('vi-VN') : '..../..../.......';
  
   

  return (
    <div className="bg-surface border border-outline rounded-sm p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="font-display font-bold text-[13px] text-on-surface uppercase tracking-tight">
          Xem trước (Preview)
        </h3>
        <span className="material-symbols-outlined text-sm text-on-surface-variant">print</span>
      </div>

      <div className="relative rounded-sm overflow-hidden flex flex-col items-center aspect-[3/2] bg-[#FAF9F6] border border-outline/30 shadow-inner">
        {/* Background Overlay Image (The placeholder with border and top image) */}
        <Image
          src="/certificate-bg.png"
          alt="Nền chứng chỉ"
          fill
          priority
          unoptimized
          className="object-cover opacity-90 z-0 pointer-events-none" 
        />
        
        {/* Overlay Content aligned with real sample */}
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-center p-4">
           
           {/* Category Title */}
           <div className="mt-8 mb-3">
              <h2 className="text-[15px] font-display font-bold text-[#A52A2A] leading-none tracking-[0.1em] uppercase">
                {certificateType === 'RCIA' ? 'CHỨNG CHỈ GIÁO LÝ DỰ TÒNG' : 'CHỨNG CHỈ GIÁO LÝ HÔN NHÂN'}
              </h2>
              <p className="text-[7px] text-on-surface-variant/80 font-serif italic mt-1.5 px-12 leading-tight">
                {certificateType === 'RCIA' 
                  ? 'Chiếu theo kết quả hoàn thành chương trình huấn luyện Giáo lý dự tòng' 
                  : 'Chiếu theo kết quả hoàn thành chương trình huấn luyện chuẩn bị Bí tích Hôn nhân'}
              </p>
           </div>

           <div className="mb-2">
              <span className="text-[10px] font-serif font-black text-[#8B0000] tracking-[0.3em] uppercase opacity-90">CHỨNG NHẬN</span>
           </div>

           {/* Recipient Name - Enhanced Calligraphy style */}
           <div className="mb-4 relative w-full px-12">
              <h1 className="text-[22px] font-serif italic font-medium text-[#1A1A1A] tracking-wider drop-shadow-[0.5px_0.5px_0px_rgba(0,0,0,0.1)] py-1 min-h-[36px] flex items-end justify-center">
                {parishionerName || '...........................................'}
              </h1>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-[1px] border-b border-dotted border-[#8B0000]/40" />
           </div>

           {/* Small details in a signature line style */}
           <div className="grid grid-cols-2 gap-x-10 gap-y-2 text-[8.5px] font-serif text-on-surface-variant w-full px-14 mb-4">
             <div className="flex items-center gap-1.5 border-b border-dotted border-outline-variant/40 pb-0.5">
               <span className="opacity-70 whitespace-nowrap">Số hiệu:</span>
               <span className="text-[#8B0000] font-bold italic">{certificateNo || '.......'}</span>
             </div>
             <div className="flex items-center gap-1.5 border-b border-dotted border-outline-variant/40 pb-0.5">
               <span className="opacity-70 whitespace-nowrap">Giáo xứ:</span>
               <span className="text-on-surface font-bold italic truncate">{issuedBy || '................'}</span>
             </div>
           </div>

           {/* Footer: Date and Signature Placeholder */}
           <div className="w-full mt-auto mb-4 px-10 flex justify-end">
              <div className="text-right">
                <p className="text-[8px] font-serif text-on-surface-variant mb-6">
                  {issuedBy || '.......'}, ngày {formattedDate !== '..../..../.......' ? formattedDate.split('/')[0] : '...'} tháng {formattedDate !== '..../..../.......' ? formattedDate.split('/')[1] : '...'} năm {formattedDate !== '..../..../.......' ? formattedDate.split('/')[2] : '...'}
                </p>
                
                {/* Signature area - kept blank for the priest */}
                <div className="min-h-[35px]" />
                
                <div className="text-center">
                  <p className="text-[9px] font-serif font-bold text-on-surface uppercase">
                    LM. {issuedBy !== parishName ? 'Quản xứ' : 'Tất Ứng'}
                  </p>
                  <p className="text-[7px] font-serif text-on-surface-variant italic opacity-60 mt-0.5 whitespace-nowrap">
                    (Ký tên và đóng dấu)
                  </p>
                </div>
              </div>
           </div>
        </div>
      </div>
      
      <p className="text-[11px] text-on-surface-variant font-body mt-4 text-center italic leading-relaxed px-2">
        * Dữ liệu mô phỏng dựa trên thông tin thật giúp bác kiểm tra trước khi lưu và in.
      </p>
    </div>
  );
}
