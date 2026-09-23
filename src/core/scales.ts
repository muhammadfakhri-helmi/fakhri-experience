import { approvedEngineeringData as A } from '../data/resolver';

/**
 * Multi-scale vertical mapping from real elevation (m relative to mudline, + up) to scene units.
 *  - SUBSEA / WELLHEAD zone (depthCompressFrom … uncompressedZoneTop): true height
 *  - GLOBAL water column (uncompressedZoneTop … MSL): compressed by viz.waterColumnScale
 *  - Above MSL: true height (rig)
 *  - CUTAWAY below viz.depthCompressFrom: logarithmic compression ("DEPTH VISUALLY COMPRESSED")
 * Labels always show real elevations; only positions are mapped.
 */
const MSL_E = A.num('elev.msl');
const TOP = A.num('viz.uncompressedZoneTop');
const WC = A.num('viz.waterColumnScale');
const DC = A.num('viz.depthCompressFrom');
const DEEPEST = A.num('casing.c13.shoe');
const DEPTH_SPAN = 200; // scene units used for the compressed cutaway
const K = 150;

export function Y(e: number): number {
  if (e >= DC && e <= TOP) return e;
  if (e > TOP && e <= MSL_E) return TOP + (e - TOP) * WC;
  if (e > MSL_E) return TOP + (MSL_E - TOP) * WC + (e - MSL_E);
  const d = -e, d0 = -DC;
  return DC - DEPTH_SPAN * Math.log(1 + (d - d0) / K) / Math.log(1 + (-DEEPEST - d0) / K);
}

export const MSL_Y = Y(MSL_E);
export const RADIAL = A.num('viz.radialScale');
/** diameter in inches → exaggerated scene radius in metres */
export const R = (inch: number) => inch * 0.0254 / 2 * RADIAL;
export const isCompressed = (e: number) => e < DC || (e > TOP && e < MSL_E);
