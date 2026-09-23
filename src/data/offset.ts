import { cand } from './extract';
import { Candidate, Point, Tier } from './types';

const T = Tier.FINAL_TABLE, F = Tier.FINAL_FIGURE, N = Tier.FINAL_NARRATIVE, I = Tier.INTERIM_SUMMARY;
const pts = (a: number[][]): Point[] => a.map(([x, y]) => ({ x, y }));

/** Reported discrete limits: [drilling, nonDrilling]; null = N/A. FR Table 2.1 (and 5.x). */
const LIMITS: Record<string, [number | null, number]> = {
  'noCurrent.1yr': [28, 33], 'noCurrent.100yr': [null, 26], 'current1yr.1yr': [17, 34], 'current1yr.100yr': [null, 22],
};

export const OFFSET: Candidate[] = [
  ...Object.entries(LIMITS).flatMap(([k, [d, n]]) => [
    cand(`offset.${k}.drilling`, d ?? 'N/A', d === null ? '' : '± m', 'SRC-02', 10, 'Table 2.1 Offset Limit Results Summary', k, T),
    cand(`offset.${k}.nonDrilling`, n, '± m', 'SRC-02', 10, 'Table 2.1 Offset Limit Results Summary', k, T),
    cand(`offset.${k}.drilling`, d ?? 'N/A', d === null ? '' : '± m', 'SRC-06', 1, 'Table 1.1 Offset Limit Results Summary', k, I),
    cand(`offset.${k}.nonDrilling`, n, '± m', 'SRC-06', 1, 'Table 1.1 Offset Limit Results Summary', k, I),
  ]),
  cand('offset.limiting.noCurrent', 'Drilling: upper flex joint angle. Non-drilling: 36 in conductor pipe strength (up- and downstream).', '',
    'SRC-02', 64, '§5.4 discussion of Fig 5.3', 'No current', N),
  cand('offset.limiting.current1yr', 'Drilling: upper flex joint (upstream), 36 in conductor and lower flex joint (downstream). Non-drilling: 36 in conductor pipe strength.', '',
    'SRC-02', 65, '§5.4 discussion of Fig 5.4', '1-yr current', N),
  cand('offset.modes', ['Drilling: connected, normal drilling', 'Connected non-drilling: avoid tripping large equipment and string rotation through flex joints',
    'Disconnect: outside connected non-drilling limits, disconnect at the LMRP'], '', 'SRC-02', 63, '§5.4 operating mode definitions', 'All', N),
  cand('offset.hsRangePlotted', 7, 'm', 'SRC-02', 64, 'Figs 5.3–5.4 (Hs axis 0–7 m)', 'Envelope plots', F),
  cand('offset.hsRangePlotted', 14, 'm', 'SRC-01', 39, '§3.5.3 Load Cases (Hs up to 14 m in 1 m steps)', 'Planned load cases', Tier.DESIGN_BASIS),

  // Envelope outlines digitised from final report figures (DERIVED). x = rig offset [m], y = Hs [m].
  cand('offset.envelope.noCurrent.nonDrilling', pts([[-46, 0], [-45.5, 1], [-40, 2.2], [-35, 2.9], [-32, 5.2], [-25, 7], [25, 7], [32, 5.3], [35, 2.9], [40, 2.2], [45, 1], [46, 0]]),
    'm / m', 'SRC-02', 64, 'Fig 5.3 (digitised outline)', 'No current', F, 'derived'),
  cand('offset.envelope.noCurrent.drilling', pts([[-33, 0], [-32.5, 2.3], [-31.5, 3.7], [-30, 3.8], [-25, 4.3], [-20, 4.85], [-14, 5.25], [-5, 5.35], [5, 5.4], [11, 5.45], [20, 4.95], [25, 4.4], [30, 3.8], [32, 3.7], [32.5, 2.7], [33, 0]]),
    'm / m', 'SRC-02', 64, 'Fig 5.3 (digitised outline)', 'No current', F, 'derived'),
  cand('offset.envelope.current1yr.nonDrilling', pts([[-50, 0], [-50, 1.5], [-45, 4.8], [-40, 7], [20, 7], [25, 5.5], [30, 5.05], [35, 3.8], [40, 1.8], [40.5, 0]]),
    'm / m', 'SRC-02', 65, 'Fig 5.4 (digitised outline)', '1-yr current', F, 'derived'),
  cand('offset.envelope.current1yr.drilling', pts([[-23, 0], [-22.7, 1.5], [-20, 3.3], [-17, 4.05], [-10, 4.7], [-5, 5.05], [5, 5.25], [15, 5.4], [25, 5.5], [30, 5.05], [35, 3.8], [40, 1.8], [40.5, 0]]),
    'm / m', 'SRC-02', 65, 'Fig 5.4 (digitised outline)', '1-yr current', F, 'derived'),

  // Conductor bending moment vs offset, 1-yr storm Hs 3.8 m with current — digitised (DERIVED).
  cand('bm.offsets', [-80, -60, -40, -20, 0, 20, 40, 60, 80], 'm', 'SRC-02', 67, 'Fig 5.5 (digitised)', '1-yr storm, Hs 3.8 m', F, 'derived'),
  cand('bm.peaks', [9500, 6950, 4600, 2350, 1400, 3700, 6000, 8500, 11100], 'kNm', 'SRC-02', 67, 'Fig 5.5 (digitised peak values)', '1-yr storm, Hs 3.8 m', F, 'derived'),
  cand('bm.shape', pts([[7, 0.37], [5, 0.45], [3.5, 0.54], [0, 0.66], [-3, 0.81], [-6, 0.93], [-8.5, 1.0], [-10, 0.99], [-13, 0.88], [-16, 0.64], [-20, 0.36], [-23, 0.12], [-26, 0.03], [-30, 0.02]]),
    '— (normalised)', 'SRC-02', 67, 'Fig 5.5 (normalised shape of +80 m curve)', '1-yr storm, Hs 3.8 m', F, 'derived',
    { note: 'Peak near −8 to −10 m below mudline, consistent with narrative "peak loads ≈10 m below mudline".' }),
  cand('bm.peakLocationNarrative', 'Peak bending ≈10 m below mudline, where riser loads react against soil lateral support', '', 'SRC-02', 68, '§5.4 discussion of Fig 5.5', '1-yr storm', N),
  cand('capacity.c36x15.bending', 8600, 'kNm', 'SRC-02', 17, 'Table 3.7 Bending Capacities (storm, ×1.33)', 'Offset', T),
  cand('capacity.c36x10.bending', 5750, 'kNm', 'SRC-02', 17, 'Table 3.7 Bending Capacities (storm, ×1.33)', 'Offset', T),
  cand('capacity.c26.bending', 2840, 'kNm', 'SRC-02', 17, 'Table 3.7 Bending Capacities (storm, ×1.33)', 'Offset', T),
];
