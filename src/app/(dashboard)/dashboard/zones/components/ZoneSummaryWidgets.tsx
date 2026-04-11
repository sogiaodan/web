export function ZoneSummaryWidgets({ totalZones, totalMembers }: { totalZones: number, totalMembers: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <div className="bg-primary text-white p-4 rounded shadow-sm border border-primary/20 corner-accent flex flex-col justify-center">
        <h3 className="text-[10px] uppercase font-bold tracking-widest text-white/70 mb-1">Tổng Cộng</h3>
        <p className="font-display font-bold text-2xl">{totalZones} Giáo khu</p>
      </div>
      <div className="bg-primary text-white p-4 rounded shadow-sm border border-primary/20 corner-accent flex flex-col justify-center">
        <h3 className="text-[10px] uppercase font-bold tracking-widest text-white/70 mb-1">Ban Hành Giáo</h3>
        <p className="font-display font-bold text-2xl">{totalMembers} Thành viên</p>
      </div>
    </div>
  );
}
