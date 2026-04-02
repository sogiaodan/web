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
