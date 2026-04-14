"use client";

import { useState } from 'react';
import { ParishGroupDetail } from '@/types/parish-group';
import { useAddParishGroupMember, useUpdateParishGroupMember, useRemoveParishGroupMember } from '../../queries/useParishGroupMutations';
import { ParishionerSearchCombobox } from '@/components/ui/ParishionerSearchCombobox';
import { formatDate } from '@/lib/utils';
import { UserPlus, Star, Edit2, Trash2, Check, X, Calendar, Users } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  group: ParishGroupDetail;
  canEdit: boolean;
}

export function MembersTable({ group, canEdit }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [newMemberId, setNewMemberId] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState('');

  const addMutation = useAddParishGroupMember(group.id);
  const updateMutation = useUpdateParishGroupMember(group.id, editingId || '');
  const removeMutation = useRemoveParishGroupMember(group.id);

  const handleAddSubmit = async () => {
    if (!newMemberId) {
      toast.error('Vui lòng chọn một giáo dân');
      return;
    }
    try {
      await addMutation.mutateAsync({ parishioner_id: newMemberId, role: newMemberRole || 'Thành viên' });
      toast.success('Đã thêm thành viên');
      setIsAdding(false);
      setNewMemberId('');
      setNewMemberRole('');
    } catch (err: unknown) {
      if ((err as { status?: number }).status === 409) {
        toast.error('Giáo dân này đã là thành viên');
      } else {
        toast.error((err as Error).message || 'Lỗi khi thêm thành viên');
      }
    }
  };

  const startEdit = (membershipId: string, currentRole: string | null) => {
    setEditingId(membershipId);
    setEditRole(currentRole || '');
  };

  const handleUpdateRole = async () => {
    if (!editingId) return;
    try {
      await updateMutation.mutateAsync({ role: editRole || 'Thành viên' });
      toast.success('Đã cập nhật chức vụ');
      setEditingId(null);
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Lỗi cập nhật chức vụ');
    }
  };

  const handleRemove = async (membershipId: string, isLeader: boolean) => {
    const msg = isLeader 
      ? 'Giáo dân này đang là TRƯỞNG NHÓM. Xóa thành viên này sẽ gỡ bỏ chức trưởng nhóm. Ban có chắc chắn muốn xóa không?'
      : 'Bạn có chắc chắn muốn xóa thành viên này khỏi hội đoàn?';
    
    if (confirm(msg)) {
      try {
        await removeMutation.mutateAsync(membershipId);
        toast.success('Đã xóa thành viên');
      } catch (err: unknown) {
        toast.error((err as Error).message || 'Lỗi khi xóa thành viên');
      }
    }
  };

  return (
    <div className="bg-surface rounded-2xl border border-outline overflow-hidden shadow-sm flex flex-col h-full">
      <div className="p-4 md:p-6 border-b border-outline bg-surface flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-display font-bold text-on-surface">Danh sách thành viên</h2>
          <p className="text-sm text-on-surface-variant font-body mt-0.5">
            Tổng số {group.members.length} thành viên đang tham gia hội đoàn này
          </p>
        </div>
        
        {canEdit && !isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm shadow-primary/20 transition-all hover:translate-y-[-1px] active:translate-y-[0px] min-h-[48px] w-full md:w-auto"
          >
            <UserPlus className="w-4 h-4" />
            Thêm thành viên mới
          </button>
        )}
      </div>

      {isAdding && (
        <div className="p-6 md:p-8 border-b border-outline bg-primary/5 space-y-6 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-bold text-on-surface">Ghi danh thành viên mới</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant ml-1">
                Tìm kiếm giáo dân
              </label>
              <ParishionerSearchCombobox label="" placeholder="Tìm tên hoặc mã giáo dân..." value={newMemberId} onChange={(id) => setNewMemberId(id || '')} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant ml-1">
                Chức vụ / Vai trò
              </label>
              <input
                type="text"
                placeholder="VD: Ca trưởng, Thủ quỹ..."
                value={newMemberRole}
                onChange={(e) => setNewMemberRole(e.target.value)}
                className="block w-full px-4 py-3 border border-outline rounded-xl bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[48px] shadow-sm"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
            <button
              onClick={() => setIsAdding(false)}
              className="px-6 h-12 rounded-xl font-bold text-on-surface-variant border border-outline bg-surface hover:bg-surface-variant hover:text-on-surface transition-all active:scale-95 w-full sm:w-auto"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleAddSubmit}
              disabled={addMutation.isPending}
              className="px-8 h-12 rounded-xl font-bold bg-primary hover:shadow-lg hover:shadow-primary/20 text-white disabled:opacity-50 transition-all w-full sm:w-auto"
            >
              Lưu thành viên
            </button>
          </div>
        </div>
      )}

      {/* List content with scroll container */}
      <div className="flex-1 overflow-x-auto">
        {/* Mobile view (< 1024px) */}
        <div className="lg:hidden p-4 space-y-4">
          {group.members.map((m) => {
            const isLeader = group.leader?.id === m.parishioner.id;
            return (
              <div key={m.id} className={`p-5 rounded-2xl border transition-all ${isLeader ? 'border-primary bg-primary/5 ring-1 ring-primary/20 shadow-md' : 'border-outline bg-surface hover:shadow-sm'} flex flex-col gap-4 relative overflow-hidden group/card`}>
                {isLeader && (
                  <div className="absolute top-0 right-0 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-bl-2xl flex items-center gap-1.5 shadow-sm">
                    <Star className="w-3 h-3 fill-current" />
                    Trưởng nhóm
                  </div>
                )}
                
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border-2 ${isLeader ? 'bg-primary text-white border-primary' : 'bg-surface-variant/50 text-on-surface-variant border-outline/50 font-bold'}`}>
                    {m.parishioner.christian_name?.[0] || m.parishioner.full_name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-on-surface text-lg leading-tight truncate">
                      {m.parishioner.christian_name ? `${m.parishioner.christian_name} ` : ''}
                      {m.parishioner.full_name}
                    </p>
                    <p className="text-xs text-on-surface-variant font-medium mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3 opacity-60" />
                      Gia nhập: {m.joined_at ? formatDate(m.joined_at) : 'Chưa cập nhật'}
                    </p>
                  </div>
                </div>

                {editingId === m.id ? (
                  <div className="flex items-center gap-2 mt-2 p-1 bg-surface-variant/20 rounded-xl border border-outline/30 animate-in fade-in duration-200">
                    <input
                      type="text"
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                      className="flex-1 px-3 py-2 border border-outline rounded-lg text-sm bg-surface min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="Chức vụ..."
                      autoFocus
                    />
                    <div className="flex gap-1">
                      <button onClick={handleUpdateRole} className="p-2.5 bg-primary text-white rounded-lg transition-transform active:scale-90">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditingId(null)} className="p-2.5 bg-surface border border-outline text-on-surface rounded-lg">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between border-t border-outline/30 pt-4 mt-1">
                    <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${isLeader ? 'bg-primary/20 text-primary' : 'bg-surface-variant text-on-surface-variant'}`}>
                      {m.role || 'Thành viên'}
                    </div>
                    
                    {canEdit && (
                      <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover/card:opacity-100 transition-opacity">
                        <button 
                          onClick={() => startEdit(m.id, m.role)} 
                          className="p-3 text-primary hover:bg-primary/10 rounded-xl transition-all border border-transparent active:scale-95"
                          title="Sửa chức danh"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleRemove(m.id, isLeader)} 
                          className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent active:scale-95"
                          title="Xóa thành viên"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {group.members.length === 0 && (
            <div className="text-center py-16 px-4">
              <div className="w-16 h-16 bg-surface-variant/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-on-surface-variant/40" />
              </div>
              <h4 className="font-bold text-on-surface">Chưa có thành viên</h4>
              <p className="text-sm text-on-surface-variant mt-1 max-w-[240px] mx-auto">
                Bắt đầu xây dựng hội đoàn bằng cách thêm thành viên đầu tiên.
              </p>
            </div>
          )}
        </div>

        {/* Desktop view (>= 1024px) */}
        <div className="hidden lg:block">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-variant/20 border-b border-outline">
                <th className="py-5 px-6 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] w-[40%]">Họ và tên</th>
                <th className="py-5 px-6 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Chức vụ / Vai trò</th>
                <th className="py-5 px-6 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Ngày gia nhập</th>
                {canEdit && <th className="py-5 px-6 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] text-right">Hành động</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline/50">
              {group.members.map((m) => {
                const isLeader = group.leader?.id === m.parishioner.id;
                return (
                  <tr key={m.id} className={`group/row transition-all ${isLeader ? 'bg-primary/[0.03]' : 'hover:bg-surface-variant/20'}`}>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-sm shrink-0 shadow-sm transition-transform group-hover/row:scale-105 ${isLeader ? 'bg-primary text-white border-primary shadow-primary/20' : 'bg-surface border-outline/50 text-on-surface-variant'}`}>
                          {m.parishioner.christian_name?.[0] || m.parishioner.full_name[0]}
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-on-surface group-hover/row:text-primary transition-colors">
                              {m.parishioner.christian_name ? `${m.parishioner.christian_name} ` : ''}
                              {m.parishioner.full_name}
                            </span>
                            {isLeader && (
                              <span className="inline-flex items-center gap-1 bg-primary text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shadow-sm">
                                <Star className="w-2.5 h-2.5 fill-current" /> Leader
                              </span>
                            )}
                          </div>
                          {isLeader && <span className="text-[10px] text-primary font-medium uppercase tracking-tighter">Trưởng ban quản trị</span>}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {editingId === m.id ? (
                        <div className="flex items-center gap-2 animate-in fade-in duration-200">
                          <input
                            type="text"
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value)}
                            className="px-3 py-1.5 border border-outline rounded-lg text-sm bg-surface w-40 focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none shadow-sm transition-all"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleUpdateRole()}
                          />
                          <div className="flex gap-1">
                            <button onClick={handleUpdateRole} className="p-1.5 bg-primary text-white rounded-md hover:shadow-md transition-all shadow-sm">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => setEditingId(null)} className="p-1.5 bg-surface border border-outline text-on-surface rounded-md hover:bg-surface-variant">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className={`inline-flex items-center px-4 py-1 rounded-full text-[11px] font-black uppercase tracking-wider transition-colors ${isLeader ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-surface-variant/50 text-on-surface-variant border border-transparent'}`}>
                          {m.role || 'Thành viên'}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-on-surface-variant text-sm font-medium">
                      {m.joined_at ? (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 opacity-40 text-on-surface-variant" />
                          {formatDate(m.joined_at)}
                        </div>
                      ) : (
                        <span className="opacity-30 italic">Chưa rõ</span>
                      )}
                    </td>
                    {canEdit && (
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
                          <button
                            onClick={() => startEdit(m.id, m.role)}
                            className="p-3 text-primary hover:bg-primary/5 rounded-xl transition-all active:scale-90"
                            title="Chỉnh sửa chức vụ"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRemove(m.id, isLeader)}
                            className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                            title="Xóa ra khỏi nhóm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
              {group.members.length === 0 && (
                <tr>
                  <td colSpan={canEdit ? 4 : 3} className="py-24 text-center">
                    <div className="flex flex-col items-center">
                       <div className="w-20 h-20 bg-surface-variant/20 rounded-full flex items-center justify-center mb-4">
                        <Users className="w-10 h-10 text-on-surface-variant/20" />
                       </div>
                       <p className="text-on-surface-variant font-medium">Hội đoàn hiện chưa có thành viên nào.</p>
                       {canEdit && (
                         <button 
                           onClick={() => setIsAdding(true)}
                           className="text-primary font-bold text-sm mt-2 hover:underline"
                         >
                           + Thêm thành viên ngay
                         </button>
                       )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
