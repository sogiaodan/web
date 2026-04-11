import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h2 className="text-2xl font-bold mb-4 font-display">404 - Không tìm thấy trang</h2>
      <p className="text-muted text-center mb-6 font-body">Trang bạn yêu cầu không tồn tại hoặc đã bị xóa.</p>
      <Link
        href="/"
        className="px-6 py-2 bg-primary text-white font-medium rounded hover:opacity-90 transition-opacity"
      >
        Trở về trang chủ
      </Link>
    </div>
  );
}
