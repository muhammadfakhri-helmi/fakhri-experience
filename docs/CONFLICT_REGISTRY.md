# CONFLICT REGISTRY (generated from src/data/conflicts.ts)

Resolution priority for calculated results: 1 final-report tables → 2 final-report figures → 3 final-report narrative → 4 final sensitivity summaries → 5 design basis → 6 interim summaries. This is a visualization data-governance rule, not a general engineering rule.

The resolver throws if two sources disagree on a key that is not registered below.

## C-01 — Governing component for combined wave + VIV fatigue

| Field | Value |
|---|---|
| Key | `fatigue.governing.combined` |
| Conflicting values | SRC-02 Table 5.6: THS to HPWHH connector — 0.4 y<br>SRC-04 §1 Summary: LPWHH weld — 0.5 y |
| Selected visualization value | THS to HPWHH connector — 0.4 y |
| Selected source | SRC-02 — Final Report — Floating Vessel Conductor Analysis |
| Superseded source(s) | SRC-04 |
| Selection rationale | The THS connector row was added in the final report; the interim VIV summary did not assess it. Final report table has priority 1. |
| Visualization policy | Show THS connector as governing; show LPWHH weld (0.5 y) as second. Inspector shows the interim value as superseded. |
| Resolved status | REPORTED_WITH_SOURCE_CONFLICT |

## C-02 — Governing component for VIV fatigue

| Field | Value |
|---|---|
| Key | `fatigue.governing.viv` |
| Conflicting values | SRC-02 Table 5.1: THS to HPWHH connector — 0.4 y<br>SRC-04 §1 Summary: LPWHH weld — 0.9 y |
| Selected visualization value | THS to HPWHH connector — 0.4 y |
| Selected source | SRC-02 — Final Report — Floating Vessel Conductor Analysis |
| Superseded source(s) | SRC-04 |
| Selection rationale | Same cause as C-01: THS connector only present in final report. |
| Visualization policy | VIV chapter highlights THS connector first. |
| Resolved status | REPORTED_WITH_SOURCE_CONFLICT |

## C-03 — Fatigue acceptance target

| Field | Value |
|---|---|
| Key | `target.GENERAL` |
| Conflicting values | SRC-02 §3.3.1: 140 days general / 70 days THS connector<br>SRC-03 §1: 80 days (single operational target)<br>SRC-04 §1: 80 days (single operational target) |
| Selected visualization value | 140 days (general components); THS connector uses its own 70-day target |
| Selected source | SRC-02 — Final Report — Floating Vessel Conductor Analysis |
| Superseded source(s) | SRC-03, SRC-04 |
| Selection rationale | Targets were revised by the operator for the final report and made component-specific. |
| Visualization policy | Each component is compared only against its own class target. 80 days never shown by default. |
| Resolved status | REPORTED_WITH_SOURCE_CONFLICT |

## C-04 — Cement shortfall cases

| Field | Value |
|---|---|
| Key | `sens.cement.cases` |
| Conflicting values | SRC-02 Table 5.4: 0 / 20 / 58 m<br>SRC-03 §1 (proposal): 10 / 20 m |
| Selected visualization value | 0 / 20 / 58 m |
| Selected source | SRC-02 — Final Report — Floating Vessel Conductor Analysis |
| Superseded source(s) | SRC-03 |
| Selection rationale | Early proposal replaced by the agreed cases after a high-level screening. |
| Visualization policy | Proposal is SUPERSEDED_PROPOSAL: kept for audit only, never offered as a scenario. |
| Resolved status | REPORTED |

## C-05 — MODU heading cases

| Field | Value |
|---|---|
| Key | `sens.heading.cases` |
| Conflicting values | SRC-02 Table 5.5: 0 / 45 / 90°<br>SRC-03 §1 (proposal): 30 / 60 / 90° |
| Selected visualization value | 0 / 45 / 90° |
| Selected source | SRC-02 — Final Report — Floating Vessel Conductor Analysis |
| Superseded source(s) | SRC-03 |
| Selection rationale | Early proposal replaced by agreed cases. |
| Visualization policy | Proposal is SUPERSEDED_PROPOSAL: audit only. |
| Resolved status | REPORTED |

## C-06 — Limiting component for 20 m cement shortfall (internal final-report inconsistency)

| Field | Value |
|---|---|
| Key | `sens.cement.20.limiting` |
| Conflicting values | SRC-02 Table 5.4: 36 × 1.0 in connector weld — 4.2 y<br>SRC-02 §2.2.2 narrative: 36 × 1.5 in connector weld<br>SRC-07 §1 / Table 2.1: 36 × 1.0 in connector weld — 4.2 y |
| Selected visualization value | 36 × 1.0 in connector weld (1st) — 4.2 y |
| Selected source | SRC-02 — Final Report — Floating Vessel Conductor Analysis |
| Superseded source(s) | SRC-02 |
| Selection rationale | Most explicit numerical result (final report table) agrees with the final sensitivity summary; narrative wording is inconsistent. |
| Visualization policy | Hotspot placed at −21.77 m (36 × 1.0 in connector weld). Inspector must display the narrative inconsistency. |
| Resolved status | REPORTED_WITH_SOURCE_CONFLICT |

## C-07 — 26 in secondary conductor top of cement

| Field | Value |
|---|---|
| Key | `casing.c26.tocLead` |
| Conflicting values | SRC-02 Table 3.9: 0 m (mudline)<br>SRC-01 Table 2.13: +2.00 m above mudline |
| Selected visualization value | 0 m (mudline) |
| Selected source | SRC-02 — Final Report — Floating Vessel Conductor Analysis |
| Superseded source(s) | SRC-01 |
| Selection rationale | Final report table has priority; design basis setting-depth table (2.8) also states mudline. |
| Visualization policy | Cement drawn from mudline. |
| Resolved status | REPORTED_WITH_SOURCE_CONFLICT |

## C-08 — Significant wave height range for operating envelopes

| Field | Value |
|---|---|
| Key | `offset.hsRangePlotted` |
| Conflicting values | SRC-02 Figs 5.3–5.4: Plotted 0–7 m<br>SRC-01 §3.5.3: Load cases planned up to 14 m |
| Selected visualization value | 0–7 m (as plotted) |
| Selected source | SRC-02 — Final Report — Floating Vessel Conductor Analysis |
| Superseded source(s) | SRC-01 |
| Selection rationale | Only the published plot range can be shown; no results above 7 m are published. |
| Visualization policy | Envelope chart axis limited to 7 m. |
| Resolved status | REPORTED_WITH_SOURCE_CONFLICT |

## C-09 — Base-case heading reference

| Field | Value |
|---|---|
| Key | `sens.heading.definition` |
| Conflicting values | SRC-02 §5.2.3: Heading relative to prevailing WAVE direction<br>SRC-08 §1: Base case in line with prevailing WIND direction |
| Selected visualization value | Relative to prevailing wave direction |
| Selected source | SRC-02 — Final Report — Floating Vessel Conductor Analysis |
| Superseded source(s) | SRC-08 |
| Selection rationale | Final report and the heading table header both define the angle against the prevailing wave direction. |
| Visualization policy | Wave-direction arrow is fixed; MODU rotates relative to it. |
| Resolved status | REPORTED_WITH_SOURCE_CONFLICT |

## Superseded proposals (audit only, never shown as scenarios)

| Key | Proposed value | Source |
|---|---|---|
| `sens.cement.cases` | [10,20] | SRC-03 §1 Summary (proposed cases) |
| `sens.heading.cases` | [30,60,90] | SRC-03 §1 Summary (proposed cases) |

## Resolver statistics

281 resolved keys: REPORTED 256, REPORTED_WITH_SOURCE_CONFLICT 7, DERIVED 7, ILLUSTRATIVE 11.

