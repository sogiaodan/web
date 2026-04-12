import { useState, useEffect } from 'react';
import { X, AlertTriangle, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { FormInput } from '@/components/ui/FormInput';
import { SettingsAccountsAPI, Account } from '@/lib/api/settings';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

/** Generate a simple random temporary password: e.g. "Parish#7392" */
function generateTempPassword(): string {
  const prefixes = ['Parish', 'Admin', 'Giaoxu', 'Sacred', 'Vellum'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const num = Math.floor(1000 + Math.random() * 9000); // always 4 digits
  const specials = ['@', '#', '!', '*'];
  const special = specials[Math.floor(Math.random() * specials.length)];
  return `${prefix}${special}${num}`;
}

export function CreateUserDialog({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({ name: '', email: '', phone_number: '', role: 'VIEWER', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({ name: '', email: '', phone_number: '', role: 'VIEWER', password: generateTempPassword() });
      setErrors({});
      setCopied(false);
    }
  }, [isOpen]);

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(formData.password).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!formData.name) return setErrors({ name: 'Họ tên là bắt buộc' });
    if (!formData.email) return setErrors({ email: 'Email là bắt buộc' });
    if (!formData.password) return setErrors({ password: 'Mật khẩu là bắt buộc' });
    if (formData.password.length < 8) return setErrors({ password: 'Mật khẩu tối thiểu 8 ký tự' });

    setIsSubmitting(true);
    try {
      await SettingsAccountsAPI.create(formData);
      toast.success('Tạo tài khoản thành công');
      onSuccess();
      onClose();
    } catch (err: any) {
      if (err.message && err.message.toLowerCase().includes('email')) {
        if (err.code === 'EMAIL_ACTIVE_ELSEWHERE' || err.message.includes('hoạt động')) {
           setErrors({ email: 'Tài khoản đang hoạt động ở giáo xứ khác' });
           toast.error(err.message || 'Hành động bị chặn vì email đang hoạt động ở giáo xứ khác');
        } else {
           setErrors({ email: 'Email đã được sử dụng' });
           toast.error('Email đã được sử dụng');
        }
      } else {
        toast.error(err.message || 'Có lỗi xảy ra');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] bg-foreground/50 transition-opacity" onClick={() => !isSubmitting && onClose()} />
      <div className="fixed inset-0 md:inset-auto md:left-[50%] md:top-[50%] z-[110] w-full md:max-w-[480px] md:-translate-x-1/2 md:-translate-y-1/2 flex flex-col">
        <div className="bg-vellum md:rounded box-border shadow-xl overflow-hidden flex flex-col flex-1 md:max-h-[90vh] md:border border-outline">
          <div className="px-6 py-5 border-b border-outline flex items-center justify-between shrink-0 bg-surface-container">
            <h3 className="font-serif text-[20px] font-bold text-foreground">
              Thêm người dùng mới
            </h3>
            <button onClick={onClose} disabled={isSubmitting} className="text-muted hover:text-foreground outline-none">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="px-6 py-6 overflow-y-auto flex-1">
            <form id="create-user-form" onSubmit={handleSubmit} className="space-y-4">
              <FormInput
                label="HỌ VÀ TÊN *"
                placeholder="Nhập họ và tên"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                error={errors.name}
              />
              <FormInput
                label="EMAIL *"
                type="email"
                placeholder="name@parish.org"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                error={errors.email}
              />
              <FormInput
                label="SỐ ĐIỆN THOẠI"
                type="tel"
                autoComplete="off"
                placeholder="09xxxxxxxx"
                value={formData.phone_number}
                onChange={e => setFormData({ ...formData, phone_number: e.target.value })}
              />
              <div className="space-y-1.5 flex flex-col">
                <label className="font-sans text-[14px] font-medium uppercase tracking-[0.05em] text-foreground">
                  VAI TRÒ *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="flex w-full items-center font-sans h-12 rounded-[2px] border border-outline-variant bg-vellum px-3 text-[16px] text-foreground outline-none transition-all duration-200 ease-in-out hover:bg-surface-container-low focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent"
                >
                  <option value="VIEWER">Viewer</option>
                  <option value="EDITOR">Editor</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="font-sans text-[14px] font-medium uppercase tracking-[0.05em] text-foreground">
                  MẬT KHẨU TẠM THỜI *
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      autoComplete="new-password"
                      readOnly
                      value={formData.password}
                      className="flex w-full font-mono font-bold tracking-wider h-12 rounded-[2px] border border-outline-variant bg-surface-container px-3 text-[15px] text-foreground outline-none pr-10"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyPassword}
                    title="Sao chép mật khẩu"
                    className="h-12 w-12 flex-shrink-0 flex items-center justify-center rounded border border-outline-variant hover:bg-hover-bg transition-colors text-muted hover:text-foreground"
                  >
                    {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(f => ({ ...f, password: generateTempPassword() }))}
                    title="Tạo lại mật khẩu mới"
                    className="h-12 px-3 flex-shrink-0 flex items-center justify-center rounded border border-outline-variant hover:bg-hover-bg transition-colors text-muted hover:text-foreground text-xs font-sans font-medium"
                  >
                    Tạo lại
                  </button>
                </div>
                {errors.password && <p className="mt-1 font-sans text-[12px] font-medium text-primary">{errors.password}</p>}
                <p className="font-sans text-[11px] text-muted italic">Mật khẩu được tạo ngẫu nhiên. Hãy sao chép và gửi cho người dùng.</p>
                <p className="font-sans text-[11px] text-amber-600 italic mt-0.5">Lưu ý: Email mời có thể rơi vào mục <strong>Spam</strong>. Hãy nhắc người dùng kiểm tra nếu không thấy trong Inbox.</p>
              </div>
            </form>
          </div>
          
          <div className="px-6 py-4 bg-surface-container border-t border-outline flex items-center justify-end gap-2 rounded-b shrink-0 flex-col md:flex-row">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full md:w-auto rounded px-4 min-h-[48px] md:min-h-[44px] text-[16px] md:text-sm font-medium text-foreground hover:bg-hover-bg transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              form="create-user-form"
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto rounded bg-primary px-4 min-h-[48px] md:min-h-[44px] text-[16px] md:text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[140px]"
            >
              {isSubmitting ? <LoadingSpinner className="h-4 w-4 text-white" /> : 'Tạo tài khoản'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export function EditUserDialog({ user, onClose, onSuccess }: { user: Account | null; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({ name: '', email: '', phone_number: '', role: 'VIEWER' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name, email: user.email, phone_number: user.phone_number || '', role: user.role });
      setErrors({});
    }
  }, [user]);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!formData.name) return setErrors({ name: 'Họ tên là bắt buộc' });
    if (!formData.email) return setErrors({ email: 'Email là bắt buộc' });

    setIsSubmitting(true);
    try {
      await SettingsAccountsAPI.update(user.id, formData);
      toast.success('Cập nhật tài khoản thành công');
      onSuccess();
      onClose();
    } catch (err: any) {
      if (err.message && err.message.toLowerCase().includes('email')) {
         setErrors({ email: 'Email đã được sử dụng' });
         toast.error('Email đã được sử dụng');
      } else {
         toast.error(err.message || 'Có lỗi xảy ra');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] bg-foreground/50 transition-opacity" onClick={() => !isSubmitting && onClose()} />
      <div className="fixed inset-0 md:inset-auto md:left-[50%] md:top-[50%] z-[110] w-full md:max-w-[480px] md:-translate-x-1/2 md:-translate-y-1/2 flex flex-col">
        <div className="bg-vellum md:rounded box-border shadow-xl overflow-hidden flex flex-col flex-1 md:max-h-[90vh] md:border border-outline">
          <div className="px-6 py-5 border-b border-outline flex items-center justify-between shrink-0 bg-surface-container">
            <h3 className="font-serif text-[20px] font-bold text-foreground">
              Chỉnh sửa tài khoản
            </h3>
            <button onClick={onClose} disabled={isSubmitting} className="text-muted hover:text-foreground outline-none">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="px-6 py-6 overflow-y-auto flex-1">
            <form id="edit-user-form" onSubmit={handleSubmit} className="space-y-4">
              <FormInput
                label="HỌ VÀ TÊN *"
                placeholder="Nhập họ và tên"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                error={errors.name}
              />
              <FormInput
                label="EMAIL *"
                type="email"
                placeholder="name@parish.org"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                error={errors.email}
              />
              <FormInput
                label="SỐ ĐIỆN THOẠI"
                placeholder="Nhập số điện thoại"
                value={formData.phone_number}
                onChange={e => setFormData({ ...formData, phone_number: e.target.value })}
              />
              <div className="space-y-1.5 flex flex-col">
                <label className="font-sans text-[14px] font-medium uppercase tracking-[0.05em] text-foreground">
                  VAI TRÒ *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="flex w-full items-center font-sans h-12 rounded-[2px] border border-outline-variant bg-vellum px-3 text-[16px] text-foreground outline-none transition-all duration-200 ease-in-out hover:bg-surface-container-low focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent"
                >
                  <option value="VIEWER">Viewer</option>
                  <option value="EDITOR">Editor</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </form>
          </div>
          
          <div className="px-6 py-4 bg-surface-container border-t border-outline flex items-center justify-end gap-2 rounded-b shrink-0 flex-col md:flex-row">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full md:w-auto rounded px-4 min-h-[48px] md:min-h-[44px] text-[16px] md:text-sm font-medium text-foreground hover:bg-hover-bg transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              form="edit-user-form"
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto rounded bg-primary px-4 min-h-[48px] md:min-h-[44px] text-[16px] md:text-sm font-medium text-white hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[140px]"
            >
              {isSubmitting ? <LoadingSpinner className="h-4 w-4 text-white" /> : 'Lưu thay đổi'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export function LockUnlockConfirmation({ user, locked, onClose, onSuccess }: { user: Account | null; locked: boolean; onClose: () => void; onSuccess: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [blockingError, setBlockingError] = useState<string | null>(null);

  if (!user) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setBlockingError(null);
    try {
      await SettingsAccountsAPI.toggleStatus(user.id, locked ? 'ACTIVE' : 'LOCKED');
      toast.success(locked ? 'Tài khoản đã được mở khóa' : 'Tài khoản đã bị tạm khóa');
      onSuccess();
      onClose();
    } catch (err: any) {
      // Surface "last admin" errors inline rather than dismissing the dialog
      if (err?.code === 'LAST_ADMIN_PROTECTED' || err?.message?.includes('Admin cuối cùng')) {
        setBlockingError(err.message || 'Không thể khóa tài khoản Admin cuối cùng.');
      } else {
        toast.error(err.message || 'Có lỗi xảy ra');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[100] bg-foreground/50 transition-opacity" onClick={() => !isSubmitting && onClose()} />
      <div className="fixed inset-0 md:inset-auto md:left-[50%] md:top-[50%] z-[110] w-full md:max-w-[480px] md:-translate-x-1/2 md:-translate-y-1/2 flex flex-col">
        <div className="bg-vellum md:rounded shadow-xl overflow-hidden flex flex-col flex-1 md:max-h-[90vh] md:border border-outline justify-center">
          <div className="px-6 py-5 border-b border-outline flex items-center justify-between bg-surface-container">
            <h3 className="font-serif text-[18px] font-bold text-foreground flex items-center gap-2">
              <AlertTriangle className={locked ? "text-green-600 h-5 w-5" : "text-primary h-5 w-5"} /> 
              {locked ? 'Mở khóa tài khoản?' : 'Tạm khóa tài khoản này?'}
            </h3>
          </div>
          <div className="px-6 py-8 border-b border-outline space-y-4">
            <p className="text-[16px] text-foreground">
              {locked ? (
                <>Bạn có chắc muốn mở khóa tài khoản <span className="font-bold">{user.name}</span>? Người dùng sẽ có thể đăng nhập trở lại.</>
              ) : (
                <>Bạn có chắc muốn tạm khóa tài khoản <span className="font-bold">{user.name}</span>? Người dùng này sẽ không thể đăng nhập.</>
              )}
            </p>
            {blockingError && (
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded p-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-sans text-[13px] font-semibold text-amber-800">Không thể thực hiện hành động này</p>
                  <p className="font-sans text-[13px] text-amber-700 mt-0.5">{blockingError}</p>
                </div>
              </div>
            )}
          </div>
          <div className="px-6 py-4 flex items-center justify-end gap-3 rounded-b bg-surface-container flex-col md:flex-row">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full md:w-auto rounded px-4 min-h-[48px] md:min-h-[44px] text-[16px] md:text-sm font-medium text-foreground hover:bg-hover-bg transition-colors disabled:opacity-50 border border-transparent"
            >
              Hủy
            </button>
            <button
              onClick={handleConfirm}
              disabled={isSubmitting}
              className={`w-full md:w-auto rounded px-4 min-h-[48px] md:min-h-[44px] text-[16px] md:text-sm font-medium text-white transition-colors disabled:opacity-50 flex items-center justify-center min-w-[120px] ${locked ? 'bg-green-600 hover:bg-green-700' : 'bg-primary hover:bg-primary/90'}`}
            >
              {isSubmitting ? <LoadingSpinner className="h-4 w-4" /> : (locked ? 'Mở khóa' : 'Tạm khóa')}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
