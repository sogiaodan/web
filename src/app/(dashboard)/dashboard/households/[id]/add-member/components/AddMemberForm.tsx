'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Household } from '@/types/household';
import { ParishionerLookup, ParishionerGender } from '@/types/parishioner';
import { SaintNameSelect } from '@/components/dashboard/shared/SaintNameSelect';
import { FieldLabel, FieldError, SectionHeader, getInputCls } from '@/components/dashboard/shared/FormPrimitives';
import { GenderSelect } from '@/components/dashboard/shared/GenderSelect';
import { useAddMemberToHousehold } from '../../../queries/useHouseholdMutations';

// ─── Typeahead Lookup ─────────────────────────────────────────────────────────

interface TypeaheadResult {
  id: string;
  label: string;
  sub?: string;
}

function TypeaheadInput<T>({
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
  mapResult: (data: T) => TypeaheadResult;
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
            const data = (body.data && !Array.isArray(body.data) ? (body.data.items || []) : (body.data || [])).map((item) => mapResult(item as T));
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
  phone_number: string;
  occupation: string;
  is_non_catholic: boolean;
  status: string;
  marital_status: string;
  date_of_death: string;
  relationship_to_head: string;
}

interface FormErrors {
  christian_name?: string;
  full_name?: string;
  gender?: string;
  birth_date?: string;
}

// ─── Main Form ────────────────────────────────────────────────────────────────

export function AddMemberForm({ household }: { household: Household }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramRel = searchParams.get('relationship');
  const paramGender = searchParams.get('gender');

  const addMemberMutation = useAddMemberToHousehold(household.id);

  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<FormData>({
    christian_name: '',
    full_name: '',
    nick_name: '',
    gender: (paramGender as ParishionerGender) ?? 'MALE',
    birth_date: '',
    father_id: '',
    mother_id: '',
    phone_number: '',
    occupation: '',
    is_non_catholic: false,
    status: 'RESIDING',
    marital_status: 'SINGLE',
    date_of_death: '',
    relationship_to_head: (paramRel === 'SPOUSE' && household.spouse) ? 'CHILD' : (paramRel ?? 'CHILD'),
  });

  const [fatherText, setFatherText] = useState('');
  const [motherText, setMotherText] = useState('');

  const set = (key: keyof FormData, value: FormData[keyof FormData]) =>
    setFormData((p) => ({ ...p, [key]: value }));

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.is_non_catholic && !formData.christian_name.trim()) {
      newErrors.christian_name = 'Tên Thánh là bắt buộc đối với Giáo dân';
    }
    if (!formData.full_name.trim()) newErrors.full_name = 'Họ và tên là bắt buộc';
    if (!formData.gender) newErrors.gender = 'Vui lòng chọn giới tính';
    if (!formData.birth_date) newErrors.birth_date = 'Ngày sinh là bắt buộc';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Vui lòng kiểm tra lại thông tin');
      return;
    }

    try {
      const payload: any = {
        christian_name: formData.christian_name || undefined,
        full_name: formData.full_name,
        nick_name: formData.nick_name || undefined,
        gender: formData.gender,
        birth_date: formData.birth_date || undefined,
        father_id: formData.father_id || undefined,
        mother_id: formData.mother_id || undefined,
        phone_number: formData.phone_number || undefined,
        occupation: formData.occupation || undefined,
        is_non_catholic: formData.is_non_catholic,
        status: formData.status,
        relationship_to_head: formData.relationship_to_head,
        marital_status: formData.marital_status,
        date_of_death: formData.status === 'DECEASED' ? (formData.date_of_death || undefined) : null,
      };

      await addMemberMutation.mutateAsync(payload);
      toast.success('Thêm thành viên mới thành công');
      router.push(`/dashboard/households/${household.id}`);
      router.refresh();
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Lỗi hệ thống');
    }
  };

  const isSubmitting = addMemberMutation.isPending;

  const parishionerFetchUrl = (q: string) =>
    `/api/v1/parishioners/search?q=${encodeURIComponent(q)}&limit=8`;

  const mapParishioner = (p: ParishionerLookup): TypeaheadResult => ({
    id: p.id,
    label: [p.christian_name, p.full_name].filter(Boolean).join(' ') + (p.nick_name ? ` (${p.nick_name})` : ''),
    sub: p.birth_date
      ? `Ngày sinh: ${new Date(p.birth_date).toLocaleDateString('vi-VN')}`
      : undefined,
  });

  const handleClearParent = (type: 'FATHER' | 'MOTHER') => {
    set(type === 'FATHER' ? 'father_id' : 'mother_id', '');
  };

  const head = household.head;
  const spouse = household.spouse;

  let inferredFather: typeof head | null = null;
  let inferredMother: typeof head | null = null;

  if (formData.relationship_to_head === 'CHILD') {
    if (head?.gender === 'MALE') inferredFather = head;
    else if (head?.gender === 'FEMALE') inferredMother = head;

    if (spouse?.gender === 'MALE') inferredFather = spouse;
    else if (spouse?.gender === 'FEMALE') inferredMother = spouse;
  }

  // Inference note for user
  let relationshipNotice = null;
  if (formData.relationship_to_head === 'CHILD') {
    relationshipNotice = `Thành viên này sẽ là "Con cái". Hệ thống tự nhận diện cha mẹ từ Chủ hộ và Phối ngẫu hiện tại. Bạn chỉ cần tìm thêm nếu người còn lại khuyết.`;
  } else if (formData.relationship_to_head === 'SPOUSE') {
    relationshipNotice = `Thành viên này là "Vợ/Chồng" của Chủ hộ. Hệ thống sẽ tự động liên kết Hôn phối.`;
  } else if (formData.relationship_to_head === 'PARENT') {
    relationshipNotice = `Thành viên này là "Cha mẹ" của Chủ hộ. Thành viên này sẽ là Thân phụ/Thân mẫu của Chủ hộ.`;
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="space-y-8">
        <div className="mb-8 md:mb-10 text-center">
          <h2 className="text-xl md:text-3xl font-display font-bold text-[#1C1917] mb-3">Thêm thành viên Hộ giáo</h2>
          <div className="inline-flex items-center justify-center gap-2 text-[#78716C] bg-[#F5F5F4] px-4 py-2 rounded-full border border-[#E7E5E4]">
            <span className="material-symbols-outlined text-lg text-primary">family_history</span>
            <span className="text-sm font-medium font-body">Hộ giáo: {household.head?.full_name || 'Không rõ chủ hộ'}</span>
          </div>
        </div>

        {relationshipNotice && (
          <div className="flex gap-3 bg-[#E0F2FE] border border-[#BAE6FD] rounded p-4">
             <span className="material-symbols-outlined text-[#0284C7] text-lg shrink-0">info</span>
             <p className="text-xs font-body text-[#0369A1] leading-relaxed">
               {relationshipNotice}
             </p>
          </div>
        )}

        <div className="bg-surface border border-[#E7E5E4] rounded p-6">
          <SectionHeader
            icon="person"
            title="Thông tin cá nhân"
            subtitle="Tên Thánh, họ tên, ngày sinh và giới tính"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {!formData.is_non_catholic && (
               <SaintNameSelect
                  value={formData.christian_name}
                  onChange={(val) => {
                  set('christian_name', val);
                  if (errors.christian_name) setErrors(p => ({ ...p, christian_name: undefined }));
                  }}
                  gender={formData.gender}
                  disabled={isSubmitting}
                  required
                  error={errors.christian_name}
               />
             )}

            <div className="space-y-1.5">
              <FieldLabel required>Họ và Tên</FieldLabel>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => { set('full_name', e.target.value); if (errors.full_name) setErrors(p => ({ ...p, full_name: undefined })); }}
                placeholder="Nhập đầy đủ họ tên"
                disabled={isSubmitting}
                className={getInputCls(isSubmitting, !!errors.full_name)}
              />
              <FieldError message={errors.full_name} />
            </div>

            <div className="space-y-1.5">
              <FieldLabel>Bí danh</FieldLabel>
              <input
                type="text"
                value={formData.nick_name}
                onChange={(e) => set('nick_name', e.target.value)}
                placeholder="Tên thường gọi (nếu có)"
                className={getInputCls(isSubmitting)}
              />
            </div>

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

            <div className="space-y-1.5">
              <FieldLabel required>Trạng thái sinh hoạt</FieldLabel>
              <div className="relative">
                <select
                  value={formData.status}
                  onChange={(e) => set('status', e.target.value)}
                  disabled={isSubmitting}
                  className={`${getInputCls(isSubmitting)} appearance-none pr-10`}
                >
                  <option value="RESIDING">Đang cư trú</option>
                  <option value="ABSENT">Vắng mặt</option>
                  <option value="MOVED">Chuyển xứ</option>
                  <option value="DECEASED">Đã qua đời</option>
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#78716C] text-lg pointer-events-none">expand_more</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <FieldLabel required>Quan hệ với Chủ hộ</FieldLabel>
              <div className="relative">
                <select
                  value={formData.relationship_to_head}
                  onChange={(e) => set('relationship_to_head', e.target.value)}
                  disabled={isSubmitting}
                  className={`${getInputCls(isSubmitting)} appearance-none pr-10`}
                >
                  <option value="CHILD">Con cái</option>
                  {!household.spouse && <option value="SPOUSE">Vợ/Chồng</option>}
                  <option value="PARENT">Cha mẹ</option>
                  <option value="GRANDCHILD">Cháu</option>
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#78716C] text-lg pointer-events-none">expand_more</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <FieldLabel required>Tình trạng hôn phối</FieldLabel>
              <div className="relative">
                <select
                  value={formData.marital_status}
                  onChange={(e) => set('marital_status', e.target.value)}
                  disabled={isSubmitting}
                  className={`${getInputCls(isSubmitting)} appearance-none pr-10`}
                >
                  <option value="SINGLE">Độc Thân</option>
                  <option value="MARRIED">Đã Kết Hôn</option>
                  <option value="MIXED_RELIGION">Đã Kết Hôn (Khác Đạo)</option>
                  <option value="IRREGULAR">Kết Hôn (Mắc Ngăn Trở)</option>
                  <option value="SEPARATED">Ly Thân</option>
                  <option value="DIVORCED">Ly Dị</option>
                  <option value="WIDOWED">Góa</option>
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#78716C] text-lg pointer-events-none">expand_more</span>
              </div>
            </div>

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

          <div className="mt-4">
            <label className="flex items-center gap-3 cursor-pointer group w-fit">
              <div
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                  formData.is_non_catholic
                    ? 'bg-primary border-primary'
                    : 'border-[#E7E5E4] group-hover:border-primary/50'
                }`}
                onClick={() => {
                  const newVal = !formData.is_non_catholic;
                  setFormData(p => ({
                    ...p,
                    is_non_catholic: newVal,
                    christian_name: newVal ? '' : p.christian_name
                  }));
                }}
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

        {formData.relationship_to_head === 'SPOUSE' && head && (
          <div className="bg-surface border border-[#E7E5E4] rounded p-6">
            <SectionHeader
              icon="favorite"
              title="Thông tin Vợ / Chồng"
              subtitle="Tự động liên kết hôn phối với Chủ hộ"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-1.5">
                 <FieldLabel>Phối ngẫu (Chủ hộ)</FieldLabel>
                 <div className="p-3 border border-[#E7E5E4] bg-[#F5F5F4] rounded flex items-center justify-between">
                   <div>
                     <p className="text-sm font-semibold text-[#1C1917] font-body">{[head.christian_name, head.full_name].filter(Boolean).join(' ')}</p>
                     <p className="text-xs text-[#78716C] font-body">Vai trò: Chủ hộ</p>
                   </div>
                   <span className="material-symbols-outlined text-[#8B2635] text-xl">favorite</span>
                 </div>
               </div>
            </div>
          </div>
        )}

        {formData.relationship_to_head !== 'PARENT' && (
          <div className="bg-surface border border-[#E7E5E4] rounded p-6">
            <SectionHeader
              icon="family_restroom"
              title="Thân phụ và Thân mẫu"
              subtitle="Thông tin cha mẹ ruột của thành viên đang thêm."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {inferredFather ? (
                <div className="space-y-1.5">
                  <FieldLabel>Thân phụ (Cha)</FieldLabel>
                  <div className="p-3 border border-[#E7E5E4] bg-[#F5F5F4] rounded flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#1C1917] font-body">{[inferredFather.christian_name, inferredFather.full_name].filter(Boolean).join(' ')}</p>
                      <p className="text-xs text-[#78716C] font-body">Đã nhận diện từ Hộ giáo</p>
                    </div>
                    <span className="material-symbols-outlined text-[#78716C] text-xl">shield_person</span>
                  </div>
                </div>
              ) : (
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
              )}

              {inferredMother ? (
                <div className="space-y-1.5">
                  <FieldLabel>Thân mẫu (Mẹ)</FieldLabel>
                  <div className="p-3 border border-[#E7E5E4] bg-[#F5F5F4] rounded flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#1C1917] font-body">{[inferredMother.christian_name, inferredMother.full_name].filter(Boolean).join(' ')}</p>
                      <p className="text-xs text-[#78716C] font-body">Đã nhận diện từ Hộ giáo</p>
                    </div>
                    <span className="material-symbols-outlined text-[#78716C] text-xl">pregnant_woman</span>
                  </div>
                </div>
              ) : (
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
              )}
            </div>
          </div>
        )}

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
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#78716C] text-lg pointer-events-none">phone</span>
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
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#78716C] text-lg pointer-events-none">work</span>
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

        <div className="flex gap-3 bg-[#F5F5F4] border border-[#E7E5E4] rounded p-4">
          <span className="material-symbols-outlined text-primary text-lg shrink-0">info</span>
          <p className="text-xs font-body text-[#78716C] leading-relaxed">
            Dữ liệu được lưu trữ tự động trong cơ sở dữ liệu hệ thống để liên kết với Gia phả.
            Mã hồ sơ sẽ được cấp tự động sau khi lưu.
          </p>
        </div>

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
            className="w-full sm:w-auto h-12 px-8 bg-primary text-white text-sm font-bold rounded hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">save</span>
                <span>Thêm thành viên</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
