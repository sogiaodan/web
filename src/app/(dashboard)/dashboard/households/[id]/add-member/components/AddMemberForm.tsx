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
import { DatePicker } from '@/components/dashboard/shared/DatePicker';

// ─── Typeahead Lookup ─────────────────────────────────────────────────────────

interface TypeaheadResult {
  id: string;
  label: string;
  sub?: string;
  meta?: Record<string, unknown>;
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
          readOnly={!!value}
          className={`${getInputCls(disabled, !!error)} pl-10 pr-10 ${value ? 'bg-[#F5F5F4] cursor-default' : ''}`}
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
  origin_household_id: string;
  existing_parishioner_id: string;
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
    origin_household_id: '',
    existing_parishioner_id: '',
  });

  const [fatherText, setFatherText] = useState('');
  const [motherText, setMotherText] = useState('');
  const [originText, setOriginText] = useState('');
  const [existingText, setExistingText] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedParishionerRole, setSelectedParishionerRole] = useState<string | null>(null);
  const [selectedParishionerBirthDate, setSelectedParishionerBirthDate] = useState<string | null>(null);

  const set = (key: keyof FormData, value: FormData[keyof FormData]) =>
    setFormData((p) => ({ ...p, [key]: value }));

  const validate = (): boolean => {
    if (formData.existing_parishioner_id) return true;
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
      const payload: Record<string, unknown> = {
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
        existing_parishioner_id: formData.existing_parishioner_id || undefined,
        marital_status: formData.relationship_to_head === 'SPOUSE' 
          ? (household.head?.marital_status || formData.marital_status) 
          : formData.marital_status,
        date_of_death: formData.status === 'DECEASED' ? (formData.date_of_death || undefined) : null,
        origin_household_id: formData.origin_household_id || undefined,
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

  const parishionerFetchUrlAll = (q: string) =>
    `/api/v1/parishioners/search?q=${encodeURIComponent(q)}&limit=8`;

  const mapParishioner = (p: ParishionerLookup): TypeaheadResult => ({
    id: p.id,
    label: [p.christian_name, p.full_name].filter(Boolean).join(' ') + (p.nick_name ? ` (${p.nick_name})` : ''),
    sub: p.birth_date
      ? `Ngày sinh: ${new Date(p.birth_date).toLocaleDateString('vi-VN')}`
      : undefined,
    meta: { 
      role: p.relationship_to_head,
      birth_date: p.birth_date
    }
  });
  
  const householdFetchUrl = (q: string) =>
    `/api/v1/households?search=${encodeURIComponent(q)}&limit=8&exclude_ids=${household.id}`;

  const mapHouseholdResult = (h: {
    id: string;
    household_code: string;
    head?: { id: string; full_name: string };
    spouse?: { id: string };
  }): TypeaheadResult => ({
    id: h.id,
    label: `Hộ giáo: ${h.household_code}`,
    sub: h.head ? `Chủ hộ: ${h.head.full_name}` : 'Không rõ chủ hộ',
    meta: {
      head_id: h.head?.id,
      spouse_id: h.spouse?.id
    }
  });

  const handleSelectHousehold = (item: TypeaheadResult) => {
    const meta = item.meta as { head_id?: string; spouse_id?: string } | undefined;
    setFormData(p => ({
      ...p,
      origin_household_id: item.id,
      father_id: meta?.head_id || p.father_id,
      mother_id: meta?.spouse_id || p.mother_id
    }));
  };

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

  const isSelectedUserHead = formData.existing_parishioner_id === head?.id;
  const isSelectedUserSpouse = formData.existing_parishioner_id === spouse?.id;
  
  // If the searched person is already a HEAD or SPOUSE in ANY household, hide the option.
  const isPersonAlreadyAuthoritative = selectedParishionerRole === 'HEAD' || selectedParishionerRole === 'SPOUSE';
  // If the person is already a CHILD in their own household, they shouldn't be added as CHILD again elsewhere.
  const isPersonAlreadyChild = selectedParishionerRole === 'CHILD';

  let isPersonOlderThanHead = false;
  if (head?.birth_date) {
    const headDate = new Date(head.birth_date);
    const personDateStr = formData.existing_parishioner_id 
      ? selectedParishionerBirthDate 
      : formData.birth_date;
      
    if (personDateStr) {
      const personDate = new Date(personDateStr);
      if (!isNaN(personDate.getTime()) && personDate < headDate) {
        isPersonOlderThanHead = true;
      }
    }
  }

  const hideSpouseOption = !!household.spouse || isSelectedUserHead || isSelectedUserSpouse || isPersonAlreadyAuthoritative;
  const hideChildOption = isPersonAlreadyChild || isPersonOlderThanHead;

  // Auto-correct relationship if CHILD is currently selected but no longer valid
  React.useEffect(() => {
    if (hideChildOption && formData.relationship_to_head === 'CHILD' && paramRel !== 'SPOUSE') {
      set('relationship_to_head', 'PARENT'); // Switch to a valid neutral fallback
    }
  }, [hideChildOption, formData.relationship_to_head, paramRel]);

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8 pb-20">
      <div className="mb-8 md:mb-10 text-center">
        <h2 className="text-xl md:text-3xl font-display font-bold text-[#1C1917] mb-3">Thêm thành viên Hộ giáo</h2>
        <div className="inline-flex items-center justify-center gap-2 text-[#78716C] bg-[#F5F5F4] px-4 py-2 rounded-full border border-[#E7E5E4]">
          <span className="material-symbols-outlined text-lg text-primary">family_history</span>
          <span className="text-sm font-medium font-body">Hộ giáo: {household.head?.full_name || 'Không rõ chủ hộ'}</span>
        </div>
      </div>

      {/* ── COLLAPSIBLE SEARCH SECTION ── */}
      <div className="flex flex-col items-center">
        <button
          type="button"
          onClick={() => {
              const nextShow = !showSearch;
              setShowSearch(nextShow);
              // When hiding the search panel, clear any selected person so the new-member form reappears
              if (!nextShow) {
                set('existing_parishioner_id', '');
                setExistingText('');
                setSelectedParishionerRole(null);
                setSelectedParishionerBirthDate(null);
              }
            }}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
            showSearch 
              ? 'bg-primary text-white shadow-md' 
              : 'text-[#78716C] bg-[#F5F5F4] hover:bg-[#E7E5E4] border border-[#E7E5E4]'
          }`}
        >
          <span className="material-symbols-outlined text-lg">
            {showSearch ? 'keyboard_arrow_up' : 'person_search'}
          </span>
          <span className="text-sm font-semibold font-body">
            {showSearch ? 'Ẩn tìm kiếm giáo dân' : 'Tìm giáo dân đã có sẵn (Gắn kết quan hệ)'}
          </span>
        </button>
        
        {showSearch && (
          <div className="w-full mt-6 bg-[#FAF9F6] border-2 border-dashed border-[#E7E5E4] rounded-xl p-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex flex-col md:flex-row gap-6 items-end">
              <div className="flex-1">
                <TypeaheadInput
                  label="Tìm giáo dân đã có sẵn trong hệ thống"
                  value={formData.existing_parishioner_id}
                  displayText={existingText}
                  onDisplayTextChange={setExistingText}
                  onSelect={(item) => {
                    set('existing_parishioner_id', item.id);
                    const role = item.meta?.role as string | null;
                    const bDate = item.meta?.birth_date as string | null;
                    setSelectedParishionerRole(role);
                    setSelectedParishionerBirthDate(bDate);
                  }}
                  onClear={() => {
                    set('existing_parishioner_id', '');
                    setExistingText('');
                    setSelectedParishionerRole(null);
                    setSelectedParishionerBirthDate(null);
                  }}
                  fetchUrl={parishionerFetchUrlAll}
                  mapResult={mapParishioner}
                  placeholder="Nhập tên giáo dân hoặc mã định danh..."
                  disabled={isSubmitting}
                />
              </div>
              {formData.existing_parishioner_id && (
                <div className="w-full md:w-64">
                   <div className="space-y-1.5">
                      <FieldLabel required>Quan hệ với Chủ hộ</FieldLabel>
                      <div className="relative">
                        <select
                          value={formData.relationship_to_head}
                          onChange={(e) => {
                      const rel = e.target.value;
                      setFormData(p => ({
                        ...p,
                        relationship_to_head: rel,
                        // Reset non-catholic flag when switching away from SPOUSE
                        is_non_catholic: rel === 'SPOUSE' ? p.is_non_catholic : false,
                        christian_name: rel === 'SPOUSE' && p.is_non_catholic ? '' : p.christian_name,
                      }));
                    }}
                          disabled={isSubmitting}
                          className={`${getInputCls(isSubmitting)} appearance-none pr-10`}
                        >
                          {!hideChildOption && <option value="CHILD">Con cái</option>}
                          {!hideSpouseOption && <option value="SPOUSE">Vợ/Chồng</option>}
                          <option value="PARENT">Cha mẹ</option>
                        </select>
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#78716C] text-lg pointer-events-none">expand_more</span>
                      </div>
                    </div>
                </div>
              )}
            </div>
            {!formData.existing_parishioner_id && (
              <p className="mt-3 text-[11px] text-[#78716C] italic font-body">
                * Sử dụng tính năng này để liên kết giáo dân đã có hộ riêng về hộ gốc (genealogy link).
              </p>
            )}
          </div>
        )}
      </div>

      {!formData.existing_parishioner_id && (
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

            <DatePicker
              label="Ngày sinh"
              required
              value={formData.birth_date}
              onChange={(val) => {
                set('birth_date', val);
                if (errors.birth_date) setErrors(p => ({ ...p, birth_date: undefined }));
              }}
              disabled={isSubmitting}
              error={errors.birth_date}
              max={new Date().toLocaleDateString('en-CA')}
            />

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

            {formData.status === 'DECEASED' && (
               <DatePicker
                  label="Ngày qua đời"
                  value={formData.date_of_death}
                  onChange={(val) => set('date_of_death', val)}
                  disabled={isSubmitting}
                  max={new Date().toLocaleDateString('en-CA')}
               />
            )}

            {!formData.existing_parishioner_id && (
              <div className="space-y-1.5">
                <FieldLabel required>Quan hệ với Chủ hộ</FieldLabel>
                {paramRel === 'SPOUSE' ? (
                  // Coming from the spouse card — lock the relationship, no changing allowed
                  <div className={`${getInputCls(false)} flex items-center gap-2 bg-surface-container cursor-not-allowed opacity-80`}>
                    <span className="material-symbols-outlined text-primary text-sm">favorite</span>
                    <span className="font-medium">{head?.gender === 'MALE' ? 'Vợ' : 'Chồng'}</span>
                    <span className="material-symbols-outlined text-muted text-sm ml-auto">lock</span>
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      value={formData.relationship_to_head}
                      onChange={(e) => {
                      const rel = e.target.value;
                      setFormData(p => ({
                        ...p,
                        relationship_to_head: rel,
                        // Reset non-catholic flag when switching away from SPOUSE
                        is_non_catholic: rel === 'SPOUSE' ? p.is_non_catholic : false,
                        christian_name: rel === 'SPOUSE' && p.is_non_catholic ? '' : p.christian_name,
                      }));
                    }}
                      disabled={isSubmitting}
                      className={`${getInputCls(isSubmitting)} appearance-none pr-10`}
                    >
                      {!hideChildOption && <option value="CHILD">Con cái</option>}
                      {!hideSpouseOption && <option value="SPOUSE">Vợ/Chồng</option>}
                      <option value="PARENT">Cha mẹ</option>
                      <option value="GRANDCHILD">Cháu</option>
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#78716C] text-lg pointer-events-none">expand_more</span>
                  </div>
                )}
                {formData.relationship_to_head === 'PARENT' && (
                  <p className="flex items-start gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2 mt-1 font-body">
                    <span className="material-symbols-outlined text-sm flex-shrink-0 mt-0.5">info</span>
                    <span>Chỉ thêm <strong>Cha/Mẹ</strong> vào hộ này nếu họ không có sổ hộ giáo riêng. Nếu có, hãy dùng tính năng “Tìm giáo dân có sẵn” để gắn kết quan hệ.</span>
                  </p>
                )}
                {formData.relationship_to_head === 'GRANDCHILD' && (
                  <p className="flex items-start gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2 mt-1 font-body">
                    <span className="material-symbols-outlined text-sm flex-shrink-0 mt-0.5">info</span>
                    <span>Chỉ thêm <strong>Cháu</strong> vào hộ này nếu cha mẹ cháu chưa có sổ hộ giáo. Nếu có, hãy thêm <strong>Cháu</strong> vào sổ đó.</span>
                  </p>
                )}
              </div>
            )}
          </div>

          <GenderSelect
            value={formData.gender}
            onChange={(g) => { set('gender', g); if (errors.gender) setErrors(p => ({ ...p, gender: undefined })); }}
            disabled={isSubmitting || formData.relationship_to_head === 'SPOUSE'}
            required
            error={errors.gender}
            className="mt-6"
          />
          {formData.relationship_to_head === 'SPOUSE' && (
            <p className="mt-1 text-xs text-muted-foreground font-body">
              * Giới tính được xác định tự động theo phối ngẫu của Chủ hộ.
            </p>
          )}

          {formData.relationship_to_head === 'SPOUSE' && (
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
          )}
        </div>
      )}

      {formData.relationship_to_head === 'SPOUSE' && head && !formData.existing_parishioner_id && (
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

      {/* ── SECTION: FAMILY (Genealogy) ── */}
      <div className="bg-surface border border-[#E7E5E4] rounded p-6">
        <SectionHeader
          icon="family_restroom"
          title="Thân phụ và Thân mẫu"
          subtitle="Thông tin cha mẹ ruột của thành viên đang thêm."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {formData.relationship_to_head === 'SPOUSE' ? (
          <div className="md:col-span-2">
            <TypeaheadInput
              label="Hộ giáo của Phụ mẫu (Hộ gốc)"
              value={formData.origin_household_id}
              displayText={originText}
              onDisplayTextChange={setOriginText}
              onSelect={handleSelectHousehold}
              onClear={() => {
                set('origin_household_id', '');
                set('father_id', '');
                set('mother_id', '');
              }}
              fetchUrl={householdFetchUrl}
              mapResult={mapHouseholdResult}
              placeholder="Nhập mã hộ hoặc tên chủ hộ của gia đình cha mẹ..."
              disabled={isSubmitting}
            />
            <p className="mt-2 text-[10px] text-[#78716C] italic font-body">
              * Hệ thống sẽ tự động liên kết thành viên này là con cái trong hộ giáo được chọn.
            </p>
          </div>
        ) : (
          <>
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
                fetchUrl={parishionerFetchUrlAll}
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
                fetchUrl={parishionerFetchUrlAll}
                mapResult={mapParishioner}
                placeholder="Tìm kiếm giáo dân nữ..."
                disabled={isSubmitting}
                gender="FEMALE"
              />
            )}
          </>
        )}
        </div>
      </div>

      {!formData.existing_parishioner_id && (
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
      )}

      {/* SUBMIT BUTTONS */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-6 border-t border-[#E7E5E4]">
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
              <span>Lưu thông tin</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
