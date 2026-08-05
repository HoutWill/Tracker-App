# Project Rules & Style Guidelines

## Core Directives

1. **No Emojis**:
   - DO NOT use emojis anywhere in the app UI, text labels, category markers, or headers.
   - Use vector icons (`@expo/vector-icons`, Ionicons, Feather, MaterialCommunityIcons, Lucide) or SVG icons exclusively for all visual representations.

2. **Design Aesthetic — Liquid Glass iOS Design**:
   - Implement premium iOS glassmorphism (frosted translucent panels, subtle background blurs, multi-layered depth, sleek dark surfaces).
   - Use concentric rounded corners (`outer_radius = inner_radius + padding`).
   - Use refined gradient borders with translucent fills (`rgba(255, 255, 255, 0.08)` to `rgba(255, 255, 255, 0.12)`).
   - Ensure clean typography, smooth micro-animations, and high-contrast readable text over glass surfaces.

3. **Single-Word Clean Naming Directive**:
   - ALL UI text labels, category names, preset titles, navbar tabs, card headers, and action buttons MUST strictly use 1 single word (e.g. `Expenses`, `Savings`, `Vault`, `Emergency`, `Goal`, `Food`, `Drink`, `Transport`, `Investment`, `Groceries`, `Bills`, `Shopping`, `Fun`, `Tech`, `Health`, `Income`).
   - Never use multi-word labels anywhere in the application interface.
