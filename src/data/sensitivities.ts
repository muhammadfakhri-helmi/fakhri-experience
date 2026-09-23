import { cand, life } from './extract';
import { Candidate, Tier } from './types';

const T = Tier.FINAL_TABLE, N = Tier.FINAL_NARRATIVE, S = Tier.FINAL_SENSITIVITY_SUMMARY, I = Tier.INTERIM_SUMMARY;
type L = number | null;

/** Wave-fatigue lifetime by 36 in TOC: [0 m, −20 m, −58 m]. FR Table 5.4 / SRC-07 Table 2.1. */
const CEM: Record<string, [L, L, L]> = {
  ths: [5.8, null, null], lpwhh: [1.1, null, null], lsubTop: [null, null, null], hanger: [null, null, null],
  scTaperF1: [null, null, null], c15Body: [9.3, null, null], c15Weld: [6.8, null, null], c10Weld: [null, 4.2, null],
};
/** Wave-fatigue lifetime by MODU heading: [0°, 45°, 90°]. FR Table 5.5 / SRC-08 Table 2.1. */
const HDG: Record<string, [L, L, L]> = {
  ths: [5.8, null, 5.0], lpwhh: [1.1, null, 0.9], lsubTop: [null, null, null], hanger: [null, null, null],
  scTaperF1: [null, null, null], c15Body: [9.3, null, 6.4], c15Weld: [6.8, null, 4.6], c10Weld: [null, null, null],
};

export const SENSITIVITIES: Candidate[] = [
  // Final analysed cases
  cand('sens.cement.cases', [0, 20, 58], 'm below ML', 'SRC-02', 56, 'Table 5.4 Wave Fatigue — Conductor Cement Shortfalls', 'Cement shortfall', T),
  cand('sens.cement.cases', [0, 20, 58], 'm below ML', 'SRC-07', 2, 'Table 2.1', 'Cement shortfall', S),
  cand('sens.cement.cases', [10, 20], 'm below ML', 'SRC-03', 1, '§1 Summary (proposed cases)', 'Cement shortfall — proposal', I, 'reported', { proposal: true }),
  cand('sens.heading.cases', [0, 45, 90], 'deg', 'SRC-02', 58, 'Table 5.5 Wave Fatigue — MODU Heading', 'MODU heading', T),
  cand('sens.heading.cases', [0, 45, 90], 'deg', 'SRC-08', 2, 'Table 2.1', 'MODU heading', S),
  cand('sens.heading.cases', [30, 60, 90], 'deg', 'SRC-03', 1, '§1 Summary (proposed cases)', 'MODU heading — proposal', I, 'reported', { proposal: true }),
  cand('sens.heading.definition', 'Heading angle of MODU relative to the prevailing wave direction; base case heads into the prevailing wave direction.', '',
    'SRC-02', 57, '§5.2.3', 'MODU heading', N),
  cand('sens.heading.definition', 'Base case MODU heading in line with the prevailing wind direction.', '',
    'SRC-08', 1, '§1 Summary', 'MODU heading', S),

  ...Object.entries(CEM).flatMap(([id, arr]) => arr.flatMap((y, i) => {
    const tc = [0, 20, 58][i];
    return [
      life(`sens.cement.${tc}.${id}`, y, 'SRC-02', 56, 'Table 5.4 Wave Fatigue — Conductor Cement Shortfalls', `36 in TOC ${tc} m below ML`, T),
      life(`sens.cement.${tc}.${id}`, y, 'SRC-07', 2, 'Table 2.1', `36 in TOC ${tc} m below ML`, S),
    ];
  })),
  ...Object.entries(HDG).flatMap(([id, arr]) => arr.flatMap((y, i) => {
    const h = [0, 45, 90][i];
    return [
      life(`sens.heading.${h}.${id}`, y, 'SRC-02', 58, 'Table 5.5 Wave Fatigue — MODU Heading', `Heading ${h}°`, T),
      life(`sens.heading.${h}.${id}`, y, 'SRC-08', 2, 'Table 2.1', `Heading ${h}°`, S),
    ];
  })),
  life('sens.heading.90.lpwhh', 0.9, 'SRC-08', 2, 'Table 2.1 (312.3 days)', 'Heading 90°', S),

  // Limiting component for the 20 m shortfall — internal final-report inconsistency
  cand('sens.cement.20.limiting', '36 × 1.0 in connector weld (1st) — 4.2 years', '', 'SRC-02', 56, 'Table 5.4', 'TOC 20 m below ML', T),
  cand('sens.cement.20.limiting', '36 × 1.5 in connector weld — 4.2 years', '', 'SRC-02', 8, '§2.2.2 narrative', 'TOC 20 m below ML', N),
  cand('sens.cement.20.limiting', '36 × 1.0 in connector weld (1st) — 4.2 years', '', 'SRC-07', 1, '§1 Summary', 'TOC 20 m below ML', S),
  cand('sens.cement.0.limiting', 'LPWHH weld — 1.1 years', '', 'SRC-02', 56, 'Table 5.4', 'TOC at ML', T),
  cand('sens.cement.58.limiting', 'All reported locations >10 years', '', 'SRC-02', 56, 'Table 5.4', 'TOC at shoe (58 m)', T),
  cand('sens.cement.explanation', [
    'Cement to mudline: soil/cement fixity at the mudline concentrates cyclic stress at the LPWHH weld.',
    '20 m shortfall: fixity moves down; the first 36 × 1.0 in connector weld sits next to the new fixity point and becomes limiting (4.2 y). Components above the mudline improve.',
    '58 m shortfall: no cement above the shoe, no sharp fixity point; deflections increase but no region of amplified stress — all locations >10 y.',
  ], '', 'SRC-02', 55, '§5.2.2 discussion', 'Cement shortfall', N),
  cand('sens.cement.caveat', 'Wave fatigue only. Top of cement also affects operating envelope and axial support; further TOC analysis recommended with the final rig. Base-case plan remains recommended.', '',
    'SRC-02', 55, '§5.2.2', 'Cement shortfall', N),
  cand('sens.heading.explanation', [
    '0° and 90° give similar lifetimes because the assessed semi-sub has a relatively symmetrical RAO response.',
    '45° improves wave-fatigue lifetimes by ≈10× because the RAO response is less onerous at that heading.',
    'Combined with VIV (Table 5.7) the THS connector stays at 0.4 years for every heading, because its damage is VIV-dominated.',
  ], '', 'SRC-02', 57, '§5.2.3 / §5.3.1 discussion', 'MODU heading', N),
  cand('sens.heading.caveat', 'Results are specific to the assessed rig RAOs; rerun if a different rig is used. A DP rig is expected to perform better than a moored rig.', '',
    'SRC-02', 57, '§5.2.3', 'MODU heading', N),

  // Scope gaps (contract items without an identified result)
  cand('gap.list', [
    'MODU draft sensitivity — SOW requirement, result not identified in supplied PDF set (rig modelled at 17.5 m operating draught only).',
    'Multi-directional wave loading — no standalone result; method embedded in base-case wave fatigue (fully directional scatter).',
    'Torsional capacity (contract objective) — result not identified in supplied PDF set.',
    'Soil degradation / production-cycle growth — result not identified; only installation-load axial movement reported.',
  ], '', 'SRC-00', 98, 'Exhibit B §1–§2 (scope) vs. SRC-02 contents', 'Scope audit', Tier.DESIGN_BASIS),
];
