# AI Context Document (LLM_CONTEXT)

This document is intended for AI coding assistants (like Copilot, Cursor, Antigravity, etc.) to quickly understand the architecture, context, and custom implementations of the **Learn With** project.

## 1. Project Overview
- **Name**: Learn With
- **Purpose**: A platform to showcase open-source projects, track bugs, features, and improvements, and allow developers to explore and comment on them.
- **Core Tech Stack**: 
  - Framework: **Next.js 15** (App Router, Server Actions)
  - Language: **TypeScript**
  - Styling: **Tailwind CSS**, **shadcn/ui** (Base UI)
  - Database: **Supabase (PostgreSQL)**

## 2. Architecture & Security (CRITICAL CONTEXT)
We are using a **Decoupled Proxy Architecture**:
- **Frontend (Next.js)**: Handles UI, routing, and rendering. Hosted on Vercel.
- **Backend (FastAPI)**: Handles database connections (Supabase SQL), business logic, email sending, and authentication. Hosted on Render.
- **Proxy Layer (`src/app/api/`)**: Next.js App Router API routes act as a proxy. The frontend *never* calls FastAPI directly to avoid CORS and security issues. All client-side API calls go through `src/lib/api-client.ts`, which calls the Next.js proxy, which then forwards the request to FastAPI.
- **Authentication**: FastAPI issues a JWT (`HS256`). The Next.js login proxy route intercepts this JWT and stores it in a secure, `HttpOnly` cookie (`learnwith_jwt`). The Next.js middleware uses `jose` to verify this JWT locally for UI routing protection.
- **Stateful OTP Flow**: OTPs are hashed (`bcrypt`) and stored in the database (`otp_tokens` table) with a `UNIQUE(email, purpose)` constraint to prevent unauthorized usage or replay attacks.

## 3. Key Directories
- `src/lib/api-client.ts`: The universal frontend API client that fetches from the Next.js proxy (`/api/*`).
- `src/app/api/`: The Next.js proxy routes that forward requests to FastAPI and attach the `learnwith_jwt` cookie as a Bearer token.
- `src/app/(main)/`: The authenticated dashboard, profile, and settings routes.
  - `/profile`: A strictly read-only summary of the user's account.
  - `/settings`: The hub for account configuration featuring inline editing.
- `src/app/(admin)/`: Protected routes only accessible to users with the `admin` role.
- `src/components/ui/`: Contains all `shadcn/ui` primitive components.
- `src/lib/`: Core utilities like `session.ts` and `validations/auth.ts` (Zod schemas).

## 4. UI/UX Guidelines
- **Interactive Elements**: All clickable items (buttons, links, dropdown items, switches) should explicitly show a pointer cursor. The `shadcn/ui` components have been customized to ensure `cursor-pointer` is applied where appropriate.
- **Inline Editing**: Prefer inline editing (showing a value as text with a pencil icon that toggles an input field) over static, always-visible forms for settings.
- **Aesthetics**: Focus on modern, dynamic, and premium UI designs using proper spacing, Lucide icons, and subtle animations.

## 5. Environment Variables Required
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
FASTAPI_BASE_URL=http://localhost:8000
JWT_SECRET="your-secure-random-string-used-by-both-frontend-and-backend"
```

**FastAPI Backend Environment Requirements:**
```env
DATABASE_URL=postgresql://...
SUPABASE_URL=...
SUPABASE_SERVICE_KEY=...
SMTP_USER=...
SMTP_PASS=...
JWT_SECRET="must-match-frontend"
SUPER_ADMIN_EMAIL="superadmin@example.com"
```

> **Note to AI**: Always verify changes against the `implementation_plan.md` or `task.md` history if available, and stick to the custom session management paradigm outlined above.
