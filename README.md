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

## 🏛️ SYSTEM ADMINISTRATION (GLOBAL)
- **Root Path:** `/super-admin/login`
- **Route Group:** `(super-admin)` — Strictly isolated management layout.
- **Role Requirement:** `SYSTEM_ADMIN` (verified against `v1/system-admin/login`).

---

## 🛠️ LOCAL DEVELOPMENT GUIDE
...
### 🔑 Default Credentials (DEV ONLY)
**Church Admin:**
- **Email:** `sogiaodan@gmail.com`
- **Password:** `Admin@2026`

**System Admin:**
- **Email:** `sogiaodan@gmail.com`
- **Password:** `Admin@2026` (Used for initial login)

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

---

## 🚀 CI/CD & DEPLOYMENT WORKFLOW

The Web Frontend is hosted on **Cloudflare Pages** with an automated Git-to-Deploy pipeline.

### 🌳 Branch Strategy & Environments
| Branch | Environment | Domain | Purpose |
| :--- | :--- | :--- | :--- |
| `main` | **Production** | [giaodan.io.vn](https://giaodan.io.vn) | Live application for end-users. |
| `develop` | **Staging** | [staging.giaodan.io.vn](https://staging.giaodan.io.vn) | Pre-release testing with Staging API. |
| `feature/*` | **Preview** | `*.web-8u0.pages.dev` | Individual feature testing. |

### 🛠️ Build Configuration (Cloudflare)
- **Framework Preset:** Next.js
- **Build Command:** `npx @cloudflare/next-on-pages@1`
- **Output Directory:** `.vercel/output/static`
- **Compatibility Flag:** `nodejs_compat` (Required for Next.js runtime).

### 📡 Environment Variables (Public API)
Variables are configured in the Cloudflare Dashboard under **Settings > Environment variables**:
- **Production (`main`):** `NEXT_PUBLIC_API_URL=https://api.giaodan.io.vn`
- **Preview (`develop`):** `NEXT_PUBLIC_API_URL=https://api-staging.giaodan.io.vn`

### 🔄 Deployment Steps
1.  **Local Development:** Create a `feature/your-feature` branch from `develop`.
2.  **Pull Request (to `develop`):** Create an MR to merge into `develop`. 
    - Cloudflare will generate a **Preview URL** for code review.
3.  **Staging Deployment:** Once merged into `develop`, Cloudflare automatically builds and deploys to `staging.giaodan.io.vn`.
4.  **Production Deployment:** Create an MR from `develop` into `main`.
    - Once merged, the changes are live on `giaodan.io.vn`.

> [!IMPORTANT]
> **Manual Trigger:** If a build doesn't start automatically, go to Cloudflare Dashboard > **Deployments** and select **Retry deployment**.