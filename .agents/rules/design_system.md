# ManakAI Design System Rules

## Source of Truth

The global design specification for this project is defined in:

```
/Users/ayushpatel/SIH2026/DESIGN.md
```

**Before writing any frontend component, modifying any CSS, or adding any UI element,
you MUST read DESIGN.md and follow all specifications defined there.**

---

## Non-Negotiable Rules

### 1. No Emoji in UI

Emoji characters are PROHIBITED in all component output:
- No emoji in button labels
- No emoji in headings or section titles
- No emoji in badge text or status labels
- No emoji in sidebar navigation items
- No emoji in table cells or card descriptions

Use Lucide SVG icons from `lucide-react` instead.

### 2. Button Formatting

Every button must use one of these exact CSS classes:
- `btn-primary` — primary call-to-action
- `btn-secondary` — secondary actions
- `btn-ghost` — tertiary or low-weight actions
- `btn-danger` — destructive actions

Size modifiers: `btn-xs`, `btn-sm`, `btn-lg`

Every button must have a unique `id` attribute following the pattern: `{feature}-{action}-btn`

### 3. Color Tokens Only

No hardcoded hex values in component files.
All colors must use `var(--token-name)` CSS variables defined in `index.css`.

### 4. Typography

- Headings and buttons: `var(--font-ui)` (Plus Jakarta Sans)
- Body and descriptions: `var(--font-prose)` (Inter)
- IS numbers, hashes, codes, data: `var(--font-data)` (JetBrains Mono)

### 5. Icon Sizes

- Button icons: 14px (default), 12px (small buttons)
- Inline icons: 14–16px
- Sidebar navigation: 18px
- Empty state illustration: 32–40px

### 6. Spacing

All spacing values must be multiples of 4px.

### 7. Single H1 Per Page

Each page/route may have exactly one `<h1>` element.

---

## Quick Reference Card

| Element | Class/Token | Notes |
|:--------|:-----------|:------|
| Primary button | `btn-primary` | Olive background, white text |
| Secondary button | `btn-secondary` | Surface background, border |
| Ghost button | `btn-ghost` | Transparent, low weight |
| Card container | `workbench-card` | Surface + border + shadow |
| Eyebrow label | `section-label` | 10px, uppercase, font-data |
| Status: active | `concept-status-badge active` | Emerald |
| Status: withdrawn | `concept-status-badge withdrawn` | Red, strikethrough |
| Status: amendment | `concept-status-badge amendment` | Amber |
| Data table | `data-table` | Standard table styling |
| Filter toggle | `palette-btn` / `palette-btn selected` | Olive when selected |
| Text input | `auth-input` | Focus ring on --olive-primary |
| Select input | `auth-input auth-select` | Custom arrow treatment |
