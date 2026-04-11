'use client';

export function PrintCertificateButton() {
  return (
    <button
      id="print-certificate-btn"
      onClick={() => window.print()}
      className="h-11 px-4 flex items-center gap-2 bg-primary text-white text-sm font-bold rounded hover:opacity-90 transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 whitespace-nowrap"
    >
      <span className="material-symbols-outlined text-lg">print</span>
      In chứng chỉ
    </button>
  );
}
