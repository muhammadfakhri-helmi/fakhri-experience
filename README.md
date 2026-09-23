# Naval Project — Well Conductor Analysis, interactive 3D

An auditable Three.js visualization of a floating-vessel well conductor analysis (moored semi-sub MODU, 600 m water depth):
system stack-up, well load and axial movement, offset limits, wave / VIV / combined fatigue, cement-shortfall and MODU-heading sensitivities.

Identities (operator, contractor, rig, field, document numbers) are anonymised.

- Every engineering value on screen is clickable: source document, page, table/figure, analysis case, status and any source conflict.
- Values flow through a central **Engineering Data Resolver** (see `docs/ARCHITECTURE.md`); the scene never reads source extracts directly.
- Animations are illustrative and labelled as such (`docs/ASSUMPTIONS.md`).

```
npm install
npm run dev            # local dev server
npm run build:single   # one self-contained HTML → dist-single/index.html
npm run audit:data     # data-governance check
```

Docs: `SCOPE_MATRIX.md`, `INPUT_DATA_PROVENANCE.md`, `DATA_COVERAGE.md`, `CONFLICT_REGISTRY.md`, `ASSUMPTIONS.md`, `ARCHITECTURE.md`.
