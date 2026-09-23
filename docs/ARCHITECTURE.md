# ARCHITECTURE

## Data pipeline (engineering values)

```
PDF sources (SRC-00 … SRC-08)
  → Extracted candidates        src/data/{geometry,environment,fatigue,offset,axial,sensitivities,visual}.ts
  → Conflict registry           src/data/conflicts.ts
  → Engineering Data Resolver   src/data/resolver.ts  (resolve())
  → approvedEngineeringData     src/data/resolver.ts  (the only accessor the scene/UI may use)
  → Three.js scene & UI         src/scene/*, src/chapters/*, src/ui/*
```

Rules enforced in code:

- Every candidate carries: key, value, unit, source, page, table/figure, analysis case, tier, basis.
- `resolve()` selects the lowest tier (1 = final-report table … 6 = interim summary).
- If any other candidate for the same key disagrees and the key is not in the conflict registry, resolution **throws** — conflicts cannot be silently overwritten.
- Candidates marked `proposal` resolve to `SUPERSEDED_PROPOSAL` and are excluded from the approved dataset (audit list only).
- Status set: `REPORTED`, `DERIVED`, `ILLUSTRATIVE`, `REPORTED_WITH_SOURCE_CONFLICT`, `SUPERSEDED`, `SUPERSEDED_PROPOSAL`.
- Visualization conventions (scales, amplitudes, amplification) are resolved like data, from source `VIZ`, always `ILLUSTRATIVE`.
- Fatigue targets are component-class specific (`target.THS_CONNECTOR`, `target.GENERAL`); each component is compared only with its own class target.
- `npm run audit:data` prints resolver statistics and fails on an unregistered conflict.

## Rendering

| Module | Role |
|---|---|
| `core/scales.ts` | Multi-scale vertical mapping: true-height subsea zone, compressed water column (GLOBAL), log-compressed well below −60 m (CUTAWAY). Labels always show real values. |
| `core/state.ts` | Single state store (chapter, mode, scenario values, selection). |
| `scene/world.ts` | Renderer, CSS2D labels, ocean, seabed, soil section, depth ruler, current particles, direction arrows. |
| `scene/rig.ts` | Moored semi-sub (reported draught / RT height; hull form illustrative), mooring, RAO concept rings. |
| `scene/riser.ts` | Segmented riser spline, flex joints, tension ring, offset envelope rings. |
| `scene/well.ts` | LFJ, LMRP, BOP, THS, HPWHH, LPWHH, landing sub, casings (section cut), cement, fatigue hotspots, fixity marker, load arrow. |
| `animation/deform.ts` | All deformation functions with `amplitudeSource` metadata; kept separate from results. |
| `chapters/chapters.ts` | 11 story chapters: narrative templates, inspector content, scenario controls, story steps. |
| `ui/values.ts` | Clickable value rendering and the provenance popover (source, page, table, case, all candidates, conflict note). |
| `ui/charts.ts` | Operating envelope, bending-moment profile, damage decomposition (SVG). |
| `ui/inspector.ts` | Component cards (component, scenario, value, target, classification, source, meaning). |

## Modes

- **Story**: auto-advances chapters; each chapter plays scripted scenario steps (load steps, offset sweep, VIV modes, cement cases, headings).
- **Explore**: free camera, chapter selection and scenario controls, click any component or value.

## Build

`npm install` → `npm run dev` · `npm run build` (dist/) · `npm run build:single` (one self-contained HTML in dist-single/).
