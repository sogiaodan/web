import { Calendar, BookOpen, Library, ChevronRight } from 'lucide-react';

interface LiturgyData {
  date: string;
  liturgy_title: string;
  gospel_ref: string;
  gospel_summary: string;
  liturgical_color: string;
}

export async function SpiritualLifeSection() {
  let liturgy: LiturgyData | null = null;

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    // Use proper Next.js 15 cache / fetch options. 
    // If backend is not available, this should fail gracefully and we render the fallback.
    const res = await fetch(`${baseUrl}/api/v1/landing/liturgy`, {
      next: { revalidate: 300 }
    });

    if (res.ok) {
      const json = await res.json();
      if (json && json.data) {
        liturgy = json.data;
      }
    }
  } catch (err) {
    // Graceful silent fail - render fallback
  }

  const hasData = !!liturgy;

  return (
    <section id="tien-ich" className="w-full py-16 md:py-24 bg-gradient-to-br from-[#E05C3A] to-primary relative overflow-hidden">
      {/* Decorative patterns */}
      <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>

      <div className="container mx-auto px-4 relative z-10 max-w-7xl">
        <h2 className="font-serif text-[28px] md:text-[36px] font-bold text-white mb-8 md:mb-12 text-center md:text-left drop-shadow-sm">
          Đời Sống Tâm Linh
        </h2>

        {liturgy ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Card 1 */}
            <div className="bg-white rounded p-6 shadow-xl flex flex-col items-start transition-transform duration-300 hover:-translate-y-1 border border-outline-variant/20">
              <div className="h-12 w-12 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center text-primary mb-6">
                <Calendar className="h-5 w-5 stroke-[1.5]" />
              </div>
              <h3 className="font-serif text-[20px] font-bold text-foreground mb-3">
                Phụng Vụ Hôm Nay
              </h3>
              <p className="font-sans text-[15px] text-foreground/80 leading-relaxed mb-6 flex-grow">
                {liturgy.liturgy_title}
              </p>
              <a href="#" className="font-sans text-[14px] font-medium text-primary hover:text-primary/80 flex items-center transition-colors focus-visible:outline-none focus-visible:underline min-h-[44px] mt-auto">
                Xem thêm <ChevronRight className="h-4 w-4 ml-1" />
              </a>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded p-6 shadow-xl flex flex-col items-start transition-transform duration-300 hover:-translate-y-1 border border-outline-variant/20">
              <div className="h-12 w-12 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center text-primary mb-6">
                <BookOpen className="h-5 w-5 stroke-[1.5]" />
              </div>
              <h3 className="font-serif text-[20px] font-bold text-foreground mb-3">
                Tin Mừng Ngày
              </h3>
              <p className="font-sans text-[15px] text-foreground/80 leading-relaxed mb-6 flex-grow">
                {liturgy.gospel_ref}
              </p>
              <a href="#" className="font-sans text-[14px] font-medium text-primary hover:text-primary/80 flex items-center transition-colors focus-visible:outline-none focus-visible:underline min-h-[44px] mt-auto">
                Xem thêm <ChevronRight className="h-4 w-4 ml-1" />
              </a>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded p-6 shadow-xl flex flex-col items-start transition-transform duration-300 hover:-translate-y-1 border border-outline-variant/20">
              <div className="h-12 w-12 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center text-primary mb-6">
                <Library className="h-5 w-5 stroke-[1.5]" />
              </div>
              <h3 className="font-serif text-[20px] font-bold text-foreground mb-3">
                Lời Chúa & Đời Sống
              </h3>
              <p className="font-sans text-[15px] text-foreground/80 leading-relaxed mb-6 flex-grow line-clamp-4">
                {liturgy.gospel_summary}
              </p>
              <a href="#" className="font-sans text-[14px] font-medium text-primary hover:text-primary/80 flex items-center transition-colors focus-visible:outline-none focus-visible:underline min-h-[44px] mt-auto">
                Xem thêm <ChevronRight className="h-4 w-4 ml-1" />
              </a>
            </div>
          </div>
        ) : (
          <div className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded p-12 flex flex-col items-center justify-center text-white text-center shadow-inner min-h-[300px]">
            <Calendar className="h-10 w-10 mb-4 opacity-50 stroke-[1.5]" />
            <p className="font-sans text-[16px] font-medium tracking-wide">Đang cập nhật dữ liệu phụng vụ...</p>
          </div>
        )}
      </div>
    </section>
  );
}
