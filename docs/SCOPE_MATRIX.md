# SCOPE MATRIX — Naval Project well conductor analysis (Scope A)

Scope authority: **SRC-00**, Exhibit B — Scope of Works, PDF pp. 97–101.
The contract PDF is a **scanned image PDF (no text layer)**; Exhibit B was read by OCR. OCR text of the
General Well Schematic (p. 100) and Table 9 (p. 101) is partially garbled — those items are used for
hierarchy only, never for numbers.

Result authority: **SRC-02** (SRC-02, issue 02, 09 Oct 2025).
Input authority: **SRC-01** (SRC-01, issue 02, 15 Aug 2025).

Abbreviations used below: SRC-02 = SRC-02, SRC-01 = SRC-01, SRC-00 = SRC-00,
SRC-03 / SRC-04 / SRC-05 / SRC-06 / SRC-07 / SRC-08 = supporting summaries 03–08.

## Contract objective (SRC-00 p. 98, §1)

Confirm fitness-for-purpose of the wellhead, conductor and associated subsea infrastructure with a MODU
in terms of (a) axial **and torsional** capacity to resist well weights **and production cycles**,
(b) strength in extreme vessel offsets, (c) fatigue from waves and VIV. Reason for re-analysis: new
casing/tubing configuration from big-bore completion (original analysis 2014). Wells use 36 in conductor
with 26 in secondary conductor hung off a sub-mudline hanger below the 36 in LP wellhead. Field water
depth 400–800 m.

## Matrix

| SOW ITEM | Required by Contract? | Input Source | Result Source | Relevant PDF Section | Visualization Module | Data Completeness | Notes |
|---|---|---|---|---|---|---|---|
| 2.1 Data Review & Design Basis | Yes (SRC-00 p. 98) | SRC-01 whole document | SRC-01 (is itself the deliverable) | SRC-01 §2–§3; SRC-02 §3 | Ch.01 System Overview, Ch.02 Stack-up, Inspector metadata | Complete for geometry/elevations; partial for vessel hull geometry | SRC-02 §3 repeats SRC-01 inputs; values identical where checked |
| 2.1 Soil strength / P-y review | Yes ("review on the field soil strength profiles (P-y curve)") | SRC-01 Table 2.31 (Su profile, unit weight, LB/UB) | SRC-02 Table 3.32 (same data); SRC-02 notes UB is governing | SRC-01 p. 34; SRC-02 p. 39 | Cutaway soil layers | **Partial** — undrained shear strength table only; **no P-y curves supplied** | P-y curves were generated inside the analysis model; not published |
| 2.2 Well Load Assessment | Yes | SRC-01 Tables 2.1–2.13 (weights, casings) | SRC-02 Table 5.11, Fig 5.9 | SRC-02 §5.6 p. 74–75 | Ch.03 Well Load | **Complete** (5 load steps × 4 casings) | Cross-checked with SRC-05 Fig 2.1 — consistent |
| 2.3 Soil degradation & axial movement (growth/subsidence) | Yes | SRC-01 casing props, soil | SRC-02 Table 5.12, Fig 5.10; SRC-02 Table 5.8–5.10 (length) | SRC-02 §5.5 p. 73, §5.7 p. 76 | Ch.04 Axial Movement; Ch.11 Summary | **Partial** — axial movement from installation loads is reported; **no soil-degradation (cyclic) or thermal growth / production-cycle result identified** | See scope-gap check |
| — Torsional capacity (contract objective) | Yes (objective text) | — | **SOW REQUIREMENT — RESULT NOT IDENTIFIED IN SUPPLIED PDF SET** | searched SRC-02/SRC-01 for "torsion" — 0 hits | none (listed in Summary as gap) | None | Do not visualize |
| 2.4 Offset limit analysis (bending capacities) | Yes | SRC-01 Tables 2.20–2.24, 3.1 (criteria), 2.25–2.28 (metocean) | SRC-02 Table 2.1; Figs 5.3, 5.4 (envelopes); Figs 5.5, 5.6 (BM profiles) | SRC-02 §5.4 pp. 63–72 | Ch.05 Offset Limit (highlight) | Discrete limits **complete**; envelope curves and BM profiles **plot-only** (digitizable) | SRC-06 Table 1.1 identical to SRC-02 Table 2.1 |
| 2.5 Wave fatigue — Drilling/Completion | Yes | SRC-01 Table 2.14 (SCF, S-N), wave scatter Tables 2.29/2.30, RAO App. B | SRC-02 Table 5.3 (base case) | SRC-02 §5.2.1 pp. 51–54 | Ch.06 Wave Fatigue | **Complete** at component level (min factored life) | SRC-02 adds THS connector row not present in SRC-03 |
| 2.5a Cement shortfall sensitivity | Yes | SRC-01 §2.2.8 | SRC-02 Table 5.4 | SRC-02 §5.2.2 pp. 55–56 | Ch.09 Cement Shortfall | **Complete** for 0 / 20 / 58 m | Cases changed from SRC-03 proposal (−10/−20 m) to agreed −20/−58 m |
| 2.5b Wave / MODU heading sensitivity | Yes | SRC-01 App. B RAO charts | SRC-02 Table 5.5, Table 5.7 | SRC-02 §5.2.3 pp. 57–58; §5.3.1 p. 61–62 | Ch.10 MODU Heading | **Complete** for 0 / 45 / 90° | Cases changed from SRC-03 proposal (30/60/90°) to agreed 45/90° |
| 2.5c MODU draft sensitivity | Yes | SRC-01 Table 2.15 (single draught 17.5 m) | **SOW REQUIREMENT — RESULT NOT IDENTIFIED IN SUPPLIED PDF SET** | SRC-02/SRC-01: rig "modelled at operating draft" only (SRC-01 p. 36; SRC-02 p. 41) | none (listed as gap) | None | Not in the contractor Appendix A task list either |
| 2.5d Multi-directional wave loading | Yes | SRC-01 wave scatter Tables 2.29/2.30 (directional) | **No standalone result.** Embedded in base-case wave fatigue ("fully directional wave scatter cases", SRC-02 p. 8 & §5.2) | SRC-02 §3.5.6, §4.4, §5.2 | Ch.06 (methodology note only) | Methodology only | Record as "addressed within base-case methodology; no separate sensitivity output" |
| 2.5e VIV screening | Yes | SRC-01 App. D hindcast current, Table 2.14 | SRC-02 Table 5.1 (VIV fatigue), Table 5.2 (modes/frequencies) | SRC-02 §5.1 pp. 48–50 | Ch.07 VIV | Fatigue + natural frequencies **complete**; amplitudes/mode coordinates **absent** | Exceeds "screening": full VIV fatigue done (VIV at 800 m WD) |
| — Combined wave + VIV fatigue | Implied (the contractor task list) | SRC-02 Tables 5.1, 5.3 | SRC-02 Table 5.6 (base), 5.7 (heading) | SRC-02 §5.3 pp. 59–62 | Ch.08 Combined Fatigue | **Complete** | Governing: THS connector 0.4 y (SRC-02) |
| — Conductor length assessment | Implied (the contractor task list) | SRC-01 Table 2.31 soil | SRC-02 Tables 5.8–5.10, Table 2.2 | SRC-02 §5.5 p. 73 | Ch.03/04, Ch.11 | **Complete** | Unity values also in SRC-05 Table 2.1 |
| Deliverable: draft & final report | Yes (SRC-00 p. 100) | — | SRC-02 itself | — | Inspector "Source" field | — | SRC-02R is a comment-resolution cover (R01, 7 Oct 2025), not a result set |

## Input-data families required by Scope (SRC-00 p. 99, "Items Provided by COMPANY") vs. supplied

| Family | Found in | Status |
|---|---|---|
| Assumptions — vessel heading | SRC-01 §2.4 (moored, heading into prevailing wave); SRC-02 §5.2.3 | Present |
| Assumptions — fluid density | SRC-01 Table 2.10 (mud & cement); riser mud 1.44 SG (SRC-01 p. 20) | Present |
| Assumptions — rig draft | SRC-01 Table 2.15 (17.5 m operating draught) | Present (single value) |
| Assumptions — operational duration | SRC-01 §2.3.1 (40 d drilling + 40 d completion); SRC-02 §3.3.1 targets 140 d / 70 d | Present — **target changed**, see conflicts |
| Riser system / joints | SRC-01 Tables 2.17, 2.18 | Present |
| Flex joints | SRC-01 Tables 2.20–2.22 | Present |
| Telescopic joint | SRC-01 Table 2.23 | Present |
| Tensioners | SRC-01 Table 2.24 | Present |
| BOP / LMRP | SRC-01 Table 2.19, Figs 2.14–2.15 | Present (weights/lengths; drawings only for shape) |
| THS / XT / subsea stack | SRC-01 §2.2.3–2.2.4 | Present |
| Wellhead | SRC-01 Tables 2.1–2.3 | Present |
| Conductor / casing | SRC-01 Tables 2.6–2.8, 2.11–2.13 | Present |
| Cement | SRC-01 Table 2.8, 2.10 | Present |
| Fluids | SRC-01 Table 2.10 | Present |
| Metocean (waves, current) | SRC-01 Tables 2.25–2.30, App. D | Present |
| Marine growth | — | **Not identified** in SRC-01/SRC-02 |
| Temperature profile | — | **Not identified** in SRC-01/SRC-02 |
| Soil | SRC-01 Table 2.31 | Present (Su only, no P-y) |
| Vessel dimensions | SRC-01 Table 2.15 (draught, RT height, moonpool), Figs 2.8–2.10 | Partial — hull dimensions only as drawings |
| RAOs | SRC-01 App. B (charts), Table 2.16 (reference point) | Charts only — **no numerical matrix** |
| Design criteria | SRC-01 Table 3.1 (flex joint angles, stress), Tables 2.7, 2.20; SRC-02 Table 3.7 | Present |
