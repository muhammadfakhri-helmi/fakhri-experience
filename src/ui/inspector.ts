import { approvedEngineeringData as A, fmtValue } from '../data/resolver';
import { SOURCES } from '../data/sources';
import { FATIGUE_COMPONENTS } from '../data/fatigue';
import { AppState } from '../core/state';
import { lifeKey, targetKey } from '../chapters/chapters';
import { chip, v } from './values';

const row = (label: string, key: string, override?: string) => {
  const r = A.get(key); const s = SOURCES[r.selected.source];
  return `<tr><td>${label}</td><td>${v(key, override)}</td><td>${chip(r.status)}</td><td class="src">${s.id}${r.selected.page ? ' · p.' + r.selected.page : ''}</td></tr>`;
};
const table = (rows: string) => `<table class="insp"><tr><th>Parameter</th><th>Value</th><th>Class</th><th>Source</th></tr>${rows}</table>`;

const CARDS: Record<string, { name: string; rows: [string, string][]; meaning: string }> = {
  landingSub: { name: '26 in landing sub', rows: [['OD', 'wh.landingSub.od'], ['Top elevation', 'elev.landingSubTop'], ['Base elevation', 'elev.conductorTop']], meaning: 'Carries the 26 in secondary conductor hanger below the LP wellhead.' },
  lpwhh: { name: 'Low-pressure wellhead housing', rows: [['OD', 'wh.lpwhh.od'], ['Top elevation', 'elev.lpwhhTop']], meaning: 'Welded to the 36 in conductor; its weld is the governing wave-fatigue location.' },
  hpwhh: { name: 'High-pressure wellhead housing', rows: [['OD', 'wh.hpwhh.od'], ['Top elevation (datum)', 'elev.hpwhhTop'], ['Rating', 'wh.rating'], ['Bending capacity', 'wh.bendingCapacity']], meaning: 'Pressure-containing housing on the 20 in surface casing; the THS latches onto it.' },
  ths: { name: 'Tubing head spool (THS)', rows: [['Weight in air', 'stack.ths.weightAir'], ['Effective length', 'stack.ths.lengthEff'], ['Top elevation', 'elev.thsTop']], meaning: 'Sits between wellhead and BOP in this configuration, adding height and load; its connector governs combined fatigue.' },
  bop: { name: 'Blowout preventer', rows: [['Weight in air', 'stack.bop.weightAir'], ['Length', 'stack.bop.length'], ['Top elevation', 'elev.bopTop']], meaning: 'Heaviest stack item; its mass and height amplify bending transferred to the wellhead.' },
  lmrp: { name: 'Lower marine riser package', rows: [['Weight in air', 'stack.lmrp.weightAir'], ['Length', 'stack.lmrp.length'], ['Top elevation', 'elev.lmrpTop']], meaning: 'Disconnect point: in RED operating state the riser is released here.' },
  lfj: { name: 'Lower flex joint', rows: [['Max rotation', 'fj.lfj.maxRotation'], ['Drilling criteria', 'fj.drilling.meanMax'], ['Top elevation', 'elev.lfjTop']], meaning: 'Limits the drilling envelope downstream when current is present.' },
  riser: { name: 'Marine drilling riser', rows: [['Main tube OD', 'riser.od'], ['Wall thickness', 'riser.wt'], ['Buoyancy OD', 'riser.buoyOd'], ['Mud weight', 'riser.mudWeight'], ['UFJ max rotation', 'fj.ufj.maxRotation'], ['Telescopic stroke', 'tj.stroke']], meaning: 'Transfers rig motion and current load down to the subsea stack.' },
  c36: { name: '36 in conductor', rows: [['OD', 'casing.c36.od'], ['Wall (upper / lower)', 'casing.c36.wtUpper'], ['Grade', 'casing.c36.grade'], ['Crossover', 'casing.c36.crossover'], ['Shoe', 'casing.c36.shoe'], ['Top of cement (tail)', 'casing.c36.tocTail'], ['Bending capacity 1.5 in', 'capacity.c36x15.bending'], ['Bending capacity 1.0 in', 'capacity.c36x10.bending']], meaning: 'Outer structural foundation; limits the connected non-drilling envelope.' },
  c26: { name: '26 in secondary conductor', rows: [['OD', 'casing.c26.od'], ['Wall', 'casing.c26.wt'], ['Grade', 'casing.c26.grade'], ['Shoe', 'casing.c26.shoe'], ['Top of cement', 'casing.c26.tocLead'], ['Bending capacity', 'capacity.c26.bending'], ['Min. setting depth', 'length.c26.minSettingDepth']], meaning: 'Reaches stiffer soil and carries most of the well axial load once installed.' },
  c20: { name: '20 × 18-5/8 in surface casing', rows: [['OD', 'casing.c20.od'], ['Crossover', 'casing.c20.crossover'], ['Shoe', 'casing.c20.shoe'], ['Top of cement', 'casing.c20.tocTail']], meaning: 'Carries the HPWHH; in tension in the well-load sequence.' },
  c13: { name: '13-5/8 in production casing', rows: [['OD', 'casing.c13.od'], ['Shoe', 'casing.c13.shoe'], ['Top of cement', 'casing.c13.tocTail']], meaning: 'Last string in the load sequence; adds the final step of conductor compression.' },
};

export function componentCard(id: string, s: AppState): string {
  if (id.startsWith('fat:')) return fatigueCard(id.slice(4), s);
  const c = CARDS[id]; if (!c) return '';
  return `<div class="card"><small>Component</small><h3>${c.name}</h3><p class="p">${c.meaning}</p>${table(c.rows.map(([l, k]) => row(l, k)).join(''))}</div>`;
}

function fatigueCard(id: string, s: AppState): string {
  const fc = FATIGUE_COMPONENTS.find(c => c.id === id)!;
  const lk = lifeKey(id, s) ?? `fatigue.${id}.combined`;
  const main = A.get(lk);
  return `<div class="card"><small>Component</small><h3>${fc.name}</h3>
    <dl class="kv"><dt>Scenario</dt><dd>${main.selected.case}</dd><dt>Result</dt><dd>Factored fatigue lifetime</dd>
    <dt>Reported value</dt><dd>${v(lk, fmtValue(main))}</dd><dt>Applicable target</dt><dd>${v(targetKey(fc.targetClass))} (${fc.targetClass === 'THS_CONNECTOR' ? 'THS connector class' : 'general class'})</dd>
    <dt>Classification</dt><dd>${chip(main.status)}</dd><dt>Source</dt><dd>${SOURCES[main.selected.source].id} · p.${main.selected.page} · ${main.selected.ref}</dd></dl>
    <p class="p"><b>Engineering meaning.</b> ${fc.why}</p>
    ${table([
      row('Elevation above mudline', `fatigue.${id}.elevation`), row('S-N curve', `fatigue.${id}.sn`), row('SAF', `fatigue.${id}.saf`),
      row('VIV life', `fatigue.${id}.viv`), row('Wave life', `fatigue.${id}.wave`), row('Combined life', `fatigue.${id}.combined`),
      ...A.arr<number>('sens.cement.cases').map(c => row(`Wave life, TOC ${c} m`, `sens.cement.${c}.${id}`)),
      ...A.arr<number>('sens.heading.cases').map(h => row(`Wave life, heading ${h}°`, `sens.heading.${h}.${id}`)),
      ...A.arr<number>('sens.heading.cases').map(h => row(`Combined life, heading ${h}°`, `fatigue.${id}.combinedHeading.${h}`)),
    ].join(''))}</div>`;
}
