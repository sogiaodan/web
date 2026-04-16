'use client';

import React, { useState } from 'react';
import { Household } from '@/types/household';
import { useZones } from '@/components/providers/zones-provider';
import { useUpdateHousehold } from '../../queries/useHouseholdMutations';
import { FieldLabel, getInputCls } from '@/components/dashboard/shared/FormPrimitives';
import { Loader2, Save, X } from 'lucide-react';
import { DatePicker } from '@/components/dashboard/shared/DatePicker';

interface HouseholdEditModalProps {
  household: Household;
  isOpen: boolean;
  onClose: () => void;
}

export function HouseholdEditModal({ household, isOpen, onClose }: HouseholdEditModalProps) {
  const { zones } = useZones();
  const updateHousehold = useUpdateHousehold(household.id);
  
  const [formData, setFormData] = useState({
    household_code: household.household_code || '',
    address: household.address || '',
    zone_id: household.zone_id || household.zone?.id || '',
    marital_status: household.head?.marital_status || 'MARRIED',
    physical_book_no: household.physical_book_no || '',
    book_issue_date: household.book_issue_date ? new Date(household.book_issue_date).toISOString().split('T')[0] : '',
    pastoral_notes: household.pastoral_notes || '',
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Clean up empty strings that might fail strict backend validation (like @IsDateString)
      const payload = {
        ...formData,
        book_issue_date: formData.book_issue_date || undefined,
      };
      
      await updateHousehold.mutateAsync(payload);
      onClose();
    } catch (err) {
      console.error('Failed to update household:', err);
    }
  };

  const isSubmitting = updateHousehold.isPending;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-sm shadow-2xl border border-border-color flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-color">
          <div>
            <h3 className="text-xl font-display font-bold text-text-main">Cập nhật thông tin Hộ giáo</h3>
            <p className="text-xs text-muted mt-1">Sửa đổi thông tin cơ bản và tình trạng hôn phối đồng bộ</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5 text-muted" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <FieldLabel required>Mã Hộ Giáo</FieldLabel>
              <input 
                type="text"
                name="household_code"
                required
                value={formData.household_code}
                onChange={handleChange}
                disabled={isSubmitting}
                className={getInputCls(isSubmitting)}
              />
            </div>

            <div className="space-y-1.5">
              <FieldLabel required>Giáo Khu</FieldLabel>
              <select 
                name="zone_id"
                required
                value={formData.zone_id}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`${getInputCls(isSubmitting)} appearance-none pr-10`}
              >
                <option value="">-- Chọn Giáo Khu --</option>
                {zones.map(zone => (
                  <option key={zone.id} value={zone.id}>{zone.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <FieldLabel required>Tình Trạng Hôn Phối (Đồng bộ)</FieldLabel>
              <div className="bg-[#8B2635]/5 border border-[#8B2635]/10 p-4 rounded-sm mb-3">
                <p className="text-[11px] text-[#8B2635] leading-relaxed">
                  <span className="font-bold uppercase tracking-wider block mb-1">⚠️ Lưu ý quan trọng</span>
                  Việc thay đổi trạng thái này sẽ tự động cập nhật đồng bộ cho cả <span className="font-bold">Chủ hộ</span> và <span className="font-bold">Phối ngẫu</span> để đảm bảo tính nhất quán của hồ sơ gia đình.
                </p>
              </div>
              <select 
                name="marital_status"
                required
                value={formData.marital_status}
                onChange={handleChange}
                disabled={isSubmitting}
                className={`${getInputCls(isSubmitting)} appearance-none pr-10`}
              >
                <option value="MARRIED">Đã kết hôn</option>
                <option value="MIXED_RELIGION">Kết hôn khác đạo (Phép chuẩn)</option>
                <option value="IRREGULAR">Hôn nhân ngăn trở (Nguội lạnh)</option>
                <option value="SEPARATED">Ly thân / Ly dị</option>
                <option value="WIDOWED">Góa</option>
              </select>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <FieldLabel>Địa Chỉ Cư Trú</FieldLabel>
              <textarea 
                name="address"
                rows={2}
                value={formData.address}
                onChange={handleChange}
                disabled={isSubmitting}
                className={getInputCls(isSubmitting)}
              />
            </div>


            <DatePicker
              label="Ngày Cấp Sổ"
              value={formData.book_issue_date}
              onChange={(val) => setFormData((prev) => ({ ...prev, book_issue_date: val }))}
              disabled={isSubmitting}
            />







            
            <div className="space-y-1.5">
              <FieldLabel>Số Quyển / STT</FieldLabel>
              <input 
                type="text"
                name="physical_book_no"
                value={formData.physical_book_no}
                onChange={handleChange}
                disabled={isSubmitting}
                className={getInputCls(isSubmitting)}
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <FieldLabel>Ghi Chú Mục Vụ</FieldLabel>
              <textarea 
                name="pastoral_notes"
                rows={3}
                value={formData.pastoral_notes}
                onChange={handleChange}
                disabled={isSubmitting}
                className={getInputCls(isSubmitting)}
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-border-color bg-slate-50 flex items-center justify-end gap-4 rounded-b-sm">
          <button 
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 h-12 text-sm font-semibold text-muted hover:text-text-main transition-colors"
          >
            Hủy bỏ
          </button>
          <button 
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-8 h-12 bg-primary text-white text-sm font-bold rounded-sm shadow-md hover:bg-primary/90 transition-all active:scale-[0.98] flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Lưu thay đổi
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
