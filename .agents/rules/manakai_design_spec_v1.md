# ManakAI Design Specification v1

This is the source of truth for the visual redesign. Engineering implements it; where it conflicts with any earlier prompt, this document wins. It governs appearance only. The zero-regression rules in the implementation brief still apply: no changes to state, handlers, props, data flow, or API calls.

---

## 0. Decision log

| Question | Decision |
|---|---|
| Color philosophy | **Option C, "Drawing sheet."** Cool neutral paper, graphite ink, survey-blue accent, and a stamp-ink violet reserved only for authority marks. |
| Legacy themes | "Sovereign Editorial" and "Zoom Enterprise" are both retired. One palette family with a light mode and a dark mode. The existing theme toggle stays; only its token values change. |
| Primary theme for demos | Light. It projects better and matches the document metaphor. |
| Status policy | Color flags exceptions only. Conforming data stays in plain ink. |
| UI font | IBM Plex Sans |
| Verbatim standard text | Literata, and only for text quoted from a standard or tender |
| Identifiers | IBM Plex Mono, and only for IS codes, clause references, hashes, document IDs |
| Quantities (43 MPa etc.) | IBM Plex Sans with tabular figures, not mono |
| Region separation | Whitespace first, background tone second, hairline rule last |
| Elevation | Flat in the page flow. Shadows only on things that float. |
| Corner radius | Overruled the "single radius" idea. Radius follows hierarchy: 0 / 4 / 8 px. |
| Signature element | The conformity record with its authority seal (section 7) |

### Why not the offered options

**Option A (warm parchment + serif + navy)** is currently the single most common look of AI-generated interfaces. Warm cream backgrounds paired with serif type read as "generated" before anyone reads a word. We keep the idea of paper, but make it cool and neutral like a drawing sheet, which suits an engineering-standards product better.

**Option B (#F8F9FA, #18181B)** uses Bootstrap's and Tailwind's default greys. It is safe and anonymous; nothing about it says "Indian standards compliance."

**A single universal radius** applied to every element regardless of size is itself a template tell. Controls, sheets, and edge-attached panels are different kinds of objects and get different corners.

**JetBrains Mono for all numbers** makes the product feel like a developer terminal. Procurement officers and auditors are not developers. Mono is kept for strings people copy and cite; quantities use tabular sans figures.

---

## 1. Principles

**1. The source is sacred.** Text quoted verbatim from a standard or tender is always set in serif (Literata). Everything the system says, including AI reasoning, is set in sans (Plex Sans). A user must never confuse the system's interpretation with statutory text. This is the one typographic rule that carries meaning, and it is non-negotiable.

**2. Color flags exceptions.** In a table of 42 parameters where 39 conform, 39 green rows are noise. Conforming values stay ink. Color appears only where a human needs to look.

**3. Documents, not dashboards.** The working stage is a sheet of paper with sections on it, not a grid of cards. Structure (borders, numbering, labels) exists only when it encodes information.

**4. One bold moment.** The conformity record (verdict + seal) is the only visually loud element on a screen. Everything around it is quiet.

---

## 2. Color

### 2.1 Light mode (primary)

| Token | Hex | Role |
|---|---|---|
| `--bg` | `#F3F4F2` | Canvas behind sheets. Cool, faintly grey-green, like drafting paper. |
| `--surface` | `#FFFFFF` | Sheets, drawer, top bar, inputs |
| `--surface-sunk` | `#ECEDEA` | Inset wells: skeletons, raw-data blocks, code |
| `--surface-hover` | `#E6E8E4` | Row and menu-item hover |
| `--rule` | `#DDDFDB` | Hairlines between table rows, sheet borders |
| `--rule-strong` | `#C4C7C2` | Input borders, table header underline |
| `--ink` | `#1A1D21` | Primary text (graphite, not pure black) |
| `--ink-2` | `#454A52` | Secondary text, AI reasoning prose |
| `--ink-muted` | `#5D636C` | Metadata, units, placeholders, column headers |
| `--ink-faint` | `#8C9199` | Disabled states and non-text icons only; never body text |
| `--accent` | `#1E4D8C` | Survey blue. Primary buttons, links, active tab, focus |
| `--accent-hover` | `#173E72` | Hover/pressed for accent |
| `--accent-subtle` | `#E6EDF6` | Selected row, active menu item |
| `--on-accent` | `#FFFFFF` | Text on accent fill |
| `--seal` | `#54408A` | Stamp-ink violet. **Authority marks only** (section 7) |
| `--seal-subtle` | `#EEEAF5` | Rarely used; seal hover |
| `--pass` | `#2E6B41` | Conforms |
| `--pass-subtle` | `#E7F1EA` | Not used on rows; reserved |
| `--fail` | `#A63A2B` | Outside tolerance / non-conforming |
| `--fail-subtle` | `#F8E9E6` | Tint for non-conforming table rows only |
| `--warn` | `#8A6510` | Needs review |
| `--warn-subtle` | `#F6EFDC` | Tint for needs-review table rows only |

All text/background pairs above meet WCAG AA (≥4.5:1). Checked: `--ink-muted` on `--bg` ≈ 5.5:1, `--pass`/`--fail` on white ≈ 6.4:1, `--warn` on white ≈ 5.3:1, `--accent` on white ≈ 8.6:1, `--seal` on white ≈ 8.6:1.

### 2.2 Dark mode

| Token | Hex |
|---|---|
| `--bg` | `#131619` |
| `--surface` | `#191C20` |
| `--surface-sunk` | `#0F1113` |
| `--surface-hover` | `#20242A` |
| `--rule` | `#282C32` |
| `--rule-strong` | `#383D44` |
| `--ink` | `#E6E7E4` |
| `--ink-2` | `#BFC2C6` |
| `--ink-muted` | `#969BA3` |
| `--ink-faint` | `#6B7078` |
| `--accent` | `#8DB0DE` |
| `--accent-hover` | `#A7C3E8` |
| `--accent-subtle` | `#1A2638` |
| `--on-accent` | `#0D1420` |
| `--seal` | `#B9A6E3` |
| `--seal-subtle` | `#221C33` |
| `--pass` / `--pass-subtle` | `#7DBB8E` / `#14241A` |
| `--fail` / `--fail-subtle` | `#E38B7D` / `#2B1714` |
| `--warn` / `--warn-subtle` | `#D8B45F` / `#2A2210` |

In dark mode, depth comes from lighter surfaces and `--rule-strong` outlines, not shadows.

### 2.3 Usage rules

- **One accent.** `--accent` means "you can act on this" (buttons, links, active tab, focus). It is never decoration.
- **Seal is not an accent.** `--seal` appears only on authority marks. Never on buttons, links, headings, or backgrounds.
- **At most one filled accent button per region.** Everything else is secondary or text style.
- **No palette colors outside this table.** No Tailwind defaults (`slate-*`, `blue-*`, `indigo-*`, `violet-*`, `purple-*`, `sky-*`, `emerald-*`, etc.) and no hex values in components; tokens only.

### 2.4 Status indicator policy

Verdicts are shown as **glyph + word in the status color**, never as filled pills and never by color alone.

| State | Glyph | Word | Where color appears |
|---|---|---|---|
| Conforms | check (14 px) in `--pass` | "Conforms" (word optional in tables, required in the verdict and for screen readers via `aria-label`) | Glyph only. The row and its values stay ink. |
| Outside tolerance | cross (14 px) in `--fail` | "Outside tolerance" | Glyph, word, the offending value, and a `--fail-subtle` row tint |
| Needs review | exclamation (14 px) in `--warn` | "Needs review" | Glyph, word, and a `--warn-subtle` row tint |
| Not evaluated | en dash in `--ink-muted` | "Not evaluated" | None |

The overall verdict appears in exactly one place: the conformity record (section 7).

---

## 3. Typography

### 3.1 Families

| Family | Weights to load | Used for |
|---|---|---|
| IBM Plex Sans | 400, 500, 600 | All UI: nav, labels, buttons, tables, AI reasoning, headings |
| Literata | 400, 400 italic | Verbatim standard/tender text only |
| IBM Plex Mono | 400, 500 | IS codes, clause refs, hashes, document IDs |
| IBM Plex Sans Devanagari | 400, 500 | Only if the app displays Hindi titles of standards |

Plex was chosen because it was designed for engineering contexts, has excellent tabular figures, and pairs with a Devanagari companion, which matters for BIS material. Always provide fallbacks: `"IBM Plex Sans", system-ui, -apple-system, "Segoe UI", sans-serif`.

### 3.2 Type roles

| Token | Family | Size / line height | Weight | Tracking | Use |
|---|---|---|---|---|---|
| `title` | Plex Sans | 22 / 28 | 600 | −0.01em | One per screen (e.g., "Standards", the item name) |
| `heading` | Plex Sans | 17 / 24 | 600 | −0.005em | Section headings on the sheet |
| `subheading` | Plex Sans | 14 / 20 | 600 | 0 | Drawer section heads, table group heads |
| `body` | Plex Sans | 14 / 20 | 400 | 0 | Default UI text |
| `body-strong` | Plex Sans | 14 / 20 | 500 | 0 | Button text, active nav, field labels |
| `small` | Plex Sans | 13 / 18 | 400 | 0 | Metadata, helper text, secondary table text |
| `caption` | Plex Sans | 12 / 16 | 500 | +0.01em | Column headers, timestamps |
| `verdict` | Plex Sans | 24 / 30 | 600 | −0.01em | Conformity record verdict only |
| `reasoning` | Plex Sans | 14 / 22 | 400 | 0 | AI reasoning prose, `--ink-2`, max 72ch |
| `source` | Literata | 16 / 27 | 400 | 0 | Verbatim clause text, max 68ch |
| `source-note` | Literata | 14 / 22 | 400 italic | 0 | NOTE paragraphs inside standards |
| `id` | Plex Mono | 13 / 20 | 400 | 0 | IS 269:2015, clause 6.2, hashes |
| `figure` | Plex Sans | 14 / 20 | 400 | 0 | Quantities, with `font-variant-numeric: tabular-nums lining-nums` |

---

## 4. Surfaces, Spacing, Elevation, Radius

### 4.1 Separation
1. Whitespace: 48px between sections.
2. Tone: Canvas (`--bg`) vs Sheet (`--surface`) vs Inset well (`--surface-sunk`).
3. Hairline: 1px `--rule` only where needed.

### 4.2 Spacing Base: 4px
Allowed: 4, 8, 12, 16, 24, 32, 48, 64 px.

### 4.3 Radius by Hierarchy
- Controls (buttons, inputs, checkboxes, seal): 4px
- Sheets, menus, popovers, modals: 8px
- Edge-attached (top bar, drawer): 0px
- Status dots: 50%

### 4.4 Elevation
- In-flow sheets: No shadow, 1px `--rule` outline.
- Floating (menus, drawer overlay, tooltips): `--shadow-float`
- Modals: `--shadow-modal`
