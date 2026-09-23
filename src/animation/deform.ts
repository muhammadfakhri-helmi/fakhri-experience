import { approvedEngineeringData as A } from '../data/resolver';

/**
 * Animation representation — kept separate from engineering results.
 * Every exported deformation declares its amplitude source.
 */
export const deformationMeta = {
  riserOffsetShape: { amplitudeSource: 'illustrative', drivenBy: 'rig offset (slider)', note: 'Spline pinned at LFJ and rig; no displacement profile published.' },
  riserCurrentBow: { amplitudeSource: 'illustrative', drivenBy: 'current case', note: 'Visual bow only.' },
  riserViv: { amplitudeSource: 'illustrative', frequencySource: 'reported (Table 5.2)', note: 'Mode count and natural frequency reported; amplitude not published.' },
  waveCycle: { amplitudeSource: 'illustrative', note: 'Cyclic heave/sway conveys wave loading; not scaled to Hs.' },
  conductorLean: { amplitudeSource: 'illustrative', note: 'Lateral lean of stack/conductor above ≈ −30 m, proportional to offset.' },
  axialSettlement: { amplitudeSource: 'reported', scale: 'viz.axialAmplification', note: 'Reported displacement × visual amplification.' },
} as const;

export interface DeformState { offset: number; current: boolean; vivMode: number; vivOn: boolean; waveOn: boolean; t: number }

const K_LEAN = A.num('viz.conductorDeflectionPerM');
const EXP = A.num('viz.riserOffsetShapeExp');
const BOW = A.num('viz.currentBow');
const VIV_AMP = A.num('viz.vivAmplitude');
const VIV_TS = A.num('viz.vivTimeScale');
const FREQ = A.arr<number>('viv.mode.frequency');
const HEAVE = A.num('viz.waveHeave');

/** Illustrative lateral displacement of the conductor/stack at real elevation e (m). */
export function conductorLean(e: number, s: DeformState): number {
  if (e <= -30) return 0;
  const t = Math.min(1, (e + 30) / 50);
  const wave = s.waveOn ? Math.sin(s.t * 1.1) * 0.25 : 0;
  return (s.offset * K_LEAN + wave) * t * t;
}

/** Illustrative riser lateral position at normalised height t (0 = LFJ, 1 = rig). */
export function riserX(t: number, base: number, top: number, s: DeformState): number {
  let x = base + (top - base) * Math.pow(t, EXP);
  if (s.current) x += BOW * Math.sin(Math.PI * t) * (1 - 0.25 * t);
  if (s.vivOn) {
    const f = FREQ[Math.max(0, Math.min(FREQ.length - 1, s.vivMode - 1))];
    x += VIV_AMP * Math.sin(Math.PI * s.vivMode * t) * Math.sin(2 * Math.PI * f * VIV_TS * s.t);
  }
  if (s.waveOn) x += Math.sin(s.t * 1.1) * 1.2 * t;
  return x;
}

export const rigHeave = (s: DeformState) => (s.waveOn ? Math.sin(s.t * 1.1) * HEAVE : 0);
export const rigSway = (s: DeformState) => (s.waveOn ? Math.sin(s.t * 1.1) * 1.2 : 0);
