import { NewsImage } from './NewsImage';
import { ChevronRight } from 'lucide-react';
import { API_BASE_URL } from '@/lib/configs';

interface VaticanNews {
  id: string;
  title: string;
  summary: string;
  image_url: string;
  link: string;
  pub_date: string;
}

export async function VaticanNewsSection() {
  let newsList: VaticanNews[] = [];

  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/landing/news`, {
      next: { revalidate: 300 }
    });
    
    if (res.ok) {
      const json = await res.json();
      if (json && json.data) {
        newsList = json.data;
      }
    }
  } catch {
    // Graceful failure - section will hide if no news is loaded.
  }

  // Edge case: "No Vatican News available -> Hide the News section entirely. Do not show empty state."
  if (!newsList || newsList.length === 0) {
    return null;
  }

  return (
    <section id="tin-tuc" className="w-full py-16 md:py-24 bg-vellum border-t border-outline-variant/30">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-10 md:mb-16 flex flex-col items-center">
          <span className="block font-sans text-[12px] font-bold tracking-[0.15em] text-primary/80 mb-3 uppercase">
            Cập Nhật Từ Giáo Hội
          </span>
          <h2 className="font-serif text-[28px] md:text-[36px] lg:text-[40px] font-bold text-foreground">
            Tin Tức Vatican & Suy Niệm
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {newsList.map((news) => (
            <div key={news.id} className="bg-white rounded overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 border border-outline-variant/30 flex flex-col group h-full">
              {/* Thumbnail */}
              <div className="relative w-full aspect-[16/10] bg-surface-container overflow-hidden">
                <NewsImage
                  src={news.image_url}
                  alt={news.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                />
              </div>
              
              {/* Content */}
              <div className="p-6 flex flex-col flex-grow">
                {news.pub_date && (
                  <span className="font-sans text-[12px] text-outline-variant/80 text-foreground/60 mb-2 block">
                    {new Date(news.pub_date).toLocaleDateString('vi-VN')}
                  </span>
                )}
                <h3 className="font-serif text-[18px] md:text-[20px] font-bold text-foreground mb-3 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                  {news.title}
                </h3>
                <p className="font-sans text-[14px] text-foreground/80 leading-relaxed mb-6 line-clamp-3 flex-grow">
                  {news.summary}
                </p>
                <a 
                  href={news.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-auto font-sans text-[14px] font-medium text-primary hover:text-primary/80 flex items-center transition-colors min-h-[44px] focus-visible:outline-none focus-visible:underline w-fit"
                >
                  Xem thêm <ChevronRight className="h-4 w-4 ml-1 stroke-[2]" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Link */}
        <div className="flex justify-center">
          <a
            href="https://www.vaticannews.va/vi.html"
            target="_blank"
            rel="noopener noreferrer"
            className="font-sans text-[15px] font-bold text-primary hover:text-primary/80 transition-colors flex items-center min-h-[44px] px-4 justify-center"
          >
            Xem tất cả tin tức ›
          </a>
        </div>
      </div>
    </section>
  );
}
