import * as THREE from 'three';
import gsap from 'gsap';
import './style.css';
import { approvedEngineeringData as A } from './data/resolver';
import { FATIGUE_COMPONENTS } from './data/fatigue';
import { AppState, ChapterId, store } from './core/state';
import { MSL_Y, Y } from './core/scales';
import {
  animateCurrent, animateWater, BG, camera, controls, currentArrow, currentArrowLabel, currentParticles, FOG, labelRenderer,
  renderer, resize, ruler, scene, subseaLight, waveArrow,
} from './scene/world';
import { raoRings, rig, updateMooring } from './scene/rig';
import {
  applyDeform, cementState, clickable, colorConductor, fixity, ghost, hotspots, loadArrow, loadLabel, rebuildCasings, setLoadArrow, tocLabel,
} from './scene/well';
import { diskDrilling, envelope, rigMarker, ringDrilling, ringLabelD, ringLabelN, ringNonDrilling, updateRiser } from './scene/riser';
import { CHAPTERS, chapterById, lifeKey, Scale, targetYears } from './chapters/chapters';
import { bmCapacity, bmPeak, bmShape, offsetLimits, opState } from './ui/charts';
import { componentCard } from './ui/inspector';
import { conductorLean, rigHeave, rigSway, DeformState, deformationMeta } from './animation/deform';
import { STATUS_LABEL } from './data/sources';

const $ = <T extends HTMLElement = HTMLElement>(s: string) => document.querySelector(s) as T;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------------------------------------------------------------- UI shell
const nav = $('#chapters');
nav.innerHTML = CHAPTERS.map(c => `<button class="ch" data-ch="${c.id}"><span>${c.n}</span><b>${c.title}</b><i>${c.scale}</i></button>`).join('');
nav.addEventListener('click', e => { const b = (e.target as HTMLElement).closest('.ch') as HTMLElement | null; if (b) goChapter(b.dataset.ch as ChapterId, true); });
$('#modeStory').onclick = () => { store.set({ mode: 'story' }); };
$('#modeExplore').onclick = () => { store.set({ mode: 'explore', playing: false }); };
$('#play').onclick = () => { if (store.s.mode !== 'story') store.set({ mode: 'story' }); store.set({ playing: !store.s.playing }); };
$('#prev').onclick = () => step(-1);
$('#next').onclick = () => step(1);
function step(d: number) { const i = CHAPTERS.findIndex(c => c.id === store.s.chapter); const n = CHAPTERS[Math.max(0, Math.min(CHAPTERS.length - 1, i + d))]; goChapter(n.id, true); }

const NUMERIC: (keyof AppState)[] = ['offset', 'cementCase', 'heading', 'loadStep', 'vivMode'];
document.addEventListener('click', e => {
  const b = (e.target as HTMLElement).closest('[data-set]') as HTMLElement | null;
  if (b && b.tagName === 'BUTTON') { const k = b.dataset.set as keyof AppState; store.set({ [k]: NUMERIC.includes(k) ? +b.dataset.val! : b.dataset.val, playing: false } as Partial<AppState>); }
  const tr = (e.target as HTMLElement).closest('[data-comp]') as HTMLElement | null;
  if (tr && !(e.target as HTMLElement).closest('.v')) selectComponent('fat:' + tr.dataset.comp);
});
document.addEventListener('input', e => {
  const r = e.target as HTMLInputElement;
  if (r.dataset.set) store.set({ [r.dataset.set]: +r.value, playing: false } as Partial<AppState>);
});

// ---------------------------------------------------------------- camera
const SCALE_NOTE: Record<Scale, string> = {
  GLOBAL: `GLOBAL scale — water column compressed ${A.num('viz.waterColumnScale')}×, rig true size`,
  SUBSEA: `SUBSEA scale — true height, diameters ×${A.num('viz.radialScale')}`,
  WELLHEAD: `WELLHEAD detail — true height, diameters ×${A.num('viz.radialScale')}`,
  CUTAWAY: `CUTAWAY — DEPTH VISUALLY COMPRESSED below ${A.num('viz.depthCompressFrom')} m`,
};
let camTween: gsap.core.Tween | null = null;
function fly(pos: number[], target: number[], dur = 1.6) {
  camTween?.kill();
  const p0 = camera.position.clone(), t0 = controls.target.clone(), p1 = new THREE.Vector3(...pos), t1 = new THREE.Vector3(...target);
  const o = { k: 0 };
  camTween = gsap.to(o, { k: 1, duration: reduce ? 0.01 : dur, ease: 'power2.inOut', onUpdate: () => {
    camera.position.lerpVectors(p0, p1, o.k); controls.target.lerpVectors(t0, t1, o.k);
  } });
}

// ---------------------------------------------------------------- chapters & story
let storyStep = 0, storyT = 0;
function goChapter(id: ChapterId, flyCam: boolean) {
  const ch = chapterById(id);
  storyStep = 0; storyT = 0;
  store.set({ chapter: id, selected: null, ...(store.s.mode === 'story' ? ch.story[0].patch : {}) });
  if (flyCam) { const c = ch.story[0].cam ?? ch.cam; fly(c.pos, c.target); }
}
function tickStory(dt: number) {
  const s = store.s; if (s.mode !== 'story' || !s.playing) return;
  const ch = chapterById(s.chapter); storyT += dt;
  const st = ch.story[storyStep];
  if (storyT >= st.dur) {
    storyT = 0; storyStep++;
    if (storyStep >= ch.story.length) {
      const i = CHAPTERS.findIndex(c => c.id === s.chapter);
      if (i < CHAPTERS.length - 1) goChapter(CHAPTERS[i + 1].id, true); else store.set({ playing: false });
      return;
    }
    const n = ch.story[storyStep]; store.set(n.patch); if (n.cam) fly(n.cam.pos, n.cam.target, 1.8);
  }
  const total = ch.story.reduce((a, b) => a + b.dur, 0), done = ch.story.slice(0, storyStep).reduce((a, b) => a + b.dur, 0) + storyT;
  $('#progress i').style.width = `${Math.min(100, done / total * 100)}%`;
}

// ---------------------------------------------------------------- panels
function renderPanels() {
  const s = store.s, ch = chapterById(s.chapter);
  document.querySelectorAll<HTMLElement>('.ch').forEach(b => b.setAttribute('aria-current', String(b.dataset.ch === s.chapter)));
  $('#modeStory').setAttribute('aria-pressed', String(s.mode === 'story')); $('#modeExplore').setAttribute('aria-pressed', String(s.mode === 'explore'));
  $('#play').innerHTML = s.playing ? '❚❚ Pause' : '▶ Play story';
  $('#chTitle').innerHTML = `<span>${ch.n}</span>${ch.title}`;
  $('#lead').innerHTML = ch.lead;
  $('#scaleBadge').textContent = SCALE_NOTE[ch.scale];
  $('#scaleBadge').classList.toggle('warn', ch.scale === 'CUTAWAY' || ch.scale === 'GLOBAL');
  $('#comp').innerHTML = s.selected ? componentCard(s.selected, s) + '<button class="clear" id="clearSel">Close component</button>' : '';
  const cs = document.getElementById('clearSel'); if (cs) cs.onclick = () => store.set({ selected: null });
  $('#insp').innerHTML = ch.inspector(s);
  $('#scenario').innerHTML = ch.controls(s) || '<span class="dim">No scenario controls in this chapter</span>';
}

// ---------------------------------------------------------------- selection (raycast)
const ray = new THREE.Raycaster(), mouse = new THREE.Vector2();
renderer.domElement.addEventListener('pointerdown', e => { (renderer.domElement as any)._down = [e.clientX, e.clientY]; });
renderer.domElement.addEventListener('pointerup', e => {
  const d = (renderer.domElement as any)._down; if (!d || Math.hypot(e.clientX - d[0], e.clientY - d[1]) > 5) return;
  mouse.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(mouse, camera);
  const hits = ray.intersectObjects([...clickable, ...scene.children.filter(o => o.userData.componentId === 'riser')], true).filter(h => h.object.visible);
  const id = hits.find(h => h.object.userData.componentId)?.object.userData.componentId as string | undefined;
  if (id) selectComponent(id);
});
function selectComponent(id: string) {
  store.set({ selected: store.s.selected === id ? null : id });
  if (id.startsWith('fat:') && store.s.selected) {
    const e = A.num(FATIGUE_COMPONENTS.find(c => c.id === id.slice(4))!.elevationKey);
    fly([7, Y(e) + 2.5, 11], [0, Y(e), 0], 1.2);
  }
}

// ---------------------------------------------------------------- scene state
const TARGET_CLASS = Object.fromEntries(FATIGUE_COMPONENTS.map(c => [c.id, c.targetClass]));
const lifeColor = (ratio: number | null) => new THREE.Color(ratio === null ? '#4fa37a' : ratio < 2 ? '#e0573f' : ratio < 5 ? '#e39a3b' : ratio < 15 ? '#e6c052' : '#8fc46a');
const utilColor = (x: number) => {
  const st: [number, string][] = [[0, '#2e8c86'], [0.5, '#7fc257'], [0.8, '#f0c63c'], [1, '#f08a2b'], [1.2, '#e04434']];
  for (let i = 1; i < st.length; i++) if (x <= st[i][0]) return new THREE.Color(st[i - 1][1]).lerp(new THREE.Color(st[i][1]), (x - st[i - 1][0]) / (st[i][0] - st[i - 1][0]));
  return new THREE.Color(st[st.length - 1][1]);
};
let axialDrop = 0;
function applyState(s: AppState, changed: (keyof AppState)[]) {
  const ch = s.chapter;
  const fatigueCh = ['wave', 'viv', 'combined', 'cement', 'heading'].includes(ch);
  // rig
  rig.position.x = ch === 'offset' ? s.offset : 0;
  gsap.to(rig.rotation, { y: ch === 'heading' ? -s.heading * Math.PI / 180 : 0, duration: reduce ? 0 : 1.2, ease: 'power2.inOut' });
  raoRings.visible = ch === 'heading'; waveArrow.visible = ch === 'heading' || ch === 'wave';
  const cur = ch === 'offset' && s.current === 'current1yr';
  currentArrow.visible = cur || ch === 'viv'; currentParticles.visible = cur || ch === 'viv';
  currentArrowLabel.element.innerHTML = ch === 'viv' ? 'Current → vortex shedding on riser' : `1-yr current, surface ${A.num('env.current.1yrSurface')} m/s`;
  // envelope
  envelope.visible = rigMarker.visible = ch === 'offset';
  const L = offsetLimits(s.current, s.hs);
  ringNonDrilling.scale.setScalar(L.nonDrilling); ringLabelN.element.textContent = `Connected non-drilling ±${L.nonDrilling} m`; ringLabelN.position.set(0, -1, 0);
  ringDrilling.visible = diskDrilling.visible = L.drilling !== null;
  if (L.drilling !== null) { ringDrilling.scale.setScalar(L.drilling); diskDrilling.scale.setScalar(L.drilling); ringLabelD.element.textContent = `Drilling ±${L.drilling} m`; ringLabelD.position.set(1, 0, 0); }
  rigMarker.position.x = rig.position.x;
  const os = opState(s.offset, s.current, s.hs);
  (rigMarker.material as THREE.MeshBasicMaterial).color.set(os === 'DRILLING' ? '#4fa37a' : os === 'NON_DRILLING' ? '#e6b04a' : '#d8574a');
  // axial
  const loadCh = ch === 'load' || ch === 'axial';
  const D = A.arr<number>(`axial.disp.step${s.loadStep}`)[0];
  axialDrop = loadCh ? D / 1000 * A.num('viz.axialAmplification') : 0;
  // cement
  if (changed.includes('cementCase') || changed.includes('chapter') || changed.includes('loadStep')) {
    cementState.toc36 = ch === 'cement' ? s.cementCase : 0; cementState.sleeve = ch === 'cement';
    rebuildCasings(axialDrop);
  }
  fixity.visible = ch === 'cement' && s.cementCase < A.num('casing.c36.shoe') * -1;
  fixity.position.y = ch === 'cement' ? Y(-s.cementCase) : 0;
  tocLabel.visible = ch === 'cement';
  tocLabel.element.innerHTML = `Top of 36 in cement: <b>${s.cementCase === 0 ? 'mudline' : '−' + s.cementCase + ' m'}</b>`;
  tocLabel.position.set(-1.3, Y(-s.cementCase), 0);
  // load arrow / ghost ring
  const load = A.arr<number>(`axial.load.step${s.loadStep}`)[0];
  loadLabel.element.innerHTML = `Top-of-conductor load <b>${load} t</b>`;
  setLoadArrow(Math.max(0.4, Math.abs(load) / Math.abs(A.num('axial.load.max')) * 8), A.num('elev.conductorTop') + axialDrop);
  loadArrow.visible = loadCh && s.loadStep > 1;
  ghost.visible = ch === 'axial'; ghost.position.y = A.num('elev.conductorTop');
  // conductor colour
  colorConductor(e => {
    if (ch === 'offset') return utilColor(bmPeak(s.offset) * bmShape(e) / bmCapacity(e));
    if (loadCh) return new THREE.Color('#77838b').lerp(new THREE.Color('#e0873a'), Math.abs(load) / Math.abs(A.num('axial.load.max')) * Math.max(0, Math.min(1, (e + 58) / 60)));
    return new THREE.Color('#77838b');
  });
  // hotspots
  hotspots.forEach(h => {
    const k = lifeKey(h.id, s);
    const show = fatigueCh && !!k;
    h.mesh.visible = h.ring.visible = show;
    if (!k || !show) return;
    const l = A.life(k), ty = targetYears(TARGET_CLASS[h.id]);
    const ratio = l.gt ? null : l.years / ty; const col = lifeColor(ratio);
    (h.mesh.material as THREE.MeshStandardMaterial).color.copy(col); (h.mesh.material as THREE.MeshStandardMaterial).emissive.copy(col).multiplyScalar(ratio !== null && ratio < 2 ? 0.8 : 0.25);
    (h.ring.material as THREE.MeshBasicMaterial).color.copy(col);
    h.ring.visible = show && (ratio !== null || s.selected === 'fat:' + h.id);
    h.mesh.visible = show && (ratio !== null || s.selected === 'fat:' + h.id || h.id === 'c10Weld' && ch === 'cement' && s.cementCase === 20);
    const conflict = A.get(k).status === 'REPORTED_WITH_SOURCE_CONFLICT' ? ' <i class="cf">!</i>' : '';
    h.lbl.element.innerHTML = `${h.name}: <b>${l.gt ? '&gt;' : ''}${l.years} y</b> <span>(${ratio === null ? '&gt;10 y' : ratio.toFixed(1) + '× target'})</span>${conflict}`;
    h.mesh.scale.setScalar(s.selected === 'fat:' + h.id ? 1.6 : 1);
  });
  renderPanels();
}

store.on(applyState);

// ---------------------------------------------------------------- loop
const clock = new THREE.Clock();
let fogOn = false;
function frame() {
  const dt = Math.min(0.05, clock.getDelta()), t = clock.elapsedTime, s = store.s;
  tickStory(dt);
  const ds: DeformState = {
    offset: s.chapter === 'offset' ? s.offset : 0, current: s.chapter === 'offset' && s.current === 'current1yr',
    vivMode: s.vivMode, vivOn: s.chapter === 'viv' && !reduce, waveOn: (s.chapter === 'wave' || s.chapter === 'combined') && !reduce, t,
  };
  applyDeform(ds, axialDrop);
  rig.position.y = rigHeave(ds);
  if (s.chapter !== 'offset') rig.position.x = rigSway(ds);
  updateMooring();
  updateRiser(applyBase(ds), rig.position.x, ds, axialDrop);
  animateWater(t, reduce ? 0 : 0.6);
  if (currentParticles.visible) animateCurrent(dt, s.chapter === 'viv' ? 0.5 : 1);
  controls.update();
  const under = camera.position.y < MSL_Y;
  scene.background = camera.position.y < 0 ? BG.soil : under ? BG.deep : BG.sky;
  const wantFog = under && camera.position.y > 0 && camera.position.distanceTo(controls.target) > 60;
  if (wantFog !== fogOn) { fogOn = wantFog; scene.fog = wantFog ? FOG : null; scene.traverse(o => { const m = (o as THREE.Mesh).material; if (m) (Array.isArray(m) ? m : [m]).forEach(x => x.needsUpdate = true); }); }
  subseaLight.position.set(controls.target.x + 8, controls.target.y + 8, controls.target.z + 14);
  const far = camera.position.distanceTo(controls.target) > 140;
  (document.getElementById('labels') as HTMLElement).dataset.zoom = far ? 'far' : 'near';
  ruler.visible = far;
  hotspots.forEach(h => { if (h.mesh.visible && !reduce) { const r = h.lbl.element.textContent?.includes('× target') && /\(([\d.]+)×/.exec(h.lbl.element.textContent!); if (r && +r[1] < 2) h.ring.scale.setScalar(1 + 0.15 * Math.sin(t * 5)); } });
  renderer.render(scene, camera); labelRenderer.render(scene, camera); hideOrphanLabels();
  requestAnimationFrame(frame);
}
const LFJ_E = A.num('elev.lfjTop');
/** CSS2DRenderer only checks an object's own visibility; hide labels whose ancestors are hidden. */
function hideOrphanLabels() {
  const walk = (o: THREE.Object3D, parentVisible: boolean) => {
    const vis = parentVisible && o.visible;
    if ((o as any).isCSS2DObject && !vis) (o as any).element.style.display = 'none';
    o.children.forEach(c => walk(c, vis));
  };
  walk(scene, true);
}
function applyBase(ds: DeformState) { return conductorLean(LFJ_E, ds); }

// ---------------------------------------------------------------- boot
resize();
const c0 = chapterById('overview').cam; camera.position.set(...c0.pos); controls.target.set(...c0.target);
rebuildCasings(0);
applyState(store.s, ['chapter', 'cementCase']);
const q = new URLSearchParams(location.search);
if (q.get('ch')) {
  const id = q.get('ch') as ChapterId; const ch = chapterById(id);
  store.set({ mode: 'explore', chapter: id, ...Object.fromEntries([...q.entries()].filter(([k]) => NUMERIC.includes(k as keyof AppState)).map(([k, v]) => [k, +v])),
    ...(q.get('current') ? { current: q.get('current') as AppState['current'] } : {}), ...(q.get('sel') ? { selected: q.get('sel') } : {}) });
  camera.position.set(...ch.cam.pos); controls.target.set(...ch.cam.target);
}
frame();

// expose governance metadata for audit in devtools
(window as any).__naval = { approved: A, deformationMeta, statusLabels: STATUS_LABEL };
