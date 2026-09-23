import { cand } from './extract';
import { Candidate, Tier } from './types';

/**
 * Visualization conventions. These are NOT engineering results. They are resolved like
 * every other value so the scene never hardcodes numbers, and they always carry status ILLUSTRATIVE.
 */
const V = (key: string, value: number | string, unit: string, note: string): Candidate =>
  cand(key, value, unit, 'VIZ', null, 'Visualization convention', 'Display', Tier.INTERIM_SUMMARY, 'illustrative', { note });

export const VISUAL: Candidate[] = [
  V('viz.radialScale', 1.5, '×', 'Pipe and housing diameters drawn 1.5× so they remain visible.'),
  V('viz.waterColumnScale', 0.15, '×', 'Water column between 25 m and MSL drawn at 15 % height (GLOBAL scale).'),
  V('viz.uncompressedZoneTop', 25, 'm', 'Below this elevation the subsea stack is drawn true-height.'),
  V('viz.depthCompressFrom', -60, 'm', 'Below this depth the well cutaway is logarithmically compressed.'),
  V('viz.axialAmplification', 100, '×', 'Axial movement drawn 100× larger than actual.'),
  V('viz.riserOffsetShapeExp', 1.35, '', 'Exponent of the illustrative riser deflection spline.'),
  V('viz.currentBow', 9, 'display m', 'Illustrative downstream bow of the riser under current.'),
  V('viz.conductorDeflectionPerM', 0.035, 'display m / m offset', 'Illustrative lateral lean of stack/conductor per metre of rig offset.'),
  V('viz.vivAmplitude', 7, 'display m', 'Illustrative VIV mode amplitude (no amplitude data published).'),
  V('viz.vivTimeScale', 12, '×', 'VIV animation plays 12× faster than the reported natural frequency.'),
  V('viz.waveHeave', 0.9, 'display m', 'Illustrative vessel heave for cyclic wave animation.'),
];
