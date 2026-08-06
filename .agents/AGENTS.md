# Project Rules & Style Guidelines

## Core Directives

1. **No Emojis**:
   - DO NOT use emojis anywhere in the app UI, text labels, category markers, or headers.
   - Use vector icons (`@expo/vector-icons`, Ionicons, Feather, MaterialCommunityIcons, Lucide) or SVG icons exclusively for all visual representations.

2. **Design Aesthetic — iOS 18 Liquid Glass Bento Grid System**:
   - Implement premium iOS 18 glassmorphism (frosted translucent dark panels, 24px background blurs, multi-layered depth, sleek dark surfaces).
   - **Color Rule**: DO NOT use bright/harsh solid background fills. Use dark translucent iOS bento cards (`rgba(30, 30, 38, 0.85)` base) paired with **soft 18% translucent colored glass tints** (`rgba(color, 0.18)`), subtle colored icon badges, and 1px colored accent borders.
   - Use **iOS Bento Grid Layouts** (2x2 or 2x3 tile cards with soft drop shadows).
   - Use concentric rounded corners (`outer_radius = inner_radius + padding`, outer radius `20px-24px`, inner icon badges `10px-12px`).
   - Use refined gradient borders with translucent fills (`rgba(255, 255, 255, 0.08)` to `rgba(255, 255, 255, 0.12)`).
   - Enforce curated color tokens: Blue `#1E88E5`, Red `#E53935`, Dark Grey `#2A2A2E`, Amber `#FB8C00`, Pink `#FF4081`, Slate `#546E7A`, Purple `#AB47BC`, Emerald `#00E676`, Cyan `#2EAADC`.
   - Ensure clean typography, smooth micro-animations, and high-contrast readable text over glass surfaces.

3. **Single-Word Clean Naming Directive**:
   - ALL UI text labels, category names, preset titles, navbar tabs, card headers, and action buttons MUST strictly use 1 single word (e.g. `Expenses`, `Savings`, `Vault`, `Emergency`, `Goal`, `Food`, `Drink`, `Transport`, `Investment`, `Groceries`, `Bills`, `Shopping`, `Fun`, `Tech`, `Health`, `Income`).
   - Never use multi-word labels anywhere in the application interface.
