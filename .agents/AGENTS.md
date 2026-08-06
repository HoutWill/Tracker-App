# Project Rules & Style Guidelines

## Core Directives

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
