import * as THREE from 'three';
import { approvedEngineeringData as A } from '../data/resolver';
import { FATIGUE_COMPONENTS } from '../data/fatigue';
import { R, Y } from '../core/scales';
import { CLIP, label, mat, scene } from './world';
import { conductorLean, DeformState } from '../animation/deform';

const UP = new THREE.Vector3(0, 1, 0);
const E = {
  cond: A.num('elev.conductorTop'), lsub: A.num('elev.landingSubTop'), lpw: A.num('elev.lpwhhTop'), hpw: A.num('elev.hpwhhTop'),
  ths: A.num('elev.thsTop'), bop: A.num('elev.bopTop'), lmrp: A.num('elev.lmrpTop'), lfj: A.num('elev.lfjTop'),
};
export const ELEV = E;
let DS: DeformState = { offset: 0, current: false, vivMode: 1, vivOn: false, waveOn: false, t: 0 };
const u = (e: number) => conductorLean(e, DS);

export const clickable: THREE.Object3D[] = [];
const tag = (o: THREE.Object3D, id: string) => { o.traverse(c => { c.userData.componentId = id; }); clickable.push(o); return o; };

// ---------------- Subsea stack (true height, diameters ×radial scale) ----------------
export const stack = new THREE.Group(); scene.add(stack);
const parts: Record<string, THREE.Group> = {};
function part(id: string, e0: number, e1: number, build: (g: THREE.Group, h: number) => void, text: string, side = 1) {
  const g = new THREE.Group(); g.position.y = e0; build(g, e1 - e0); stack.add(g); parts[id] = g; tag(g, id);
  const l = label(text, 'part'); l.position.set(side * 3.4, (e1 - e0) / 2, 0); g.add(l); g.userData.label = l;
  return g;
}
function frame(g: THREE.Group, w: number, h: number, m: THREE.Material) {
  const c = [[-w / 2, -w / 2], [w / 2, -w / 2], [w / 2, w / 2], [-w / 2, w / 2]];
  c.forEach(([x, z]) => { const p = new THREE.Mesh(new THREE.BoxGeometry(0.2, h, 0.2), m); p.position.set(x, h / 2, z); g.add(p); });
  [0.1, h - 0.1].forEach(y => c.forEach(([x, z], i) => {
    const [x2, z2] = c[(i + 1) % 4]; const a = new THREE.Vector3(x, y, z), b = new THREE.Vector3(x2, y, z2);
    const d = b.clone().sub(a); const bm = new THREE.Mesh(new THREE.BoxGeometry(0.16, d.length(), 0.16), m);
    bm.position.copy(a).addScaledVector(d, 0.5); bm.quaternion.setFromUnitVectors(UP, d.normalize()); g.add(bm);
  }));
}
const cylM = (r0: number, r1: number, h: number, m: THREE.Material, y: number) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, h, 32), m); c.position.y = y; return c; };

const red = mat('#a63a33', { metalness: 0.4, roughness: 0.4 });
const frameM = mat('#c7cac5', { metalness: 0.5, roughness: 0.4 });
const yellow = mat('#c9a646', { metalness: 0.3 });

part('landingSub', E.cond, E.lsub, (g, h) => g.add(cylM(R(A.num('wh.landingSub.od')), R(A.num('wh.landingSub.od')), h, mat('#9aa6ae', { metalness: 0.6 }), h / 2)),
  `26 in landing sub <b>${E.cond}–${E.lsub} m</b>`, -1);
part('lpwhh', E.lsub, E.lpw, (g, h) => g.add(cylM(R(A.num('wh.lpwhh.od')), R(A.num('wh.lpwhh.od')), h, mat('#7c8a93', { metalness: 0.6 }), h / 2)),
  `LPWHH ⌀${A.num('wh.lpwhh.od')} in — top <b>${E.lpw} m</b>`, -1);
part('hpwhh', E.lpw, E.hpw, (g, h) => g.add(cylM(R(A.num('wh.hpwhh.od')), R(A.num('wh.hpwhh.od')), h, mat('#b3bec6', { metalness: 0.7 }), h / 2)),
  `HPWHH ⌀${A.num('wh.hpwhh.od')} in — top <b>${E.hpw} m</b>`, -1);
part('ths', E.hpw, E.ths, (g, h) => {
  g.add(cylM(1.15, 1.15, 0.9, mat('#3d5d63', { metalness: 0.5 }), 0.45));
  g.add(cylM(0.95, 0.85, h - 0.9, mat('#4d7880', { metalness: 0.45 }), 0.9 + (h - 0.9) / 2));
  frame(g, 4.2, h, yellow);
  [[1.5, 0], [-1.5, 0], [0, 1.5]].forEach(([x, z]) => { const b = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), mat('#4d7880')); b.position.set(x, 1.4, z); g.add(b); });
}, `THS — top <b>${E.ths} m</b>`);
part('bop', E.ths, E.bop, (g, h) => {
  g.add(cylM(1.2, 1.2, 0.9, mat('#666d73', { metalness: 0.55 }), 0.45));
  for (let i = 0; i < 4; i++) {
    const y = 1.3 + i * (h - 1.6) / 4; const b = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.85, 1.8), red); b.position.y = y; g.add(b);
    [-1, 1].forEach(s => { const bo = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.1, 18), red); bo.rotation.z = Math.PI / 2; bo.position.set(s * 1.45, y, 0); g.add(bo); });
  }
  frame(g, 5, h, frameM);
  for (let i = 0; i < 6; i++) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 2.4, 12), yellow); b.position.set(-2.1 + (i % 3) * 0.55, 1.6 + Math.floor(i / 3) * 2.6, 2.1); g.add(b); }
}, `BOP ${A.num('stack.bop.weightAir')} t — top <b>${E.bop} m</b>`);
part('lmrp', E.bop, E.lmrp, (g, h) => {
  g.add(cylM(1.5, 1.1, 2.6, red, 1.6));
  frame(g, 4.6, h, frameM);
  const p1 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2, 0.9), yellow); p1.position.set(-1.8, 3.3, 1.8); g.add(p1);
  const p2 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2, 0.9), mat('#3f6c95')); p2.position.set(1.8, 3.3, 1.8); g.add(p2);
}, `LMRP ${A.num('stack.lmrp.weightAir')} t — top <b>${E.lmrp} m</b>`);
part('lfj', E.lmrp, E.lfj, (g, h) => {
  const s = new THREE.Mesh(new THREE.SphereGeometry(0.85, 24, 16), mat('#7c8a92', { metalness: 0.6 })); s.position.y = h / 2; g.add(s);
}, `Lower flex joint — max ${A.num('fj.lfj.maxRotation')}°`);

// ---------------- Casings & cement (section cut) ----------------
class ECurve extends THREE.Curve<THREE.Vector3> {
  constructor(private a: number, private b: number, private r = 0) { super(); }
  getPoint(t: number, v = new THREE.Vector3()) { const e = this.a + (this.b - this.a) * t; return v.set(u(e) + this.r, Y(e), 0); }
}
const tubeGeo = (a: number, b: number, r: number) =>
  new THREE.TubeGeometry(new ECurve(a, b), Math.max(24, Math.ceil(Math.abs(Y(b) - Y(a)) / 0.8)), r, 28, false);

const CAS = [
  { id: 'c36', od: A.num('casing.c36.od'), top: E.cond, shoe: A.num('casing.c36.shoe'), col: '#6f7c85', name: `36 in conductor, shoe <b>${A.num('casing.c36.shoe')} m</b>` },
  { id: 'c26', od: A.num('casing.c26.od'), top: A.num('casing.c26.top'), shoe: A.num('casing.c26.shoe'), col: '#9ea9b1', name: `26 in secondary conductor, shoe <b>${A.num('casing.c26.shoe')} m</b>` },
  { id: 'c20', od: A.num('casing.c20.od'), top: A.num('casing.c20.top'), shoe: A.num('casing.c20.shoe'), col: '#b6c0c7', name: `20 × 18-5/8 in surface casing, shoe <b>${A.num('casing.c20.shoe')} m</b>` },
  { id: 'c13', od: A.num('casing.c13.od'), top: E.hpw - 0.3, shoe: A.num('casing.c13.shoe'), col: '#c9d1d7', name: `13-5/8 in production casing, shoe <b>${A.num('casing.c13.shoe')} m</b>` },
];
export const casingMesh: Record<string, THREE.Mesh> = {};
export const casingLabel: Record<string, THREE.Object3D> = {};
const c36Mat = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide, clippingPlanes: CLIP });
CAS.forEach((c, i) => {
  const m = new THREE.Mesh(tubeGeo(c.shoe, c.top, R(c.od)),
    c.id === 'c36' ? c36Mat : mat(c.col, { metalness: 0.6, roughness: 0.35, side: THREE.DoubleSide, clippingPlanes: CLIP }));
  m.frustumCulled = false; scene.add(m); casingMesh[c.id] = m; tag(m, c.id);
  const l = label(c.name, 'part left'); l.position.set(-R(c.od) - 0.4, Y(c.shoe), 0); scene.add(l); casingLabel[c.id] = l;
  void i;
});
{ const l = label(`Crossover 36 × 1.5 → 1.0 in <b>${A.num('casing.c36.crossover')} m</b>`, 'part left'); l.position.set(-1.2, Y(A.num('casing.c36.crossover')), 0); scene.add(l); casingLabel.xo = l; }
{ const l = label('Mudline 0.00 m', 'part left'); l.position.set(-6, 0.2, 0); scene.add(l); casingLabel.ml = l; }

// Cement
let cementMeshes: THREE.Mesh[] = [];
export const cementState = { toc36: 0, sleeve: false };
export function rebuildCement() {
  cementMeshes.forEach(m => { scene.remove(m); m.geometry.dispose(); }); cementMeshes = [];
  const tail36 = A.num('casing.c36.tocTail'), shoe36 = A.num('casing.c36.shoe');
  const defs: [number, number, number, string, boolean][] = [];
  const top = -cementState.toc36;
  if (top > shoe36) {
    if (top > tail36) defs.push([top, tail36, R(42), '#d8c08e', true]);
    defs.push([Math.min(top, tail36), shoe36, R(42), '#b8975e', true]);
  }
  defs.push([A.num('casing.c26.tocLead'), A.num('casing.c26.tocTail'), R(32) * 0.98, '#cfc4a8', false]);
  defs.push([A.num('casing.c26.tocTail'), A.num('casing.c26.shoe'), R(32) * 0.98, '#b3a582', false]);
  defs.push([A.num('casing.c20.tocTail'), A.num('casing.c20.shoe'), R(24) * 0.98, '#b3a582', false]);
  defs.push([A.num('casing.c13.tocTail'), A.num('casing.c13.shoe'), R(17.5) * 0.98, '#b3a582', false]);
  defs.forEach(([a, b, r, col, is36]) => {
    const sleeve = cementState.sleeve && is36;
    const m = new THREE.Mesh(tubeGeo(b, a, sleeve ? r * 1.25 : r), mat(col, {
      roughness: 0.95, metalness: 0, side: THREE.DoubleSide, clippingPlanes: sleeve ? [] : CLIP,
      transparent: true, opacity: sleeve ? 0.55 : 0.92, depthWrite: !sleeve,
    }));
    m.frustumCulled = false; scene.add(m); cementMeshes.push(m);
  });
}
export const tocLabel = label('', 'part left hot'); scene.add(tocLabel);

// ---------------- Fatigue hotspots ----------------
import type { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
export interface Hotspot { id: string; name: string; e: number; mesh: THREE.Mesh; ring: THREE.Mesh; lbl: CSS2DObject }
export const hotspots: Hotspot[] = FATIGUE_COMPONENTS.map((fc, i) => {
  const e = A.num(fc.elevationKey);
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.24, 20, 14), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x000000 }));
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.045, 8, 48), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 }));
  ring.rotation.x = Math.PI / 2;
  const lbl = label('', 'hot ' + (i % 2 ? 'left' : ''));
  mesh.add(lbl); scene.add(mesh, ring); tag(mesh, 'fat:' + fc.id);
  return { id: fc.id, name: fc.name, e, mesh, ring, lbl };
});
const ANG: Record<string, number> = { ths: 0.3, lpwhh: 0.05, lsubTop: 0.9, hanger: 3.0, scTaperF1: 3.8, c15Body: 0.3, c15Weld: 2.9, c10Weld: 1.0 };
const DY: Record<string, number> = { lpwhh: 14, lsubTop: -12, hanger: -12, scTaperF1: 12, c15Body: 10, c15Weld: -10 };

// ---------------- Markers: fixity, load arrow, ghost ring ----------------
export const fixity = new THREE.Group(); scene.add(fixity);
{ const fr = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.08, 8, 48), new THREE.MeshBasicMaterial({ color: 0xe6b04a })); fr.rotation.x = Math.PI / 2; fixity.add(fr); }
export const fixityLabel = label('Point of fixity <i>(qualitative — §5.2.2)</i>', 'hot'); fixityLabel.position.set(1.8, 0, 0); fixity.add(fixityLabel);

export const loadArrow = new THREE.Group(); scene.add(loadArrow);
const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 1, 12), new THREE.MeshStandardMaterial({ color: 0xe0873a, emissive: 0x5a2c0c }));
const head = new THREE.Mesh(new THREE.ConeGeometry(0.45, 1, 16), new THREE.MeshStandardMaterial({ color: 0xe0873a, emissive: 0x5a2c0c }));
head.rotation.x = Math.PI; loadArrow.add(shaft, head);
export const loadLabel = label('', 'hot left'); loadArrow.add(loadLabel);
export function setLoadArrow(lenM: number, topE: number) {
  const h = Math.min(1.2, lenM * 0.35);
  shaft.scale.y = Math.max(0.01, lenM - h); shaft.position.y = -(lenM - h) / 2;
  head.scale.y = h; head.position.y = -(lenM - h) - h / 2;
  loadArrow.position.set(-4.4, topE + lenM, 0); loadLabel.position.set(-0.3, -lenM / 2, 0);
}
export const ghost = new THREE.Mesh(new THREE.TorusGeometry(R(36) + 0.3, 0.05, 8, 48), new THREE.MeshBasicMaterial({ color: 0xeaf1f3 }));
ghost.rotation.x = Math.PI / 2; scene.add(ghost);
export const ghostLabel = label('Original top of conductor', 'part'); ghostLabel.position.set(R(36) + 0.5, 0, 0); ghost.add(ghostLabel);

// ---------------- Update ----------------
export function applyDeform(ds: DeformState, axialDrop: number) {
  DS = ds;
  (['landingSub', 'lpwhh', 'hpwhh', 'ths', 'bop', 'lmrp', 'lfj'] as const).forEach(id => {
    const g = parts[id]; const mid = g.position.y + 1; g.position.x = u(mid);
  });
  stack.position.y = axialDrop;
  hotspots.forEach(h => {
    const a = ANG[h.id] ?? 0, r = (h.e > 0 ? 0.95 : 0.85) + 0.25;
    h.mesh.position.set(u(h.e) + Math.cos(a) * r, Y(h.e) + (h.e > E.cond - 0.5 ? axialDrop : 0), Math.sin(a) * r || 0.4);
    h.ring.position.set(u(h.e), Y(h.e) + (h.e > E.cond - 0.5 ? axialDrop : 0), 0);
    (h.lbl.element as HTMLElement).style.marginTop = (DY[h.id] ?? 0) + 'px';
  });
}
export function rebuildCasings(axialDrop: number) {
  CAS.forEach(c => {
    const m = casingMesh[c.id]; m.geometry.dispose(); m.geometry = tubeGeo(c.shoe, c.top, R(c.od));
    if (c.id === 'c36') {
      const n = m.geometry.attributes.position.count; m.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
      m.position.y = axialDrop;
    }
  });
  rebuildCement();
}
/** Colour the 36 in conductor by a callback of real elevation. */
export function colorConductor(fn: (e: number) => THREE.Color) {
  const g = casingMesh.c36.geometry, pos = g.attributes.position, col = g.attributes.color as THREE.BufferAttribute;
  if (!col) return;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i); let lo = -3000, hi = 10;
    for (let k = 0; k < 24; k++) { const m = (lo + hi) / 2; if (Y(m) > y) hi = m; else lo = m; }
    const c = fn(lo); col.setXYZ(i, c.r, c.g, c.b);
  }
  col.needsUpdate = true;
}
export const stackParts = parts;
