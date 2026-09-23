import * as THREE from 'three';
import { approvedEngineeringData as A } from '../data/resolver';
import { MSL_Y, R, Y } from '../core/scales';
import { label, mat, scene } from './world';
import { DeformState, riserX } from '../animation/deform';

const E = {
  lfj: A.num('elev.lfjTop'), yellowTop: A.num('elev.yellowBuoyTop'), greenTop: A.num('elev.greenBuoyTop'),
  riserTop: A.num('elev.riserTop'), tens: A.num('elev.tensionRing'), ufj: A.num('elev.ufjRotation'), rt: A.num('elev.rotaryTable'),
};
const buoyR = R(A.num('riser.buoyOd')) * 1.6, slickR = R(A.num('riser.od')) * 1.8; // extra visual thickening at GLOBAL scale (illustrative)
const SEGS: [number, number, number, string, string][] = [
  [E.lfj, E.yellowTop, buoyR, '#c9a646', `Buoyant joints (4,000 ft rating) ${E.lfj}–${E.yellowTop} m`],
  [E.yellowTop, E.greenTop, buoyR, '#5f9f8c', `Buoyant joints (2,000 ft rating) ${E.yellowTop}–${E.greenTop} m`],
  [E.greenTop, E.tens, slickR, '#8a969e', `Slick / pup joints, telescopic joint — stroke ${A.num('tj.stroke')} ft`],
  [E.tens, E.ufj, slickR * 1.1, '#6d7880', `Upper flex joint ${E.ufj} m — max ${A.num('fj.ufj.maxRotation')}°`],
];
let meshes: THREE.Mesh[] = [];
export const riserGroup = new THREE.Group(); scene.add(riserGroup);
const labels = SEGS.map(s => { const l = label(s[4], 'glob'); riserGroup.add(l); return l; });
const ufjBall = new THREE.Mesh(new THREE.SphereGeometry(1.5, 18, 12), mat('#7c8a92', { metalness: 0.6 })); riserGroup.add(ufjBall);
const tensRing = new THREE.Mesh(new THREE.TorusGeometry(2.6, 0.5, 8, 32), mat('#6d7880', { metalness: 0.5 })); tensRing.rotation.x = Math.PI / 2; riserGroup.add(tensRing);
const tensLabel = label(`Tension ring ${E.tens} m — ${A.num('tensioner.lines')} lines, ${A.num('tensioner.overpull')} kip LMRP overpull`, 'glob'); tensRing.add(tensLabel);

export function updateRiser(base: number, top: number, ds: DeformState, dropY = 0) {
  meshes.forEach(m => { riserGroup.remove(m); m.geometry.dispose(); }); meshes = [];
  const y0 = Y(E.lfj), y1 = Y(E.rt);
  const pt = (e: number) => { const t = (Y(e) - y0) / (y1 - y0); return new THREE.Vector3(riserX(t, base, top, ds), Y(e) + dropY * (1 - t), 0); };
  class RC extends THREE.Curve<THREE.Vector3> { constructor(private a: number, private b: number) { super(); } getPoint(t: number, v = new THREE.Vector3()) { return v.copy(pt(this.a + (this.b - this.a) * t)); } }
  SEGS.forEach(([a, b, r, col], i) => {
    const m = new THREE.Mesh(new THREE.TubeGeometry(new RC(a, b), 64, r, 16, false), mat(col, { metalness: 0.35 }));
    m.frustumCulled = false; m.userData.componentId = 'riser'; riserGroup.add(m); meshes.push(m);
    labels[i].position.copy(pt((a + b) / 2)).add(new THREE.Vector3(r + 1.5, 0, 0));
  });
  ufjBall.position.copy(pt(E.ufj)); tensRing.position.copy(pt(E.tens));
  return meshes;
}
export const riserMeshes = () => meshes;

/** Offset envelope rings at the sea surface (drawn over the hull). Radii come from reported limits. */
export const envelope = new THREE.Group(); scene.add(envelope); envelope.position.y = MSL_Y + 0.8;
const ring = (col: number) => { const m = new THREE.Mesh(new THREE.RingGeometry(0.93, 1, 128), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.95, side: THREE.DoubleSide, depthTest: false })); m.rotation.x = -Math.PI / 2; m.renderOrder = 30; return m; };
export const ringDrilling = ring(0x4fa37a), ringNonDrilling = ring(0xe6b04a);
export const diskDrilling = new THREE.Mesh(new THREE.CircleGeometry(1, 96), new THREE.MeshBasicMaterial({ color: 0x4fa37a, transparent: true, opacity: 0.14, side: THREE.DoubleSide, depthTest: false }));
diskDrilling.rotation.x = -Math.PI / 2; diskDrilling.renderOrder = 29;
envelope.add(diskDrilling, ringDrilling, ringNonDrilling);
const wc = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 3, 12), new THREE.MeshBasicMaterial({ color: 0xeaf1f3, depthTest: false })); wc.renderOrder = 31; wc.position.y = 1.5; envelope.add(wc);
{ const l = label('Well centre', 'strong'); l.position.set(0, 5, 0); envelope.add(l); }
export const ringLabelD = label('', 'ok'); ringDrilling.add(ringLabelD);
export const ringLabelN = label('', 'mid'); ringNonDrilling.add(ringLabelN);
export const rigMarker = new THREE.Mesh(new THREE.RingGeometry(1.8, 3, 32), new THREE.MeshBasicMaterial({ color: 0x5fb3a8, side: THREE.DoubleSide, depthTest: false }));
rigMarker.rotation.x = -Math.PI / 2; rigMarker.renderOrder = 32; rigMarker.position.y = MSL_Y + 1; scene.add(rigMarker);
