import { cand, life } from './extract';
import { Candidate, Tier } from './types';

const T = Tier.FINAL_TABLE, N = Tier.FINAL_NARRATIVE, I = Tier.INTERIM_SUMMARY;

/** Component class drives which acceptance target applies. */
export type TargetClass = 'THS_CONNECTOR' | 'GENERAL';

export interface FatigueComponentMeta {
  id: string;
  name: string;
  location: string;
  targetClass: TargetClass;
  /** candidate keys for geometry come from resolver; elevation is a reported table value. */
  elevationKey: string;
  snCurve: string;
  saf: number;
  why: string;
}

/**
 * Component metadata. Elevation / S-N / SAF values are resolved through candidates below
 * (keys `fatigue.<id>.elevation`, `.sn`, `.saf`); this list only fixes ordering and wording.
 */
export const FATIGUE_COMPONENTS: Omit<FatigueComponentMeta, 'snCurve' | 'saf'>[] = [
  { id: 'ths', name: 'THS to HPWHH connector', location: 'THS', targetClass: 'THS_CONNECTOR', elevationKey: 'fatigue.ths.elevation',
    why: 'High stress-amplification factor (SAF 5.2) and position near mudline, where cyclic riser loads enter the subsea well. VIV lock-on dominates its damage.' },
  { id: 'lpwhh', name: 'LPWHH weld', location: '36 × 1.5 in conductor', targetClass: 'GENERAL', elevationKey: 'fatigue.lpwhh.elevation',
    why: 'Sits between the stiff subsea stack and the lateral restraint of soil and cement at the mudline — the region of highest cyclic bending.' },
  { id: 'lsubTop', name: 'Top of 26 in landing sub', location: '36 × 1.5 in conductor', targetClass: 'GENERAL', elevationKey: 'fatigue.lsubTop.elevation',
    why: 'Same weld class as the LPWHH weld but slightly higher above the mudline, so bending is a little lower.' },
  { id: 'hanger', name: '26 in casing hanger base weld', location: 'Secondary conductor', targetClass: 'GENERAL', elevationKey: 'fatigue.hanger.elevation',
    why: 'Near-mudline weld on the secondary conductor; damage is mostly VIV-driven.' },
  { id: 'scTaperF1', name: 'Surface casing tapered joint weld (F1)', location: 'Surface casing', targetClass: 'GENERAL', elevationKey: 'fatigue.scTaperF1.elevation',
    why: 'Lower-quality weld class (F1) just above mudline; still over 8 years combined.' },
  { id: 'c15Body', name: 'Connector body 36 × 1.5 in', location: 'First conductor connector', targetClass: 'GENERAL', elevationKey: 'fatigue.c15Body.elevation',
    why: 'Located ≈10 m below mudline where bending transfers into the soil; high SCF (3.0).' },
  { id: 'c15Weld', name: 'Connector weld 36 × 1.5 in', location: 'First conductor connector', targetClass: 'GENERAL', elevationKey: 'fatigue.c15Weld.elevation',
    why: 'Same location as the connector body, D-class weld.' },
  { id: 'c10Weld', name: 'Connector weld 36 × 1.0 in (1st)', location: '36 × 1.0 in conductor', targetClass: 'GENERAL', elevationKey: 'fatigue.c10Weld.elevation',
    why: 'Becomes limiting only when the cement top drops to ≈20 m below mudline and the point of fixity moves next to it.' },
];

const p = (id: string, e: number, sn: string, saf: number): Candidate[] => [
  cand(`fatigue.${id}.elevation`, e, 'm', 'SRC-02', 49, 'Table 5.1 (elevation above mudline)', 'Fatigue data', T),
  cand(`fatigue.${id}.sn`, sn, '', 'SRC-02', 49, 'Table 5.1 (S-N curve)', 'Fatigue data', T),
  cand(`fatigue.${id}.saf`, saf, '', 'SRC-02', 49, 'Table 5.1 (SAF)', 'Fatigue data', T),
];

type L = number | null;
/** [viv, wave, combined] factored lifetimes — FR Tables 5.1, 5.3, 5.6. null = ">10 years". */
const RES: Record<string, [L, L, L]> = {
  ths: [0.4, 5.8, 0.4], lpwhh: [0.9, 1.1, 0.5], lsubTop: [2.1, null, 1.9], hanger: [8.0, null, 5.0],
  scTaperF1: [8.8, null, 8.0], c15Body: [null, 9.3, 6.4], c15Weld: [null, 6.8, 5.5], c10Weld: [null, null, null],
};
/** Combined (wave by heading + VIV) — FR Table 5.7, headings 0 / 45 / 90°. */
const HEAD_COMB: Record<string, [L, L, L]> = {
  ths: [0.4, 0.4, 0.4], lpwhh: [0.5, 0.8, 0.4], lsubTop: [1.9, 2.1, 1.9], hanger: [5.0, 7.6, 4.6],
  scTaperF1: [8.0, 8.7, 7.8], c15Body: [6.4, null, 4.9], c15Weld: [5.5, null, 4.0], c10Weld: [null, null, null],
};
const DAYS: Record<string, number> = {
  'ths.viv': 147.3, 'ths.combined': 137.7, 'lpwhh.viv': 313.9, 'lpwhh.wave': 390.7, 'lpwhh.combined': 174.1,
  'lsubTop.viv': 769.2, 'lsubTop.combined': 710.9,
};

export const FATIGUE: Candidate[] = [
  ...p('ths', 4.50, 'HSS', 5.2), ...p('lpwhh', 1.63, 'C1', 1.347), ...p('lsubTop', 2.50, 'C1', 1.347),
  ...p('hanger', 1.75, 'E', 1.3), ...p('scTaperF1', 1.81, 'F1', 1.3), ...p('c15Body', -10.22, 'B1', 3.0),
  ...p('c15Weld', -10.07, 'D', 1.4), ...p('c10Weld', -21.77, 'D', 1.49),

  ...Object.entries(RES).flatMap(([id, [v, w, c]]) => [
    life(`fatigue.${id}.viv`, v, 'SRC-02', 49, 'Table 5.1 VIV Fatigue Results Summary', 'VIV, base case', T, DAYS[`${id}.viv`] ? { note: `${DAYS[`${id}.viv`]} days` } : {}),
    life(`fatigue.${id}.wave`, w, 'SRC-02', 52, 'Table 5.3 Wave Fatigue Results Summary', 'Wave, base case', T, DAYS[`${id}.wave`] ? { note: `${DAYS[`${id}.wave`]} days` } : {}),
    life(`fatigue.${id}.combined`, c, 'SRC-02', 60, 'Table 5.6 Combined Wave and VIV Fatigue', 'Combined, base case', T, DAYS[`${id}.combined`] ? { note: `${DAYS[`${id}.combined`]} days` } : {}),
  ]),
  ...Object.entries(HEAD_COMB).flatMap(([id, arr]) => arr.map((y, i) =>
    life(`fatigue.${id}.combinedHeading.${[0, 45, 90][i]}`, y, 'SRC-02', 62, 'Table 5.7 Combined Fatigue (MODU heading sensitivity)', `Combined, heading ${[0, 45, 90][i]}°`, T))),

  // Interim summary values for the same keys (corroborate or conflict)
  life('fatigue.lpwhh.viv', 0.9, 'SRC-04', 2, 'Table 2.1 VIV Fatigue Results', 'VIV, base case', I),
  life('fatigue.lpwhh.combined', 0.5, 'SRC-04', 3, 'Table 2.2 Combined Fatigue', 'Combined, base case', I),
  life('fatigue.lsubTop.combined', 1.9, 'SRC-04', 3, 'Table 2.2 Combined Fatigue', 'Combined, base case', I),
  life('fatigue.lpwhh.wave', 1.1, 'SRC-03', 2, 'Table 2.1 Wave Fatigue Results', 'Wave, base case', I),

  // Acceptance targets — component-class specific
  cand('target.THS_CONNECTOR', 70, 'days', 'SRC-02', 20, '§3.3.1 Drilling Durations', '40 d drilling & completion + 30 d intervention', N,
    'reported', { note: '= 0.192 years' }),
  cand('target.GENERAL', 140, 'days', 'SRC-02', 20, '§3.3.1 Drilling Durations', '80 d drilling & completion + 30 d intervention + 30 d P&A', N,
    'reported', { note: '= 0.383 years' }),
  cand('target.GENERAL', 80, 'days', 'SRC-03', 1, '§1 Summary', 'Operational target (interim)', I),
  cand('target.GENERAL', 80, 'days', 'SRC-04', 1, '§1 Summary', 'Operational target (interim)', I),
  cand('fatigue.durations', '40 d drilling + 40 d completion', '', 'SRC-02', 20, '§3.3.1', 'Planned operations', N),

  // Governing components
  cand('fatigue.governing.combined', 'THS to HPWHH connector — 0.4 years', '', 'SRC-02', 60, 'Table 5.6 (minimum of table)', 'Combined, base case', T),
  cand('fatigue.governing.combined', 'LPWHH weld — 0.5 years', '', 'SRC-04', 1, '§1 Summary', 'Combined, base case', I),
  cand('fatigue.governing.viv', 'THS to HPWHH connector — 0.4 years', '', 'SRC-02', 49, 'Table 5.1 (minimum of table)', 'VIV, base case', T),
  cand('fatigue.governing.viv', 'LPWHH weld — 0.9 years', '', 'SRC-04', 1, '§1 Summary', 'VIV, base case', I),
  cand('fatigue.governing.wave', 'LPWHH weld — 1.1 years', '', 'SRC-02', 52, 'Table 5.3 (minimum of table)', 'Wave, base case', T),
  cand('fatigue.governing.wave', 'LPWHH weld — 1.1 years', '', 'SRC-03', 1, '§1 Summary', 'Wave, base case', I),
  cand('fatigue.otherLocations', '13 further assessed locations return >10 years in every case', '', 'SRC-02', 60, 'Tables 5.3–5.7', 'All', T),
];
