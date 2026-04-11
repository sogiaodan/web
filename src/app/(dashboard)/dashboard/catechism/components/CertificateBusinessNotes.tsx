export default function CertificateBusinessNotes() {
  return (
    <div className="bg-[#FFF7ED] border border-[#FDBA74] rounded-sm p-5">
      <h3 className="font-display font-bold text-sm text-[#9A3412] mb-3 flex items-center gap-2">
        <span className="material-symbols-outlined text-base">warning</span>
        Lưu ý nghiệp vụ
      </h3>
      <ul className="space-y-3">

        <li className="flex items-start gap-2 text-sm text-[#9A3412] font-body">
          <span className="material-symbols-outlined text-sm shrink-0 mt-0.5">info</span>
          <span>
            Đảm bảo số hiệu chứng chỉ khớp với sổ gốc lưu trữ tại Văn phòng Giáo xứ.
          </span>
        </li>
      </ul>
    </div>
  );
}
