'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Trash2, Printer, Plus, CheckCircle2 } from 'lucide-react';
import { ParishionerSearchCombobox } from '@/components/ui/ParishionerSearchCombobox';
import { PriestDropdown } from '@/components/ui/PriestDropdown';
import { HouseholdSearchCombobox } from '@/components/ui/HouseholdSearchCombobox';
import { SaintNameSelect } from '@/components/dashboard/shared/SaintNameSelect';
import { FieldLabel, FieldError, SectionHeader, getInputCls } from '@/components/dashboard/shared/FormPrimitives';
import { GenderSelect } from '@/components/dashboard/shared/GenderSelect';
import { useBatchCreateSacraments } from '../../queries/useSacramentMutations';

interface GeneralInfo {
  date: string;
  place: string;
  minister_id: string;
}

type SacramentType = 'BAPTISM' | 'EUCHARIST' | 'CONFIRMATION';

interface ParishionerPreview {
  id: string;
  christian_name: string | null;
  full_name: string;
  birth_date: string | null;
}

interface BaseTempParticipant {
  tempId: string;
  godparentBase: string; // just to share godparent display
}

interface TempBaptism extends BaseTempParticipant {
  christian_name: string;
  full_name: string;
  gender: 'MALE' | 'FEMALE';
  birth_date: string;
  father_id: string;
  mother_id: string;
  household_id: string;
  godparent_name: string;

  // for display
  father_name?: string;
  mother_name?: string;
}

interface TempStandard extends BaseTempParticipant {
  parishioner_id: string;
  godparent_name: string;

  // for display
  christian_name?: string;
  full_name?: string;
  birth_date?: string;
  father_name?: string;
  mother_name?: string;
}

export function BatchSacramentClient() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SacramentType>('BAPTISM');

  const [generalInfo, setGeneralInfo] = useState<GeneralInfo>({
    date: new Date().toISOString().substring(0, 10),
    place: 'Tại Giáo xứ',
    minister_id: '',
  });

  // Array of mixed templates but we only use one type strictly depending on activeTab
  const [participants, setParticipants] = useState<(TempBaptism | TempStandard)[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // -- Forms states --
  // Baptism fields
  const [bHouseholdId, setBHouseholdId] = useState('');
  const [bFatherId, setBFatherId] = useState('');
  const [bFatherName, setBFatherName] = useState('');
  const [bMotherId, setBMotherId] = useState('');
  const [bMotherName, setBMotherName] = useState('');
  const [bChristianName, setBChristianName] = useState('');
  const [bFullName, setBFullName] = useState('');
  const [bGender, setBGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [bBirthDate, setBBirthDate] = useState('');
  const [bGodparent, setBGodparent] = useState('');

  // Standard fields
  const [sParishionerId, setSParishionerId] = useState('');
  const [sParishionerData, setSParishionerData] = useState<ParishionerPreview | null>(null);
  const [sGodparent, setSGodparent] = useState('');

  // ── Handlers ──

  const clearBaptismForm = () => {
    setBHouseholdId('');
    setBFatherId('');
    setBFatherName('');
    setBMotherId('');
    setBMotherName('');
    setBChristianName('');
    setBFullName('');
    setBGender('MALE');
    setBBirthDate('');
    setBGodparent('');
  };

  const clearStandardForm = () => {
    setSParishionerId('');
    setSParishionerData(null);
    setSGodparent('');
  };

  const handleTabChange = (type: SacramentType) => {
    if (participants.length > 0) {
      if (!window.confirm('Chuyển qua loại bí tích khác sẽ xóa danh sách đang nhập. Tiếp tục?')) return;
    }
    setActiveTab(type);
    setParticipants([]);
    clearBaptismForm();
    clearStandardForm();
  };

  const handleAddBaptism = () => {
    if (!bFullName.trim()) return toast.error('Vui lòng nhập Họ và Tên khai sinh.');
    if (!bBirthDate) return toast.error('Vui lòng nhập Ngày sinh.');

    const newRow: TempBaptism = {
      tempId: Date.now().toString(),
      christian_name: bChristianName,
      full_name: bFullName,
      gender: bGender,
      birth_date: bBirthDate,
      father_id: bFatherId,
      mother_id: bMotherId,
      household_id: bHouseholdId,
      godparent_name: bGodparent,
      father_name: bFatherName,
      mother_name: bMotherName,
      godparentBase: bGodparent,
    };
    setParticipants([...participants, newRow]);
    // Optionally keep household, father, mother if same family. Let's clear just child fields for speed
    setBChristianName('');
    setBFullName('');
    setBBirthDate('');
    setBGender('MALE');
    setBGodparent('');
  };

  const handleAddStandard = () => {
    if (!sParishionerId) return toast.error('Vui lòng chọn Người lãnh nhận.');

    // Check duplicate
    if (participants.some((p) => (p as TempStandard).parishioner_id === sParishionerId)) {
      return toast.error('Giáo dân này đã có trong danh sách chờ.');
    }

    const newRow: TempStandard = {
      tempId: Date.now().toString(),
      parishioner_id: sParishionerId,
      godparent_name: sGodparent,
      christian_name: sParishionerData?.christian_name || '',
      full_name: sParishionerData?.full_name || '',
      birth_date: sParishionerData?.birth_date || '',
      godparentBase: sGodparent,
    };
    setParticipants([...participants, newRow]);
    clearStandardForm();
  };

  const removeRow = (tempId: string) => {
    setParticipants(p => p.filter(x => x.tempId !== tempId));
  };

  const batchMutation = useBatchCreateSacraments();

  const handleSubmitBatch = async () => {
    if (participants.length === 0) return toast.error('Danh sách trống!');
    if (!generalInfo.date) return toast.error('Vui lòng chọn Ngày cử hành.');
    if (!generalInfo.minister_id) return toast.error('Vui lòng chọn Linh mục cử hành.');
    
    setIsSubmitting(true);
    try {
      let endpoint = '';
      let payload: Record<string, unknown> = {};

      if (activeTab === 'BAPTISM') {
        endpoint = '/api/v1/sacraments/batch-baptism';
        payload = {
          date: generalInfo.date,
          place: generalInfo.place,
          minister_id: generalInfo.minister_id,
          participants: participants.map((p) => {
            const item = p as TempBaptism;
            return {
              christian_name: item.christian_name || null,
              full_name: item.full_name,
              gender: item.gender,
              birth_date: item.birth_date,
              father_id: item.father_id || null,
              mother_id: item.mother_id || null,
              household_id: item.household_id || null,
              godparent_name: item.godparent_name || null,
            };
          })
        };
      } else {
        endpoint = '/api/v1/sacraments/batch-eucharist';
        payload = {
          type: activeTab,
          date: generalInfo.date,
          place: generalInfo.place,
          minister_id: generalInfo.minister_id,
          participants: participants.map((p) => {
            const item = p as TempStandard;
            return {
              parishioner_id: item.parishioner_id,
              godparent_name: item.godparent_name || null,
            };
          })
        };
      }

      await batchMutation.mutateAsync({ endpoint, payload });

      toast.success(`Đã ghi nhận ${participants.length} hồ sơ thành công!`);
      router.push('/dashboard/sacraments');
    } catch (errValue: unknown) {
      const err = errValue as Error;
      toast.error(err.message || 'Lỗi hệ thống');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render ──

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-primary hover:bg-primary/10 p-2 rounded-full transition-colors flex items-center justify-center">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-[#1C1917] mb-1">
              Nhập Hàng Loạt
            </h1>
            <p className="text-[#78716C] font-body text-sm">Ghi nhận nhanh nhiều hồ sơ bí tích trong cùng một nghi lễ.</p>
          </div>
        </div>
        
        {/* TABS */}
        <div className="bg-surface border border-[#E7E5E4] p-1 rounded inline-flex">
          {(['BAPTISM', 'EUCHARIST', 'CONFIRMATION'] as SacramentType[]).map((t) => (
            <button
              key={t}
              onClick={() => handleTabChange(t)}
              className={`px-4 py-2 rounded text-sm font-bold font-body transition-all ${activeTab === t ? 'bg-primary text-white shadow-sm' : 'text-[#78716C] hover:text-[#1C1917]'}`}
            >
              {t === 'BAPTISM' ? 'Rửa Tội' : (t === 'EUCHARIST' ? 'Rước Lễ' : 'Thêm Sức')}
            </button>
          ))}
        </div>
      </div>

      {/* TOP CARD: GENERAL INFO */}
      <div className="bg-surface border border-[#E7E5E4] p-6 rounded shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 pt-6 pr-6">
          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded">
            BẢN NHÁP
          </span>
        </div>
        <h2 className="text-xl font-display font-bold text-[#1C1917] mb-6 border-b border-[#E7E5E4] pb-4">
          {activeTab === 'BAPTISM' ? 'Khóa Rửa Tội Trẻ Sơ Sinh' : (activeTab === 'EUCHARIST' ? 'Khóa Rước Lễ Lần Đầu' : 'Khóa Thêm Sức')}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <FieldLabel required>Ngày cử hành</FieldLabel>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#78716C] text-[18px]">calendar_today</span>
              <input type="date" value={generalInfo.date} onChange={e => setGeneralInfo({...generalInfo, date: e.target.value})} className={`${getInputCls(isSubmitting)} pl-10`} />
            </div>
          </div>
          <div>
            <FieldLabel required>Địa điểm cử hành</FieldLabel>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#78716C] text-[18px]">location_on</span>
              <input type="text" value={generalInfo.place} onChange={e => setGeneralInfo({...generalInfo, place: e.target.value})} className={`${getInputCls(isSubmitting)} pl-10`} placeholder="Ví dụ: Tại Giáo xứ" />
            </div>
          </div>
          <div>
             <PriestDropdown value={generalInfo.minister_id} onChange={val => setGeneralInfo({...generalInfo, minister_id: val || ''})} />
          </div>
        </div>
      </div>

      {/* TWO COLUMNS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COMPONENT */}
        <div className="lg:col-span-4 bg-surface rounded border border-[#E7E5E4] shadow-sm">
          <div className="p-4 border-b border-[#E7E5E4]">
             <SectionHeader icon="person_add" title="Thêm Thụ nhân mới" className="mb-0 border-b-0 pb-0" />
          </div>
          <div className="p-5 space-y-5">
            {activeTab === 'BAPTISM' ? (
               <>
                 {/* Household */}
                 <div>
                   <HouseholdSearchCombobox value={bHouseholdId} onChange={(id) => setBHouseholdId(id || '')} placeholder="Nhập mã hộ giáo (nếu có)" />
                 </div>

                 {/* Father & Mother */}
                 <div className="grid grid-cols-2 gap-3">
                   <div>
                     <ParishionerSearchCombobox label="Cha (Thân phụ)" value={bFatherId} onChange={(id, p) => { setBFatherId(id || ''); setBFatherName(p ? `${p.christian_name || ''} ${p.full_name}`.trim() : ''); }} placeholder="Tên cha..." />
                   </div>
                   <div>
                      <ParishionerSearchCombobox label="Mẹ (Thân mẫu)" value={bMotherId} onChange={(id, p) => { setBMotherId(id || ''); setBMotherName(p ? `${p.christian_name || ''} ${p.full_name}`.trim() : ''); }} placeholder="Tên mẹ..." />
                   </div>
                 </div>

                 <SaintNameSelect
                   value={bChristianName}
                   onChange={setBChristianName}
                   gender={bGender}
                   disabled={isSubmitting}
                   className="mb-1"
                 />
                 
                 {/* Full Name */}
                 <div className="space-y-1.5">
                    <FieldLabel required>Họ và tên khai sinh</FieldLabel>
                    <input type="text" value={bFullName} onChange={e => setBFullName(e.target.value)} placeholder="Nhập họ và tên..." className={getInputCls(isSubmitting)} />
                  </div>

                  {/* Gender & BirthDate */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-1">
                    <GenderSelect
                      value={bGender}
                      onChange={(g) => setBGender(g as 'MALE' | 'FEMALE')}
                      disabled={isSubmitting}
                      variant="toggle"
                      label="Giới tính"
                      required
                    />
                    <div className="flex-1">
                      <FieldLabel required>Ngày sinh</FieldLabel>
                      <input type="date" value={bBirthDate} onChange={e => setBBirthDate(e.target.value)} max={new Date().toISOString().substring(0,10)} className={`${getInputCls(isSubmitting)} py-[7px]`} />
                    </div>
                  </div>

                  {/* Godparent */}
                  <div className="space-y-1.5">
                    <FieldLabel>Người đỡ đầu</FieldLabel>
                    <input type="text" value={bGodparent} onChange={e => setBGodparent(e.target.value)} placeholder="Tên Thánh, Họ và Tên" className={getInputCls(isSubmitting)} />
                  </div>

                 {/* Add button */}
                 <button onClick={handleAddBaptism} className="w-full flex items-center justify-center gap-2 bg-primary text-white h-11 rounded font-bold hover:bg-primary/90 transition-colors">
                    <Plus className="w-5 h-5" /> Thêm vào danh sách
                 </button>
               </>
            ) : (
               <>
                  <div className="mb-4">
                     <p className="text-sm text-[#78716C] font-body mb-4">
                       Tìm kiếm giáo dân đã có hồ sơ để ghi nhận vào khóa bí tích này.
                     </p>
                     <ParishionerSearchCombobox 
                      value={sParishionerId} 
                      onChange={(id, p) => { 
                        setSParishionerId(id || ''); 
                        setSParishionerData(p as any || null); 
                      }} 
                    />
                  </div>

                  <div className="mb-6 space-y-1.5">
                    <FieldLabel>Người đỡ đầu (NẾU CÓ)</FieldLabel>
                    <input type="text" value={sGodparent} onChange={e => setSGodparent(e.target.value)} placeholder="Tên Thánh, Họ và Tên" className={getInputCls(isSubmitting)} />
                  </div>

                  <button onClick={handleAddStandard} className="w-full flex items-center justify-center gap-2 bg-primary text-white h-11 rounded font-bold hover:bg-primary/90 transition-colors">
                    <Plus className="w-5 h-5" /> Thêm vào danh sách
                  </button>
               </>
            )}
          </div>
        </div>

        {/* RIGHT COMPONENT */}
        <div className="lg:col-span-8 flex flex-col h-full space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E7E5E4]">
             <h3 className="font-display font-bold text-lg text-[#1C1917]">Danh sách chờ ghi sổ ({participants.length.toString().padStart(2, '0')})</h3>
             <div className="flex gap-2">
                <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold border border-[#E7E5E4] rounded hover:bg-[#F5F5F4] text-[#78716C] transition-colors"><Printer className="w-3.5 h-3.5" /> IN NHÁP</button>
                <button onClick={() => { if(window.confirm('Xóa toàn bộ danh sách?')) setParticipants([]); }} className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold border border-red-200 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"><Trash2 className="w-3.5 h-3.5" /> XÓA HẾT</button>
             </div>
          </div>

          <div className="flex-1 min-h-[400px] border border-[#E7E5E4] bg-surface rounded shadow-sm overflow-hidden flex flex-col">
             {participants.length === 0 ? (
               <div className="flex-1 flex flex-col items-center justify-center text-[#78716C] p-8">
                  <span className="material-symbols-outlined text-5xl opacity-20 mb-3">group_add</span>
                  <p className="font-body text-sm text-center max-w-sm">Danh sách hiện đang trống.<br/>Vui lòng sử dụng form bên trái để thêm thủ nhân vào khóa cử hành bí tích.</p>
               </div>
             ) : (
               <div className="overflow-x-auto h-full">
                 <table className="w-full text-left font-body text-sm whitespace-nowrap">
                   <thead className="bg-[#F5F5F4] text-[#78716C] text-[10px] uppercase tracking-widest border-b border-[#E7E5E4]">
                     <tr>
                       <th className="px-4 py-3 w-16 text-center text-xs">STT</th>
                       <th className="px-4 py-3 font-bold">Tên Thánh & Họ Tên</th>
                       <th className="px-4 py-3 font-bold">Ngày Sinh</th>
                       {activeTab === 'BAPTISM' && <th className="px-4 py-3 font-bold">Phụ Huynh</th>}
                       <th className="px-4 py-3 font-bold">Người Đỡ Đầu</th>
                       <th className="px-4 py-3 w-16"></th>
                     </tr>
                   </thead>
                   <tbody>
                     {participants.map((p, idx) => (
                       <tr key={p.tempId} className="border-b border-[#E7E5E4] last:border-0 hover:bg-[#F5F5F4]/50">
                         <td className="px-4 py-4 text-center text-[#A8A29E] font-medium">
                           {(idx + 1).toString().padStart(2, '0')}
                         </td>
                         <td className="px-4 py-4">
                           <div className="font-display font-medium text-[#1C1917] text-[15px]">
                             {activeTab === 'BAPTISM' ? (
                               <>
                                  <span className="text-primary">{p.christian_name || ''}</span>
                                  <div className="font-bold">{p.full_name}</div>
                               </>
                             ) : (
                               <>
                                  <span className="text-primary">{(p as TempStandard).christian_name || ''}</span>
                                  <div className="font-bold">{(p as TempStandard).full_name}</div>
                               </>
                             )}
                           </div>
                           {activeTab === 'BAPTISM' && (p as TempBaptism).gender && (
                             <span className="text-xs text-[#78716C]">
                               {(p as TempBaptism).gender === 'MALE' ? 'Nam' : 'Nữ'}
                             </span>
                           )}
                         </td>
                         <td className="px-4 py-4 text-[#78716C]">
                             {activeTab === 'BAPTISM' 
                               ? ((p as TempBaptism).birth_date ? new Date((p as TempBaptism).birth_date!).toLocaleDateString('vi-VN') : '')
                               : ((p as TempStandard).birth_date ? new Date((p as TempStandard).birth_date!).toLocaleDateString('vi-VN') : '')}
                         </td>
                         {activeTab === 'BAPTISM' && (
                           <td className="px-4 py-4">
                             <div className="text-xs space-y-1">
                               <div className="text-[#1C1917]">C: {(p as TempBaptism).father_name || '...'}</div>
                               <div className="text-[#78716C]">M: {(p as TempBaptism).mother_name || '...'}</div>
                             </div>
                           </td>
                         )}
                         <td className="px-4 py-4 text-[#1C1917]">
                           {p.godparentBase || ''}
                         </td>
                         <td className="px-4 py-4 text-center">
                           <button onClick={() => removeRow(p.tempId)} className="text-[#A8A29E] hover:text-red-500 transition-colors p-1 rounded-full"><Trash2 className="w-4 h-4" /></button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             )}
          </div>
          <div className="text-right text-[11px] italic text-[#A8A29E] font-body mt-2">
            * Dữ liệu hiện tại đang lưu ở trạng thái bản nháp. Vui lòng kiểm tra kỹ trước khi hoàn tất ghi vào Sổ Cái Giáo xứ.
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={handleSubmitBatch}
              disabled={isSubmitting || participants.length === 0}
              className="bg-primary text-white h-12 px-8 rounded font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-[15px]"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
              Hoàn tất & Ghi Sổ
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
