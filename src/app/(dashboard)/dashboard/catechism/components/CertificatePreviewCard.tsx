import Image from 'next/image';

export default function CertificatePreviewCard() {
  return (
    <div className="bg-surface border border-outline rounded-sm p-5">
      <h3 className="font-display font-bold text-sm text-on-surface mb-3">
        Xem trước (Preview)
      </h3>
      <div className="bg-[#F5F5F4] rounded-sm overflow-hidden flex items-center justify-center p-4">
        <Image
          src="/certificate-preview.png"
          alt="Mẫu chứng chỉ giáo lý"
          width={240}
          height={240}
          className="object-contain w-full max-h-56"
        />
      </div>
      <p className="text-[11px] text-on-surface-variant font-body mt-2 text-center italic">
        Mẫu chứng chỉ Giáo lý — Tổng Giáo phận Hà Nội
      </p>
    </div>
  );
}
