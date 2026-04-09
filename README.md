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
- **Base URL:** Defined via environment variables (pointing to the backend via Cloudflare Tunnel).
- **Tenant Context:** Every request must include the `church_id` (extracted by BE from Cookie) to ensure **Schema-based isolation** via `SET search_path`.
- **Client Fetch:** All client-side fetch calls MUST use `credentials: "include"` to forward the HttpOnly JWT cookie through Next.js API rewrites.

---

## 🏗️ ARCHITECTURE: THIN SERVER / THICK CLIENT

This project follows the **"Thin Server / Thick Client"** pattern for Vercel deployment:

- **`page.tsx` files** are thin Server Components. They export `metadata` and render a `<FeatureClient />` component. They do NOT fetch data directly.
- **`FeatureClient.tsx` files** are `"use client"` components. They manage all interactive state, data fetching (via React Query hooks), and mutations.
- **`queries/` directories** contain React Query hooks (`useFeatureQuery.ts`, `useFeatureMutation.ts`) per feature.
- **`/lib/queries/`** contains shared query hooks reused across multiple features (`useZonesQuery`, `usePriestsQuery`, `useSaintNamesQuery`).

---

## 🚀 CI/CD & DEPLOYMENT WORKFLOW

The Web Frontend is hosted on **Vercel** with an automated Git-to-Deploy pipeline.

### 🌳 Branch Strategy & Environments
| Branch | Environment | Domain | Purpose |
| :--- | :--- | :--- | :--- |
| `main` | **Production** | [giaodan.io.vn](https://giaodan.io.vn) | Live application for end-users. |
| `develop` | **Staging Preview** | [staging.giaodan.io.vn](https://staging.giaodan.io.vn) | Pre-release testing with Staging API. |
| `feature/*` | **Preview** | Auto-generated `.vercel.app` URL | Individual feature testing. |

### 🛠️ Build Configuration (Vercel)
- **Framework Preset:** Next.js
- **Root Directory:** `./` (If connected directly to `web` repo) or `web/` (If connected to `platform` repo)
- **Build Command:** `npm run build`
- **Output Directory:** `.next` (default — managed by Vercel automatically)
- **Install Command:** `npm ci`
- **Node.js Version:** `20.x`


### 📡 Environment Variables (Vercel Dashboard)
Configure under **Project Settings > Environment Variables**:

| Variable | Value | Scope |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `https://api.giaodan.io.vn` | **Production** |
| `NEXT_PUBLIC_API_URL` | `https://staging-api.giaodan.io.vn` | **Preview** |
| `NEXT_PUBLIC_APP_URL` | `https://giaodan.io.vn` | **Production** |

### 🔄 Deployment Steps
1. **Local Development:** Create a `feature/your-feature` branch from `develop`.
2. **Pull Request (to `develop`):** Create a PR to merge into `develop`.
    - Vercel will automatically generate a **Preview URL** for code review.
3. **Staging Deployment:** Once merged into `develop`, Vercel auto-deploys to the staging preview environment.
4. **Production Deployment:** Create a PR from `develop` into `main`.
    - Once merged, changes are live on `giaodan.io.vn`.

> [!IMPORTANT]
> **Vercel Connection:** If connecting the standalone `web` repo, the **Root Directory** is `./`. If connecting the parent `platform` repo, set it to `web/`. All builds run standard `npm run build` — no Cloudflare adapters or Edge Runtime required.

> [!NOTE]
> **API Proxying:** `next.config.ts` rewrites `/api/:path*` to the backend, making all client-side `fetch('/api/v1/...')` calls same-origin. The browser automatically attaches `SameSite=Strict` cookies, so `credentials: "include"` works without CORS issues.