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

## 2. Authentication & Security (CRITICAL CONTEXT)
We are **not** using standard Supabase Auth for session management. We have implemented a highly secure, custom authentication flow.

- **Session Management (`src/lib/session.ts`)**: Sessions are maintained using cryptographically signed HTTP-only cookies (`HMAC-SHA256`). Do not try to implement JWT libraries or standard Supabase Auth methods for user sessions.
- **Middleware (`src/middleware.ts`)**: Protects routes by verifying the signed session cookies.
- **Role-Based Access**: Users are either `admin` or `developer`. There is a dynamic "Super Admin" designated by the `SUPER_ADMIN_EMAIL` environment variable. The Super Admin can promote/demote other admins.
- **Stateless OTP Flow**: OTPs for Signup, Email Updates, and Password Resets are **NOT** stored in the database. Instead, they are packaged with the user's data, cryptographically signed, and stored in temporary, secure cookies (e.g., `otp_signup`, `otp_update_email`).
  - *Example*: When updating an email, the new email and OTP are saved to an `otp_update_email` cookie. Only when the user inputs the matching OTP does the server verify the cookie and update the actual database row.

## 3. Key Directories
- `src/app/actions/`: Contains all Next.js Server Actions (e.g., `auth.ts`, `users.ts`). This is the primary way the frontend interacts with the database.
- `src/app/(main)/`: The authenticated dashboard, profile, and settings routes.
  - `/profile`: A strictly read-only summary of the user's account.
  - `/settings`: The hub for account configuration featuring inline editing.
- `src/app/(admin)/`: Protected routes only accessible to users with the `admin` role.
- `src/components/ui/`: Contains all `shadcn/ui` primitive components.
- `src/lib/`: Core utilities like `session.ts`, `supabase/admin.ts`, and `validations/auth.ts` (Zod schemas).

## 4. UI/UX Guidelines
- **Interactive Elements**: All clickable items (buttons, links, dropdown items, switches) should explicitly show a pointer cursor. The `shadcn/ui` components have been customized to ensure `cursor-pointer` is applied where appropriate.
- **Inline Editing**: Prefer inline editing (showing a value as text with a pencil icon that toggles an input field) over static, always-visible forms for settings.
- **Aesthetics**: Focus on modern, dynamic, and premium UI designs using proper spacing, Lucide icons, and subtle animations.

## 5. Environment Variables Required
```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
SMTP_USER=...
SMTP_PASS=...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SESSION_SECRET="your-secure-random-string"
SUPER_ADMIN_EMAIL="superadmin@example.com"
```

> **Note to AI**: Always verify changes against the `implementation_plan.md` or `task.md` history if available, and stick to the custom session management paradigm outlined above.
