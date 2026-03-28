# 🎨 WEB FRONTEND CONTEXT & DESIGN SYSTEM

This directory contains the Frontend implementation for **Sổ Giáo Dân**. All development MUST adhere to the following strict architectural and design rules.

---

## 🏛️ SOURCE OF TRUTH: THE MASTER DESIGN
Before writing any CSS, Tailwind classes, or UI components, you MUST consult:
👉 **`web/design-system/MASTER.md`**

### 🎨 Visual Identity (Sacred Vellum)
- **Theme:** "Modern Archive" (Warm, Professional, Academic).
- **Background:** Always `#FDFBF7` (Vellum). **NO Dark Mode.**
- **Primary Color:** `#8B2635` (Sacred Crimson) for all key actions.
- **Typography:** - Headlines/Titles: **Lora** (Serif).
    - UI/Body/Labels: **Work Sans** (Sans-serif).
- **Shapes:** Sharp edges strictly between **2px - 4px radius**. Avoid "bubbly" or highly rounded corners.
- **Elevation:** Use Tonal Layering and `outline-variant` (#D6D3D1). Avoid aggressive drop shadows.

---

## 🌐 LOCALIZATION (L10N)
- **User-Facing UI:** 100% **Vietnamese** (Formal/Parish tone).
    - Use: "Giáo dân", "Giáo xứ", "Hệ thống quản trị".
    - Error messages, placeholders, and buttons must be localized.
- **Developer-Facing:** Code, Comments, Props, and Documentation must be in **English**.

---

## 🔒 SECURITY & AUTHENTICATION
- **JWT Storage:** Must use **HttpOnly, Secure, SameSite=Lax Cookies**.
- **No LocalStorage:** Sensitive auth data must NEVER be stored in LocalStorage/SessionStorage.
- **Logic Location:** FE is for rendering only. All validation and permission logic must be handled by the Backend (Mac Mini).

---

## 📡 API COMMUNICATION
- **Base URL:** Defined via environment variables (pointing to the Cloudflare Tunnel/Mac Mini).
- **Tenant Context:** Every request must include the `church_id` (extracted by BE from Cookie) to ensure **Schema-based isolation** via `SET search_path`.