# PiTrack — Google Stitch UX/UI & System Architecture Specification

## 1. Executive Summary & Design Philosophy

PiTrack is a high-performance Progressive Web Application (PWA) engineered for personal expense tracking, multi-period budgeting, savings vault management, and automated reminder calendar synchronization.

The user interface follows the **Google Stitch Design Framework** combined with Apple **iOS 18 Muted Pastel Bento Grid System**, focusing on zero-friction user workflows, high contrast typography, solid matte glassmorphic cards, and strict visual consistency.

---

## 2. Core Design Directives

### Directives Checklist
- **No Emojis**: Emojis are strictly forbidden across all interface components, labels, and headers. Vector icons (Lucide Icons) are used exclusively.
- **Single-Word Clean Naming**: Every navigation tab, category marker, preset button, card header, and action control strictly uses 1 single word (e.g., `Expenses`, `Savings`, `Vault`, `Goal`, `Task`, `Install`, `Share`, `Add`).
- **No Glowing Blur Shadows**: Heavy neon glows, blurry backdrop backdrops, and glowing radiuses are prohibited. Cards use solid matte surface fills with crisp clean borders (`1px solid rgba(255, 255, 255, 0.08)`).
- **Timezone Standardization**: Primary execution environment explicitly adheres to **Cambodia Timezone (Asia/Phnom_Penh, ICT, UTC+7)** for all calendar exports (`.ics`), due date math, and reminder alerts.

---

## 3. iOS 18 Muted Pastel Color System

| State / Module | Hex Code | Purpose |
| :--- | :--- | :--- |
| **Today** | `#4A99E9` | Soft Muted Sky Blue (Daily active scope, today tasks) |
| **Scheduled** | `#ED6C6C` | Soft Muted Salmon Coral (Future scheduled items) |
| **All** | `#48484A` | Soft Dark Charcoal (Global overview cards) |
| **Flagged** | `#F3A85B` | Soft Warm Peach Gold (High priority items) |
| **Urgent** | `#EC668C` | Soft Rose Muted Pink (Urgent alerts) |
| **Completed** | `#6C7B8A` | Soft Muted Steel Grey (Completed items) |
| **Background Surface** | `#0B131E` | Deep Space Matte Black Base Surface |
| **Card Glass Surface** | `#141E2C` | Matte Bento Card Container Fill |

---

## 4. Bento Grid Layout Architecture

The user interface employs concentric rounded container geometry:

$$\text{outer\_radius} = \text{inner\_radius} + \text{padding}$$

- **Outer Bento Tile Radius**: `20px` to `24px`
- **Inner Icon Badge Radius**: `10px` to `12px`
- **Container Padding**: `12px` to `16px`
- **Bento Grid Alignment**: Responsive 2x2 and 2x3 tile configurations.

---

## 5. System Architecture & Component Hierarchy

### Application Modules

1. **Expenses Module (`ExpensesScreen.tsx`)**:
   - Multi-period budgeting (`Daily`, `Weekly`, `Monthly`).
   - Multi-currency transaction logging (`USD` / `KHR` at $1 = 4,000 \text{ KHR}$).
   - Category allocation and monthly rollover calculation.

2. **Savings Module (`SavingsScreen.tsx`)**:
   - Vault emergency savings goals.
   - Surplus budget auto-allocation snapshots.
   - Multi-goal progress visualization.

3. **Planner & Reminders Module (`PlannerScreen.tsx`)**:
   - Interactive todo checklist.
   - Inline Information & Edit Modal (`ReminderDetailModal.tsx`) supporting instant updates to `Title`, `Notes`, `Date`, `Start Time`, and `End Time`.
   - Voice input recognition (`speechService.ts`).
   - Reorderable quick presets (`PlannerPresetGrid.tsx`).

4. **Calendar & iOS Integration (`calendarSyncService.ts`)**:
   - Local Floating Time (`YYYYMMDDTHHmm00`) `.ics` event generation for Apple Calendar with audio alarms (`VALARM`).
   - Native iOS Share Sheet integration for Apple Reminders (`VTODO`).
   - Background Web Push Service Worker (`public/sw.js`) and Home Screen red badge notification support (`navigator.setAppBadge`).

---

## 6. Database & Persistence Architecture

- **Primary User ID (`pkid`)**: Numeric auto-increment integer (`1`, `2`, `3`...) managed via Cloudflare Workers KV counter (`sys:user_counter`).
- **Guest Device Fallback**: Local storage persistence via `StorageService.ts` with string coercion checks preventing type mismatch crashes.
- **Service Worker PWA**: Registered Service Worker (`/sw.js`) delivering background push notifications outside Safari on iOS Lock Screens.

---

## 7. Verification & Deployment Pipeline

1. **Static Analysis & Compilation**: `tsc && vite build` validation.
2. **Assets Isolation**: Exclusion of workspace files via root, public, and dist `.assetsignore` manifests for Cloudflare Workers deployment.
3. **Repository Pipeline**: Production deployment synced directly to `HoutWill/Tracker-App` master branch.
