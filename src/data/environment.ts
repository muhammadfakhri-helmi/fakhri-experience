import { cand } from './extract';
import { Candidate, Tier } from './types';

const T = Tier.FINAL_TABLE, N = Tier.FINAL_NARRATIVE, D = Tier.DESIGN_BASIS;

export const ENVIRONMENT: Candidate[] = [
  cand('env.waterDepth', 600, 'm', 'SRC-02', 35, '§3.5.1 Water Depth', 'All scopes except VIV', N),
  cand('env.waterDepthViv', 800, 'm', 'SRC-02', 35, '§3.5.1 Water Depth', 'VIV fatigue scope', N),
  cand('env.hs.1yr', 3.8, 'm', 'SRC-02', 35, 'Table 3.26 Extreme Cyclonic Wave Data', 'Cyclonic', T),
  cand('env.hs.10yr', 4.7, 'm', 'SRC-02', 35, 'Table 3.26', 'Cyclonic', T),
  cand('env.hs.50yr', 5.9, 'm', 'SRC-02', 35, 'Table 3.26', 'Cyclonic', T),
  cand('env.hs.100yr', 6.4, 'm', 'SRC-02', 35, 'Table 3.26', 'Cyclonic', T),
  cand('env.tp.1yr', 9.0, 's', 'SRC-01', 30, 'Table 2.25 Extreme Cyclonic Wave Data', 'Cyclonic', D),
  cand('env.current.1yrSurface', 1.07, 'm/s', 'SRC-02', 63, '§5.4 Offset Limit Analysis', '1-yr extreme current', N),
  cand('env.current.hindcastTypical', 0.6, 'm/s', 'SRC-04', 4, '§2 discussion (majority of hindcast speeds below ≈0.6 m/s)', 'VIV hindcast', Tier.INTERIM_SUMMARY,
    'reported', { note: 'Qualitative bound from interim summary; used only for narrative context.' }),
  cand('env.fatigueDesignFactor', 10, '', 'SRC-02', 48, '§5 (API RP 2A-WSD)', 'All fatigue', N),
  cand('env.waveScatterMethod', 'Fully directional wave scatter cases (Hs–Tz pairs combined with directional probabilities)', '',
    'SRC-02', 8, '§2.2 / §5.2', 'Wave fatigue', N),

  // VIV mode summary (FR Table 5.2)
  cand('viv.mode.frequency', [0.027, 0.054, 0.082, 0.109, 0.136], 'Hz', 'SRC-02', 50, 'Table 5.2 VIV Mode Shapes Summary', 'VIV, 800 m WD', T),
  cand('viv.mode.period', [36.9, 18.4, 12.2, 9.2, 7.3], 's', 'SRC-02', 50, 'Table 5.2', 'VIV, 800 m WD', T),
  cand('viv.mode.lockOnSpeed', [0.07, 0.15, 0.66], 'm/s', 'SRC-02', 50, 'Table 5.2 (modes 1–3; modes 4–5 not excited)', 'VIV, 800 m WD', T),
  cand('viv.mode.exceedance', ['95%', '80%', '2.5%'], '', 'SRC-02', 50, 'Table 5.2', 'VIV, 800 m WD', T),

  // Soil (upper-bound undrained shear strength, top of layer), FR Table 3.32
  cand('soil.layers', [0, 0.3, 3.5, 7.7, 10.2, 12.0, 19.6, 21.8, 27.8, 29.1, 34.9, 37.1, 48.0, 103.0, 150.9], 'm below ML',
    'SRC-02', 39, 'Table 3.32 Soil Data', 'Upper bound (governing)', T),
  cand('soil.suUpperTop', [1.2, 2.6, 8.5, 17.4, 19.4, 25.9, 33.9, 39.7, 46.5, 53.5, 57.5, 66.5, 77.6, 165.0], 'kPa',
    'SRC-02', 39, 'Table 3.32 Soil Data', 'Upper bound (governing)', T),
  cand('soil.type', 'Clay', '', 'SRC-02', 39, 'Table 3.32', 'All', T),
  cand('soil.pyCurves', 'Not supplied in document set', '', 'SRC-02', 39, 'Table 3.32 (Su profile only)', 'All', T,
    'reported', { note: 'P-y curves were generated inside the analysis model and are not published.' }),
];
