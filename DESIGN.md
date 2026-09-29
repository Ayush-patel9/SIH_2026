# ManakAI Design System — Global Design Specification
## SIH 2026 — BIS Standards Intelligence Platform

> This document is the single source of truth for all UI/UX decisions in the ManakAI platform.
> Every component, every spacing value, every color token, and every interaction pattern
> is defined here. All AI agents, developers, and contributors must follow these specifications.

---

## 1. Core Principles

1. **No Emojis in UI Copy.** Emojis are explicitly prohibited in all button labels, headings, section titles, badges, status labels, table cells, and navigation items. Use Lucide SVG icons from the `lucide-react` package instead of emoji characters. The only exception is within AI-generated content returned by the backend that the user has not yet reviewed.
2. **Consistent Hierarchy.** Every screen has exactly one `<h1>` (page title). Secondary sections use `<h2>`. Component titles use `<h3>`. Labels and section markers use the `section-label` utility class.
3. **Restrained Animation.** Transitions are subtle and purposeful. No animations that loop indefinitely without user interaction. Hover transitions use 150ms ease. Page transitions use 200ms ease.
4. **Accessible Contrast.** All foreground/background combinations meet WCAG AA minimum contrast ratios. The primary ink color (#1C2419) against the canvas (#FBF9F5) exceeds WCAG AAA.
5. **Token-Based Implementation.** All colors, spacing, radii, and typography values must use the CSS variable tokens defined in Section 2. No hardcoded hex values should appear in component files.

---

## 2. Design Token Reference

All tokens are defined in `application/frontend/src/index.css` under `:root`.

### 2.1 Color Tokens — ManakAI Sovereign Theme (Default)

```css
/* Canvas and Surface */
--canvas:               #FBF9F5;   /* Warm parchment — page background */
--canvas-secondary:     #F6F3EB;   /* Oatmeal — secondary containers */
--surface:              #FFFEFB;   /* Elevated ivory — card backgrounds */
--surface-secondary:    #F5F0E6;   /* Warm beige — nested card tier */
--surface-hover:        #EFE9DD;   /* Hover state for surface elements */
--paper:                #FFFEFB;   /* Equivalent to surface — sticky headers */

/* Text Hierarchy */
--ink:                  #1C2419;   /* Primary text — headings and body */
--ink-primary:          #1C2419;
--ink-secondary:        #44503E;   /* Secondary text — descriptions */
--ink-muted:            #6E7A68;   /* Muted text — metadata, timestamps */
--ink-faint:            #9BA795;   /* Faint text — placeholders */
--ink-ghost:            #C4CDC0;   /* Disabled text */

/* Dividers */
--hairline:             #E5E0D4;   /* Default border and divider */
--hairline-hover:       #D5CFBF;   /* Hover border state */
--border-default:       #E5E0D4;

/* Primary Brand — Deep Botanical Olive */
--olive-primary:        #36452F;   /* Primary action color */
--olive-dark:           #24301F;   /* Primary action hover */
--olive-hover:          #2A3724;   /* Primary button hover */
--olive-sage:           #4A5D3F;   /* Secondary brand tone */
--olive-leaf:           #E8EDE4;   /* Chip/tag background */
--olive-tint:           #F0F4ED;   /* Very light olive tint */

/* Gold Accent — Antique Brass */
--gold-antique:         #C29D53;
--gold-bg:              #FBF7EC;
--gold-border:          #EAD9B5;
--gold-text:            #8A6922;

/* Status Colors */
--emerald-pass:         #2D6A4F;   /* Success / Active */
--emerald-bg:           #EDF7F1;
--emerald-border:       #B7E4C7;
--emerald-text:         #1B4332;

--amber-warn:           #C47F17;   /* Warning / Amendment required */
--amber-bg:             #FFF9EB;
--amber-border:         #FDE68A;

--error-red:            #BA3A2A;   /* Error / Withdrawn / Non-compliant */
--error-bg:             #FDF2F0;
--error-border:         #F7CDC6;
--error-line:           #BA3A2A;

--superposition-violet: #5B4E7A;   /* Alternative / Comparative */
--superposition-bg:     #F3F0F8;
--superposition-border: #DCD5E8;

--collapse-cobalt:      #36452F;   /* Primary recommendation highlight */

/* Shadows */
--shadow-xs:     0 1px 2px 0 rgba(54, 69, 47, 0.04);
--shadow-sm:     0 1px 3px 0 rgba(54, 69, 47, 0.04), 0 1px 2px -1px rgba(54, 69, 47, 0.03);
--shadow-card:   0 1px 3px 0 rgba(54, 69, 47, 0.04), 0 4px 16px -2px rgba(54, 69, 47, 0.03);
--shadow-modal:  0 16px 40px -4px rgba(28, 36, 25, 0.14);
```

### 2.2 Typography Tokens

```css
--font-ui:    'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif;
--font-prose: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-data:  'JetBrains Mono', monospace;
```

- **`--font-ui`**: All navigation, buttons, labels, badges, section headings, and interactive controls.
- **`--font-prose`**: Body text, descriptions, paragraphs, and card content.
- **`--font-data`**: IS standard numbers, SHA-256 hashes, numeric metrics, code snippets, timestamps, and technical identifiers.

### 2.3 Border Radius Tokens

```css
--radius-xs:   4px;    /* Micro chips, inline badges */
--radius-sm:   6px;    /* Default cards, inputs, buttons */
--radius-md:   10px;   /* Modals, larger cards */
--radius-lg:   14px;   /* Drawers, panels */
--radius-full: 9999px; /* Pill badges, toggle switches */
```

### 2.4 Spacing Scale

Use multiples of 4px for all margins, padding, and gaps:

| Token Name | Value | Use Case |
|:-----------|:------|:---------|
| 2px | Micro | Icon-to-label gap inside chips |
| 4px | XS | Gap between inline badges |
| 6px | SM | Button icon-to-text gap, dense row gap |
| 8px | Base | Default padding inside chips, small cards |
| 12px | MD | Section vertical rhythm, input padding |
| 16px | LG | Card padding, section gap |
| 20px | XL | Major section padding |
| 24px | 2XL | Page section vertical separation |
| 32px | 3XL | Empty state padding, major page sections |

---

## 3. Button Specifications

All buttons must follow these exact specifications. No button should deviate from the classes defined below.

### 3.1 Primary Button — `btn-primary`

Use for: The single most important call-to-action on a screen (e.g., "Search Standards", "Analyze Tender", "Generate Certificate").

```css
.btn-primary {
  font-family: var(--font-ui);
  font-size: 13px;
  font-weight: 600;
  color: #FFFFFF;
  background: var(--olive-primary);
  border: 1px solid var(--olive-dark);
  border-radius: var(--radius-sm);
  padding: 8px 16px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: background 150ms ease, box-shadow 150ms ease, transform 100ms ease;
  box-shadow: var(--shadow-xs);
  white-space: nowrap;
  user-select: none;
}

.btn-primary:hover:not(:disabled) {
  background: var(--olive-hover);
  box-shadow: var(--shadow-sm);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(1px);
  box-shadow: none;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary:focus-visible {
  outline: 2px solid var(--focus-blue);
  outline-offset: 2px;
}
```

**Example usage:**
```tsx
<button type="button" className="btn-primary" id="search-standards-btn">
  <Search size={14} />
  Search Standards
</button>
```

---

### 3.2 Secondary Button — `btn-secondary`

Use for: Secondary actions adjacent to a primary action (e.g., "Add Standard", "Export", "Copy Clause", "Compare").

```css
.btn-secondary {
  font-family: var(--font-ui);
  font-size: 13px;
  font-weight: 500;
  color: var(--ink);
  background: var(--surface);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-sm);
  padding: 7px 14px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: background 150ms ease, border-color 150ms ease, box-shadow 150ms ease;
  box-shadow: var(--shadow-xs);
  white-space: nowrap;
  user-select: none;
}

.btn-secondary:hover:not(:disabled) {
  background: var(--surface-hover);
  border-color: var(--hairline-hover);
  box-shadow: var(--shadow-sm);
}

.btn-secondary:active:not(:disabled) {
  background: var(--canvas-secondary);
}

.btn-secondary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
```

**Example usage:**
```tsx
<button type="button" className="btn-secondary" id="add-standard-btn">
  <Plus size={14} />
  Add Standard
</button>
```

---

### 3.3 Ghost Button — `btn-ghost`

Use for: Tertiary or destructive actions with low visual weight (e.g., "Remove", "Clear", close icons, "Show more").

```css
.btn-ghost {
  font-family: var(--font-ui);
  font-size: 12px;
  font-weight: 500;
  color: var(--ink-muted);
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  padding: 6px 10px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: color 150ms ease, background 150ms ease, border-color 150ms ease;
  user-select: none;
}

.btn-ghost:hover:not(:disabled) {
  color: var(--ink);
  background: var(--surface-hover);
  border-color: var(--hairline);
}

.btn-ghost:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
```

---

### 3.4 Danger Button — `btn-danger`

Use for: Irreversible destructive actions that require explicit user intent (e.g., "Delete Record", "Revoke Certificate").

```css
.btn-danger {
  font-family: var(--font-ui);
  font-size: 13px;
  font-weight: 600;
  color: var(--error-red);
  background: var(--error-bg);
  border: 1px solid var(--error-border);
  border-radius: var(--radius-sm);
  padding: 7px 14px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: background 150ms ease, border-color 150ms ease;
  user-select: none;
}

.btn-danger:hover:not(:disabled) {
  background: #FAE7E4;
  border-color: #EFB3AB;
}
```

---

### 3.5 Button Sizing Modifiers

Apply these modifier classes alongside the base button class to override default size:

| Class | Font Size | Padding | Use Case |
|:------|:----------|:--------|:---------|
| `.btn-xs` | 11px | 3px 8px | Dense table row actions, chip-embedded actions |
| `.btn-sm` | 12px | 5px 12px | Compact form actions, secondary toolbar buttons |
| (default) | 13px | 7-8px 14-16px | Standard UI actions |
| `.btn-lg` | 15px | 10px 20px | Hero CTAs, modal confirmation actions |

---

### 3.6 Button ID Conventions

Every interactive button must have a unique, descriptive `id` attribute for browser testing:

- Pattern: `{feature}-{action}-btn`
- Examples: `search-standards-btn`, `generate-certificate-btn`, `add-alternative-btn`, `export-nit-btn`, `upload-tender-btn`

---

## 4. Input Field Specifications

### 4.1 Text Input — `auth-input`

```css
.auth-input {
  font-family: var(--font-prose);
  font-size: 13px;
  color: var(--ink);
  background: var(--surface);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-sm);
  padding: 8px 12px;
  width: 100%;
  transition: border-color 150ms ease, box-shadow 150ms ease;
  outline: none;
}

.auth-input::placeholder {
  color: var(--ink-faint);
  font-style: normal;
}

.auth-input:hover {
  border-color: var(--hairline-hover);
}

.auth-input:focus {
  border-color: var(--olive-primary);
  box-shadow: 0 0 0 3px var(--focus-blue-glow);
}
```

### 4.2 Select Dropdown — `auth-input auth-select`

Apply `auth-select` alongside `auth-input` on `<select>` elements. This adds the dropdown arrow treatment and removes the browser default appearance.

---

## 5. Card and Panel Specifications

### 5.1 Workbench Card — `workbench-card`

The primary container for feature content areas and tool panels.

```css
.workbench-card {
  background: var(--surface);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-card);
  padding: 20px;
  transition: box-shadow 200ms ease;
}

.workbench-card:hover {
  box-shadow: var(--shadow-card-hover);
}
```

**Anatomy:**
- Top: `section-label` (10–11px uppercase tracking letter) + `<h2>` card title + description `<p>`
- Middle: Primary content (tables, graphs, forms)
- Bottom: Action row with `btn-secondary` or `btn-ghost` buttons

### 5.2 Section Label — `section-label`

Used as the eyebrow text above every major card title. Must always be uppercase.

```css
.section-label {
  font-family: var(--font-data);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ink-muted);
  margin-bottom: 4px;
}
```

**Example:**
```tsx
<div className="section-label">STANDARDS INTELLIGENCE</div>
<h2>Tri-Retrieval Query Engine</h2>
```

---

## 6. Badge and Chip Specifications

### 6.1 Status Badges — `concept-status-badge`

Used to display IS standard compliance status inline.

```css
.concept-status-badge {
  font-family: var(--font-data);
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: var(--radius-xs);
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
}

/* Active / Compliant */
.concept-status-badge.active {
  background: var(--emerald-bg);
  color: var(--emerald-text);
  border: 1px solid var(--emerald-border);
}

/* Withdrawn / Non-compliant */
.concept-status-badge.withdrawn {
  background: var(--error-bg);
  color: var(--error-red);
  border: 1px solid var(--error-border);
  text-decoration: line-through;
}

/* Amendment required / Under revision */
.concept-status-badge.amendment {
  background: var(--amber-bg);
  color: var(--amber-warn);
  border: 1px solid var(--amber-border);
}

/* Alternative / Comparative */
.concept-status-badge.alternative {
  background: var(--superposition-bg);
  color: var(--superposition-violet);
  border: 1px solid var(--superposition-border);
}
```

### 6.2 QCO Mandatory Badge

For inline tagging of standards with mandatory Quality Control Order status:

```tsx
<span style={{
  fontFamily: 'var(--font-data)',
  fontSize: '10px',
  fontWeight: 700,
  padding: '2px 6px',
  borderRadius: 'var(--radius-xs)',
  background: 'var(--gold-bg)',
  color: 'var(--gold-text)',
  border: '1px solid var(--gold-border)',
}}>
  QCO MANDATORY
</span>
```

### 6.3 Palette Filter Buttons — `palette-btn`

For toggle-style filter buttons in toolbars:

```css
.palette-btn {
  font-family: var(--font-ui);
  font-size: 12px;
  font-weight: 500;
  color: var(--ink-secondary);
  background: var(--surface);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-sm);
  padding: 5px 10px;
  cursor: pointer;
  transition: all 150ms ease;
}

.palette-btn.selected,
.palette-btn:hover {
  background: var(--olive-leaf);
  border-color: var(--olive-sage);
  color: var(--olive-primary);
}
```

---

## 7. Table Specifications — `data-table`

```css
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-family: var(--font-prose);
  font-size: 13px;
  color: var(--ink);
}

.data-table thead tr {
  background: var(--canvas-secondary);
  border-bottom: 1px solid var(--hairline);
}

.data-table th {
  font-family: var(--font-ui);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--ink-muted);
  padding: 10px 12px;
  text-align: left;
}

.data-table td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--hairline);
  vertical-align: top;
  line-height: 1.45;
}

.data-table tbody tr:hover {
  background: var(--surface-hover);
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}
```

**IS Number Cell:** Always use `var(--font-data)` for IS number values in table cells, with `font-weight: 600`.

---

## 8. Typography Scale

| Element | Font | Size | Weight | Color | Usage |
|:--------|:-----|:-----|:-------|:------|:------|
| Page Title `h1` | `--font-ui` | 24px | 700 | `--ink` | One per page |
| Card Title `h2` | `--font-ui` | 18–20px | 600 | `--ink` | Section heading |
| Subsection `h3` | `--font-ui` | 15–16px | 600 | `--ink` | Component heading |
| Section Label | `--font-data` | 10px | 600 | `--ink-muted` | Eyebrow above h2 |
| Body / Description | `--font-prose` | 13–14px | 400 | `--ink-secondary` | Card descriptions |
| Table Header | `--font-ui` | 11px | 600 | `--ink-muted` | Uppercase, tracked |
| Table Cell | `--font-prose` | 13px | 400 | `--ink` | Data cells |
| IS Number | `--font-data` | 13–15px | 600–700 | `--ink` | Standard codes |
| Hash / Code | `--font-data` | 11–12px | 400 | `--ink-secondary` | SHA-256, snippets |
| Badge / Chip | `--font-data` | 10–11px | 600 | varies | Status labels |
| Button Label | `--font-ui` | 12–13px | 500–600 | varies | Action labels |
| Input Placeholder | `--font-prose` | 13px | 400 | `--ink-faint` | Placeholder text |
| Timestamp | `--font-data` | 11px | 400 | `--ink-muted` | Dates, times |

---

## 9. Icon Usage

Use icons exclusively from the `lucide-react` package. Do not use emoji as icon substitutes.

### 9.1 Standard Icon Sizes

| Context | Size | Example |
|:--------|:-----|:--------|
| Button icon (default) | 14px | `<Search size={14} />` |
| Button icon (small) | 12–13px | `<Plus size={12} />` |
| Inline with text | 14–16px | Next to metadata labels |
| Card action icons | 16px | Copy, Download, Share actions |
| Sidebar navigation | 18px | Nav item icons |
| Feature hero icons | 20–24px | Section-level visual marker |
| Empty state icons | 32–40px | Centered empty state illustration |

### 9.2 Preferred Icon Assignments

| Action / Concept | Icon |
|:-----------------|:-----|
| Search / Query | `Search` |
| Add / Create | `Plus` |
| Remove / Delete | `X` or `Trash2` |
| Download / Export | `Download` |
| Copy to clipboard | `Copy` |
| Verification / Compliance | `ShieldCheck` |
| Warning / Amendment | `AlertTriangle` |
| Loading / Processing | `Loader2` with `.spinner` class |
| Standard / Certificate | `Award` |
| Audit / Lock | `Lock` |
| Graph / Network | `Network` |
| Upload / Ingest | `Upload` |
| Clock / History | `Clock` |
| Settings | `Settings` |

---

## 10. Loading and Empty States

### 10.1 Loading Spinner

```tsx
import { Loader2 } from 'lucide-react';

<Loader2 size={16} className="spinner" />
```

```css
.spinner {
  animation: spin 700ms linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
```

### 10.2 Empty State Structure

```tsx
<div style={{
  padding: '40px 24px',
  textAlign: 'center',
  background: 'var(--surface-secondary)',
  borderRadius: 'var(--radius-sm)',
  border: '1px dashed var(--hairline)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '8px',
}}>
  <Search size={36} color="var(--ink-faint)" />
  <h3 style={{ fontFamily: 'var(--font-ui)', fontSize: '15px', fontWeight: 600, color: 'var(--ink)', margin: 0 }}>
    No Standards Found
  </h3>
  <p style={{ fontFamily: 'var(--font-prose)', fontSize: '13px', color: 'var(--ink-secondary)', maxWidth: '420px', margin: 0 }}>
    Enter a material name or IS number above to search across 22,011 Indian Standards.
  </p>
</div>
```

---

## 11. Status Color Semantic Mapping

These color assignments are consistent across all features and must not be repurposed:

| Status | Background Token | Text / Border Token | Use Case |
|:-------|:-----------------|:--------------------|:---------|
| Active / Compliant | `--emerald-bg` | `--emerald-text` / `--emerald-border` | Active IS standard, QCO compliant |
| Warning / Amendment | `--amber-bg` | `--amber-warn` / `--amber-border` | Mandatory amendment, under revision |
| Withdrawn / Error | `--error-bg` | `--error-red` / `--error-border` | Withdrawn standard, non-compliant |
| QCO Mandatory | `--gold-bg` | `--gold-text` / `--gold-border` | Mandatory ISI mark required |
| Alternative | `--superposition-bg` | `--superposition-violet` / `--superposition-border` | Alternative candidate standard |
| Primary Selection | `rgba(54,69,47,0.06)` | `--collapse-cobalt` | Primary recommendation highlight |

---

## 12. Sidebar Navigation Specification

The sidebar is defined in `application/frontend/src/components/Sidebar.tsx`.

- **Width:** 220px (collapsed to icon-only at 56px on mobile breakpoint)
- **Background:** `var(--void)` (#232B20 — Deep Botanical Charcoal)
- **Nav Item Font:** `var(--font-ui)`, 13px, weight 500
- **Nav Item Text Color:** `rgba(255,255,255,0.7)` (inactive), `#FFFFFF` (active)
- **Active Nav Item Background:** `rgba(255,255,255,0.1)`
- **Active Nav Item Left Border:** 3px solid `var(--gold-antique)`
- **Nav Item Padding:** 10px 14px
- **Nav Item Icon:** Lucide icon, 16px, positioned before label text with 10px gap
- **Section Separator:** `var(--font-data)`, 9px uppercase, `rgba(255,255,255,0.35)`, with 12px top margin

**No emoji characters in sidebar navigation labels.**

---

## 13. Modal and Drawer Specification

### 13.1 Modal Overlay

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(28, 36, 25, 0.6);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
```

### 13.2 Modal Container

```css
.modal-container {
  background: var(--surface);
  border: 1px solid var(--hairline);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-modal);
  max-width: 640px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}
```

### 13.3 Modal Header Structure

```tsx
<div style={{ padding: '20px 24px', borderBottom: '1px solid var(--hairline)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
  <div>
    <div className="section-label">CONTEXT LABEL</div>
    <h2 style={{ fontFamily: 'var(--font-ui)', fontSize: '18px', fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
      Modal Title
    </h2>
  </div>
  <button type="button" className="btn-ghost" style={{ padding: '4px' }} id="close-modal-btn" aria-label="Close">
    <X size={16} />
  </button>
</div>
```

---

## 14. Accessibility Requirements

- All interactive elements must have a unique `id` attribute.
- All icon-only buttons must have an `aria-label` attribute.
- All form inputs must have an associated `<label>` element with a `htmlFor` attribute.
- Focus styles must be visible and use `outline: 2px solid var(--focus-blue)` with `outline-offset: 2px`.
- Never remove `:focus-visible` styles.
- Color alone must never be the sole indicator of status — always pair color with text or an icon.

---

## 15. Theme System

The platform supports two themes, toggled via the `data-theme` attribute on `<html>`:

| Theme | Attribute | Description |
|:------|:----------|:------------|
| ManakAI Sovereign (default) | none / `data-theme="sovereign"` | Warm parchment, deep olive, antique gold |
| Zoom Enterprise | `data-theme="zoom"` | Clean arctic blue-white, corporate navy |

All component styles use CSS token variables only, so themes apply automatically without component changes. The theme toggle is implemented in `application/frontend/src/components/ThemeSwitcher.tsx`.

---

## 16. Prohibited Patterns

The following patterns are explicitly prohibited across all component files:

1. **Hardcoded hex colors** in component files (use CSS variable tokens)
2. **Emoji characters** in UI labels, headings, buttons, badges, or navigation items
3. **Inline `style={{ color: 'red' }}`** or similar direct color values — use token variables
4. **Multiple `<h1>` elements** on a single page
5. **`console.log` statements** committed to production components
6. **Hardcoded pixel values for spacing** that do not follow the 4px grid system
7. **`!important` in CSS** except in reset/normalize rules
8. **Non-Lucide icons** — do not import icons from any other icon library

---

*This document is the authoritative source for all design decisions in ManakAI.*
*For questions about specific component implementations, refer to the component source files in*
*`application/frontend/src/components/` and `application/frontend/src/features/`.*
