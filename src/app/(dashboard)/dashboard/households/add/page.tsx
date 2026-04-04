'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { 
  ArrowLeft, 
  Save, 
  Home, 
  User, 
  Phone, 
  MapPin, 
  AlertCircle,
  Loader2,
  Info
} from 'lucide-react';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AddHouseholdPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch Zones for selection
  const { data: dashboardData } = useSWR('/api/v1/dashboard/summary', fetcher);

  const [formData, setFormData] = useState({
    // Household Info
    household_code: '',
    address: '',
    phone_number: '',
    zone_id: '',
    canonical_status: 'REGULAR',
    
    // Head of Household Info (Parishioner)
    christian_name: '',
    full_name: '',
    gender: 'MALE',
    birth_date: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Step 1: Create the Head Parishioner first
      const headRes = await fetch('/api/v1/parishioners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          christian_name: formData.christian_name,
          full_name: formData.full_name,
          gender: formData.gender,
          birth_date: formData.birth_date,
        }),
      });

      const headResult = await headRes.json();
      if (!headRes.ok) throw new Error(headResult.message || 'Lỗi khi tạo chủ hộ');

      // The headResult should contain the new parishioner ID
      const headId = headResult.id || headResult.data?.id;

      // Step 2: Create the Household using the headId
      const householdRes = await fetch('/api/v1/households', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          household_code: formData.household_code,
          address: formData.address,
          phone_number: formData.phone_number,
          zone_id: formData.zone_id || undefined,
          canonical_status: formData.canonical_status,
          head_id: headId,
        }),
      });

      const householdResult = await householdRes.json();
      if (!householdRes.ok) throw new Error(householdResult.message || 'Lỗi khi tạo hộ giáo');

      // Success! Redirect to household detail or list
      const newId = householdResult.id || householdResult.data?.id;
      router.push(`/dashboard/households/${newId}`);
      router.refresh();
      
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <div className="mb-8">
        <Link 
          href="/dashboard"
          className="inline-flex items-center text-sm text-slate-500 hover:text-sacred-crimson transition-colors mb-4 group"
        >
          <ArrowLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" />
          Quay lại tổng quan
        </Link>
        <h1 className="text-4xl font-serif font-bold text-slate-900 tracking-tight">
          Thiết Lập Hộ Giáo Mới
        </h1>
        <p className="mt-2 text-slate-600 text-lg">
          Khởi tạo thông tin gia đình và chủ hộ để bắt đầu quản lý.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 pb-20">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
            <p className="text-sm text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* SECTION: HOUSEHOLD */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center">
            <div className="w-8 h-8 rounded-lg bg-sacred-crimson/10 flex items-center justify-center mr-3">
              <Home className="w-5 h-5 text-sacred-crimson" />
            </div>
            <h2 className="font-bold text-slate-800 text-lg font-serif">Thông Tin Hộ Giáo</h2>
          </div>
          
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 block uppercase tracking-wider">
                Mã Hộ Giáo <span className="text-sacred-crimson">*</span>
              </label>
              <input 
                type="text"
                name="household_code"
                required
                placeholder="Ví dụ: HG-001"
                value={formData.household_code}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-sacred-crimson/10 focus:border-sacred-crimson outline-none transition-all placeholder:text-slate-300"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 block uppercase tracking-wider">
                Giáo Khu
              </label>
              <select 
                name="zone_id"
                value={formData.zone_id}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-sacred-crimson/10 focus:border-sacred-crimson outline-none transition-all appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1em_1em]"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7' /%3E%3C/svg%3E")` }}
              >
                <option value="">-- Chọn Giáo Khu --</option>
                <option value="test">Khu vực thử nghiệm</option>
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700 block uppercase tracking-wider">
                Địa Chỉ Cư Trú
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                <textarea 
                  name="address"
                  rows={2}
                  placeholder="Số nhà, đường, giáo họ..."
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-sacred-crimson/10 focus:border-sacred-crimson outline-none transition-all placeholder:text-slate-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 block uppercase tracking-wider">
                Số Điện Thoại Gia Đình
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                <input 
                  type="tel"
                  name="phone_number"
                  placeholder="09xxx..."
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-sacred-crimson/10 focus:border-sacred-crimson outline-none transition-all placeholder:text-slate-300"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 block uppercase tracking-wider">
                Tình Trạng Mục Vụ
              </label>
              <select 
                name="canonical_status"
                value={formData.canonical_status}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-sacred-crimson/10 focus:border-sacred-crimson outline-none transition-all appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1em_1em]"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7' /%3E%3C/svg%3E")` }}
              >
                <option value="REGULAR">Bình thường</option>
                <option value="MIXED_RELIGION">Gia đình khác đạo</option>
                <option value="IRREGULAR">Chưa hợp thức</option>
              </select>
            </div>
          </div>
        </section>

        {/* SECTION: HEAD OF HOUSEHOLD */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center">
            <div className="w-8 h-8 rounded-lg bg-sacred-gold/10 flex items-center justify-center mr-3">
              <User className="w-5 h-5 text-sacred-gold" />
            </div>
            <h2 className="font-bold text-slate-800 text-lg font-serif">Thông Tin Chủ Hộ</h2>
          </div>
          
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 block uppercase tracking-wider">
                Tên Thánh
              </label>
              <input 
                type="text"
                name="christian_name"
                placeholder="VD: Gioan, Maria..."
                value={formData.christian_name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-sacred-crimson/10 focus:border-sacred-crimson outline-none transition-all placeholder:text-slate-300"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 block uppercase tracking-wider">
                Họ và Tên <span className="text-sacred-crimson">*</span>
              </label>
              <input 
                type="text"
                name="full_name"
                required
                placeholder="Họ tên đầy đủ"
                value={formData.full_name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-sacred-crimson/10 focus:border-sacred-crimson outline-none transition-all placeholder:text-slate-300"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 block uppercase tracking-wider">
                Giới Tính
              </label>
              <div className="flex bg-slate-100 rounded-xl p-1.5 w-max">
                <button
                  type="button"
                  onClick={() => setFormData(p => ({...p, gender: 'MALE'}))}
                  className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${formData.gender === 'MALE' ? 'bg-white text-sacred-crimson shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Nam
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(p => ({...p, gender: 'FEMALE'}))}
                  className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${formData.gender === 'FEMALE' ? 'bg-white text-sacred-crimson shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Nữ
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 block uppercase tracking-wider">
                Ngày Sinh
              </label>
              <input 
                type="date"
                name="birth_date"
                value={formData.birth_date}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-sacred-crimson/10 focus:border-sacred-crimson outline-none transition-all text-slate-600"
              />
            </div>
          </div>
        </section>

        {/* SUBMIT BUTTONS */}
        {/* SUBMIT BUTTONS */}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-md border-t border-slate-200 flex items-center justify-center space-x-6 z-50 md:relative md:bg-transparent md:border-none md:p-0 md:justify-end">
          <Link 
            href="/dashboard"
            className="px-8 py-3 rounded-xl border-2 border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-all active:scale-[0.98]"
          >
            Hủy Bỏ
          </Link>
          <button 
            type="submit"
            disabled={isSubmitting}
            className={`
              flex items-center px-10 py-3.5 rounded-xl font-bold text-white shadow-xl transition-all
              ${isSubmitting 
                ? 'bg-slate-400 cursor-not-allowed' 
                : 'bg-[#8B1D1D] hover:bg-[#6D1616] active:scale-[0.98]'
              }
            `}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-3" />
                Lưu Hộ Giáo
              </>
            )}
          </button>
        </div>

      </form>

      <div className="mt-8 p-6 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-start">
        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mr-4 shrink-0 text-blue-600">
          <Info className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-blue-900 leading-tight">Hướng dẫn nhập liệu</h3>
          <p className="text-sm text-blue-800/70 mt-1">
            Hệ thống sẽ đồng thời tạo mới thông tin Chủ hộ vào danh sách Giáo dân. Bạn có thể bổ sung các thành viên khác vào hộ này sau khi tạo thành công.
          </p>
        </div>
      </div>
    </div>
  );
}
