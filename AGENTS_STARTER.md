# Project Rules, Style Guidelines & Security Standards

## Core UI & Design Directives

1. **No Emojis**:
   - DO NOT use emojis anywhere in the app UI, text labels, category markers, or headers.
   - Use vector icons (`@expo/vector-icons`, Ionicons, Feather, MaterialCommunityIcons, Lucide) or SVG icons exclusively for all visual representations.

2. **Design Aesthetic — iOS 18 Muted Pastel Bento Grid System**:
   - Implement native Apple iOS Dark Mode bento card aesthetics (soft matte muted pastel fills with subtle top-left radial glow, non-harsh, non-neon).
   - **Color Rule**: Enforce exact Apple iOS Dark Mode Muted Pastel Palette:
     - `Today`: `#4A99E9` (Soft Muted Sky Blue)
     - `Scheduled`: `#ED6C6C` (Soft Muted Salmon Coral)
     - `All`: `#48484A` (Soft Dark Charcoal)
     - `Flagged`: `#F3A85B` (Soft Warm Peach Gold)
     - `Urgent`: `#EC668C` (Soft Rose Muted Pink)
     - `Completed`: `#6C7B8A` (Soft Muted Steel Grey)
   - Use **iOS Bento Grid Layouts** (2x2 or 2x3 tile cards with 20px rounded corners and white text/icons).
   - Use concentric rounded corners (`outer_radius = inner_radius + padding`, outer radius `20px-24px`, inner icon badges `10px-12px`).
   - Ensure clean typography, smooth micro-animations, and high contrast text over muted pastel cards.

3. **Single-Word Clean Naming Directive**:
   - ALL UI text labels, category names, preset titles, navbar tabs, card headers, and action buttons MUST strictly use 1 single word (e.g. `Expenses`, `Savings`, `Vault`, `Emergency`, `Goal`, `Food`, `Drink`, `Transport`, `Investment`, `Groceries`, `Bills`, `Shopping`, `Fun`, `Tech`, `Health`, `Income`).
   - Never use multi-word labels anywhere in the application interface.

4. **No Blur Glowing Colors Directive**:
   - DO NOT use blurry glowing colors, radial glow backdrops, backdrop blur effects, or heavy neon box-shadow glows anywhere in the application UI.
   - Use clean, crisp, solid matte cards with subtle clean borders (`1px solid rgba(255, 255, 255, 0.08)`) and high-contrast typography.

5. **Timezone Directive — Cambodia (ICT / UTC+7)**:
   - Always remember that the user and primary application environment operates in **Cambodia Timezone (Asia/Phnom_Penh, ICT, UTC+7)**.
   - All date/time calculations, calendar ICS exports, notifications, and reminders must explicitly align with UTC+7 Cambodia Timezone.

---

## Security & Data Protection Directives

1. **Environment Variables & Secret Protection**:
   - NEVER hardcode API keys, access tokens, database URIs, or secret credentials in source code.
   - Always load sensitive keys from `.env` files and add `.env*` to `.gitignore`.

2. **Input Validation & Injection Prevention**:
   - Validate and sanitize all user input before storing or processing.
   - Prevent XSS (Cross-Site Scripting) by escaping rendered HTML and avoiding un-sanitized dynamic markup.
   - Prevent SQL/NoSQL injection by using parameterized queries, ORM layers, or typed SDKs.

3. **Secure Storage & Data Encryption**:
   - Encrypt sensitive data at rest and in transit (HTTPS / TLS 1.3).
   - Never store plain text auth tokens or credentials in unsecure client storage.

4. **Authentication & Authorization Scoping**:
   - Enforce server-side and client-side access control on all endpoints and state mutations.
   - Validate resource ownership on every operation to prevent IDOR (Insecure Direct Object Reference).

5. **Sanitized Error Handling**:
   - Do NOT leak full stack traces, database schema details, or system paths to end users.
   - Return clean, safe error messages to clients while logging full traces server-side.

6. **Dependency Hygiene**:
   - Periodically audit third-party packages for vulnerabilities (`npm audit`).
   - Use standard, trusted open-source packages.

---

## How to Apply to Any New Project

### Option A: Global Setup (Works Automatically for All Projects)
Save this file to: `C:\Users\MSI\.gemini\config\AGENTS.md`

### Option B: Per-Project Setup
Copy this file into your project at: `.agents/AGENTS.md`
