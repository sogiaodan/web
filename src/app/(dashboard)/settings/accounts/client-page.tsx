'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  ChevronRight, 
  Plus, 
  Pencil, 
  Lock, 
  Unlock, 
  Shield,
  Search,
  Mail,
} from 'lucide-react';
import { SettingsAccountsAPI, Account } from '@/lib/api/settings';
import { CreateUserDialog, EditUserDialog, LockUnlockConfirmation } from './_components/Dialogs';
import { PaginationControls } from '@/components/ui/PaginationControls';
import { useAuth } from '@/components/providers/auth-provider';


const fetchAccounts = async (params: string) => {
  const parsed = JSON.parse(params);
  return SettingsAccountsAPI.list(parsed);
};

export default function AccountManagementPage() {
  const { user: currentUser } = useAuth();
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const limit = 10;

  const { data, error, refetch: mutate, isLoading } = useQuery({
    queryKey: ['accounts', { page, limit, role: roleFilter }],
    queryFn: () => fetchAccounts(JSON.stringify({ page, limit, role: roleFilter })),
  });

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<Account | null>(null);
  const [lockContext, setLockContext] = useState<{ user: Account, locked: boolean } | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);

  const handleResendInvite = async (user: Account) => {
    setResendingId(user.id);
    try {
      const result = await SettingsAccountsAPI.resendInvite(user.id);
      toast.success(`${result.message}. Lưu ý: Email có thể rơi vào mục Spam.`, { duration: 6000 });
    } catch (err: any) {
      toast.error(err.message || 'Không thể gửi email. Vui lòng thử lại.');
    } finally {
      setResendingId(null);
    }
  };

  const stats = data?.data?.stats;
  const items = data?.data?.items || [];
  const pagination = data?.data?.pagination;

  const roleLabels: Record<string, string> = {
    'ADMIN': 'Admin',
    'EDITOR': 'Editor',
    'VIEWER': 'Viewer',
  };

  const filteredItems = items.filter((user: Account) => {
    if (!searchTerm) return true;
    const lower = searchTerm.toLowerCase();
    return user.name.toLowerCase().includes(lower) || 
           user.email.toLowerCase().includes(lower) ||
           roleLabels[user.role]?.toLowerCase().includes(lower);
  });

  const formatLastUpdated = (dateString: string | null | undefined) => {
    if (!dateString) return '--';
    const date = new Date(dateString);
    const now = new Date();
    
    // Simplistic relative time for demonstration (Hôm nay / date string)
    if (date.toDateString() === now.toDateString()) {
       return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} Hôm nay`;
    }
    return new Intl.DateTimeFormat('vi-VN', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
  };

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <nav className="flex items-center text-sm font-sans text-muted mb-4">
        <Link href="/settings" className="hover:text-foreground transition-colors">
          Cài đặt
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="font-semibold text-foreground">Quản lý tài khoản</span>
      </nav>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-[24px] font-bold text-foreground">Tài khoản Hệ thống</h1>
          <p className="font-sans text-[14px] text-muted tracking-wide mt-1">Danh sách nhân sự được cấp quyền truy cập quản lý dữ liệu Giáo xứ.</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center justify-center rounded bg-primary px-4 py-2 font-sans text-sm font-medium text-white hover:bg-primary/90 min-h-[48px] md:min-h-[40px] w-full md:w-auto transition-colors"
        >
          <Plus className="mr-2 h-5 w-5" />
          Thêm người dùng
        </button>
      </div>

      {/* Summary Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface-container-low border border-outline rounded p-4 flex flex-col">
           <span className="font-sans text-[11px] font-medium text-muted uppercase tracking-wider">TỔNG CỘNG</span>
           <span className="font-serif text-[22px] font-bold mt-1">
             {isLoading ? '--' : `${stats?.total_accounts || 0} Tài khoản`}
           </span>
        </div>
        <div className="bg-surface-container-low border border-outline rounded p-4 flex flex-col">
           <span className="font-sans text-[11px] font-medium text-primary uppercase tracking-wider">HOẠT ĐỘNG</span>
           <span className="font-serif text-[22px] font-bold mt-1 text-primary">
             {isLoading ? '--' : stats?.active_count || 0}
           </span>
        </div>
        <div className="bg-surface-container-low border border-outline rounded p-4 flex flex-col">
           <span className="font-sans text-[11px] font-medium text-muted uppercase tracking-wider">TẠM KHÓA</span>
           <span className="font-serif text-[22px] font-bold mt-1">
             {isLoading ? '--' : stats?.locked_count || 0}
           </span>
        </div>
        <div className="bg-surface-container-low border border-outline rounded p-4 flex flex-col">
           <span className="font-sans text-[11px] font-medium text-muted uppercase tracking-wider">LẦN CUỐI CẬP NHẬT</span>
           <span className="font-serif text-[22px] font-bold mt-1">
             {isLoading ? '--' : formatLastUpdated(stats?.last_updated_at)}
           </span>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide w-full">
        <span className="font-sans text-[14px] text-foreground shrink-0 hidden md:block">Bộ lọc nhanh:</span>
        {['Tất cả', 'Admin', 'Editor', 'Viewer'].map((label, i) => {
          const mapVal = label === 'Tất cả' ? '' : (label === 'Admin' ? 'ADMIN' : (label === 'Editor' ? 'EDITOR' : 'VIEWER'));
          const isActive = roleFilter === mapVal;
          return (
            <button
              key={label}
              onClick={() => { setRoleFilter(mapVal); setPage(1); }}
              className={`min-h-[40px] px-5 rounded-full font-sans text-[14px] font-medium shrink-0 transition-colors border ${
                isActive 
                  ? 'bg-primary text-white border-primary' 
                  : 'bg-transparent text-foreground border-outline hover:border-foreground/30'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="relative w-full">
         <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted pointer-events-none" />
         <input 
           type="text"
           placeholder="Tìm kiếm tên, chức vụ..."
           value={searchTerm}
           onChange={(e) => setSearchTerm(e.target.value)}
           className="w-full h-12 pl-10 pr-4 bg-vellum rounded border border-outline focus:border-primary focus:outline-none transition-colors text-[16px] md:text-sm font-sans"
         />
      </div>

      {/* Data Table */}
      <div className="bg-surface border border-outline rounded overflow-hidden">
        <div className="hidden md:grid grid-cols-[3fr_1fr_1fr_1fr] gap-4 bg-surface-container p-4 border-b border-outline">
           <div className="font-sans text-[12px] font-semibold text-muted uppercase tracking-wider">Tên người dùng</div>
           <div className="font-sans text-[12px] font-semibold text-muted uppercase tracking-wider">Vai trò</div>
           <div className="font-sans text-[12px] font-semibold text-muted uppercase tracking-wider text-center">Trạng thái</div>
           <div className="font-sans text-[12px] font-semibold text-muted uppercase tracking-wider text-right">Thao tác</div>
        </div>

        <div className="flex flex-col divide-y divide-outline">
          {isLoading ? (
            <div className="p-8 text-center text-muted font-sans text-sm">Đang tải...</div>
          ) : error ? (
            <div className="p-8 text-center text-primary font-sans text-sm">Có lỗi xảy ra khi tải danh sách</div>
          ) : filteredItems.length === 0 ? (
            <div className="p-8 text-center text-muted font-sans text-sm">Không tìm thấy tài khoản nào</div>
          ) : (
            filteredItems.map((user: Account) => (
              <div key={user.id} className="p-4 flex flex-col md:grid md:grid-cols-[3fr_1fr_1fr_1fr] md:items-center gap-4 hover:bg-hover-bg transition-colors">
                 <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-sans font-bold text-sm shrink-0 border border-primary/20">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-sans text-base font-semibold text-foreground truncate">{user.name}</div>
                      <div className="font-sans text-[13px] text-muted truncate">{user.email}</div>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-2 md:block">
                   <span className="font-sans text-[12px] text-muted md:hidden w-20">Vai trò:</span>
                   <span className="font-sans text-[14px] text-foreground font-medium">{roleLabels[user.role]}</span>
                 </div>

                 <div className="flex items-center gap-2 md:justify-center">
                   <span className="font-sans text-[12px] text-muted md:hidden w-20">Trạng thái:</span>
                   {user.status === 'ACTIVE' ? (
                     <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-[#DCFCE7] text-[#16A34A] border border-[#16A34A]/20">
                       Hoạt động
                     </span>
                   ) : (
                     <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium bg-[#FFF7ED] text-[#EA580C] border border-[#EA580C]/20">
                       Tạm khóa
                     </span>
                   )}
                 </div>

                  <div className="flex items-center justify-end gap-1 mt-2 md:mt-0 pt-3 border-t border-outline md:border-t-0 md:pt-0">
                     {user.id !== currentUser?.id && (
                       <button
                         onClick={() => handleResendInvite(user)}
                         disabled={resendingId === user.id}
                         title="Gửi lại lời mời"
                         className="p-2 min-h-[44px] md:min-h-[36px] w-[44px] md:w-[36px] flex items-center justify-center text-muted hover:text-blue-600 rounded transition-colors disabled:opacity-40"
                         aria-label="Resend invite"
                       >
                         <Mail className={`w-4 h-4 md:w-[18px] md:h-[18px] ${resendingId === user.id ? 'animate-pulse' : ''}`} />
                       </button>
                     )}
                     <button
                       onClick={() => setEditUser(user)}
                       className="p-2 min-h-[44px] md:min-h-[36px] w-[44px] md:w-[36px] flex items-center justify-center text-muted hover:text-foreground rounded transition-colors"
                       aria-label="Edit user"
                     >
                       <Pencil className="w-4 h-4 md:w-[18px] md:h-[18px]" />
                     </button>
                     <button
                       onClick={() => setLockContext({ user, locked: user.status === 'LOCKED' })}
                       className="p-2 min-h-[44px] md:min-h-[36px] w-[44px] md:w-[36px] flex items-center justify-center text-muted hover:text-foreground rounded transition-colors"
                       aria-label={user.status === 'LOCKED' ? "Unlock user" : "Lock user"}
                     >
                       {user.status === 'LOCKED' ? (
                         <Unlock className="w-4 h-4 md:w-[18px] md:h-[18px] text-[#16A34A]" />
                       ) : (
                         <Lock className="w-4 h-4 md:w-[18px] md:h-[18px] text-primary" />
                       )}
                     </button>
                  </div>
              </div>
            ))
          )}
        </div>

        {pagination && pagination.total > 0 && (
          <div className="p-4 border-t border-outline flex flex-col items-center">
             <div className="w-full flex justify-between items-center bg-surface pb-2 hidden md:flex">
                <span className="font-sans text-[14px] text-muted">Hiển thị {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} trong số {pagination.total} tài khoản</span>
             </div>
             <PaginationControls
               page={pagination.page}
               totalPages={pagination.total_pages}
               onPageChange={setPage}
             />
          </div>
        )}
      </div>

      {/* Security Notice */}
      <div className="bg-surface-container-low border border-outline rounded p-4 flex gap-4 mt-6">
         <Shield className="w-12 h-12 text-primary shrink-0 opacity-80" strokeWidth={1.5} />
         <div>
            <h3 className="font-sans text-[16px] font-bold text-foreground">Chính sách Bảo mật & Phân quyền</h3>
            <p className="font-sans text-[14px] text-muted mt-1 leading-relaxed">
              Mỗi tài khoản được cấp quyền truy cập dựa trên vai trò do Cha sở quyết định. Xin lưu ý yêu cầu nhân sự sử dụng mật khẩu mạnh và không chia sẻ tài khoản cho người khác. Cha sở có toàn quyền khóa hoặc mở khóa bất kỳ tài khoản nào để đảm bảo an toàn thông tin Giáo xứ.
            </p>
         </div>
      </div>

      <CreateUserDialog 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        onSuccess={() => mutate()} 
      />
      
      <EditUserDialog 
        user={editUser}
        onClose={() => setEditUser(null)}
        onSuccess={() => mutate()}
      />

      <LockUnlockConfirmation
        user={lockContext?.user || null}
        locked={lockContext?.locked || false}
        onClose={() => setLockContext(null)}
        onSuccess={() => mutate()}
      />
    </div>
  );
}
