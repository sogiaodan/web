"use client";

import { useState } from 'react';
import { ParishGroupDetail } from '@/types/parish-group';
import { useAddParishGroupMember, useUpdateParishGroupMember, useRemoveParishGroupMember } from '../../queries/useParishGroupMutations';
import { ParishionerSearchCombobox } from '@/components/ui/ParishionerSearchCombobox';
import { formatDate } from '@/lib/utils';
import { UserPlus, Star, Edit2, Trash2, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

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
    } catch (err: any) {
      if (err.status === 409) {
        toast.error('Giáo dân này đã là thành viên');
      } else {
        toast.error(err.message || 'Lỗi khi thêm thành viên');
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
    } catch (err: any) {
      toast.error(err.message || 'Lỗi cập nhật chức vụ');
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
      } catch (err: any) {
        toast.error(err.message || 'Lỗi khi xóa thành viên');
      }
    }
  };

  return (
    <div className="bg-surface rounded-2xl border border-outline overflow-hidden">
      <div className="p-4 md:p-6 border-b border-outline flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-display font-bold text-on-surface">Danh sách thành viên</h2>
          <p className="text-sm text-on-surface-variant font-body">
            {group.members.length} thành viên đang tham gia
          </p>
        </div>
        
        {canEdit && !isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-on-primary px-4 py-2.5 rounded-xl font-bold transition-all min-h-[48px] w-full md:w-auto"
          >
            <UserPlus className="w-4 h-4" />
            Thêm thành viên
          </button>
        )}
      </div>

      {isAdding && (
        <div className="p-4 md:p-6 border-b border-outline bg-surface-variant/30 flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          <div className="w-full lg:flex-1 relative z-50">
            <label className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant mb-1 block">
              Tìm giáo dân
            </label>
            <ParishionerSearchCombobox value={newMemberId} onChange={setNewMemberId} />
          </div>
          <div className="w-full lg:w-64">
            <label className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant mb-1 block">
              Chức vụ (Tùy chọn)
            </label>
            <input
              type="text"
              placeholder="VD: Ca trưởng..."
              value={newMemberRole}
              onChange={(e) => setNewMemberRole(e.target.value)}
              className="block w-full px-3 py-3 border border-outline rounded-xl bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all min-h-[48px]"
            />
          </div>
          <div className="flex gap-2 w-full lg:w-auto self-end">
            <button
              onClick={() => setIsAdding(false)}
              className="flex-1 lg:flex-none px-4 py-3 rounded-xl font-bold text-on-surface-variant border border-outline hover:bg-surface-variant transition-colors min-h-[48px]"
            >
              Hủy
            </button>
            <button
              onClick={handleAddSubmit}
              disabled={addMutation.isPending}
              className="flex-1 lg:flex-none px-4 py-3 rounded-xl font-bold bg-primary hover:bg-primary/90 text-on-primary disabled:opacity-50 transition-colors min-h-[48px]"
            >
              Lưu
            </button>
          </div>
        </div>
      )}

      {/* Mobile view (< 1024px) */}
      <div className="lg:hidden p-4 space-y-4">
        {group.members.map((m) => {
          const isLeader = group.leader?.id === m.parishioner.id;
          return (
            <div key={m.id} className={`p-4 rounded-xl border ${isLeader ? 'border-primary/50 bg-primary/5' : 'border-outline bg-surface'} flex flex-col gap-3 relative`}>
              {isLeader && (
                <div className="absolute top-0 right-0 bg-primary text-on-primary text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-bl-xl rounded-tr-xl flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  Trưởng nhóm
                </div>
              )}
              
              <div>
                <p className="font-bold text-on-surface text-lg">
                  {m.parishioner.christian_name ? `${m.parishioner.christian_name} ` : ''}
                  {m.parishioner.full_name}
                </p>
                <p className="text-xs text-on-surface-variant mt-1">
                  Gia nhập: {m.joined_at ? formatDate(m.joined_at) : 'Chưa rõ'}
                </p>
              </div>

              {editingId === m.id ? (
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="text"
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="flex-1 px-3 py-2 border border-outline rounded-lg text-sm bg-background min-h-[48px]"
                    placeholder="Chức vụ..."
                  />
                  <button onClick={handleUpdateRole} className="p-3 bg-primary text-on-primary rounded-lg min-h-[48px] min-w-[48px] flex justify-center items-center">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => setEditingId(null)} className="p-3 bg-surface-variant text-on-surface rounded-lg min-h-[48px] min-w-[48px] flex justify-center items-center">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between border-t border-outline/50 pt-3 mt-1">
                  <div className="font-medium text-sm text-on-surface-variant bg-surface-variant px-3 py-1 rounded-full">
                    {m.role || 'Thành viên'}
                  </div>
                  
                  {canEdit && (
                    <div className="flex gap-1 border border-outline rounded-lg bg-surface">
                      <button onClick={() => startEdit(m.id, m.role)} className="p-3 text-primary hover:bg-surface-variant rounded-l-lg border-r border-outline min-h-[48px] min-w-[48px] flex justify-center items-center">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleRemove(m.id, isLeader)} className="p-3 text-red-600 hover:bg-red-50 rounded-r-lg min-h-[48px] min-w-[48px] flex justify-center items-center">
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
          <div className="text-center p-8 text-on-surface-variant text-sm">
            Chưa có thành viên nào.
          </div>
        )}
      </div>

      {/* Desktop view (>= 1024px) */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-variant/50 border-b border-outline">
              <th className="py-4 px-6 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Họ và tên</th>
              <th className="py-4 px-6 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Chức vụ</th>
              <th className="py-4 px-6 text-xs font-bold text-on-surface-variant uppercase tracking-widest">Ngày tham gia</th>
              {canEdit && <th className="py-4 px-6 text-xs font-bold text-on-surface-variant uppercase tracking-widest text-right">Thao tác</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline">
            {group.members.map((m) => {
              const isLeader = group.leader?.id === m.parishioner.id;
              return (
                <tr key={m.id} className={`hover:bg-surface-variant/30 transition-colors ${isLeader ? 'bg-primary/5' : ''}`}>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-on-surface">
                        {m.parishioner.christian_name ? `${m.parishioner.christian_name} ` : ''}
                        {m.parishioner.full_name}
                      </span>
                      {isLeader && (
                        <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                          <Star className="w-3 h-3 fill-current" /> Trưởng nhóm
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    {editingId === m.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editRole}
                          onChange={(e) => setEditRole(e.target.value)}
                          className="px-3 py-1.5 border border-outline rounded-lg text-sm bg-background w-40 focus:ring-1 focus:ring-primary focus:outline-none"
                          autoFocus
                          onKeyDown={(e) => e.key === 'Enter' && handleUpdateRole()}
                        />
                        <button onClick={handleUpdateRole} className="p-1.5 text-primary hover:bg-surface-variant rounded">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => setEditingId(null)} className="p-1.5 text-on-surface-variant hover:bg-surface-variant rounded">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="font-medium text-sm text-on-surface-variant bg-surface-variant/50 px-3 py-1 rounded-full">
                        {m.role || 'Thành viên'}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-on-surface-variant text-sm">
                    {m.joined_at ? formatDate(m.joined_at) : '-'}
                  </td>
                  {canEdit && (
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => startEdit(m.id, m.role)}
                          className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="Sửa chức vụ"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRemove(m.id, isLeader)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa thành viên"
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
                <td colSpan={canEdit ? 4 : 3} className="py-8 text-center text-on-surface-variant">
                  Chưa có thành viên nào trong hội đoàn.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
