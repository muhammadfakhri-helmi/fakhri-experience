import { approvedEngineeringData as A } from '../data/resolver';
import { Point } from '../data/types';
import { CurrentCase, HsCase } from '../core/state';
import { FATIGUE_COMPONENTS } from '../data/fatigue';
import { v } from './values';

const interp = (xs: number[], ys: number[], x: number) => {
  if (x <= xs[0]) return ys[0];
  for (let i = 1; i < xs.length; i++) if (x <= xs[i]) return ys[i - 1] + (ys[i] - ys[i - 1]) * (x - xs[i - 1]) / (xs[i] - xs[i - 1]);
  return ys[ys.length - 1];
};
export const bmPeak = (off: number) => interp(A.arr('bm.offsets'), A.arr('bm.peaks'), off);
export function bmShape(e: number) {
  const s = A.arr<Point>('bm.shape');
  if (e >= s[0].x) return s[0].y; if (e <= s[s.length - 1].x) return s[s.length - 1].y;
  for (let i = 1; i < s.length; i++) if (e >= s[i].x) { const t = (e - s[i - 1].x) / (s[i].x - s[i - 1].x); return s[i - 1].y + (s[i].y - s[i - 1].y) * t; }
  return 0;
}
export const bmCapacity = (e: number) => e >= A.num('casing.c36.crossover') ? A.num('capacity.c36x15.bending') : A.num('capacity.c36x10.bending');

export function offsetLimits(cur: CurrentCase, hs: HsCase) {
  const d = A.get(`offset.${cur}.${hs}.drilling`).value, n = A.num(`offset.${cur}.${hs}.nonDrilling`);
  return { drilling: typeof d === 'number' ? d : null, nonDrilling: n, dKey: `offset.${cur}.${hs}.drilling`, nKey: `offset.${cur}.${hs}.nonDrilling` };
}
export type OpState = 'DRILLING' | 'NON_DRILLING' | 'DISCONNECT';
export function opState(offset: number, cur: CurrentCase, hs: HsCase): OpState {
  const L = offsetLimits(cur, hs), a = Math.abs(offset);
  if (L.drilling !== null && a <= L.drilling) return 'DRILLING';
  if (a <= L.nonDrilling) return 'NON_DRILLING';
  return 'DISCONNECT';
}

/** Offset vs Hs operating envelope (digitised published outline + reported discrete limits). */
export function envelopeChart(offset: number, cur: CurrentCase, hs: HsCase): string {
  const W = 340, H = 220, pl = 30, pr = 8, pt = 10, pb = 30, xmin = -60, xmax = 60, ymax = A.num('offset.hsRangePlotted');
  const X = (x: number) => pl + (x - xmin) / (xmax - xmin) * (W - pl - pr), Yc = (y: number) => pt + (1 - y / ymax) * (H - pt - pb);
  const poly = (p: Point[]) => p.map(q => `${X(q.x)},${Yc(q.y)}`).join(' ');
  const nd = A.arr<Point>(`offset.envelope.${cur}.nonDrilling`), dr = A.arr<Point>(`offset.envelope.${cur}.drilling`);
  const hsVal = A.num(hs === '1yr' ? 'env.hs.1yr' : 'env.hs.100yr');
  const L = offsetLimits(cur, hs);
  let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Operating envelope: rig offset versus significant wave height">`;
  s += `<rect x="${pl}" y="${pt}" width="${W - pl - pr}" height="${H - pt - pb}" fill="rgba(216,87,74,.22)"/>`;
  s += `<polygon points="${poly(nd)}" fill="rgba(230,176,74,.45)" stroke="#e6b04a"/><polygon points="${poly(dr)}" fill="rgba(79,163,122,.55)" stroke="#4fa37a"/>`;
  for (let x = -60; x <= 60; x += 20) s += `<text x="${X(x)}" y="${H - pb + 13}" class="ax" text-anchor="middle">${x}</text>`;
  for (let y = 0; y <= ymax; y += 1) s += `<text x="${pl - 5}" y="${Yc(y) + 3}" class="ax" text-anchor="end">${y}</text>`;
  s += `<line x1="${pl}" x2="${W - pr}" y1="${Yc(hsVal)}" y2="${Yc(hsVal)}" stroke="#eaf1f3" stroke-dasharray="4 3"/>`;
  [L.drilling, L.nonDrilling].forEach((lim, i) => { if (lim === null) return; [-lim, lim].forEach(x => s += `<line x1="${X(x)}" x2="${X(x)}" y1="${Yc(hsVal) - 7}" y2="${Yc(hsVal) + 7}" stroke="${i ? '#e6b04a' : '#4fa37a'}" stroke-width="3"/>`); });
  s += `<circle cx="${X(Math.max(xmin, Math.min(xmax, offset)))}" cy="${Yc(hsVal)}" r="6" fill="#5fb3a8" stroke="#eaf1f3" stroke-width="2"/>`;
  s += `<text x="${(pl + W) / 2}" y="${H - 2}" class="ax" text-anchor="middle">Rig offset [m] (− upstream / + downstream)</text>`;
  s += `<text x="10" y="${(pt + H - pb) / 2}" class="ax" transform="rotate(-90 10 ${(pt + H - pb) / 2})" text-anchor="middle">Hs [m]</text></svg>`;
  return s + `<p class="note">Coloured regions: outline digitised from ${v(`offset.envelope.${cur}.nonDrilling`, 'published figure')} (DERIVED). Bars on the dashed line: reported limits ${L.drilling !== null ? v(L.dKey, '±' + L.drilling + ' m') : v(L.dKey)} / ${v(L.nKey, '±' + L.nonDrilling + ' m')} (governing, symmetric).</p>`;
}

/** Conductor bending moment profile vs elevation for the current offset (digitised). */
export function bmChart(offset: number): string {
  const W = 340, H = 230, pl = 36, pr = 10, pt = 8, pb = 28, zmin = -30, zmax = 7, bmax = 12000;
  const X = (b: number) => pl + b / bmax * (W - pl - pr), Yc = (z: number) => pt + (zmax - z) / (zmax - zmin) * (H - pt - pb);
  const c15 = A.num('capacity.c36x15.bending'), c10 = A.num('capacity.c36x10.bending'), xo = A.num('casing.c36.crossover');
  let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Conductor bending moment versus elevation">`;
  for (let b = 0; b <= bmax; b += 3000) s += `<line x1="${X(b)}" x2="${X(b)}" y1="${pt}" y2="${H - pb}" stroke="rgba(255,255,255,.07)"/><text x="${X(b)}" y="${H - pb + 13}" class="ax" text-anchor="middle">${b / 1000}k</text>`;
  [5, 0, -10, -20, -30].forEach(z => s += `<line x1="${pl}" x2="${W - pr}" y1="${Yc(z)}" y2="${Yc(z)}" stroke="rgba(255,255,255,${z === 0 ? .25 : .06})"/><text x="${pl - 5}" y="${Yc(z) + 3}" class="ax" text-anchor="end">${z}</text>`);
  s += `<polyline fill="none" stroke="#d8574a" stroke-dasharray="4 3" points="${X(c15)},${Yc(1.63)} ${X(c15)},${Yc(xo)}"/><polyline fill="none" stroke="#d8574a" stroke-dasharray="4 3" points="${X(c10)},${Yc(xo)} ${X(c10)},${Yc(-30)}"/>`;
  A.arr<number>('bm.offsets').filter(o => Math.abs(o) <= 60).forEach(o => { let p = ''; for (let z = 7; z >= -30; z -= 0.5) p += `${X(bmPeak(o) * bmShape(z))},${Yc(z)} `; s += `<polyline fill="none" stroke="rgba(169,188,195,.22)" points="${p}"/>`; });
  let p = ''; for (let z = 7; z >= -30; z -= 0.5) p += `${X(bmPeak(offset) * bmShape(z))},${Yc(z)} `;
  s += `<polyline fill="none" stroke="#5fb3a8" stroke-width="2.5" points="${p}"/>`;
  s += `<text x="${(pl + W) / 2}" y="${H - 2}" class="ax" text-anchor="middle">Bending moment [kNm] vs elevation [m]</text></svg>`;
  return s + `<p class="note">Curves digitised from ${v('bm.peaks', 'final report figure')} (DERIVED, 1-yr storm). Red dashes: capacities ${v('capacity.c36x15.bending')} / ${v('capacity.c36x10.bending')}.</p>`;
}

/** Combined damage decomposition: damage rate = 1 / factored life (DERIVED). */
export function damageBars(): string {
  const rows = FATIGUE_COMPONENTS.filter(c => !A.life(`fatigue.${c.id}.combined`).gt).map(c => {
    const vv = A.life(`fatigue.${c.id}.viv`), w = A.life(`fatigue.${c.id}.wave`), cb = A.life(`fatigue.${c.id}.combined`);
    const dv = vv.gt ? 0 : 1 / vv.years, dw = w.gt ? 0 : 1 / w.years;
    return { c, dv, dw, vv, w, cb, sum: dv + dw };
  }).sort((a, b) => b.sum - a.sum);
  const max = Math.max(...rows.map(r => r.sum));
  return `<div class="dbars">${rows.map(r => `<div class="dbar"><span>${r.c.name}</span>
    <div class="track"><i class="viv" style="width:${r.dv / max * 100}%"></i><i class="wave" style="width:${r.dw / max * 100}%"></i></div>
    <span>${v(`fatigue.${r.c.id}.combined`, `${r.cb.years} y`)}</span></div>`).join('')}</div>
    <p class="note"><i class="sw viv"></i>VIV <i class="sw wave"></i>Wave. Bar length = damage rate (1 / factored life), DERIVED from the reported lifetimes. A ">10 y" entry contributes an unquantified small share and is drawn as zero.</p>`;
}
