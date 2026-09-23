import { approvedEngineeringData as A } from '../data/resolver';
import { FATIGUE_COMPONENTS, TargetClass } from '../data/fatigue';
import { AppState, ChapterId } from '../core/state';
import { MSL_Y } from '../core/scales';
import { bmChart, bmPeak, damageBars, envelopeChart, opState } from '../ui/charts';
import { chip, lifeV, tpl, v } from '../ui/values';

export type Scale = 'GLOBAL' | 'SUBSEA' | 'WELLHEAD' | 'CUTAWAY';
export interface Cam { pos: [number, number, number]; target: [number, number, number] }
export interface Chapter {
  id: ChapterId; n: string; title: string; scale: Scale; cam: Cam; lead: string;
  inspector: (s: AppState) => string;
  controls: (s: AppState) => string;
  /** Story steps: state patches applied in sequence (seconds per step). */
  story: { dur: number; patch: Partial<AppState>; cam?: Cam }[];
}

const TARGET_YEARS = (cls: TargetClass) => A.num(`target.${cls}`) / 365.25;
export const targetKey = (cls: TargetClass) => `target.${cls}`;
export const targetYears = TARGET_YEARS;

/** Which lifetime key applies to a component in the current chapter / scenario. */
export function lifeKey(id: string, s: AppState): string | null {
  switch (s.chapter) {
    case 'wave': return `fatigue.${id}.wave`;
    case 'viv': return `fatigue.${id}.viv`;
    case 'combined': case 'overview': case 'summary': return `fatigue.${id}.${s.fatigueMode}`;
    case 'cement': return `sens.cement.${s.cementCase}.${id}`;
    case 'heading': return `sens.heading.${s.heading}.${id}`;
    default: return null;
  }
}

function lifeTable(s: AppState, keyFn: (id: string) => string, showAll = false) {
  const rows = FATIGUE_COMPONENTS.map(c => ({ c, k: keyFn(c.id), l: A.life(keyFn(c.id)) }))
    .filter(r => showAll || !r.l.gt || r.c.id === s.selected).sort((a, b) => (a.l.gt ? 99 : a.l.years) - (b.l.gt ? 99 : b.l.years));
  const hidden = FATIGUE_COMPONENTS.length - rows.length;
  return `<table class="lt"><tr><th>Component</th><th>Life</th><th>Target</th><th>Life / target</th></tr>${rows.map(r => {
    const ty = TARGET_YEARS(r.c.targetClass), ratio = r.l.gt ? null : r.l.years / ty;
    return `<tr class="${r.c.id === s.selected ? 'on' : ''}" data-comp="${r.c.id}"><td>${r.c.name}</td><td>${lifeV(r.k)}</td><td>${v(targetKey(r.c.targetClass))}</td>
      <td>${ratio === null ? '<span class="dim">&gt;' + (10 / ty).toFixed(0) + '×</span>' : `<b class="${ratio < 2 ? 'r-lo' : ratio < 5 ? 'r-mid' : 'r-hi'}">${ratio.toFixed(1)}×</b>`}</td></tr>`;
  }).join('')}</table>${hidden ? `<p class="note">${hidden} listed components &gt;10 y in this case. ${v('fatigue.otherLocations', 'All other assessed locations')} also exceed 10 y.</p>` : ''}
  <p class="note">Each component is compared only with its own class target (THS connector ${v('target.THS_CONNECTOR')}, other components ${v('target.GENERAL')}).</p>`;
}
const seg = (key: keyof AppState, opts: [string | number, string][], cur: unknown) =>
  `<div class="seg" role="group">${opts.map(([val, l]) => `<button data-set="${key}" data-val="${val}" aria-pressed="${String(val) === String(cur)}">${l}</button>`).join('')}</div>`;

const K = (id: string) => `fatigue.${id}`;
const Y0 = MSL_Y;

export const CHAPTERS: Chapter[] = [
  {
    id: 'overview', n: '01', title: 'System overview', scale: 'GLOBAL',
    cam: { pos: [330, 190, 420], target: [0, 55, 0] },
    lead: tpl('A moored semi-sub MODU drills in {{env.waterDepth}} of water. The marine riser links the rig to a subsea stack (LMRP, BOP, THS) sitting on the wellhead, which is carried by a {{casing.c36.od|36 in}} conductor and a {{casing.c26.od|26 in}} secondary conductor in clay. The study checks whether this well foundation survives the loads the floating rig puts into it.'),
    inspector: () => `<h3>What was analysed</h3><dl class="kv">
      <dt>Rig</dt><dd>${v('rig.type')}</dd><dt>Water depth</dt><dd>${v('env.waterDepth')} (VIV: ${v('env.waterDepthViv')})</dd>
      <dt>RT above mudline</dt><dd>${v('elev.rotaryTable')}</dd><dt>Planned operations</dt><dd>${v('fatigue.durations')}</dd>
      <dt>Fatigue design factor</dt><dd>${v('env.fatigueDesignFactor')}</dd></dl>
      <h3>Analyses in scope</h3><ul class="ls"><li>Well load and axial movement</li><li>Offset limit (operating envelope)</li><li>Wave fatigue, VIV fatigue, combined fatigue</li><li>Cement-shortfall and MODU-heading sensitivities</li></ul>`,
    controls: () => '', story: [{ dur: 12, patch: {} }],
  },
  {
    id: 'stackup', n: '02', title: 'System stack-up', scale: 'SUBSEA',
    cam: { pos: [20, 13, 34], target: [0, 8, 0] },
    lead: tpl('From rotary table ({{elev.rotaryTable}}) down: upper flex joint, telescopic joint and tension ring at the rig, buoyant riser through the water column, then lower flex joint ({{elev.lfjTop}}), LMRP ({{elev.lmrpTop}}), BOP ({{elev.bopTop}}), THS ({{elev.thsTop}}) and the wellhead (HPWHH {{elev.hpwhhTop}}). All elevations are relative to the mudline.'),
    inspector: () => `<h3>Elevations above mudline</h3><table class="lt">${[
      ['Rotary table', 'elev.rotaryTable'], ['Upper flex joint', 'elev.ufjRotation'], ['Tension ring', 'elev.tensionRing'], ['Top of riser', 'elev.riserTop'],
      ['Lower flex joint top', 'elev.lfjTop'], ['LMRP top', 'elev.lmrpTop'], ['BOP top', 'elev.bopTop'], ['THS top', 'elev.thsTop'], ['HPWHH top', 'elev.hpwhhTop'],
      ['LPWHH top', 'elev.lpwhhTop'], ['Landing sub top', 'elev.landingSubTop'], ['Conductor top', 'elev.conductorTop']].map(([l, k]) => `<tr><td>${l}</td><td>${v(k)}</td></tr>`).join('')}</table>
      <h3>Casing programme</h3><table class="lt"><tr><th>String</th><th>Shoe</th><th>Cement</th></tr>
      <tr><td>36 in conductor</td><td>${v('casing.c36.shoe')}</td><td>${v('casing.c36.tocLead', 'mudline')} → ${v('casing.c36.shoe')}</td></tr>
      <tr><td>26 in secondary</td><td>${v('casing.c26.shoe')}</td><td>${v('casing.c26.tocLead', 'mudline')} → ${v('casing.c26.shoe')}</td></tr>
      <tr><td>20 × 18-5/8 in</td><td>${v('casing.c20.shoe')}</td><td>${v('casing.c20.tocTail')}</td></tr>
      <tr><td>13-5/8 in</td><td>${v('casing.c13.shoe')}</td><td>${v('casing.c13.tocTail')}</td></tr></table>`,
    controls: () => '',
    story: [
      { dur: 4, patch: {}, cam: { pos: [160, Y0 + 70, 220], target: [0, Y0 + 10, 0] } },
      { dur: 4, patch: {}, cam: { pos: [150, 70, 230], target: [0, 60, 0] } },
      { dur: 4, patch: {}, cam: { pos: [20, 13, 34], target: [0, 8, 0] } },
      { dur: 4, patch: {}, cam: { pos: [14, -14, 44], target: [0, -24, 0] } },
    ],
  },
  {
    id: 'load', n: '03', title: 'Well load', scale: 'WELLHEAD',
    cam: { pos: [20, 10, 32], target: [0, 4, 0] },
    lead: tpl('Every string hung off or landed on the conductor adds axial load that is reacted through cement and soil. By the last step the top of the 36 in conductor carries {{axial.load.max}} (negative = compression).'),
    inspector: s => {
      const L = A.arr<number>(`axial.load.step${s.loadStep}`), names = ['36 in conductor', '26 in secondary', '20 in surface', '13-5/8 in production'];
      return `<h3>Step ${s.loadStep}: ${A.arr<string>('axial.steps')[s.loadStep - 1]}</h3><div class="loadbars">${L.map((x, i) =>
        `<div class="lb"><span>${names[i]}</span><div class="track"><i style="width:${Math.abs(x) / Math.abs(A.num('axial.load.max')) * 100}%;background:${x < 0 ? '#e0873a' : '#5fb3a8'}"></i></div><span>${v(`axial.load.step${s.loadStep}`, (x > 0 ? '+' : '') + x + ' t')}</span></div>`).join('')}</div>
        <p class="note">Orange = compression, teal = tension.</p>
        <h3>Axial capacity (unity values, &lt;1.0 acceptable)</h3><dl class="kv"><dt>Design, SF 1.5 (UB / LB)</dt><dd>${v('axial.unity.designUB')} / ${v('axial.unity.designLB')}</dd>
        <dt>Operating, SF 2.0 (UB / LB)</dt><dd>${v('axial.unity.operatingUB')} / ${v('axial.unity.operatingLB')}</dd>
        <dt>Cement bond 36→36 / 36→26 / 26→26</dt><dd>${v('axial.unity.bond36to36')} / ${v('axial.unity.bond36to26')} / ${v('axial.unity.bond26to26')}</dd></dl>
        <h3>Length findings</h3><dl class="kv"><dt>36 in with 26 in installed</dt><dd>${v('length.c36.note', 'No minimum')}</dd><dt>26 in minimum setting depth</dt><dd>${v('length.c26.minSettingDepth')}</dd>
        <dt>26 in minimum TOC</dt><dd>${v('length.c26.minToc')}</dd><dt>36 in if 26 in omitted</dt><dd>${v('length.c36.minWithout26')}</dd></dl>`;
    },
    controls: s => seg('loadStep', [1, 2, 3, 4, 5].map(i => [i, `Step ${i}`]), s.loadStep),
    story: [1, 2, 3, 4, 5].map(i => ({ dur: 2.6, patch: { loadStep: i } })),
  },
  {
    id: 'axial', n: '04', title: 'Axial movement', scale: 'WELLHEAD',
    cam: { pos: [7, 4.5, 13], target: [0, 1.5, 0] },
    lead: tpl('The same loads push the conductor down into the soil. The reported movement at the conductor head is {{axial.disp.max}}. It is drawn {{viz.axialAmplification}} larger so it can be seen; the white ring marks the original position.'),
    inspector: s => {
      const D = A.arr<number>(`axial.disp.step${s.loadStep}`), amp = A.num('viz.axialAmplification');
      return `<div class="big"><small>Actual value (step ${s.loadStep})</small><b>${v(`axial.disp.step${s.loadStep}`, D[0] + ' mm')}</b><small>Visual scale factor</small><b>${v('viz.axialAmplification')}</b><small>Shown in scene as</small><b>${(D[0] * amp / 1000).toFixed(2)} m ${chip('ILLUSTRATIVE')}</b></div>
        <table class="lt"><tr><th>String</th><th>Cumulative movement</th></tr>${['36 in conductor', '26 in secondary', '20 in surface', '13-5/8 in production'].map((n, i) =>
          `<tr><td>${n}</td><td>${v(`axial.disp.step${s.loadStep}`, (D[i] > 0 ? '+' : '') + D[i] + ' mm')}</td></tr>`).join('')}</table>`;
    },
    controls: s => seg('loadStep', [1, 2, 3, 4, 5].map(i => [i, `Step ${i}`]), s.loadStep),
    story: [1, 2, 3, 4, 5].map(i => ({ dur: 2.4, patch: { loadStep: i } })),
  },
  {
    id: 'offset', n: '05', title: 'Offset limit', scale: 'GLOBAL',
    cam: { pos: [190, 230, 300], target: [0, 70, 0] },
    lead: tpl('Wind, waves and current push the moored rig off the well. The riser bends, the stack leans and the conductor bends hardest {{bm.peakLocationNarrative|≈10 m below the mudline}}. Flex-joint angles cap normal drilling; 36 in conductor strength caps the connected, non-drilling mode.'),
    inspector: s => {
      const st = opState(s.offset, s.current, s.hs);
      const lim = A.get(`offset.limiting.${s.current}`);
      const box = st === 'DRILLING' ? ['ok', 'GREEN — normal drilling'] : st === 'NON_DRILLING' ? ['mid', 'YELLOW — connected, non-drilling'] : ['bad', 'RED — disconnect at LMRP'];
      return `<div class="status ${box[0]}"><b>${box[1]}</b><span>Offset ${s.offset > 0 ? '+' : ''}${s.offset} m · Hs ${v(s.hs === '1yr' ? 'env.hs.1yr' : 'env.hs.100yr')} · ${s.current === 'current1yr' ? v('env.current.1yrSurface') + ' surface current' : 'no current'}</span></div>
        <h3>Limiting components</h3><p class="p">${v(`offset.limiting.${s.current}`, String(lim.value))}</p>
        <h3>Operating envelope</h3>${envelopeChart(s.offset, s.current, s.hs)}
        <h3>36 in conductor bending</h3><dl class="kv"><dt>Peak at this offset (1-yr storm curve)</dt><dd>${v('bm.peaks', Math.round(bmPeak(s.offset)).toLocaleString('en-US') + ' kNm')}</dd></dl>${bmChart(s.offset)}
        <h3>Reported limits</h3><table class="lt"><tr><th>Case</th><th>Drilling</th><th>Non-drilling</th></tr>${(['noCurrent', 'current1yr'] as const).flatMap(c => (['1yr', '100yr'] as const).map(h =>
          `<tr class="${c === s.current && h === s.hs ? 'on' : ''}"><td>${c === 'noCurrent' ? 'No current' : '1-yr current'}, Hs ${h}</td><td>${v(`offset.${c}.${h}.drilling`)}</td><td>${v(`offset.${c}.${h}.nonDrilling`)}</td></tr>`)).join('')}</table>`;
    },
    controls: s => `<label class="rng">Rig offset <b>${s.offset > 0 ? '+' : ''}${s.offset} m</b><input type="range" data-set="offset" min="-60" max="60" step="1" value="${s.offset}"></label>
      ${seg('current', [['noCurrent', 'No current'], ['current1yr', '1-yr current']], s.current)}${seg('hs', [['1yr', 'Hs 1-yr'], ['100yr', 'Hs 100-yr']], s.hs)}`,
    story: [
      { dur: 1.5, patch: { offset: 0, current: 'noCurrent', hs: '1yr' } },
      ...[10, 20, 28, 33, 40, 20, 0, -20, -33, -40, 0].map(o => ({ dur: 1.3, patch: { offset: o } })),
      { dur: 2, patch: { current: 'current1yr' } }, ...[17, 30, 34, 0].map(o => ({ dur: 1.4, patch: { offset: o } })),
    ],
  },
  {
    id: 'wave', n: '06', title: 'Wave fatigue', scale: 'SUBSEA',
    cam: { pos: [17, 9, 27], target: [0, 3.5, 0] },
    lead: tpl('Every wave moves the rig; the riser passes that cycling into the stack. Stress concentrates where the stiff stack meets the soil and cement restraint at the mudline, so the {{fatigue.governing.wave|LPWHH weld}} accumulates the most wave damage. Directional wave scatter is applied ({{env.waveScatterMethod|fully directional}}).'),
    inspector: s => `<h3>Wave-fatigue factored lifetimes</h3>${lifeTable(s, id => `${K(id)}.wave`)}
      <h3>Why here?</h3><p class="p">${FATIGUE_COMPONENTS.find(c => c.id === (s.selected ?? 'lpwhh'))?.why ?? ''}</p><p class="note">Cyclic motion in the scene is ILLUSTRATIVE and not scaled to wave height. No stress contour is published, so only reported hotspot locations are marked.</p>`,
    controls: () => '', story: [{ dur: 12, patch: { selected: 'lpwhh' } }],
  },
  {
    id: 'viv', n: '07', title: 'Vortex-induced vibration', scale: 'GLOBAL',
    cam: { pos: [40, 62, 250], target: [0, 58, 0] },
    lead: tpl('Current flowing past the riser sheds vortices. When shedding locks on to a riser natural frequency, the riser vibrates in a mode shape. The analysis (at {{env.waterDepthViv}}) reports mode frequencies and lock-on speeds; VIV governs the {{fatigue.governing.viv|THS connector}}.'),
    inspector: s => {
      const f = A.arr<number>('viv.mode.frequency'), per = A.arr<number>('viv.mode.period'), sp = A.arr<number>('viv.mode.lockOnSpeed'), ex = A.arr<string>('viv.mode.exceedance');
      return `<h3>Riser natural modes</h3><table class="lt"><tr><th>Mode</th><th>f</th><th>T</th><th>Lock-on speed</th><th>Exceedance</th></tr>${f.map((x, i) =>
        `<tr class="${i + 1 === s.vivMode ? 'on' : ''}"><td>${i + 1}</td><td>${v('viv.mode.frequency', x + ' Hz')}</td><td>${v('viv.mode.period', per[i] + ' s')}</td><td>${sp[i] !== undefined ? v('viv.mode.lockOnSpeed', sp[i] + ' m/s') : '<span class="dim">not excited</span>'}</td><td>${ex[i] ? v('viv.mode.exceedance', ex[i]) : ''}</td></tr>`).join('')}</table>
        <p class="note">Mode shape and amplitude in the scene are ILLUSTRATIVE (${v('viz.vivAmplitude')}); animation runs ${v('viz.vivTimeScale')} faster than the reported frequency.</p>
        <h3>VIV-fatigue factored lifetimes</h3>${lifeTable(s, id => `${K(id)}.viv`)}`;
    },
    controls: s => seg('vivMode', [[1, 'Mode 1'], [2, 'Mode 2'], [3, 'Mode 3']], s.vivMode),
    story: [1, 2, 3].map(m => ({ dur: 4.5, patch: { vivMode: m } })),
  },
  {
    id: 'combined', n: '08', title: 'Combined fatigue', scale: 'SUBSEA',
    cam: { pos: [17, 9, 27], target: [0, 3.5, 0] },
    lead: tpl('Wave and VIV damage add up. The governing result is {{fatigue.governing.combined}} against its own {{target.THS_CONNECTOR}} target; the LPWHH weld follows at {{fatigue.lpwhh.combined}} against {{target.GENERAL}}. All components meet their targets.'),
    inspector: s => `${seg('fatigueMode', [['viv', 'VIV'], ['wave', 'Wave'], ['combined', 'Combined']], s.fatigueMode)}
      <h3>How damage combines</h3>${damageBars()}
      <h3>${s.fatigueMode === 'combined' ? 'Combined' : s.fatigueMode === 'viv' ? 'VIV' : 'Wave'} factored lifetimes</h3>${lifeTable(s, id => `${K(id)}.${s.fatigueMode}`)}`,
    controls: s => seg('fatigueMode', [['viv', 'VIV'], ['wave', 'Wave'], ['combined', 'Combined']], s.fatigueMode),
    story: [{ dur: 3.5, patch: { fatigueMode: 'viv' } }, { dur: 3.5, patch: { fatigueMode: 'wave' } }, { dur: 5, patch: { fatigueMode: 'combined', selected: 'ths' } }],
  },
  {
    id: 'cement', n: '09', title: 'Cement shortfall', scale: 'CUTAWAY',
    cam: { pos: [13, -8, 36], target: [0, -14, 0] },
    lead: tpl('Where the 36 in cement stops sets where the conductor is effectively fixed. Moving that fixity changes where wave-fatigue stress concentrates — the result is a change in location, not a rule that less cement is better.'),
    inspector: s => {
      const expl = A.arr<string>('sens.cement.explanation')[[0, 20, 58].indexOf(s.cementCase)];
      return `<div class="status mid"><b>Top of 36 in cement: ${s.cementCase === 0 ? 'mudline (base case)' : s.cementCase + ' m below mudline'}</b><span>Limiting: ${v(`sens.cement.${s.cementCase}.limiting`)}</span></div>
        <p class="p">${expl}</p><h3>Wave-fatigue factored lifetimes</h3>${lifeTable(s, id => `sens.cement.${s.cementCase}.${id}`)}
        <p class="note">${v('sens.cement.caveat', 'Scope and caveat')}: wave fatigue only; base-case plan remains recommended.</p>`;
    },
    controls: s => seg('cementCase', A.arr<number>('sens.cement.cases').map(c => [c, c === 0 ? 'Base (mudline)' : `${c} m shortfall`]), s.cementCase),
    story: A.arr<number>('sens.cement.cases').map(c => ({ dur: 4.5, patch: { cementCase: c } })),
  },
  {
    id: 'heading', n: '10', title: 'MODU heading', scale: 'GLOBAL',
    cam: { pos: [0, Y0 + 340, 70], target: [0, Y0, 0] },
    lead: tpl('The wave direction is fixed; the moored rig can be set at different headings to it. Heading changes how strongly the hull responds (RAO), and so how much cyclic bending reaches the well. {{sens.heading.definition|Angle is measured to the prevailing wave direction.}}'),
    inspector: s => {
      const expl = A.arr<string>('sens.heading.explanation');
      return `<h3>Wave-fatigue factored lifetimes at ${s.heading}°</h3>${lifeTable(s, id => `sens.heading.${s.heading}.${id}`)}
        <h3>Combined with VIV at ${s.heading}°</h3><table class="lt">${['ths', 'lpwhh', 'lsubTop'].map(id => `<tr><td>${FATIGUE_COMPONENTS.find(c => c.id === id)!.name}</td><td>${lifeV(`fatigue.${id}.combinedHeading.${s.heading}`)}</td></tr>`).join('')}</table>
        <ul class="ls">${expl.map(e => `<li>${e}</li>`).join('')}</ul><p class="note">RAO rings are a concept graphic (ILLUSTRATIVE); no RAO magnitudes are published as numbers. ${v('sens.heading.caveat', 'Rig-specific result')}.</p>`;
    },
    controls: s => seg('heading', A.arr<number>('sens.heading.cases').map(h => [h, `${h}°`]), s.heading),
    story: A.arr<number>('sens.heading.cases').map(h => ({ dur: 4.5, patch: { heading: h } })),
  },
  {
    id: 'summary', n: '11', title: 'Engineering summary', scale: 'GLOBAL',
    cam: { pos: [330, 190, 420], target: [0, 55, 0] },
    lead: tpl('The moored-MODU well meets every reported requirement. The weakest fatigue point is {{fatigue.governing.combined}}; the operating envelope is capped by flex joints (drilling) and 36 in conductor strength (connected non-drilling).'),
    inspector: () => `<h3>Key results</h3><dl class="kv">
      <dt>Governing combined fatigue</dt><dd>${v('fatigue.governing.combined')}</dd><dt>Second</dt><dd>${lifeV('fatigue.lpwhh.combined')} LPWHH weld</dd>
      <dt>Offset, no current, 1-yr Hs</dt><dd>${v('offset.noCurrent.1yr.drilling')} / ${v('offset.noCurrent.1yr.nonDrilling')}</dd>
      <dt>Offset, 1-yr current, 1-yr Hs</dt><dd>${v('offset.current1yr.1yr.drilling')} / ${v('offset.current1yr.1yr.nonDrilling')}</dd>
      <dt>Peak conductor load</dt><dd>${v('axial.load.max')}</dd><dt>Axial movement</dt><dd>${v('axial.disp.max')}</dd>
      <dt>20 m cement shortfall</dt><dd>${v('sens.cement.20.limiting')}</dd><dt>45° heading</dt><dd>${v('sens.heading.explanation', '≈10× longer wave-fatigue life')}</dd></dl>
      <h3>Scope items without an identified result</h3><ul class="ls warn">${A.arr<string>('gap.list').map(g => `<li>${g}</li>`).join('')}</ul>
      <h3>Data governance</h3><p class="p">${A.all().length} values resolved · ${A.conflicts().length} registered conflicts · ${A.proposals().length} superseded proposals (audit only).</p>
      <ul class="ls">${A.conflicts().map(c => `<li><b>${c.id}</b> ${c.title} — ${c.selectedValue} (${c.selectedSource})</li>`).join('')}</ul>`,
    controls: () => '', story: [{ dur: 12, patch: {} }],
  },
];
export const chapterById = (id: ChapterId) => CHAPTERS.find(c => c.id === id)!;
