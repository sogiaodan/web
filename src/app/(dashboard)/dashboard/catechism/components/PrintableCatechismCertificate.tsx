'use client';

import { formatDate } from '@/lib/utils';
import { CertificateDetail } from '@/types/catechism';

interface PrintableCatechismCertificateProps {
  certificate: CertificateDetail;
  parishInfo?: {
    diocese?: string | null;
    deanery?: string | null;
    name?: string | null;
  };
}

export function PrintableCatechismCertificate({
  certificate,
  parishInfo,
}: PrintableCatechismCertificateProps) {
  const isRCIA = certificate.certificate_type === 'RCIA';
  
  const title = isRCIA
    ? 'GIẤY CHỨNG NHẬN HOÀN THÀNH GIÁO LÝ DỰ TÒNG'
    : 'GIẤY CHỨNG NHẬN HOÀN THÀNH GIÁO LÝ HÔN NHÂN';

  const subTitle = isRCIA
    ? 'Chiếu theo kết quả hoàn thành chương trình huấn luyện Giáo lý Dự tòng'
    : 'Chiếu theo kết quả hoàn thành chương trình huấn luyện chuẩn bị Bí tích Hôn nhân';

  const typeText = isRCIA ? 'GIÁO LÝ DỰ TÒNG' : 'GIÁO LÝ HÔN NHÂN';

  const formattedIssueDate = certificate.issue_date
    ? new Date(certificate.issue_date)
    : new Date();

  return (
    <div
      className="certificate-print-area bg-white text-black p-8 md:p-12 shadow-2xl relative overflow-hidden print:shadow-none"
      style={{
        width: '210mm',
        minHeight: '297mm',
        border: '12px double #1C1917',
        fontFamily: "'Times New Roman', Times, serif",
      }}
    >
      {/* Black Corner Decorations */}
      <div className="absolute top-2 left-2 w-16 h-16 border-t-2 border-l-2 border-[#1C1917]"></div>
      <div className="absolute top-2 right-2 w-16 h-16 border-t-2 border-r-2 border-[#1C1917]"></div>
      <div className="absolute bottom-2 left-2 w-16 h-16 border-b-2 border-l-2 border-[#1C1917]"></div>
      <div className="absolute bottom-2 right-2 w-16 h-16 border-b-2 border-r-2 border-[#1C1917]"></div>

      <div className="flex flex-col h-full text-[#1C1917]">
        {/* Header Content - 3 Rows stacked vertically on the left */}
        <div className="flex flex-col gap-1 text-[11px] font-bold mb-8 uppercase tracking-wider text-left opacity-80 leading-normal">
          <p>
            GIÁO PHẬN:{' '}
            {parishInfo?.diocese ? (
              <span className="text-black font-extrabold ml-1">
                {parishInfo.diocese}
              </span>
            ) : (
              '................................................'
            )}
          </p>
          <p>
            GIÁO HẠT:{' '}
            {parishInfo?.deanery ? (
              <span className="text-black font-extrabold ml-1">
                {parishInfo.deanery}
              </span>
            ) : (
              '................................................'
            )}
          </p>
          <p>
            GIÁO XỨ:{' '}
            {parishInfo?.name ? (
              <span className="text-black font-extrabold ml-1">
                {parishInfo.name}
              </span>
            ) : (
              '................................................'
            )}
          </p>
        </div>

        <div className="text-center mb-10">
          <div className="flex justify-center gap-1 text-[#B91C1C] mb-2 opacity-50">
            <span className="text-xs">♦</span> <span className="text-xs">♦</span>{' '}
            <span className="text-xs">♦</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#B91C1C] tracking-tighter uppercase whitespace-normal px-6 leading-tight">
            {title}
          </h1>
          <div className="flex justify-center gap-1 text-[#B91C1C] mt-2 opacity-50">
            <span className="text-xs">♦</span> <span className="text-xs">♦</span>{' '}
            <span className="text-xs">♦</span>
          </div>
          <p className="text-xs md:text-sm font-serif italic mt-4 opacity-80 max-w-lg mx-auto">
            {subTitle}
          </p>
        </div>

        <div className="space-y-6 text-sm md:text-base leading-relaxed px-4 md:px-12">
          <p className="text-center font-bold text-[#1C1917] text-xl my-4 uppercase tracking-[0.2em] opacity-80">
            CHỨNG NHẬN
          </p>

          <div className="flex items-end gap-2">
            <span className="whitespace-nowrap font-medium text-black/60">Anh (Chị):</span>
            <div className="flex-1 border-b border-dotted border-black px-4 font-bold uppercase text-2xl text-[#1A1A1A] tracking-tight">
              {certificate.is_outsider 
                ? `${certificate.outsider_christian_name || ''} ${certificate.outsider_name || ''}`.trim()
                : `${certificate.parishioner?.christian_name || ''} ${certificate.parishioner?.full_name || ''}`.trim()}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="flex items-end gap-2">
              <span className="whitespace-nowrap font-medium text-black/60">
                Sinh ngày:
              </span>
              <div className="flex-1 border-b border-dotted border-black/30 px-2 font-bold">
                {certificate.is_outsider 
                  ? formatDate(certificate.outsider_birth_date)
                  : formatDate(certificate.parishioner?.birth_date)}
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className="whitespace-nowrap font-medium text-black/60">Thuộc Giáo xứ:</span>
              <div className="flex-1 border-b border-dotted border-black/30 px-2 font-bold text-center">
                {certificate.is_outsider ? (certificate.outsider_parish_name || '') : (certificate.parishioner?.parish_name || '—')}
              </div>
            </div>
          </div>


          <div className="bg-stone-50 py-2.5 rounded-sm border-y border-stone-300 my-6">
            <p className="text-center font-bold text-[#1C1917] text-base md:text-lg uppercase tracking-wider whitespace-nowrap">
              ĐÃ HOÀN THÀNH CHƯƠNG TRÌNH KHÓA HỌC {typeText}
            </p>
          </div>

          <div className="flex items-end gap-2">
            <span className="whitespace-nowrap font-medium text-black/60">Vào ngày cấp:</span>
            <div className="flex-1 border-b border-dotted border-black/80 px-4 font-bold text-xl text-[#1A1A1A]">
              {formatDate(certificate.issue_date)}
            </div>
          </div>

          <div className="flex items-end gap-2">
            <span className="whitespace-nowrap font-medium text-black/60">Nơi cấp:</span>
            <div className="flex-1 border-b border-dotted border-black/30 px-4 font-bold">
              {certificate.issued_by}
            </div>
          </div>

          <div className="flex gap-4 text-[10px] mt-16 pt-4 border-t border-black/5">
            <span className="whitespace-nowrap italic font-medium opacity-50">
              Trích lục sổ chứng chỉ Giáo lý:
            </span>
            <div className="flex-1 font-bold text-center tracking-[0.1em]">
              SỐ HIỆU CHỨNG CHỈ: {certificate.certificate_no || '........................'}
            </div>
          </div>

          <div className="flex justify-end mt-16 text-center">
            <div className="w-80">
              <p className="text-[10px] italic mb-1 opacity-60">
                {parishInfo?.name || 'Giáo xứ'}, ngày{' '}
                {formattedIssueDate.getDate()} tháng{' '}
                {formattedIssueDate.getMonth() + 1} năm{' '}
                {formattedIssueDate.getFullYear()}
              </p>
              <p className="text-sm font-bold uppercase mb-1 tracking-tight text-[#1C1917]">
                LINH MỤC CHÁNH XỨ
              </p>
              <div className="h-20 mb-2 relative">
                <div className="absolute inset-0 flex items-center justify-center opacity-5 select-none grayscale">
                  <svg viewBox="0 0 100 40" className="w-32 h-16 opacity-20">
                    <path
                      d="M10,20 Q30,10 50,30 T90,20"
                      fill="none"
                      stroke="black"
                      strokeWidth="0.5"
                    />
                  </svg>
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
          /* Reset root and body layout */
          :global(html),
          :global(body),
          :global(#__next) {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            height: auto !important;
            overflow: visible !important;
          }
          /* Reset flex/grid and height layout containers specifically */
          :global(div[class*="h-dvh"]),
          :global(div[class*="flex-1"]),
          :global(main) {
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            overflow: visible !important;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            background: transparent !important;
            box-shadow: none !important;
            display: block !important;
          }
          :global(header),
          :global(nav),
          :global(aside),
          :global(button),
          :global(.print-hidden) {
            display: none !important;
          }
          :global(body) * {
            visibility: hidden;
          }
          /* Show only the certificate area */
          :global(.certificate-print-area),
          :global(.certificate-print-area) * {
            visibility: visible;
          }
          :global(.certificate-print-area) {
            display: block !important;
            position: relative !important;
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 auto !important;
            padding: 25mm !important;
            box-shadow: none !important;
            border: 12px double #1C1917 !important;
            -webkit-print-color-adjust: exact;
            background: white !important;
            z-index: 9999;
            page-break-inside: avoid;
            page-break-after: avoid;
          }
        }
      `}</style>
    </div>
  );
}
