'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ParishionerDetail, ParishionerLookup, ParishionerGender } from '@/types/parishioner';
import { SaintNameSelect } from '@/components/dashboard/shared/SaintNameSelect';
import { FieldLabel, FieldError, SectionHeader, getInputCls } from '@/components/dashboard/shared/FormPrimitives';
import { GenderSelect } from '@/components/dashboard/shared/GenderSelect';


// ─── Typeahead Lookup ─────────────────────────────────────────────────────────

interface TypeaheadResult {
  id: string;
  label: string;
  sub?: string;
}

function TypeaheadInput({
  label,
  required,
  value,
  displayText,
  onDisplayTextChange,
  onSelect,
  onClear,
  fetchUrl,
  mapResult,
  placeholder,
  disabled,
  error,
  gender,
}: {
  label: string;
  required?: boolean;
  value: string;
  displayText: string;
  onDisplayTextChange: (v: string) => void;
  onSelect: (item: TypeaheadResult) => void;
  onClear: () => void;
  fetchUrl: (q: string) => string;
  mapResult: (data: any) => TypeaheadResult;
  placeholder: string;
  disabled?: boolean;
  error?: string;
  gender?: 'MALE' | 'FEMALE';
}) {
  const [results, setResults] = useState<TypeaheadResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const search = useCallback(
    (q: string) => {
      if (!q.trim() || q.trim().length < 1) {
        setResults([]);
        setOpen(false);
        return;
      }
      if (debounceRef.current) clearTimeout(debounceRef.current);
      setLoading(true);
      setOpen(true);
      debounceRef.current = setTimeout(async () => {
        try {
          let url = fetchUrl(q);
          if (gender) url += `&gender=${gender}`;
          const res = await fetch(url, { credentials: 'include' });
          if (res.ok) {
            const body = await res.json() as { data?: { items?: unknown[] } | unknown[] };
            const data = (body.data && !Array.isArray(body.data) ? (body.data.items || []) : (body.data || [])).map(mapResult);
            setResults(data);
          }
        } catch {
          setResults([]);
        } finally {
          setLoading(false);
        }
      }, 350);
    },
    [fetchUrl, mapResult, gender]
  );

  const handleChange = (v: string) => {
    onDisplayTextChange(v);
    if (!v) {
      onClear();
      setResults([]);
      setOpen(false);
      return;
    }
    search(v);
  };

  return (
    <div className="space-y-1.5 relative" ref={containerRef}>
      <FieldLabel required={required}>{label}</FieldLabel>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#78716C] text-lg pointer-events-none">
          person_search
        </span>
        <input
          type="text"
          value={displayText}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`${getInputCls(disabled, !!error)} pl-10 pr-10`}
        />
        {value && (
          <button
            type="button"
            onClick={() => { onClear(); onDisplayTextChange(''); setResults([]); setOpen(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78716C] hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        )}
      </div>
      <FieldError message={error} />

      {/* Dropdown */}
      {open && displayText && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-surface border border-[#E7E5E4] rounded shadow-lg z-30 max-h-52 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-sm text-[#78716C] font-body">Đang tìm kiếm...</div>
          ) : results.length > 0 ? (
            <ul>
              {results.map((r) => (
                <li
                  key={r.id}
                  onClick={() => { onSelect(r); onDisplayTextChange(r.label); setOpen(false); }}
                  className="px-4 py-3 hover:bg-[#F5F5F4] cursor-pointer flex items-start justify-between gap-2 border-b border-[#E7E5E4] last:border-0 transition-colors"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#1C1917] font-body">{r.label}</p>
                    {r.sub && <p className="text-xs text-[#78716C] font-body">{r.sub}</p>}
                  </div>
                  <span className="material-symbols-outlined text-sm text-[#78716C] shrink-0 mt-0.5">check_circle</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-sm text-[#78716C] font-body italic">Không tìm thấy kết quả</div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Form state ───────────────────────────────────────────────────────────────

interface FormData {
  christian_name: string;
  full_name: string;
  nick_name: string;
  gender: ParishionerGender;
  birth_date: string;
  father_id: string;
  mother_id: string;
  household_id: string;
  phone_number: string;
  occupation: string;
  is_non_catholic: boolean;
  status: string;
  marital_status: string;
  date_of_death: string;
}

interface FormErrors {
  full_name?: string;
  gender?: string;
  birth_date?: string;
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  initialData?: ParishionerDetail;
  isEdit?: boolean;
}

import { useCreateParishioner, useUpdateParishioner } from '../queries/useParishionerMutations';

export function ParishionerForm({ initialData, isEdit = false }: Props) {
  const router = useRouter();
  
  const createMutation = useCreateParishioner();
  const updateMutation = useUpdateParishioner(initialData?.id || '');

  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<FormData>({
    christian_name: initialData?.christian_name ?? '',
    full_name: initialData?.full_name ?? '',
    nick_name: initialData?.nick_name ?? '',
    gender: initialData?.gender ?? 'MALE',
    birth_date: initialData?.birth_date ? initialData.birth_date.split('T')[0] : '',
    father_id: initialData?.father?.id ?? '',
    mother_id: initialData?.mother?.id ?? '',
    household_id: initialData?.household?.id ?? '',
    phone_number: initialData?.phone_number ?? '',
    occupation: initialData?.occupation ?? '',
    is_non_catholic: initialData?.is_non_catholic ?? false,
    status: initialData?.status ?? 'RESIDING',
    marital_status: initialData?.marital_status ?? 'SINGLE',
    date_of_death: initialData?.date_of_death ? initialData.date_of_death.split('T')[0] : '',
  });

  // Typeahead display texts
  const [fatherText, setFatherText] = useState(
    initialData?.father
      ? [initialData.father.christian_name, initialData.father.full_name].filter(Boolean).join(' ')
      : ''
  );
  const [motherText, setMotherText] = useState(
    initialData?.mother
      ? [initialData.mother.christian_name, initialData.mother.full_name].filter(Boolean).join(' ')
      : ''
  );
  const [householdText, setHouseholdText] = useState(
    initialData?.household?.household_code ?? ''
  );

  const set = (key: keyof FormData, value: FormData[keyof FormData]) =>
    setFormData((p) => ({ ...p, [key]: value }));

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.full_name.trim()) newErrors.full_name = 'Họ và tên là bắt buộc';
    if (!formData.gender) newErrors.gender = 'Vui lòng chọn giới tính';
    if (!formData.birth_date) newErrors.birth_date = 'Ngày sinh là bắt buộc';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Vui lòng kiểm tra lại thông tin');
      return;
    }

    try {
      const payload = {
        christian_name: formData.christian_name || undefined,
        full_name: formData.full_name,
        nick_name: formData.nick_name || undefined,
        gender: formData.gender,
        birth_date: formData.birth_date || undefined,
        father_id: formData.father_id || undefined,
        mother_id: formData.mother_id || undefined,
        household_id: formData.household_id || undefined,
        phone_number: formData.phone_number || undefined,
        occupation: formData.occupation || undefined,
        is_non_catholic: formData.is_non_catholic,
        status: formData.status,
        marital_status: formData.marital_status,
        date_of_death: formData.status === 'DECEASED' ? (formData.date_of_death || undefined) : null,
      };

      if (isEdit) {
        await updateMutation.mutateAsync(payload);
      } else {
        const result = await createMutation.mutateAsync(payload);
        const targetId = result.id;
        router.push(`/dashboard/parishioners/${targetId}`);
        router.refresh();
      }

      toast.success(
        isEdit ? 'Cập nhật thông tin giáo dân thành công' : 'Thêm giáo dân mới thành công'
      );

      if (isEdit) {
        router.push(`/dashboard/parishioners/${initialData?.id}`);
        router.refresh();
      }
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Lỗi hệ thống');
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // ── Parishioner search factory ────────────────────────────────────────────
  const parishionerFetchUrl = (q: string) =>
    `/api/v1/parishioners/search?q=${encodeURIComponent(q)}&limit=8`;

  const mapParishioner = (p: ParishionerLookup): TypeaheadResult => ({
    id: p.id,
    label: [p.christian_name, p.full_name].filter(Boolean).join(' ') + (p.nick_name ? ` (${p.nick_name})` : ''),
    sub: p.birth_date
      ? `Ngày sinh: ${new Date(p.birth_date).toLocaleDateString('vi-VN')}`
      : undefined,
  });

  // ── Household search factory ──────────────────────────────────────────────
  const householdFetchUrl = (q: string) =>
    `/api/v1/households?search=${encodeURIComponent(q)}&limit=8`;

  const mapHousehold = (h: { id: string; household_code: string; head?: { full_name: string } }): TypeaheadResult => ({
    id: h.id,
    label: `Mã hộ: ${h.household_code}`,
    sub: h.head ? `Chủ hộ: ${h.head.full_name}` : undefined,
  });

  const handleClearParent = (type: 'FATHER' | 'MOTHER') => {
    set(type === 'FATHER' ? 'father_id' : 'mother_id', '');

    if (formData.household_id) {
      const parentLabel = type === 'FATHER' ? 'Thân phụ' : 'Thân mẫu';
      toast.warning(
        `Cảnh báo: Giáo dân sẽ tự động bị xóa khỏi Hộ giáo do mất kết nối với ${parentLabel}.`
      );
      set('household_id', '');
      setHouseholdText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="space-y-8">
        {/* ── Section 1: Personal Info ──────────────────────────────────────── */}
        <div className="bg-surface border border-[#E7E5E4] rounded p-6">
          <SectionHeader
            icon="person"
            title="Thông tin cá nhân"
            subtitle="Tên Thánh, họ tên, ngày sinh và giới tính"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SaintNameSelect
              value={formData.christian_name}
              onChange={(val) => set('christian_name', val)}
              gender={formData.gender}
              disabled={isSubmitting}
              required
            />

            {/* Full Name */}
            <div className="space-y-1.5">
              <FieldLabel required>Họ và Tên</FieldLabel>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => { set('full_name', e.target.value); if (errors.full_name) setErrors(p => ({ ...p, full_name: undefined })); }}
                placeholder="Nguyễn Văn An"
                disabled={isSubmitting}
                className={getInputCls(isSubmitting, !!errors.full_name)}
              />
              <FieldError message={errors.full_name} />
            </div>

            {/* Nick Name */}
            <div className="space-y-1.5">
              <FieldLabel>Bí danh</FieldLabel>
              <input
                type="text"
                value={formData.nick_name}
                onChange={(e) => set('nick_name', e.target.value)}
                placeholder="Tên hay gọi (nếu có)"
                className={getInputCls(isSubmitting)}
              />
            </div>

            {/* Birth Date */}
            <div className="space-y-1.5">
              <FieldLabel required>Ngày sinh</FieldLabel>
              <input
                type="date"
                value={formData.birth_date}
                onChange={(e) => { set('birth_date', e.target.value); if (errors.birth_date) setErrors(p => ({ ...p, birth_date: undefined })); }}
                disabled={isSubmitting}
                max={new Date().toISOString().split('T')[0]}
                className={getInputCls(isSubmitting, !!errors.birth_date)}
              />
              <FieldError message={errors.birth_date} />
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <FieldLabel required>Trạng thái</FieldLabel>
              <div className="relative">
                <select
                  value={formData.status}
                  onChange={(e) => set('status', e.target.value)}
                  disabled={isSubmitting}
                  className={`${getInputCls(isSubmitting)} appearance-none pr-10`}
                >
                  <option value="RESIDING">Đang sinh hoạt</option>
                  <option value="ABSENT">Vắng mặt</option>
                  <option value="MOVED">Chuyển xứ</option>
                  <option value="DECEASED">Đã qua đời</option>
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#78716C] text-lg pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>

            {/* Marital Status */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 group/label relative mb-2">
                <FieldLabel required className="!mb-0">Tình trạng hôn phối</FieldLabel>
                
                {/* Info Icon & Popover for protected status */}
                {isEdit && !!initialData?.household?.id && (initialData?.relationship_to_head === 'HEAD' || initialData?.relationship_to_head === 'SPOUSE') && (
                  <div className="relative group/info">
                    <div className="w-12 h-12 flex items-center justify-center -ml-3 -mr-3 -my-3 cursor-help">
                      <span className="material-symbols-outlined text-[#8B2635] text-[18px] leading-none align-middle hover:scale-110 transition-transform">info</span>
                    </div>
                    
                    {/* Popover Bubble */}
                    <div className="absolute left-[-10px] bottom-full mb-3 w-72 p-4 bg-white border border-[#8B2635]/20 rounded-md shadow-xl z-[60] 
                                    opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all duration-200 origin-bottom-left scale-95 group-hover/info:scale-100
                                    before:content-[''] before:absolute before:top-full before:left-3 before:border-8 before:border-transparent before:border-t-white
                                    after:content-[''] after:absolute after:top-full after:left-[11px] after:border-[9px] after:border-transparent after:border-t-[#8B2635]/10 after:-z-10">
                      <h4 className="text-[12px] font-display font-bold text-[#8B2635] mb-1.5 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[14px]">protected_identifier</span>
                        Dữ liệu đang được bảo vệ
                      </h4>
                      <p className="text-[11px] text-on-surface-variant leading-relaxed mb-3">
                        Vì đây là <span className="font-bold italic">Chủ hộ / Phối ngẫu</span>, bạn cần cập nhật Tình trạng hôn phối đồng bộ cho cả hai tại trang quản lý Hộ giáo.
                      </p>
                      <button
                        type="button"
                        onClick={() => router.push(`/dashboard/households/${initialData.household!.id}`)}
                        className="w-full h-8 flex items-center justify-center gap-1.5 bg-[#8B2635] text-white text-[10px] font-bold rounded-sm hover:bg-[#8B2635]/90 transition-all uppercase tracking-wider"
                      >
                        <span className="material-symbols-outlined text-[14px]">family_history</span>
                        Đi tới trang Hộ giáo
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="relative">
                <select
                  value={formData.marital_status}
                  onChange={(e) => set('marital_status', e.target.value)}
                  disabled={isSubmitting || (isEdit && !!initialData?.household?.id && (initialData?.relationship_to_head === 'HEAD' || initialData?.relationship_to_head === 'SPOUSE'))}
                  className={`${getInputCls(isSubmitting || (isEdit && !!initialData?.household?.id && (initialData?.relationship_to_head === 'HEAD' || initialData?.relationship_to_head === 'SPOUSE')))} appearance-none pr-10`}
                >
                  <option value="SINGLE">Độc Thân</option>
                  <option value="MARRIED">Đã Kết Hôn</option>
                  <option value="MIXED_RELIGION">Đã Kết Hôn (Khác Đạo)</option>
                  <option value="IRREGULAR">Kết Hôn (Mắc Ngăn Trở)</option>
                  <option value="SEPARATED">Ly Thân</option>
                  <option value="DIVORCED">Ly Dị</option>
                  <option value="WIDOWED">Góa</option>
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#78716C] text-lg pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>

            {/* Date of Death (Conditional) */}
            {formData.status === 'DECEASED' && (
              <div className="space-y-1.5">
                <FieldLabel>Ngày qua đời</FieldLabel>
                <input
                  type="date"
                  value={formData.date_of_death}
                  onChange={(e) => set('date_of_death', e.target.value)}
                  disabled={isSubmitting}
                  max={new Date().toISOString().split('T')[0]}
                  className={getInputCls(isSubmitting)}
                />
              </div>
            )}
          </div>

          <GenderSelect
            value={formData.gender}
            onChange={(g) => { set('gender', g); if (errors.gender) setErrors(p => ({ ...p, gender: undefined })); }}
            disabled={isSubmitting}
            required
            error={errors.gender}
            className="mt-6"
          />

          {/* Non-Catholic checkbox */}
          <div className="mt-4">
            <label className="flex items-center gap-3 cursor-pointer group w-fit">
              <div
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                  formData.is_non_catholic
                    ? 'bg-primary border-primary'
                    : 'border-[#E7E5E4] group-hover:border-primary/50'
                }`}
                onClick={() => set('is_non_catholic', !formData.is_non_catholic)}
              >
                {formData.is_non_catholic && (
                  <span className="material-symbols-outlined text-white text-xs">check</span>
                )}
              </div>
              <span className="text-sm font-body text-[#1C1917]">
                Không phải Công giáo (vợ/chồng khác đạo)
              </span>
            </label>
          </div>
        </div>

        {/* ── Section 2: Family Info ────────────────────────────────────────── */}
        <div className="bg-surface border border-[#E7E5E4] rounded p-6">
          <SectionHeader
            icon="family_restroom"
            title="Thông tin gia đình"
            subtitle="Thân phụ, thân mẫu và hộ giáo"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Father */}
            <TypeaheadInput
              label="Thân phụ (Cha)"
              value={formData.father_id}
              displayText={fatherText}
              onDisplayTextChange={setFatherText}
              onSelect={(item) => set('father_id', item.id)}
              onClear={() => handleClearParent('FATHER')}
              fetchUrl={parishionerFetchUrl}
              mapResult={mapParishioner}
              placeholder="Tìm kiếm giáo dân nam..."
              disabled={isSubmitting}
              gender="MALE"
            />

            {/* Mother */}
            <TypeaheadInput
              label="Thân mẫu (Mẹ)"
              value={formData.mother_id}
              displayText={motherText}
              onDisplayTextChange={setMotherText}
              onSelect={(item) => set('mother_id', item.id)}
              onClear={() => handleClearParent('MOTHER')}
              fetchUrl={parishionerFetchUrl}
              mapResult={mapParishioner}
              placeholder="Tìm kiếm giáo dân nữ..."
              disabled={isSubmitting}
              gender="FEMALE"
            />
          </div>

          {/* Household */}
          <div className="mt-6">
            <TypeaheadInput
              label="Hộ giáo"
              value={formData.household_id}
              displayText={householdText}
              onDisplayTextChange={setHouseholdText}
              onSelect={(item) => set('household_id', item.id)}
              onClear={() => set('household_id', '')}
              fetchUrl={householdFetchUrl}
              mapResult={mapHousehold}
              placeholder="Tìm kiếm mã hộ giáo..."
              disabled={isSubmitting}
            />
            <p className="mt-1.5 text-xs font-body text-[#78716C] italic">
              Lưu ý: Hộ giáo xác định giáo khu và tình trạng cư trú của giáo dân.
            </p>
          </div>
        </div>

        {/* ── Section 3: Contact Info ───────────────────────────────────────── */}
        <div className="bg-surface border border-[#E7E5E4] rounded p-6">
          <SectionHeader
            icon="contact_phone"
            title="Thông tin liên hệ"
            subtitle="Số điện thoại và nghề nghiệp (không bắt buộc)"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <FieldLabel>Số điện thoại</FieldLabel>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#78716C] text-lg pointer-events-none">
                  phone
                </span>
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => set('phone_number', e.target.value)}
                  placeholder="09xxx..."
                  disabled={isSubmitting}
                  className={`${getInputCls(isSubmitting)} pl-10`}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <FieldLabel>Nghề nghiệp</FieldLabel>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#78716C] text-lg pointer-events-none">
                  work
                </span>
                <input
                  type="text"
                  value={formData.occupation}
                  onChange={(e) => set('occupation', e.target.value)}
                  placeholder="Kỹ sư, Giáo viên, Nông dân..."
                  disabled={isSubmitting}
                  className={`${getInputCls(isSubmitting)} pl-10`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Info note ─────────────────────────────────────────────────────── */}
        <div className="flex gap-3 bg-[#F5F5F4] border border-[#E7E5E4] rounded p-4">
          <span className="material-symbols-outlined text-primary text-lg shrink-0">info</span>
          <p className="text-xs font-body text-[#78716C] leading-relaxed">
            Dữ liệu sau khi lưu sẽ tự động được đồng bộ với hệ thống Tiến trình Bí tích và Gia phả Ba đời.
            Thông tin Bí tích có thể được cập nhật riêng sau khi tạo hồ sơ.
          </p>
        </div>

        {/* ── Actions ───────────────────────────────────────────────────────── */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="w-full sm:w-auto h-12 px-6 border border-[#E7E5E4] text-[#1C1917] text-sm font-medium rounded hover:bg-[#F5F5F4] transition-all active:scale-95 disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            id="parishioner-form-submit-btn"
            className="w-full sm:w-auto h-12 px-8 bg-primary text-white text-sm font-bold rounded hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">save</span>
                <span>{isEdit ? 'Cập nhật hồ sơ' : 'Lưu hồ sơ'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
