import { cand } from './extract';
import { Candidate, Tier } from './types';

const T = Tier.FINAL_TABLE, F = Tier.FINAL_FIGURE, I = Tier.INTERIM_SUMMARY;

/** Load steps; values per casing [36 in, 26 in, 20 in, 13-5/8 in]. Negative = compression. */
const STEPS = [
  'Drill and run conductor', 'Drill and run secondary conductor', 'Drill and run surface casing',
  'Install wellhead, THS and BOP', 'Drill and run production casing',
];
const LOAD: number[][] = [[0, 0, 0, 0], [-101.9, 101.9, 0, 0], [-259.8, 44.0, 215.8, 0], [-404.4, -8.8, 215.7, 0], [-608.9, -83.7, 215.5, 279.6]];
const DISP: number[][] = [[0, 0, 0, 0], [-3.8, 3.8, 0, 0], [-9.8, 1.7, 8.1, 0], [-15.2, -0.3, 8.1, 0], [-22.9, -3.1, 8.1, 10.5]];

export const AXIAL: Candidate[] = [
  cand('axial.steps', STEPS, '', 'SRC-02', 74, 'Table 5.11 Well Loads Summary', 'Base case well plan', T),
  ...LOAD.map((row, i) => cand(`axial.load.step${i + 1}`, row, 't', 'SRC-02', 74, 'Table 5.11 Well Loads Summary', `Load step ${i + 1}`, T)),
  ...DISP.map((row, i) => cand(`axial.disp.step${i + 1}`, row, 'mm', 'SRC-02', 76, 'Table 5.12 Axial Movement Summary', `Load step ${i + 1}`, T)),
  cand('axial.load.max', -608.9, 't', 'SRC-02', 74, 'Table 5.11 / Fig 5.9', 'Top of 36 in conductor', T),
  cand('axial.load.max', -608.9, 't', 'SRC-05', 2, 'Fig 2.1 Well Load Summary', 'Top of 36 in conductor', I),
  cand('axial.disp.max', -22.9, 'mm', 'SRC-02', 76, 'Table 5.12 / Fig 5.10', 'Top of 36 in conductor', T),
  cand('axial.disp.max', -22.9, 'mm', 'SRC-05', 1, '§1 Summary', 'Top of 36 in conductor', I),

  cand('axial.unity.designUB', 0.14, '', 'SRC-02', 73, 'Table 5.8 Length & Axial Summary (SF 1.5)', 'Upper-bound soil', T),
  cand('axial.unity.designLB', 0.20, '', 'SRC-02', 73, 'Table 5.8 (SF 1.5)', 'Lower-bound soil', T),
  cand('axial.unity.operatingUB', 0.19, '', 'SRC-02', 73, 'Table 5.8 (SF 2.0)', 'Upper-bound soil', T),
  cand('axial.unity.operatingLB', 0.26, '', 'SRC-02', 73, 'Table 5.8 (SF 2.0)', 'Lower-bound soil', T),
  cand('axial.unity.bond36to36', 0.29, '', 'SRC-02', 73, 'Table 5.8', 'Cement bond', T),
  cand('axial.unity.bond36to26', 0.33, '', 'SRC-02', 73, 'Table 5.8', 'Cement bond', T),
  cand('axial.unity.bond26to26', 0.02, '', 'SRC-02', 73, 'Table 5.8', 'Cement bond', T),
  cand('length.c26.minSettingDepth', 144, 'm below ML', 'SRC-02', 10, 'Table 2.2 Length Sensitivity', 'Base-case cement at ML', T),
  cand('length.c26.minToc', 340, 'm below ML', 'SRC-02', 10, 'Table 2.2', 'Base-case shoe at 410 m', T),
  cand('length.c36.minWithout26', 118, 'm below ML', 'SRC-02', 10, 'Table 2.2', '26 in omitted, cemented to ML', T),
  cand('length.c36.note', 'No minimum requirement once the 26 in secondary conductor is installed; base plan recommended for structural and fatigue reasons.', '',
    'SRC-02', 10, 'Table 2.2', '36 in conductor', T),
  cand('axial.figure', 'Top-of-conductor load and displacement step plots', '', 'SRC-02', 75, 'Figs 5.9–5.10', 'Base case', F),
];
