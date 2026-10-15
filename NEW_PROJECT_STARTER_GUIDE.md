# New Project Quick-Start & Customization Transfer Guide

This guide makes it fast and easy to start any new project while preserving your custom **Agent Rules**, **Design System**, **Skills**, and **Security Protection Guidelines**.

---

## ⚡ Method 1: Global Setup (Recommended — Works Automatically for ALL New Projects)

If you set this up globally once, **every single new project** you open will automatically inherit your rules, skills, and security guidelines without needing to copy files every time!

### Step 1: Open Global Customization Folder
Your global configuration directory on Windows is located at:
`C:\Users\MSI\.gemini\config`

### Step 2: Global `AGENTS.md`
Copy or append your rules directly into `C:\Users\MSI\.gemini\config\AGENTS.md`.

### Step 3: Global `skills/`
Copy your custom skill folders into `C:\Users\MSI\.gemini\config\skills\`.

---

## 📁 Method 2: Per-Project Copy (Workspace `.agents` Directory)

If you prefer to include these rules directly within a specific project repository:

1. Create a `.agents` folder inside your new project root.
2. Place `AGENTS.md` inside `.agents/AGENTS.md`.
3. Place custom skills inside `.agents/skills/<skill-name>/SKILL.md`.

### 💻 Quick PowerShell Command to Copy to a New Project

When you create a new project folder (e.g. `C:\Users\MSI\Desktop\MyNewApp`), run this in PowerShell:

```powershell
# Copy the entire .agents folder (rules + skills) to your new project:
Copy-Item -Recurse -Force "c:\Users\MSI\Desktop\Expense Tracker\.agents" "C:\Users\MSI\Desktop\MyNewApp\.agents"
```

---

## 📋 Ready-to-Use `AGENTS.md` Template (Rules + Security Guidelines)

Create or update `.agents/AGENTS.md` (or `C:\Users\MSI\.gemini\config\AGENTS.md`) with the following content:

```markdown
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

## Security & Protection Directives

1. **Environment Variables & Secret Protection**:
   - NEVER hardcode secrets, API keys, tokens, or private credentials in codebase files.
   - Always store sensitive keys in `.env` or local configuration files.
   - Always enforce `.env*` entries in `.gitignore`.

2. **Input Validation & Injection Prevention**:
   - Validate and sanitize all user input before storing or processing.
   - Prevent XSS (Cross-Site Scripting) by escaping rendered HTML and avoiding `dangerouslySetInnerHTML` unless explicitly sanitized.
   - Prevent SQL/NoSQL injection by using parameterized queries, ORMs (e.g. Prisma), or typed client libraries.

3. **Secure Storage & Data Encryption**:
   - Encrypt sensitive user data at rest and in transit (HTTPS / TLS 1.3).
   - Never store unencrypted auth tokens or user passwords in browser `localStorage` or unsecure local device storage.

4. **Authentication & Authorization Scoping**:
   - Enforce strict server-side and client-side access control on all routes and state resources.
   - Validate user ownership on every request to prevent IDOR (Insecure Direct Object Reference) vulnerability.

5. **Sanitized Error Handling**:
   - Do NOT leak full stack traces, database schema details, or system internals to client end-users in production builds.
   - Return clean, safe, user-friendly error responses while logging actual trace details server-side.

6. **Dependency & Build Hygiene**:
   - Periodically check for vulnerable packages (`npm audit` / `yarn audit`).
   - Avoid pulling unverified third-party libraries; use standard, vetted open-source packages.
```

---

## 🛠️ Summary Checklist for Starting a New Project

- [ ] **Create Project Folder**: `mkdir MyNewApp`
- [ ] **Copy Agent Rules & Skills**: Copy `.agents/` folder into project root or setup globally in `C:\Users\MSI\.gemini\config`.
- [ ] **Verify `AGENTS.md`**: Ensure UI rules, single-word directive, UTC+7 timezone, and security standards are present.
- [ ] **Environment Setup**: Add `.env` to `.gitignore` before committing code.
