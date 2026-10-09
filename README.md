# AccessiForge ⚒️

**Forge inclusive interfaces.** A zero-dependency, offline-friendly WCAG 2.1
accessibility lab: practice keyboard and screen-reader patterns, measure
contrast with the exact WCAG math, simulate magnification and color vision
deficiency, hunt 14 planted defects in a broken storefront, and produce a
shareable audit report.

AccessiForge is an enhanced, professionally restructured edition of the
single-file “A11y Lab” concept — every original feature is preserved and
extended.

---

## Quick start

No build step, no dependencies, no server required:

1. Unzip anywhere.
2. Open `index.html` in any modern browser (Chrome, Edge, Firefox, Safari).
3. Optional: serve it locally for a clean URL — `python3 -m http.server`
   or `npx serve`, then visit `http://localhost:8000`.

Progress (issues found/fixed, checklist ratings, notes, saved color pairs,
theme) is stored in `localStorage` and survives reloads.

## The five modules

| # | Module | What you do |
|---|--------|-------------|
| — | **Overview** | Progress dashboard, quick start, POUR reference, reset |
| 1 | **Keyboard & ARIA** | Test tabs, accordion, modal dialog, menu button, toggle switch, validated form; watch the live key event log |
| 2 | **Contrast & zoom** | Exact WCAG 2.x contrast math (AA/AAA, UI components), hue-preserving fix suggestion, swap, saved pair history; 100–400% magnification, 320px reflow, text spacing, and protanopia/deuteranopia/tritanopia/achromatopsia filters |
| 3 | **Fix the UI** | Compare the broken “Before” storefront with the fixed “After”, track 14 WCAG failures with Found/Fixed checkboxes and filters |
| 4 | **Audit report** | Rate 18 tracked success criteria with notes, watch per-principle scores, generate/copy/print reports, export/import JSON |

### Keyboard shortcuts

- `Alt` + `1`…`5` — jump to a module
- `Alt` + `T` — cycle theme (light → dark → high contrast)
- `?` — shortcut help (`Esc` closes)
- Module tabs: `Left` / `Right` / `Home` / `End` (roving tabindex)

## Project structure

```
accessiforge/
├── index.html                  App shell: header, tab navigation, 5 panels,
│                               dialogs, CVD filter defs, script loader
├── css/
│   ├── tokens.css              Design tokens: 3 themes, spacing/type scales,
│   │                           radii, motion — all contrast-checked
│   ├── base.css                Reset, document, typography, layout primitives
│   ├── components.css          Buttons, cards, forms, tabs, dialogs, toasts,
│   │                           badges, chips, progress, stats…
│   ├── modules.css             Per-module styles (hero, contrast lab,
│   │                           magnification stage, sample UI, audit)
│   └── print.css               Clean print output for audit reports
├── js/
│   ├── app.js                  Bootstrap — initialises services + modules
│   ├── core/
│   │   ├── dom.js              $ / $$ / esc / events helpers
│   │   ├── store.js            Safe localStorage wrapper (namespaced)
│   │   ├── announce.js         Live region + visible toast (SC 4.1.3)
│   │   ├── theme.js            Light/dark/contrast manager with persistence
│   │   ├── tabs.js             WAI-ARIA tabs pattern + hash deep links
│   │   └── shortcuts.js        Global shortcuts + help dialog
│   ├── data/
│   │   ├── issues.js           The 14 planted WCAG failures + fixes
│   │   ├── checklist.js        18 tracked success criteria (POUR) + hints
│   │   └── sample.js           The “Brew & Bean” Before/After sample UI
│   └── modules/
│       ├── overview.js         Progress dashboard
│       ├── keyboard-lab.js     ARIA pattern demos + key log + trap
│       ├── contrast.js         WCAG contrast math, suggestions, history
│       ├── magnify.js          Zoom / reflow / spacing / CVD simulation
│       ├── workshop.js         Before/After compare + issue tracker
│       └── audit.js            Checklist, scoring, report generation
└── assets/
    └── favicon.svg
```

Classic `<script>` tags (no ES modules) are used deliberately so the app
runs from `file://` with zero tooling.

## Design system (summary)

- **Typography** — Lexend (headings + body; designed for readability) and
  IBM Plex Mono (code, key log), both with full system-font fallbacks so
  the app works identically offline.
- **Color** — teal primary with orange accent; every text pair is
  ≥ 4.5:1 and every UI border ≥ 3:1 in all three themes (light, dark,
  high contrast). The lab practices what it teaches.
- **Spacing** — 4px scale (`--sp-1` … `--sp-16`); **type** — fluid scale
  from 13px captions to a `clamp()` hero.
- **Focus** — a 3px `:focus-visible` ring on every interactive element;
  visible focus is never removed anywhere.
- **Motion** — 150–250ms transitions, fully disabled under
  `prefers-reduced-motion`.
- **Touch targets** — ≥ 44px on all controls.

## Accessibility notes

The app itself targets WCAG 2.1 AA (and mostly AAA for contrast):

- Skip link, landmarks, one `<h1>` per module panel, coherent heading order
- Full keyboard support with roving tabindex on the module tabs
- Native `<dialog>` for modals (focus trap + Esc for free)
- Status messages announced via polite live regions
- The “Before” samples intentionally contain failures — including a
  keyboard trap with a documented `Esc` exit — for teaching purposes
- Automated tools catch only a portion of WCAG issues; always confirm
  with real assistive technology (NVDA, JAWS, VoiceOver, TalkBack)

## Browser support

Latest Chrome, Edge, Firefox and Safari. Uses `<dialog>`, CSS custom
properties, `:focus-visible`, `clamp()`, `padStart` — all baseline since
2022. Degrades gracefully offline (system fonts) and in private mode
(in-memory storage).

## License

MIT — see [LICENSE](LICENSE).
