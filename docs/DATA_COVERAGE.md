# DATA COVERAGE AUDIT

Class A = DATA-DRIVEN, B = PARTIALLY DATA-DRIVEN (values reported, motion/geometry illustrative),
C = ILLUSTRATIVE ONLY.

## 1. Raw-data availability (searched in all supplied PDFs)

| Data type | Available? | Where | Implication |
|---|---|---|---|
| OrcaFlex time histories | No | — | No time-domain replay possible |
| Vessel displacement time histories | No | — | Vessel motion = illustrative |
| Riser displacement profiles | No | — | Riser shape = illustrative spline pinned to reported limits |
| VIV amplitudes | No | — | VIV amplitude illustrative |
| VIV mode-shape coordinates | No | — | Mode *count* and frequencies are reported (SRC-02 Table 5.2, p. 50); shapes drawn as generic sine modes |
| Bending-moment distributions | **Plot only** | SRC-02 Fig 5.5 (p. 67, 1-yr storm, −80…+80 m offset), Fig 5.6 (p. 69, Hs sweep at 0 m) ; SRC-06 Fig 2.3 | Digitise → DERIVED |
| Stress distributions | No | — | No stress contours |
| Raw fatigue damage arrays | No | Only minimum factored lifetime per component location | Hotspot markers only, no continuous damage field |
| Raw P-y curves | No | Su table only (SRC-02 Table 3.32) | Soil shown as strength bands |
| RAO numerical matrices | No | Charts only (SRC-02 App. B pp. 86–88) | RAO concept illustrative |
| Offset-envelope XY coordinates | **Plot only** | SRC-02 Figs 5.3/5.4 (pp. 64–65); SRC-06 Figs 2.1/2.2 | Discrete limits EXACT (Table 2.1); curve DERIVED by digitising, labelled as such |
| Soil reactions | No | — | Not shown |
| CAD / 3D geometry | No | Drawings/figures only | Equipment massing from lengths/ODs (EXACT) + shape (ILLUSTRATIVE) |

## 2. Visualization classification

| Requested visualization | Class | Reported values used | Illustrative part |
|---|---|---|---|
| 01 System overview | B | All elevations (SRC-02 Fig 3.1), WD 600 m, RT 626.05 m, draught 17.5 m | Hull shape, mooring layout |
| 02 Stack-up dive | A (elevations) / B (shape) | Component elevations, lengths, ODs, weights | Equipment surface detail |
| 03 Well load | A | SRC-02 Table 5.11 (5 steps × 4 casings), Fig 5.9 | Arrow thickness mapping (documented scale) |
| 04 Axial movement | A | SRC-02 Table 5.12 (−22.9 mm peak) | Visual amplification factor (displayed) |
| 05 Offset limit | B | SRC-02 Table 2.1 discrete limits; limiting components (UFJ / LFJ / 36 in pipe) from SRC-02 §5.4 text | Riser deflection shape; envelope curve between published points (digitised, flagged) |
| 05b Conductor bending vs offset | B | SRC-02 Fig 5.5 digitised (DERIVED) + capacities SRC-02 Table 3.7 (EXACT) | none beyond digitisation error |
| 06 Wave fatigue | A (values) / C (cyclic motion) | SRC-02 Table 5.3 | Wave cycling animation |
| 07 VIV | A (fatigue, frequencies) / C (amplitude, vortex shedding) | SRC-02 Table 5.1, Table 5.2 (f, T, lock-on speed, exceedance) | Vortex street, mode shape amplitude |
| 08 Combined fatigue | A | SRC-02 Tables 5.1, 5.3, 5.6 | Bar/damage-share graphics are DERIVED (damage = 1/life) |
| 09 Cement shortfall | A (values) / B (fixity marker) | SRC-02 Table 5.4, TOC levels | "Point of fixity" position is qualitative (SRC-02 text), not a number |
| 10 MODU heading | A (values) / C (RAO) | SRC-02 Table 5.5, 5.7 | RAO response concept |
| 11 Engineering summary | A | SRC-02 §2.8 conclusions, Tables 2.1, 2.2, 5.6, 5.11, 5.12 | — |
| MODU draft sensitivity | — | **SOW REQUIREMENT — RESULT NOT IDENTIFIED IN SUPPLIED PDF SET** | Do not simulate |
| Multi-directional wave loading (standalone) | — | **SOW REQUIREMENT — RESULT NOT IDENTIFIED IN SUPPLIED PDF SET** (method embedded in base-case wave fatigue: "fully directional wave scatter cases", SRC-02 p. 8, §5.2) | Methodology note only |
| Torsional capacity (contract objective) | — | **SOW REQUIREMENT — RESULT NOT IDENTIFIED IN SUPPLIED PDF SET** | Do not simulate |
| Soil degradation / thermal growth from production cycles | — | **SOW REQUIREMENT — RESULT NOT IDENTIFIED IN SUPPLIED PDF SET** (only installation-load axial movement reported) | Do not simulate |

## 3. Conflicts between documents (SOURCE 02 wins — never averaged)

| ID | Item | Supporting summary / other doc | FINAL REPORT (authoritative) | Resolution |
|---|---|---|---|---|
| C-1 | Governing combined-fatigue component | SRC-04 (02 Sep) Table 2.2: LPWHH weld 0.5 y is minimum; THS connector not assessed | SRC-02 Table 5.6 (p. 60): **THS to HPWHH connector 0.4 y** governs; LPWHH 0.5 y second | Use SRC-02. THS connector row exists only in SRC-02 and SRC-08 |
| C-2 | VIV governing component | SRC-04 Table 2.1: LPWHH 0.9 y minimum | SRC-02 Table 5.1 (p. 49): THS connector 0.4 y (147.3 d), LPWHH 0.9 y | Use SRC-02 |
| C-3 | Fatigue target | SRC-03 & SRC-04: "80 day operational target" | SRC-02 §3.3.1 (p. 20): 140 d (0.383 y) general, 70 d (0.192 y) THS | Use SRC-02 targets |
| C-4 | Cement shortfall cases | SRC-03 (27 Aug) proposed −10 / −20 m | SRC-02 Table 5.4: 0 / −20 / −58 m (agreed) | Use SRC-02; note proposal history |
| C-5 | Heading cases | SRC-03 proposed 30 / 60 / 90° | SRC-02 Table 5.5: 0 / 45 / 90° | Use SRC-02 |
| C-6 | Wording, 20 m shortfall limiting component | SRC-02 §2.2.2 text: "first 36 x 1.5 in connector weld" | SRC-02 Table 5.4 and SRC-07: **36 × 1.0 in connector weld 4.2 y** | Internal SRC-02 inconsistency; use the **table** value and flag in inspector |
| C-7 | 26 in TOC | SRC-01 Table 2.13 (p. 15): secondary cement top +2.00 m above ML | SRC-01 Table 2.8 / SRC-02 Table 3.9: 0 (ML) | Use SRC-02 Table 3.9 |
| C-8 | Hs range assessed for envelopes | SRC-01 §3.5.3: up to 14 m in 1 m steps | SRC-02 / SRC-06 plots: 0–7 m shown; SRC-06 text "up to 7 m" | Plot range 0–7 m as published |
| C-9 | "08 Oct" old report | File SRC-02R (.docx) | Content is only a cover sheet + Comment Resolution Sheet, **R01 dated 7 Oct 2025**, no result tables | Not used for results; used only to explain why SRC-02 added target columns, THS connector etc. |
| C-10 | Base-case heading wording | SRC-08: "in line with the prevailing **wind** direction" | SRC-02 / SRC-03: heading into prevailing **wave** direction | Use SRC-02 (wave) |
| C-11 | Table cross-references | SRC-02 text cites "Table 3.12" for casing depths; caption is Table 3.9. SRC-01 text cites Table 2.11; caption Table 2.8 | — | Cite captions, not in-text references |

## 4. Consistency checks that passed

- Offset limits: SRC-06 Table 1.1 = SRC-02 Table 2.1 (all 8 values).
- Well load and axial movement: SRC-05 Figs 2.1/2.2 step values = SRC-02 Tables 5.11/5.12.
- Length assessment: SRC-05 Table 2.2 = SRC-02 Table 2.2 (118 / 144 / 340 m).
- Cement shortfall table: SRC-07 Table 2.1 = SRC-02 Table 5.4.
- Heading table: SRC-08 Table 2.1 = SRC-02 Table 5.5.
- Wave base case (components common to both): SRC-03 Table 2.1 = SRC-02 Table 5.3.
