import Image from 'next/image';

interface CertificatePreviewProps {
  certificateType: string;
  issueDate: string;
  certificateNo: string;
  issuedBy: string;
}

export default function CertificatePreviewCard({
  certificateType,
  issueDate,
  certificateNo,
  issuedBy,
}: CertificatePreviewProps) {
  // Format date if needed
  const formattedDate = issueDate ? new Date(issueDate).toLocaleDateString('vi-VN') : '..../..../.......';
  
  const typeDisplay = certificateType === 'RCIA' ? 'DỰ TÒNG' : certificateType === 'MARRIAGE_PREP' ? 'HÔN NHÂN' : '...................';

  return (
    <div className="bg-surface border border-outline rounded-sm p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="font-display font-bold text-[13px] text-on-surface uppercase tracking-tight">
          Xem trước (Preview)
        </h3>
        <span className="material-symbols-outlined text-sm text-on-surface-variant">print</span>
      </div>

      <div className="relative rounded-sm overflow-hidden flex flex-col items-center aspect-[1/1.4] bg-[#FAF9F6] border border-outline/30 shadow-inner">
        {/* Background Overlay Image */}
        <Image
          src="/certificate-bg.png"
          alt="Nền chứng chỉ"
          fill
          priority
          unoptimized
          className="object-cover opacity-[0.35] z-0 pointer-events-none mix-blend-multiply" 
        />
        
        {/* Decorative elements over background */}
        <div className="absolute inset-0 border-[12px] border-double border-outline/10 z-0 m-4 pointer-events-none" />

        {/* Overlay Content */}
        <div className="relative z-10 w-full h-full flex flex-col items-center text-center p-8 pt-12">
           {/* Church Authority */}
           <div className="mb-6 space-y-1">
              <h4 className="text-[9px] uppercase text-on-surface-variant tracking-[0.2em] font-bold font-sans">
                TỔNG GIÁO PHẬN SÀI GÒN
              </h4>
              <p className="text-[10px] uppercase font-bold text-on-surface-variant font-sans tracking-wide">
                {issuedBy || '................................'}
              </p>
           </div>
           
           <div className="mb-6">
              <span className="material-symbols-outlined text-[#8B0000] text-3xl opacity-80">account_balance</span>
              <div className="w-10 h-0.5 bg-[#8B0000] mx-auto opacity-20 mt-1" />
           </div>

           <h2 className="text-[17px] font-display font-medium text-[#8B0000] leading-snug tracking-wider">
             CHỨNG CHỈ GIÁO LÝ<br/>
             <span className="text-[13px] tracking-[0.1em]">{certificateType ? typeDisplay : '...................'}</span>
           </h2>

           <div className="flex-1 min-h-[30px]"></div>

           <div className="w-full space-y-3.5 text-[11px] text-on-surface font-sans px-4 mb-8">
             <div className="flex justify-between items-end border-b border-[#8B0000]/10 pb-1">
               <span className="text-on-surface-variant text-[10px] uppercase tracking-wider font-bold">Ngày cấp:</span>
               <span className="font-semibold text-right border-0 focus:ring-0 p-0">{formattedDate}</span>
             </div>
             <div className="flex justify-between items-end border-b border-[#8B0000]/10 pb-1">
               <span className="text-on-surface-variant text-[10px] uppercase tracking-wider font-bold">Số hiệu:</span>
               <span className="font-semibold truncate max-w-[140px] text-right">{certificateNo || '................'}</span>
             </div>
             <div className="flex justify-between items-end border-b border-[#8B0000]/10 pb-1">
               <span className="text-on-surface-variant text-[10px] uppercase tracking-wider font-bold">Nơi cấp:</span>
               <span className="font-semibold truncate max-w-[140px] text-right italic">{issuedBy || '................'}</span>
             </div>
           </div>

           <div className="text-[10px] text-on-surface-variant/60 font-body mb-2">
             Xác nhận bởi Văn phòng Giáo vụ
           </div>
        </div>
      </div>
      
      <p className="text-[11px] text-on-surface-variant font-body mt-4 text-center italic leading-relaxed px-2">
        * Dữ liệu mô phỏng dựa trên thông tin thật giúp bác kiểm tra trước khi lưu và in.
      </p>
    </div>
  );
}
