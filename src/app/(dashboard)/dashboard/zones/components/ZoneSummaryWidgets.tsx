export function ZoneSummaryWidgets({ totalZones, totalMembers }: { totalZones: number, totalMembers: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <div className="bg-primary text-white p-6 rounded shadow-sm border border-primary/20 corner-accent min-h-[140px] flex flex-col justify-center">
        <h3 className="text-xs uppercase font-bold tracking-widest text-white/80 mb-2">Tổng Cộng</h3>
        <p className="font-display font-bold text-4xl">{totalZones} Giáo khu</p>
      </div>
      <div className="bg-primary text-white p-6 rounded shadow-sm border border-primary/20 corner-accent min-h-[140px] flex flex-col justify-center">
        <h3 className="text-xs uppercase font-bold tracking-widest text-white/80 mb-2">Nhân Sự Ban Hành Giáo</h3>
        <p className="font-display font-bold text-4xl">{totalMembers} Thành viên</p>
      </div>
    </div>
  );
}
