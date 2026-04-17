'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Save, 
  MapPin, 
  AlertCircle,
  Loader2,
  Info
} from 'lucide-react';
import Link from 'next/link';
import { useZones } from '@/components/providers/zones-provider';
import { SaintNameSelect } from '@/components/dashboard/shared/SaintNameSelect';
import { FieldLabel, SectionHeader, getInputCls } from '@/components/dashboard/shared/FormPrimitives';
import { GenderSelect } from '@/components/dashboard/shared/GenderSelect';
import { DatePicker } from '@/components/dashboard/shared/DatePicker';
import { useCreateHousehold } from '../queries/useHouseholdMutations';
// import { ParishionerLookup } from '@/types/parishioner';
import { useCallback, useEffect, useRef } from 'react';

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
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
           <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </span>
        <input
          type="text"
          value={displayText}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`${getInputCls(disabled, !!error)} pl-11 pr-10`}
        />
        {value && (
          <button
            type="button"
            onClick={() => { onClear(); onDisplayTextChange(''); setResults([]); setOpen(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sacred-crimson transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

      {/* Dropdown */}
      {open && displayText && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded shadow-xl z-[100] max-h-52 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-sm text-slate-500">Đang tìm kiếm...</div>
          ) : results.length > 0 ? (
            <ul>
              {results.map((r) => (
                <li
                  key={r.id}
                  onClick={() => { onSelect(r); onDisplayTextChange(r.label); setOpen(false); }}
                  className="px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-start justify-between gap-2 border-b border-slate-100 last:border-0 transition-colors"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{r.label}</p>
                    {r.sub && <p className="text-xs text-slate-500">{r.sub}</p>}
                  </div>
                  <svg className="text-slate-300 shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-sm text-slate-500 italic">Không tìm thấy kết quả</div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AddHouseholdPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const { zones } = useZones();
  const createHousehold = useCreateHousehold();

  const [showOptional, setShowOptional] = useState(false);
  const [showHeadOptional, setShowHeadOptional] = useState(false);

  const [formData, setFormData] = useState({
    // Household Info
    household_code: '',
    address: '',
    zone_id: '',
    book_issue_date: '',
    physical_book_no: '',
    marital_status: 'MARRIED',
    pastoral_notes: '',
    
    // Head of Household Info (Parishioner)
    christian_name: '',
    full_name: '',
    nick_name: '',
    gender: 'MALE',
    birth_date: '',
    father_id: '',
    mother_id: '',
    origin_household_id: '',
  });

  const [originHouseholdText, setOriginHouseholdText] = useState('');

  const householdFetchUrl = (q: string) =>
    `/api/v1/households?search=${encodeURIComponent(q)}&limit=8`;

  const mapHouseholdResult = (h: {
    id: string;
    household_code: string;
    head?: { id: string; full_name: string; gender: string };
    spouse?: { id: string; gender: string };
  }): TypeaheadResult => ({
    id: h.id,
    label: `Hộ giáo: ${h.household_code}`,
    sub: h.head ? `Chủ hộ: ${h.head.full_name}` : 'Không rõ chủ hộ',
    meta: {
      head: h.head,
      spouse: h.spouse
    }
  });

  const handleSelectHousehold = (item: TypeaheadResult) => {
    const meta = item.meta as { 
      head?: { id: string; gender: string }; 
      spouse?: { id: string; gender: string }; 
    } | undefined;
    
    const head = meta?.head;
    const spouse = meta?.spouse;
    
    let fId = '';
    let mId = '';
    
    if (head?.gender === 'MALE') fId = head.id;
    else if (head?.gender === 'FEMALE') mId = head.id;
    
    if (spouse?.gender === 'MALE') fId = spouse.id;
    else if (spouse?.gender === 'FEMALE') mId = spouse.id;
    
    setFormData(p => ({
      ...p,
      origin_household_id: item.id,
      father_id: fId,
      mother_id: mId
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // Create Household and Head in a single atomic request
      const payload = {
          household_code: formData.household_code,
          address: formData.address,
          zone_id: formData.zone_id || undefined,
          book_issue_date: formData.book_issue_date || undefined,
          physical_book_no: formData.physical_book_no || undefined,
          marital_status: formData.marital_status,
          pastoral_notes: formData.pastoral_notes || undefined,
          // Nested head data for atomic creation
          head: {
            christian_name: formData.christian_name,
            full_name: formData.full_name,
            nick_name: formData.nick_name || undefined,
            gender: formData.gender,
            birth_date: formData.birth_date,
            father_id: formData.father_id || undefined,
            mother_id: formData.mother_id || undefined,
            origin_household_id: formData.origin_household_id || undefined,
          }
      };

      const result = await createHousehold.mutateAsync(payload);

      // Success! Redirect to household detail
      // Note: apiFetch wrapper returns the 'data' field of the response, so result IS the data object if successful, or it contains the id.
      // E.g., result.id
      const newId = result.id;
      router.push(`/dashboard/households/${newId}`);
      
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message);
    }
  };

  const isSubmitting = createHousehold.isPending;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <div className="mb-8">
        <Link 
          href="/dashboard/households"
          className="inline-flex items-center text-sm text-slate-500 hover:text-sacred-crimson transition-colors mb-4 group"
        >
          <ArrowLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" />
          Quay lại danh sách hộ giáo
        </Link>
        <h1 className="text-4xl font-serif font-bold text-slate-900 tracking-tight">
          Thiết Lập Hộ Giáo Mới
        </h1>

      </div>

      <form onSubmit={handleSubmit} className="space-y-8 pb-20">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
            <p className="text-sm text-red-800 font-medium">{error}</p>
          </div>
        )}

        {/* SECTION: HOUSEHOLD */}
        <section className="bg-white rounded shadow-sm border border-slate-200">

          <SectionHeader
            icon="home"
            title="Thông Tin Hộ Giáo"
            className="px-6 pt-6"
          />
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-1.5">
              <FieldLabel required>Mã Hộ Giáo</FieldLabel>
              <input 
                type="text"
                name="household_code"
                required
                placeholder="Ví dụ: HG-001"
                value={formData.household_code}
                onChange={handleChange}
                className={getInputCls(isSubmitting)}
              />
            </div>

            {zones.length > 0 && (
              <div className="space-y-1.5">
                <FieldLabel required>Giáo Khu</FieldLabel>
                <div className="relative">
                  <select 
                    name="zone_id"
                    required
                    value={formData.zone_id}
                    onChange={handleChange}
                    className={getInputCls(isSubmitting) + " appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1em_1em] pr-10"}
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7' /%3E%3C/svg%3E")` }}
                  >
                    <option value="">-- Chọn Giáo Khu --</option>
                    {zones.map((zone: { id: string; name: string }) => (
                      <option key={zone.id} value={zone.id}>{zone.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <FieldLabel required>Tình Trạng Hôn Phối</FieldLabel>
              <div className="relative">
                <select 
                  name="marital_status"
                  required
                  value={formData.marital_status}
                  onChange={handleChange}
                  className={getInputCls(isSubmitting) + " appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1em_1em] pr-10"}
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7' /%3E%3C/svg%3E")` }}
                >
                  <option value="MARRIED">Đã kết hôn</option>
                  <option value="MIXED_RELIGION">Kết hôn khác đạo (Phép chuẩn)</option>
                  <option value="IRREGULAR">Hôn nhân ngăn trở (Nguội lạnh)</option>
                  <option value="SEPARATED">Ly thân / Ly dị</option>
                  <option value="WIDOWED">Góa</option>
                </select>
              </div>
            </div>
            <DatePicker
              label="Ngày Cấp Sổ"
              value={formData.book_issue_date}
              onChange={(val) => setFormData(p => ({ ...p, book_issue_date: val }))}
              disabled={isSubmitting}
              max={new Date().toLocaleDateString('en-CA')}
            />

            <div className="space-y-1.5">
              <FieldLabel>Số Quyển / Số Thứ Tự</FieldLabel>
              <input 
                type="text"
                name="physical_book_no"
                placeholder="Ví dụ: Q-05, STT-123"
                value={formData.physical_book_no}
                onChange={handleChange}
                className={getInputCls(isSubmitting)}
              />
            </div>

            <div className="md:col-span-2 pt-2">
              <button
                type="button"
                onClick={() => setShowOptional(!showOptional)}
                className="flex items-center text-sm font-bold text-sacred-crimson hover:text-red-800 transition-colors"
              >
                <span className="mr-2 h-5 w-5 bg-sacred-crimson/10 rounded-full flex items-center justify-center font-serif">
                  {showOptional ? '−' : '+'}
                </span>
                {showOptional ? 'Ẩn bớt các trường không bắt buộc' : 'Hiển thị thêm các thông tin bổ sung (Địa chỉ, Ghi chú...)'}
              </button>
            </div>

            {showOptional && (
              <>
                <div className="space-y-1.5 md:col-span-2">
                  <FieldLabel>Địa Chỉ Cư Trú</FieldLabel>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                    <textarea 
                      name="address"
                      rows={2}
                      placeholder="Số nhà, đường, giáo họ..."
                      value={formData.address}
                      onChange={handleChange}
                      className={getInputCls(isSubmitting) + " pl-12"}
                    />
                  </div>
                </div>



                <div className="space-y-1.5 md:col-span-2">
                  <FieldLabel>Ghi Chú Mục Vụ</FieldLabel>
                  <textarea 
                    name="pastoral_notes"
                    rows={3}
                    placeholder="Các thông tin lưu ý khác về hộ gia đình..."
                    value={formData.pastoral_notes}
                    onChange={handleChange}
                    className={getInputCls(isSubmitting)}
                  />
                </div>
              </>
            )}
          </div>
        </section>

        {/* SECTION: HEAD OF HOUSEHOLD */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200">

          <SectionHeader
            icon="person"
            title="Thông Tin Chủ Hộ"
            className="px-6 pt-6"
          />
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <SaintNameSelect
              value={formData.christian_name}
              onChange={(val) => setFormData(p => ({ ...p, christian_name: val }))}
              gender={formData.gender}
              disabled={isSubmitting}
              required
            />

            <div className="space-y-1.5">
              <FieldLabel required>Họ và Tên</FieldLabel>
              <input 
                type="text"
                name="full_name"
                required
                placeholder="Họ tên đầy đủ"
                value={formData.full_name}
                onChange={handleChange}
                className={getInputCls(isSubmitting)}
              />
            </div>

            <GenderSelect
              value={formData.gender}
              onChange={(g) => setFormData(p => ({...p, gender: g}))}
              disabled={isSubmitting}
              variant="toggle"
              label="Giới Tính"
            />

            <DatePicker
              label="Ngày Sinh"
              required
              value={formData.birth_date}
              onChange={(val) => setFormData(p => ({ ...p, birth_date: val }))}
              disabled={isSubmitting}
              max={new Date().toLocaleDateString('en-CA')}
            />

            <div className="md:col-span-2 pt-2">
              <button
                type="button"
                onClick={() => setShowHeadOptional(!showHeadOptional)}
                className="flex items-center text-sm font-bold text-sacred-gold hover:text-amber-700 transition-colors"
              >
                <span className="mr-2 h-5 w-5 bg-sacred-gold/10 rounded-full flex items-center justify-center font-serif text-sacred-gold">
                  {showHeadOptional ? '−' : '+'}
                </span>
                {showHeadOptional ? 'Ẩn bớt thông tin bổ sung' : 'Bổ sung Bí danh / Tên hiệu...'}
              </button>
            </div>

            {showHeadOptional && (
              <div className="space-y-1.5">
                <FieldLabel>Bí danh / Tên gọi ở nhà</FieldLabel>
                <input 
                  type="text"
                  name="nick_name"
                  placeholder="Bé Tí, Út, v.v..."
                  value={formData.nick_name}
                  onChange={handleChange}
                  className={getInputCls(isSubmitting)}
                />
              </div>
            )}

            {/* PARENT SELECTION (Genealogy) */}
            <div className="md:col-span-2 pt-6 border-t border-slate-100">
              <SectionHeader
                icon="family_history"
                title="Thân Phụ & Thân Mẫu (Hộ Gốc)"
              />
              <div className="mt-4">
                <TypeaheadInput
                  label="Hộ Giáo Của Phụ Mẫu"
                  value={formData.origin_household_id}
                  displayText={originHouseholdText}
                  onDisplayTextChange={setOriginHouseholdText}
                  onSelect={handleSelectHousehold}
                  onClear={() => {
                    setFormData(p => ({
                      ...p,
                      origin_household_id: '',
                      father_id: '',
                      mother_id: ''
                    }));
                  }}
                  fetchUrl={householdFetchUrl}
                  mapResult={mapHouseholdResult}
                  placeholder="Nhập mã hộ hoặc tên chủ hộ của gia đình cha mẹ..."
                  disabled={isSubmitting}
                />
                <p className="mt-2 text-[10px] text-slate-500 italic">
                  * Hệ thống sẽ tự động nhận diện Cha/Mẹ từ hộ giáo được chọn để liên kết gia phả.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SUBMIT BUTTONS */}
        {/* SUBMIT BUTTONS */}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-md border-t border-slate-200 flex items-center justify-center space-x-6 z-50 md:relative md:bg-transparent md:border-none md:p-0 md:justify-end">
          <Link 
            href="/dashboard/households"
            className="px-8 py-3 rounded-sm border-2 border-slate-300 text-slate-700 font-bold hover:bg-slate-50 transition-all active:scale-[0.98]"
          >
            Hủy Bỏ
          </Link>
          <button 
            type="submit"
            disabled={isSubmitting}
            className={`
              flex items-center px-10 py-3.5 rounded-sm font-bold text-white shadow-xl transition-all
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

      <div className="mt-8 p-6 bg-blue-50/50 rounded border border-blue-100 flex items-start">
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
