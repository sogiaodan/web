/**
 * Central configuration for the Web application.
 * This ensures consistency across all components regarding API endpoints and App URLs.
 */

// 🌐 The URL of the Backend API (running on port 3000 by default)
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// 💻 The URL of this Frontend application (running on port 3003 by default)
export const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3003';

// 📄 Other common app-wide constants can go here
export const APP_NAME = 'Sổ Giáo Dân';
export const APP_DESCRIPTION = 'Giải pháp số hóa công tác quản lý giáo xứ hiện đại';

// 📞 Project Contact Information
export const CONTACT_INFO = {
  address: 'Tan Thinh Church, 4 Thanh Niên, Tân Thới Nhì, Xuân Thới Sơn, Hồ Chí Minh',
  phone: '+84 90 799 1102',
  email: 'sogiaodan@gmail.com'
};

// 🗺️ Navigation Links (Internal)
export const PROJECT_LINKS = [
  { name: 'Về Dự Án', href: '#ve-du-an' },
  { name: 'Liên Hệ', href: '#lien-he' },
  { name: 'Chính Sách Bảo Mật', href: '/privacy' },
];
