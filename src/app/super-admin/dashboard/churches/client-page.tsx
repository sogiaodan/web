'use client';

import { useState } from 'react';
import { Church, Plus, Search, Building2, Globe, User, Mail, Calendar } from 'lucide-react';
import { ChurchOnboardingForm } from './onboarding-form';
import clsx from 'clsx';

// Mock data for initial UI
const MOCK_CHURCHES = [
  {
    id: '1',
    name: 'Giáo xứ Đa Minh Ba Chuông',
    schema_name: 'church_da_minh',
    admin_name: 'Lm. Giuse',
    admin_email: 'admin@daminhbachuong.org',
    created_at: '2026-03-20T10:00:00Z',
    status: 'ACTIVE'
  },
  {
    id: '2',
    name: 'Giáo xứ Tân Định',
    schema_name: 'church_tan_dinh',
    admin_name: 'Lm. Phêrô',
    admin_email: 'admin@tandinh-parish.org',
    created_at: '2026-03-15T08:30:00Z',
    status: 'ACTIVE'
  }
];

export default function ChurchesManagementPage() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChurches = MOCK_CHURCHES.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.schema_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative min-h-full">
      <div className={clsx(
        "space-y-8 transition-all duration-500",
        showOnboarding ? "opacity-30 blur-sm pointer-events-none scale-[0.98]" : "opacity-100"
      )}>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">Quản Trị Giáo Xứ</h1>
            <p className="text-muted mt-1 italic font-medium">Lưu trữ và quản lý quyền truy cập các thực thể tôn giáo.</p>
          </div>
          
          <button 
            onClick={() => setShowOnboarding(true)}
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all hover:-translate-y-0.5 active:translate-y-0 group"
          >
            <Plus className="h-5 w-5" />
            ONBOARD GIÁO XỨ MỚI
          </button>
        </div>

        <div className="flex flex-col gap-6">
          <div className="relative group max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted transition-colors group-focus-within:text-primary" />
            <input 
              type="text" 
              placeholder="Tìm kiếm giáo xứ, schema..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-outline pl-12 pr-4 py-3 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:italic"
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {filteredChurches.map((church) => (
              <div 
                key={church.id}
                className="bg-white border border-outline p-6 rounded-sm shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                    <Building2 className="h-24 w-24" />
                </div>

                <div className="flex flex-col gap-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-serif text-xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                        {church.name}
                      </h3>
                      <div className="mt-2 flex items-center gap-2 text-[11px] font-bold text-primary uppercase tracking-wider bg-primary/5 px-2 py-1 rounded w-fit italic">
                        <Globe className="h-3 w-3" />
                        ID: {church.schema_name}
                      </div>
                    </div>
                    <div className="h-3 w-3 rounded-full bg-green-500 shadow-sm shadow-green-500/50" title="Đang hoạt động" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-outline/50">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-widest text-muted font-bold">Quản trị viên</p>
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <User className="h-3.5 w-3.5 text-muted" />
                        <span className="font-medium">{church.admin_name}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase tracking-widest text-muted font-bold">Ngày khởi tạo</p>
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <Calendar className="h-3.5 w-3.5 text-muted" />
                        <span className="font-medium">{new Date(church.created_at).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                    <div className="col-span-2 space-y-1">
                      <p className="text-[10px] uppercase tracking-widest text-muted font-bold">Email kỹ thuật</p>
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <Mail className="h-3.5 w-3.5 text-muted" />
                        <span className="font-medium">{church.admin_email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Onboarding Drawer/Modal */}
      {showOnboarding && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div 
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setShowOnboarding(false)}
          />
          <div className="relative w-full max-w-lg h-full">
            <ChurchOnboardingForm 
              onSuccess={() => {
                setShowOnboarding(false);
                // In real app, we would re-fetch the list
              }}
              onCancel={() => setShowOnboarding(false)} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
