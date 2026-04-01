import Image from 'next/image';
import { Database, Edit, Archive } from 'lucide-react';

export function FeaturesSection() {
  const features = [
    {
      icon: <Database className="h-6 w-6 stroke-[1.5]" />,
      title: 'Quản Lý Dữ Liệu Tập Trung',
      description: 'Mọi thông tin về bí tích, gia đình và nhân khẩu được tổ chức khoa học và bảo mật tuyệt đối.'
    },
    {
      icon: <Edit className="h-6 w-6 stroke-[1.5]" />,
      title: 'Dễ Dàng Cập Nhật',
      description: 'Giao diện thân thiện giúp Ban Hành Giáo dễ dàng cập nhật các thay đổi nhân sự và sự kiện giáo xứ.'
    },
    {
      icon: <Archive className="h-6 w-6 stroke-[1.5]" />,
      title: 'Lưu Trữ Bền Vững',
      description: 'Bảo tồn hồ sơ giáo xứ qua nhiều thế hệ, tránh thất lạc do thời gian hoặc tác động môi trường.'
    }
  ];

  return (
    <section id="ve-du-an" className="w-full py-16 md:py-24 bg-vellum">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Text & Features */}
          <div className="flex-1 w-full order-1">
            <h2 className="font-serif text-[28px] md:text-[36px] lg:text-[40px] font-bold text-foreground mb-10 leading-[1.3]">
              Tính Năng & Ý Nghĩa Của Hệ Thống Sổ Giáo Dân
            </h2>
            
            <div className="flex flex-col gap-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-5">
                  <div className="mt-1 flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-sans text-[18px] md:text-[20px] font-bold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="font-sans text-[15px] text-foreground/80 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Image & Badge */}
          <div className="flex-1 w-full order-2 relative">
            <div className="relative w-full aspect-[4/3] rounded shadow-2xl overflow-hidden group">
              <Image
                src="/images/features-image.png"
                alt="Open book in a library setting representing system features"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-primary/10 mix-blend-multiply" />
            </div>

            {/* Stats Badge */}
            <div className="mt-6 lg:mt-0 lg:absolute lg:-bottom-6 lg:-left-6 bg-primary text-white rounded p-5 shadow-xl flex items-center justify-center border border-white/10 lg:animate-in lg:fade-in lg:zoom-in duration-500 max-w-xs z-10 mx-auto lg:mx-0">
              <div className="text-center">
                <span className="block font-serif text-[32px] font-bold leading-none mb-1">
                  100+
                </span>
                <span className="block font-sans text-[14px] font-medium opacity-90">
                  Giáo xứ đã tin dùng hệ thống
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
