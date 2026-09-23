import * as THREE from 'three';
import { approvedEngineeringData as A } from '../data/resolver';
import { MSL_Y } from '../core/scales';
import { label, mat, scene } from './world';

/**
 * Generic moored semi-submersible. Only draught (17.5 m) and RT height above MSL (26.05 m) are
 * reported values; hull proportions are ILLUSTRATIVE (drawings only in source).
 */
const UP = new THREE.Vector3(0, 1, 0);
export const rig = new THREE.Group(); scene.add(rig);
const draught = A.num('rig.draught');
const rtAbove = A.num('rig.rtAboveMsl');

function bar(a: THREE.Vector3, b: THREE.Vector3, r: number, m: THREE.Material, p: THREE.Object3D = rig) {
  const d = new THREE.Vector3().subVectors(b, a), L = d.length();
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, L, 6), m);
  mesh.position.copy(a).addScaledVector(d, 0.5); mesh.quaternion.setFromUnitVectors(UP, d.normalize()); p.add(mesh); return mesh;
}
function box(w: number, h: number, d: number, m: THREE.Material, x: number, y: number, z: number) {
  const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); rig.add(b); return b;
}
function cyl(r: number, h: number, m: THREE.Material, x: number, y: number, z: number) {
  const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 28), m); c.position.set(x, y, z); rig.add(c); return c;
}

(() => {
  const hull = mat('#8d949a', { metalness: 0.45, roughness: 0.5 }), deck = mat('#5c666d', { metalness: 0.4 });
  const white = mat('#d9dcd8', { metalness: 0.3, roughness: 0.45 }), accent = mat('#c9a646', { metalness: 0.3 });
  const keel = MSL_Y - draught;
  [-28, 28].forEach(z => {
    box(100, 8.5, 15, hull, 0, keel + 4.25, z);
    [-36, 0, 36].forEach(x => cyl(6.2, draught + 12 - 8.5, hull, x, keel + 8.5 + (draught + 12 - 8.5) / 2, z));
  });
  [-36, 0, 36].forEach(x => bar(new THREE.Vector3(x, keel + 5, -21), new THREE.Vector3(x, keel + 5, 21), 1.3, hull));
  const deckBottom = MSL_Y + 12, rt = MSL_Y + rtAbove;
  box(82, rt - deckBottom - 3, 72, deck, 0, (deckBottom + rt - 3) / 2, 0);
  box(16, 3, 16, mat('#6d777e'), 0, rt - 1.5, 0);
  const legs = [[-7, -7], [7, -7], [7, 7], [-7, 7]], h0 = rt, h1 = rt + 58;
  const at = (x: number, z: number, y: number) => { const f = (y - h0) / (h1 - h0); return new THREE.Vector3(x * (1 - 0.7 * f), y, z * (1 - 0.7 * f)); };
  legs.forEach(([x, z]) => bar(at(x, z, h0), at(x, z, h1), 0.45, white));
  for (let y = h0; y < h1; y += 8) {
    const y1 = Math.min(h1, y + 8);
    for (let s = 0; s < 4; s++) { const [ax, az] = legs[s], [bx, bz] = legs[(s + 1) % 4]; bar(at(ax, az, y1), at(bx, bz, y1), 0.2, white); bar(at(ax, az, y), at(bx, bz, y1), 0.14, white); }
  }
  box(6, 3, 6, accent, 0, h1 + 1.5, 0);
  box(24, 13, 20, white, -26, rt + 6.5, -22);
  for (let i = 0; i < 4; i++) box(24.2, 0.5, 20.2, mat('#2c3942'), -26, rt + 2 + i * 3, -22);
  const heli = new THREE.Mesh(new THREE.CylinderGeometry(11, 11, 0.7, 8), mat('#3f4c46')); heli.position.set(-40, rt + 13.5, -24); rig.add(heli);
  [[34, -30], [-34, 30]].forEach(([x, z]) => { cyl(1.6, 9, accent, x, rt + 4.5, z); bar(new THREE.Vector3(x, rt + 8, z), new THREE.Vector3(x * 0.35, rt + 36, z * 0.2), 0.6, accent); });
  const l = label(`Semi-sub MODU, moored — draught ${draught} m, RT ${rtAbove} m above MSL <i>(hull form illustrative)</i>`, 'strong');
  l.position.set(0, h1 + 8, 0); rig.add(l);
})();

// Mooring lines
const moor: THREE.Line[] = [];
const fair = [[-44, -34], [44, -34], [-44, 34], [44, 34], [-50, -22], [50, -22], [-50, 22], [50, 22]];
for (let i = 0; i < 8; i++) {
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(40 * 3), 3));
  const l = new THREE.Line(g, new THREE.LineBasicMaterial({ color: 0x31434a })); scene.add(l); moor.push(l);
}
export function updateMooring() {
  moor.forEach((l, i) => {
    const [fx, fz] = fair[i];
    const v = new THREE.Vector3(fx, MSL_Y - 10, fz).applyAxisAngle(UP, rig.rotation.y).add(new THREE.Vector3(rig.position.x, 0, 0));
    const dir = new THREE.Vector2(fx, fz).normalize(); const ax = dir.x * 620, az = dir.y * 620;
    const p = l.geometry.attributes.position.array as Float32Array;
    for (let j = 0; j < 40; j++) {
      const t = j / 39;
      p[j * 3] = THREE.MathUtils.lerp(v.x, ax, t); p[j * 3 + 2] = THREE.MathUtils.lerp(v.z, az, t);
      p[j * 3 + 1] = Math.max(0.3, THREE.MathUtils.lerp(v.y, 0, Math.pow(t, 0.55)) - Math.sin(t * Math.PI) * 6);
    }
    l.geometry.attributes.position.needsUpdate = true;
  });
}

/** RAO concept rings for the heading chapter — ILLUSTRATIVE, no RAO magnitudes are shown. */
export const raoRings = new THREE.Group(); scene.add(raoRings);
for (let i = 0; i < 3; i++) {
  const r = new THREE.Mesh(new THREE.RingGeometry(58 + i * 14, 59.5 + i * 14, 96),
    new THREE.MeshBasicMaterial({ color: 0x7fc8d8, transparent: true, opacity: 0.35 - i * 0.08, side: THREE.DoubleSide, depthWrite: false }));
  r.rotation.x = -Math.PI / 2; r.position.y = MSL_Y + 0.5; raoRings.add(r);
}
