import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { approvedEngineeringData as A } from '../data/resolver';
import { MSL_Y, Y } from '../core/scales';

export const canvas = document.getElementById('scene') as HTMLCanvasElement;
export const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, logarithmicDepthBuffer: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.localClippingEnabled = true;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

export const labelRenderer = new CSS2DRenderer({ element: document.getElementById('labels') as HTMLElement });
export const scene = new THREE.Scene();
export const camera = new THREE.PerspectiveCamera(38, 1, 0.05, 30000);
export const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; controls.dampingFactor = 0.08;

scene.add(new THREE.HemisphereLight(0xcfe2ec, 0x1b2a30, 0.9));
const sun = new THREE.DirectionalLight(0xfff0dc, 1.6); sun.position.set(300, 600, 250); scene.add(sun);
const rim = new THREE.DirectionalLight(0x6fb6cf, 0.6); rim.position.set(-250, -80, 300); scene.add(rim);
export const subseaLight = new THREE.PointLight(0xbfe8ff, 60, 60, 1.6); subseaLight.position.set(8, 14, 12); scene.add(subseaLight);

/** Section-cut plane: keeps z ≤ 0 so casing strings read as a cutaway. */
export const CLIP = [new THREE.Plane(new THREE.Vector3(0, 0, -1), 0)];
export const mat = (color: THREE.ColorRepresentation, o: THREE.MeshStandardMaterialParameters = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.35, ...o });

function gradient(stops: [number, string][]) {
  const c = document.createElement('canvas'); c.width = 4; c.height = 256; const g = c.getContext('2d')!;
  const gr = g.createLinearGradient(0, 0, 0, 256); stops.forEach(([o, col]) => gr.addColorStop(o, col)); g.fillStyle = gr; g.fillRect(0, 0, 4, 256);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
export const BG = {
  sky: gradient([[0, '#1d3a52'], [0.6, '#4d7486'], [1, '#9fb4b8']]),
  deep: gradient([[0, '#0f3a4a'], [0.5, '#0a2633'], [1, '#051720']]),
  soil: new THREE.Color('#1e1c18'),
};
export const FOG = new THREE.FogExp2(0x0a2a36, 0.0026);

/** CSS2D label helper (real engineering dimensions are always shown in labels). */
export function label(html: string, cls = ''): CSS2DObject {
  const el = document.createElement('div'); el.className = 'lbl ' + cls; el.innerHTML = html;
  const o = new CSS2DObject(el); return o;
}

// ---------------- Ocean surface ----------------
const waterGeo = new THREE.PlaneGeometry(2400, 2400, 120, 120); waterGeo.rotateX(-Math.PI / 2);
const waterBase = (waterGeo.attributes.position.array as Float32Array).slice();
export const water = new THREE.Mesh(waterGeo, new THREE.MeshStandardMaterial({
  color: 0x1f5c6c, roughness: 0.18, metalness: 0.2, transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false,
}));
water.position.y = MSL_Y; water.renderOrder = 2; scene.add(water);
export function animateWater(t: number, amp: number) {
  const p = waterGeo.attributes.position.array as Float32Array;
  for (let i = 0; i < p.length; i += 3) {
    const x = waterBase[i], z = waterBase[i + 2];
    p[i + 1] = amp * (Math.sin(x * 0.03 + t * 0.8) * 0.6 + Math.sin(z * 0.045 + t * 0.55) * 0.4);
  }
  waterGeo.attributes.position.needsUpdate = true;
}

// ---------------- Seabed (bathymetry) ----------------
function noise(base: string, n: number, rep: number) {
  const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d')!;
  g.fillStyle = base; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < n; i++) { g.fillStyle = `rgba(${Math.random() > .5 ? '255,255,240' : '0,0,0'},${0.03 + Math.random() * 0.06})`; g.fillRect(Math.random() * 256, Math.random() * 256, 1 + Math.random() * 3, 1 + Math.random() * 2); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const seabedGeo = new THREE.PlaneGeometry(2000, 2000, 80, 80); seabedGeo.rotateX(-Math.PI / 2);
{
  const p = seabedGeo.attributes.position.array as Float32Array;
  for (let i = 0; i < p.length; i += 3) {
    const x = p[i], z = p[i + 2], r = Math.hypot(x, z);
    p[i + 1] = r < 40 ? 0 : (Math.sin(x * 0.012) * Math.cos(z * 0.009) * 1.8 + Math.sin((x + z) * 0.004) * 2.5) * Math.min(1, (r - 40) / 80);
  }
  seabedGeo.computeVertexNormals();
}
export const seabed = new THREE.Mesh(seabedGeo, new THREE.MeshStandardMaterial({ map: noise('#5f5e50', 7000, 60), roughness: 1, metalness: 0 }));
scene.add(seabed);

// ---------------- Soil section wall (cutaway) ----------------
export const soilWall = (() => {
  const layers = A.arr<number>('soil.layers'), su = A.arr<number>('soil.suUpperTop');
  const wReal = 120, top = 0, bot = Y(A.num('casing.c13.shoe')) - 6;
  const h = top - bot, cw = 700, ch = Math.round(cw * h / wReal);
  const cv = document.createElement('canvas'); cv.width = cw; cv.height = ch; const g = cv.getContext('2d')!;
  const py = (y: number) => (top - y) / h * ch;
  for (let i = 0; i < ch; i += 2) {
    const y = top - i / ch * h;
    // find real depth for this y via inverse search
    let lo = -3000, hi = 0; for (let k = 0; k < 30; k++) { const m = (lo + hi) / 2; if (Y(m) > y) hi = m; else lo = m; }
    const d = -lo; let s = su[su.length - 1];
    for (let k = 0; k < su.length; k++) if (d >= layers[k] && d < layers[k + 1]) s = su[k];
    const t = Math.min(1, Math.log10(Math.max(1, s)) / Math.log10(170));
    const inData = d <= layers[layers.length - 1];
    const c = new THREE.Color('#5d5646').lerp(new THREE.Color('#2e3a37'), t);
    if (!inData) c.lerp(new THREE.Color('#1c1d1b'), 0.55);
    g.fillStyle = '#' + c.getHexString(); g.fillRect(0, i, cw, 2);
  }
  for (let i = 0; i < 26000; i++) { g.fillStyle = `rgba(0,0,0,${0.05 + Math.random() * 0.08})`; g.fillRect(Math.random() * cw, Math.random() * ch, 1.5, 1.2); }
  g.strokeStyle = 'rgba(15,12,8,.5)'; g.lineWidth = 1.4;
  layers.forEach(d => { if (d <= 0) return; const y = py(Y(-d)); g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= cw; x += 20) g.lineTo(x, y + Math.sin(x / 60 + d) * 1.2); g.stroke(); });
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const m = new THREE.Mesh(new THREE.PlaneGeometry(wReal, h), new THREE.MeshBasicMaterial({ map: tex, color: 0xbfc4bd }));
  m.position.set(0, (top + bot) / 2, -1.9); scene.add(m);
  const lb = label(`Clay — undrained shear strength profile to ${layers[layers.length - 1]} m (${A.get('soil.suUpperTop').selected.ref})`, 'part soft');
  lb.position.set(-40, Y(-75), -1.8); m.parent!.add(lb);
  return m;
})();

// ---------------- Water-depth ruler ----------------
export const ruler = new THREE.Group(); scene.add(ruler);
(() => {
  const x = -70, m = new THREE.LineBasicMaterial({ color: 0x9fc6d4, transparent: true, opacity: 0.7 });
  const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, 0, 0), new THREE.Vector3(x, MSL_Y, 0)]);
  ruler.add(new THREE.Line(g, m));
  const wd = A.num('env.waterDepth');
  for (let e = 0; e <= wd; e += 100) {
    const t = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, Y(e), 0), new THREE.Vector3(x + 3, Y(e), 0)]);
    ruler.add(new THREE.Line(t, m));
    const l = label(`${wd - e} m`, 'ruler'); l.position.set(x - 1, Y(e), 0); ruler.add(l);
  }
  const t = label(`Water depth ${wd} m <i>(column compressed)</i>`, 'ruler strong'); t.position.set(x, Y(wd / 2), 0); ruler.add(t);
})();

// ---------------- Current particles ----------------
const NCP = 700;
const cpPos = new Float32Array(NCP * 3), cpSeed = new Float32Array(NCP);
for (let i = 0; i < NCP; i++) { cpPos[i * 3] = -200 + Math.random() * 400; cpPos[i * 3 + 1] = Math.random() * (MSL_Y - 2); cpPos[i * 3 + 2] = -120 + Math.random() * 240; cpSeed[i] = Math.random(); }
const cpGeo = new THREE.BufferGeometry(); cpGeo.setAttribute('position', new THREE.BufferAttribute(cpPos, 3));
export const currentParticles = new THREE.Points(cpGeo, new THREE.PointsMaterial({ color: 0x9fd6e6, size: 0.9, transparent: true, opacity: 0.55, depthWrite: false }));
scene.add(currentParticles);
/** Speed profile factor (surface 1 → deep ~0.2). Illustrative particle speed only. */
export function animateCurrent(dt: number, strength: number) {
  const p = cpPos;
  for (let i = 0; i < NCP; i++) {
    const f = 0.2 + 0.8 * Math.pow(p[i * 3 + 1] / MSL_Y, 1.4);
    p[i * 3] += dt * (4 + 22 * f * strength) * (0.7 + cpSeed[i] * 0.6);
    if (p[i * 3] > 200) p[i * 3] = -200;
  }
  cpGeo.attributes.position.needsUpdate = true;
}

// ---------------- Direction arrows on the sea surface ----------------
function flatArrow(color: number, len: number, w: number) {
  const s = new THREE.Shape(); s.moveTo(-len / 2, -w / 2); s.lineTo(len / 2 - w * 1.4, -w / 2); s.lineTo(len / 2 - w * 1.4, -w * 1.3); s.lineTo(len / 2, 0);
  s.lineTo(len / 2 - w * 1.4, w * 1.3); s.lineTo(len / 2 - w * 1.4, w / 2); s.lineTo(-len / 2, w / 2);
  const m = new THREE.Mesh(new THREE.ShapeGeometry(s), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthTest: false }));
  m.rotation.x = -Math.PI / 2; m.renderOrder = 20; return m;
}
export const waveArrow = flatArrow(0xeaf1f3, 90, 7); waveArrow.position.set(-150, MSL_Y + 1, 0); scene.add(waveArrow);
{ const l = label('Prevailing wave direction <i>(fixed)</i>', 'strong'); l.position.set(0, 0, 6); waveArrow.add(l); }
export const currentArrow = flatArrow(0x7fc8d8, 70, 5); currentArrow.position.set(-150, MSL_Y + 1, 40); scene.add(currentArrow);
export const currentArrowLabel = label('', 'strong'); currentArrowLabel.position.set(0, 0, 6); currentArrow.add(currentArrowLabel);

export function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false); labelRenderer.setSize(w, h);
  camera.aspect = w / h; camera.updateProjectionMatrix();
}
addEventListener('resize', resize);
