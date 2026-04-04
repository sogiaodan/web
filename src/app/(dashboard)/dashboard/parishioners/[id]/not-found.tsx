import Link from 'next/link';

export default function ParishionerNotFound() {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <span className="material-symbols-outlined text-6xl text-[#78716C]/30 block mb-4">
          person_off
        </span>
        <h1 className="font-display font-bold text-2xl text-[#1C1917] mb-2">
          Không tìm thấy giáo dân
        </h1>
        <p className="text-sm text-[#78716C] font-body mb-6">
          Hồ sơ giáo dân này không tồn tại hoặc đã bị xóa khỏi hệ thống.
        </p>
        <Link
          href="/dashboard/parishioners"
          className="inline-flex items-center gap-2 h-12 px-6 bg-primary text-white text-sm font-bold rounded hover:opacity-90 transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Về danh sách Giáo dân
        </Link>
      </div>
    </div>
  );
}
