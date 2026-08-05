---
name: make-interfaces-feel-better
description: Apply concrete design-engineering details that make interfaces feel polished. Use when reviewing or improving UI spacing, typography, borders, shadows, motion, hit areas, icons, text wrapping, and interaction states.
metadata:
  origin: community
---

# Make Interfaces Feel Better

Use this skill for the small design-engineering details that compound into a
more polished interface.

Source: salvaged from stale community PR #1659 by `linus707`.

## When to Use

- The user says the UI feels off, flat, generic, cramped, jumpy, or unfinished.
- You are building controls, cards, lists, dashboards, navigation, forms, or
  toolbars.
- A component needs hover, active, focus, enter, exit, loading, or empty states.
- A frontend review needs specific before/after recommendations.

## Core Principles

### Concentric Radius

For nearby nested rounded surfaces:

```text
outer radius = inner radius + padding
```

If padding is large, treat layers as separate surfaces instead of forcing the
math. The point is optical coherence, not formula worship.

### Optical Alignment

Geometric centering is not always visual centering. Icon buttons, play
triangles, arrows, stars, and asymmetric icons often need a small offset. Fix the
SVG when possible; otherwise adjust with a pixel-level margin or padding change.

### Shadows And Borders

Use borders for separation and focus rings. Use layered shadows when a card,
button, dropdown, popover needs depth. Shadows should be transparent and
subtle enough to work across backgrounds.

### Text Wrapping

- Use `text-wrap: balance` on headings and short titles.
- Use `text-wrap: pretty` on short-to-medium body text, captions, descriptions,
  and list items.
- Avoid both on long prose, code, and preformatted content.
- Use `font-variant-numeric: tabular-nums` for counters, timers, prices, tables,
  and other updating numbers.

### Font Smoothing

On macOS, apply antialiased font smoothing at the root layout when the project
does not already do so:

```css
html {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### Image Outlines

Images often need a subtle inset outline so their edges do not blur into the
surface.

```css
img {
  outline: 1px solid rgba(0, 0, 0, 0.1);
  outline-offset: -1px;
}
```

### Touch & Hit Targets

- Ensure interactive elements have a minimum hit target of 44x44px.
- Use invisible padding or pseudoelements (`::before`) if the visual element is smaller.

### Motion & Feedback

- Keep interactive micro-animations fast (150ms - 250ms).
- Use `ease-out` for entering elements and `ease-in` for exiting elements.
- Always provide active/pressed state feedback for buttons and touch targets.
