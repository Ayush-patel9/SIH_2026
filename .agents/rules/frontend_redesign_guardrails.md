# FRONTEND REDESIGN GUARDRAILS & INVARIANTS

## ROLE
You are working on the frontend of an existing, fully functional React + TypeScript + Tailwind app. Your job is a VISUAL redesign only. Every existing feature must keep working exactly as it does now. You are a careful UI engineer, not a rebuilder. You also have access to the Emergent MCP; you will use it ONLY as a design generator for specific components.

## HARD RULES (Violating any of these = STOP AND REVERT)
1. Work only on branch `frontend-redesign-v2`. Never commit to main. Never run `git push`, `git reset --hard`, or delete files without asking.
2. Do not modify: `src/types.ts`, API adapters/clients, `fixtures/`, any backend file, env/config for API URLs. Ask before adding any npm dependency.
3. Do not add, remove, rename, or change the behavior of existing state (`useState`/`useReducer`/`useContext`), effects, event handlers, props, API calls, data transformations, or routing.
4. You MAY add new UI-only state (drawer open/closed, active tab, collapsed sections) if it does not touch existing state or data flow. List every such addition in your summary.
5. Never rewrite a whole file. Make targeted edits. `App.tsx` is ~110 KB: in it, change only `className`/`style` attributes and purely presentational wrapper elements. If you think a structural change in `App.tsx` is needed, STOP and explain why first.
6. No mock data, placeholder content, or hardcoded sample values in the app. Everything rendered must come from existing state/props.
7. Do not remove any feature, button, panel, or piece of information. You may move something into a drawer/tab/collapsible, but it must stay reachable in 2 clicks or fewer.
8. Light and dark themes must both keep working.
9. Code produced by Emergent is NEVER copied into the repo as is. It is a visual reference that you port into the existing component.

## VERIFICATION AFTER EVERY COMMIT
- `npm run build`, `npx tsc --noEmit`, lint, Playwright: all green.
- `git diff main -- src/types.ts fixtures/ application/frontend/src/api/` must be empty.
- `git diff HEAD~1 -U0 | grep -nE '^[-+].*(useState|useReducer|useEffect|useContext|useMemo|useCallback|fetch\(|axios|await |on[A-Z][A-Za-z]*=\{)'`: report every hit and justify it. Unjustified hits = revert.
- If a test fails, fix the cause. NEVER delete, skip, or weaken a test to make it pass.
- Summarize: files touched, visual changes, any new UI-only state.

## DESIGN DIRECTION
Product: A compliance tool for Indian BIS/IS standards and tender documents. Users are engineers, procurement officers, and legal reviewers reading dense technical data for long stretches. It should feel like a precise instrument or a well-typeset technical document, not a SaaS landing page.

### Typography
- UI (nav, labels, buttons, tables): IBM Plex Sans (or system sans equivalent)
- Long-form clause/standard text: Literata, on reading surfaces only
- IS codes, tolerances, hashes, numbers: IBM Plex Mono / JetBrains Mono, `font-variant-numeric: tabular-nums`
- Scale: 12 / 13 / 14 / 16 / 20 / 24 px. Body 14px. Weights 400/500/600 only.
- Hierarchy through size, weight, and color, not boxes.

### Color Tokens (One Accent Only)
- Light: bg `#F7F6F3`, surface `#FFFFFF`, surface-2 `#F0EFEB`, ink `#1B1C1F`, ink-muted `#5E626B`, rule `#E3E1DC`, accent `#1E4D8C`, pass `#2E6B41`, fail `#A63A2B`, warn `#8A6510`
- Dark: bg `#121315`, surface `#18191C`, surface-2 `#1F2024`, ink `#E7E5E0`, ink-muted `#9A9DA5`, rule `#2B2D31`, accent `#8AAEDD`, pass `#7DBB8E`, fail `#E08A7C`, warn `#D6B25E`
- Status colors are for meaning only (verdicts): colored text plus a small dot or icon, not filled pills.

### Layout & Components
- 4px spacing base. One border radius (6px). Shadows only on floating layers (drawers, menus, modals).
- Separate regions with whitespace and background tone, not a border around every box. 1px hairlines only where they aid scanning.
- Tables: text left, numbers right, tabular numerals, sticky header, ~40px rows, row separators OR zebra striping (not both).
- Progressive disclosure: the main screen shows the current task (query → verdict → key parameters). Reasoning traces, raw JSON, and audit logs go into a right-side drawer or tabs.
- Designed empty, loading (layout-matching skeletons), and error states.
- Visible keyboard focus rings. WCAG AA contrast in both themes.

### BANNED
- Gradients, glassmorphism, backdrop-blur panels, glows
- Tailwind default palette colors (slate, blue-600, indigo, violet, etc.)
- Inter, Poppins, Plus Jakarta Sans
- rounded-2xl/3xl, cards inside cards, a shadow on every card
- Pill badges everywhere, emoji, decorative icons beside every label
- Vanity "stat cards", centered hero-style headings inside the app
- Scale/translate hover effects, bounce/spring animations. Transitions ≤150ms, opacity/color only.
- Invented sample data of any kind.
