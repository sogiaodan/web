export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// Map backend error codes → Vietnamese user-friendly messages
const ERROR_MESSAGES: Record<string, string> = {
  // Household
  HOUSEHOLD_NOT_FOUND: 'Không tìm thấy hộ giáo này.',
  HOUSEHOLD_CODE_DUPLICATE: 'Mã hộ giáo đã tồn tại. Vui lòng chọn mã khác.',
  MEMBER_ALREADY_SPLIT: 'Thành viên này đã được tách sang hộ khác.',
  // Parishioner
  PARISHIONER_NOT_FOUND: 'Không tìm thấy giáo dân này.',
  PARISHIONER_DUPLICATE: 'Giáo dân đã tồn tại trong hệ thống.',
  // Auth
  INVALID_CREDENTIALS: 'Email hoặc mật khẩu không đúng.',
  TOKEN_EXPIRED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  TOKEN_MISSING: 'Chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.',
  INVALID_TOKEN: 'Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.',
  INSUFFICIENT_PERMISSIONS: 'Bạn không có quyền thực hiện thao tác này.',
  // Priest
  PRIEST_NOT_FOUND: 'Không tìm thấy linh mục này.',
  // Zone / Generic
  ZONE_NOT_FOUND: 'Không tìm thấy giáo khu này.',
  NOT_FOUND: 'Không tìm thấy dữ liệu yêu cầu.',
  FORBIDDEN: 'Bạn không có quyền truy cập tài nguyên này.',
};

function resolveErrorMessage(raw: string | undefined, status: number): string {
  if (!raw) return `Đã xảy ra lỗi (${status}). Vui lòng thử lại.`;
  // If the message is a known error code, return Vietnamese translation
  if (ERROR_MESSAGES[raw]) return ERROR_MESSAGES[raw];
  // If it's a JSON array (validation errors from class-validator)
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.join(' ');
  } catch {}
  // Return as-is if it's already a human-readable message
  return raw;
}

/**
 * Client-side fetch wrapper for React Query hooks.
 * Automatically includes credentials (HttpOnly cookies via rewrite proxy)
 * and handles the standard API response format.
 */
export async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(endpoint, {
    ...options,
    headers,
    credentials: "include",
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const rawMessage = json?.message;
    const message = resolveErrorMessage(
      Array.isArray(rawMessage) ? rawMessage.join(' ') : rawMessage,
      res.status
    );
    
    if (res.status === 401) {
      const code = json?.code;
      const isTokenInvalidError = code === 'TOKEN_EXPIRED' || code === 'TOKEN_MISSING' || code === 'INSUFFICIENT_PERMISSIONS' || code === 'INVALID_TOKEN';
      
      if (isTokenInvalidError && typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }
    
    throw new ApiError(message, res.status);
  }

  return json?.data as T;
}
