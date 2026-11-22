import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

// Side-profile stations as a fraction of length (0 = tail, 1 = nose).
const PROFILES = {
  sedan: { cowl: 0.665, wsTop: 0.525, roofEnd: 0.285, deck: 0.155, belt: 0.635, nose: 0.5, tail: 0.655 },
  hatch: { cowl: 0.7, wsTop: 0.56, roofEnd: 0.14, deck: 0.035, belt: 0.62, nose: 0.5, tail: 0.63 },
  coupe: { cowl: 0.64, wsTop: 0.5, roofEnd: 0.3, deck: 0.12, belt: 0.65, nose: 0.48, tail: 0.665 },
  wagon: { cowl: 0.68, wsTop: 0.55, roofEnd: 0.075, deck: 0.025, belt: 0.61, nose: 0.49, tail: 0.61 },
  suv: { cowl: 0.71, wsTop: 0.595, roofEnd: 0.085, deck: 0.025, belt: 0.62, nose: 0.56, tail: 0.62 },
  convertible: { cowl: 0.62, wsTop: 0.53, roofEnd: 0.3, deck: 0.15, belt: 0.69, nose: 0.52, tail: 0.68, open: true },
  pickup: { cowl: 0.72, wsTop: 0.625, roofEnd: 0.445, deck: 0.4, belt: 0.62, nose: 0.57, tail: 0.62, bed: true },
  supercar: { cowl: 0.75, wsTop: 0.56, roofEnd: 0.4, deck: 0.2, belt: 0.65, nose: 0.36, tail: 0.73 },
};

const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (t) => Math.min(1, Math.max(0, t));
const smooth = (t) => { const x = clamp01(t); return x * x * (3 - 2 * x); };

function loftParts(sections, classify) {
  const rows = sections.length, cols = sections[0].length;
  const position = new Float32Array(rows * cols * 3);
  sections.forEach((section, r) => section.forEach((p, c) => position.set(p, (r * cols + c) * 3)));
  const groups = {};
  for (let r = 0; r < rows - 1; r++) {
    for (let c = 0; c < cols - 1; c++) {
      const key = classify ? classify(r, c) : 'main';
      const a = r * cols + c, b = a + 1, d = a + cols, e = d + 1;
      (groups[key] ||= []).push(a, d, b, b, d, e);
    }
  }
  const base = new THREE.BufferGeometry();
  base.setAttribute('position', new THREE.BufferAttribute(position, 3));
  base.setIndex(Object.values(groups).flat());
  base.computeVertexNormals();
  const out = {};
  Object.entries(groups).forEach(([key, index]) => {
    const part = new THREE.BufferGeometry();
    part.setAttribute('position', base.getAttribute('position'));
    part.setAttribute('normal', base.getAttribute('normal'));
    part.setIndex(index);
    out[key] = part;
  });
  return out;
}

const loft = (sections) => loftParts(sections).main;

function canvasTexture(width, height, draw) {
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  draw(canvas.getContext('2d'), width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

export const PAINTS = ['#c8102e', '#f5f5f2', '#0d0f14', '#8d939c', '#123e8c', '#0f5c46', '#f2a900', '#ff5a1f'];

export class Car3D {
  constructor(container, car, paint) {
    this.container = container;
    this.car = car;
    this.disposables = [];
    this.autoRotate = true;
    this.transition = null;
    this.viewName = 'orbit';
    this.hoodTarget = 0;
    this.hoodAmount = 0;

    const width = container.clientWidth || 800, height = container.clientHeight || 500;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(width, height);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.envTexture = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;
    this.scene.environment = this.envTexture;
    pmrem.dispose();

    this.camera = new THREE.PerspectiveCamera(32, width / height, 0.02, 60);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.enablePan = false;
    this.controls.autoRotateSpeed = 1.1;
    this.controls.addEventListener('start', () => { this.transition = null; });

    const key = new THREE.DirectionalLight(0xffffff, 2.1);
    key.position.set(2.5, 6.5, 3.5);
    key.castShadow = true;
    key.shadow.mapSize.set(1536, 1536);
    key.shadow.radius = 5;
    Object.assign(key.shadow.camera, { left: -4.5, right: 4.5, top: 4.5, bottom: -4.5, near: 1, far: 16 });
    const rim = new THREE.DirectionalLight(0xff8a5c, 0.9);
    rim.position.set(-5, 2.4, -3);
    this.scene.add(key, rim, new THREE.HemisphereLight(0xc8d6ff, 0x1a120e, 0.5));

    this.paint = new THREE.MeshPhysicalMaterial({ color: paint || PAINTS[0], metalness: 0.42, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.05, side: THREE.DoubleSide });
    const classic = car.cat === 'classic';
    this.mats = {
      glass: new THREE.MeshPhysicalMaterial({ color: 0x0b1420, metalness: 0.1, roughness: 0.03, transparent: true, opacity: 0.36, side: THREE.DoubleSide, depthWrite: false, envMapIntensity: 1.6 }),
      black: new THREE.MeshStandardMaterial({ color: 0x08090c, roughness: 0.5 }),
      gloss: new THREE.MeshStandardMaterial({ color: 0x050608, roughness: 0.16, metalness: 0.5 }),
      trim: new THREE.MeshStandardMaterial({ color: 0x1b1c22, roughness: 0.74, side: THREE.DoubleSide }),
      dash: new THREE.MeshStandardMaterial({ color: classic ? 0x3a2417 : 0x202128, roughness: 0.58 }),
      leather: new THREE.MeshStandardMaterial({ color: classic ? 0x8a4a28 : 0x2c2d35, roughness: 0.56 }),
      stitch: new THREE.MeshStandardMaterial({ color: car.fuel === 'd' ? 0xf2a900 : 0xff4d2e, roughness: 0.5 }),
      metal: new THREE.MeshStandardMaterial({ color: 0xd5d8de, metalness: 1, roughness: 0.2 }),
      tire: new THREE.MeshStandardMaterial({ color: 0x0c0c0e, roughness: 0.9 }),
      engine: new THREE.MeshStandardMaterial({ color: 0x41454e, metalness: 0.8, roughness: 0.34 }),
      accent: new THREE.MeshStandardMaterial({ color: car.fuel === 'd' ? 0xf2a900 : 0xd4182e, metalness: 0.45, roughness: 0.3 }),
      head: new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xe6efff, emissiveIntensity: 2.2 }),
      tail: new THREE.MeshStandardMaterial({ color: 0x70000a, emissive: 0xff1426, emissiveIntensity: 1.9 }),
    };

    this.root = new THREE.Group();
    this.scene.add(this.root);
    this.build();
    this.buildGround();

    this.setView('orbit', true);
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(container);
    this.lastTime = performance.now();
    this.renderer.setAnimationLoop(() => this.tick());
  }

  mesh(geometry, material, parent = this.root, shadow = true) {
    const object = new THREE.Mesh(geometry, material);
    object.castShadow = shadow;
    object.receiveShadow = shadow;
    parent.add(object);
    this.disposables.push(geometry);
    return object;
  }

  box(w, h, d, x, y, z, material, parent, radius = 0) {
    const r = Math.min(radius, w / 2.01, h / 2.01, d / 2.01);
    const geometry = r > 0 ? new RoundedBoxGeometry(w, h, d, 3, r) : new THREE.BoxGeometry(w, h, d);
    const object = this.mesh(geometry, material, parent);
    object.position.set(x, y, z);
    return object;
  }

  build() {
    const { car } = this;
    const L = car.len / 1000, W = car.wid / 1000, H = car.hei / 1000;
    const P = { ...(PROFILES[car.body] || PROFILES.sedan) };
    if (car.rearEngine && P.deck < 0.17) { P.deck = 0.17; P.roofEnd = Math.max(P.roofEnd, 0.32); }
    const tall = car.body === 'suv' || car.body === 'pickup';
    const clearance = tall ? 0.25 : car.body === 'supercar' ? 0.115 : 0.15;
    const X = (t) => (t - 0.5) * L;
    const beltY = H * P.belt;
    const endRound = (t) => { const e = Math.min(t, 1 - t) / 0.085; return e >= 1 ? 1 : Math.sqrt(1 - (1 - e) * (1 - e)); };
    const beltAt = (t) => {
      let y = beltY;
      if (t >= P.cowl) y = lerp(beltY, H * P.nose, smooth((t - P.cowl) / (1 - P.cowl)));
      else if (t <= P.deck) y = lerp(H * P.tail, beltY, smooth(t / Math.max(P.deck, 0.001)));
      return y - (1 - endRound(t)) * 0.07;
    };
    const halfW = (t) => (W / 2) * (0.87 + 0.13 * Math.pow(Math.sin(Math.PI * clamp01(t)), 0.6)) * (0.74 + 0.26 * endRound(t));
    const radius = Math.min(tall ? 0.385 : 0.345, H * (tall ? 0.205 : 0.228));
    const wb = Math.min(car.wb / 1000, L * 0.72);
    const axles = [wb / 2 + L * 0.006, -wb / 2 + L * 0.006];
    Object.assign(this, { L, W, H, P, X, beltAt, halfW, clearance, radius, axles, endRound });

    this.buildLowerBody();
    this.buildPanels();
    this.buildGreenhouse();
    this.buildWheels();
    this.buildDetails();
    this.buildInterior();
    this.buildEngine();
  }

  buildLowerBody() {
    const { X, beltAt, halfW, clearance, radius, axles, endRound, mats, paint, P, L, H, W } = this;
    const archR = radius * 1.12;
    const shape = [[0.955, 1], [0.995, 0.86], [1, 0.66], [0.985, 0.42], [0.97, 0.2], [0.93, 0.07], [0.8, 0], [0.3, 0], [-0.3, 0], [-0.8, 0], [-0.93, 0.07], [-0.97, 0.2], [-0.985, 0.42], [-1, 0.66], [-0.995, 0.86], [-0.955, 1]];
    const count = 150, sections = [];
    for (let i = 0; i <= count; i++) {
      const t = i / count, x = X(t), top = beltAt(t), hw = halfW(t);
      const low = clearance + (1 - endRound(t)) * 0.13;
      sections.push(shape.map(([zf, yf]) => {
        let y = lerp(low, top, yf);
        if (Math.abs(zf) >= 0.8) {
          for (const ax of axles) {
            const dx = x - ax;
            if (Math.abs(dx) < archR) y = Math.max(y, Math.min(top - 0.045, radius + Math.sqrt(archR * archR - dx * dx)));
          }
        }
        const flare = axles.reduce((sum, ax) => sum + Math.exp(-Math.pow((x - ax) / (radius * 1.5), 2)) * 0.016, 0);
        return [x, y, zf * (hw + flare * Math.min(1, yf + 0.4))];
      }));
    }
    this.mesh(loft(sections), paint);

    [0, count].forEach((i) => {
      const ring = sections[i];
      const centre = ring.reduce((sum, p) => [sum[0] + p[0], sum[1] + p[1], sum[2] + p[2]], [0, 0, 0]).map((v) => v / ring.length);
      const index = [];
      for (let c = 0; c < ring.length; c++) index.push(c, (c + 1) % ring.length, ring.length);
      const cap = new THREE.BufferGeometry();
      cap.setAttribute('position', new THREE.Float32BufferAttribute([...ring.flat(), ...centre], 3));
      cap.setIndex(index);
      cap.computeVertexNormals();
      this.mesh(cap, paint);
    });

    // Dark wheel-well liners and underbody.
    axles.forEach((ax) => [1, -1].forEach((side) => {
      const geometry = new THREE.CylinderGeometry(archR * 0.99, archR * 0.99, 0.34, 32);
      geometry.rotateX(Math.PI / 2);
      const well = this.mesh(geometry, mats.black, this.root, false);
      well.position.set(ax, radius, side * (halfW(0.5 + ax / L) - 0.185));
    }));
    this.box(L * 0.9, 0.02, W * 0.8, 0, clearance + 0.012, 0, mats.black);
    if (P.bed) {
      this.box(L * 0.35, 0.03, W * 0.82, X(0.2), H * 0.43, 0, mats.trim);
      this.box(0.03, H * 0.2, W * 0.84, X(P.deck) - 0.01, H * 0.52, 0, mats.trim);
    }
  }

  surface(from, to, parent, offset = new THREE.Vector3()) {
    const { beltAt, halfW, X } = this;
    const sections = [];
    for (let i = 0; i <= 26; i++) {
      const t = lerp(from, to, i / 26);
      const row = [];
      for (let j = 0; j <= 14; j++) {
        const z = -1 + (j / 14) * 2;
        const crown = (0.055 * Math.sin(Math.PI * clamp01(i / 26)) + 0.022) * (1 - z * z);
        row.push([X(t) - offset.x, beltAt(t) + crown - offset.y, z * halfW(t) * 0.965]);
      }
      sections.push(row);
    }
    return this.mesh(loft(sections), this.paint, parent);
  }

  buildPanels() {
    const { car, P, X, beltAt } = this;
    const range = car.rearEngine ? [0.012, P.deck] : [P.cowl, 0.992];
    // Rear lids hinge at the cabin so they lift away from the camera behind the car.
    const hinge = car.rearEngine ? range[1] : range[0];
    this.hoodSign = car.rearEngine ? -1 : 1;
    const pivot = new THREE.Vector3(X(hinge), beltAt(hinge) + 0.006, 0);
    this.hood = new THREE.Group();
    this.hood.position.copy(pivot);
    this.root.add(this.hood);
    this.surface(range[0], range[1], this.hood, pivot);
    if (car.rearEngine) this.surface(P.cowl, 0.992);
    else if (!P.bed && P.deck > 0.05) this.surface(0.008, P.deck);
    else if (!P.bed) this.surface(0.006, P.deck + 0.004);
  }

  buildGreenhouse() {
    const { H, P, X, beltAt, halfW, mats, paint } = this;
    const roofY = H * 0.97;
    const end = P.open ? P.wsTop : P.deck;
    const heightAt = (t) => {
      if (t >= P.wsTop) return lerp(roofY, beltAt(P.cowl), Math.pow(clamp01((t - P.wsTop) / (P.cowl - P.wsTop)), 1.12));
      if (t >= P.roofEnd) return roofY + 0.014 * Math.sin(Math.PI * (t - P.roofEnd) / (P.wsTop - P.roofEnd));
      return lerp(beltAt(P.deck), roofY, Math.pow(clamp01((t - P.deck) / Math.max(P.roofEnd - P.deck, 0.001)), 0.82));
    };
    const SIDE = 4, TOP = 8;
    const stations = [];
    for (let i = 0; i <= 72; i++) stations.push(lerp(P.cowl, end, i / 72));
    const sections = stations.map((t) => {
      const base = halfW(t) * 0.965, belt = beltAt(t) + 0.004, y = Math.max(heightAt(t), belt + 0.002);
      const k = clamp01((y - belt) / Math.max(roofY - belt, 0.001));
      const top = base * lerp(1, 0.77, k);
      const row = [];
      for (let i = 0; i <= SIDE; i++) { const s = i / SIDE; row.push([X(t), lerp(belt, y, s), lerp(base, top, Math.pow(s, 0.9))]); }
      // The outermost strips are narrow so they read as slim A/C pillars.
      [0.94, 0.62, 0.31, 0, -0.31, -0.62, -0.94].forEach((f) => row.push([X(t), y + 0.026 * k * (1 - f * f), top * f]));
      for (let i = SIDE; i >= 0; i--) { const s = i / SIDE; row.push([X(t), lerp(belt, y, s), -lerp(base, top, Math.pow(s, 0.9))]); }
      return row;
    });
    const lastCol = SIDE * 2 + TOP - 1;
    const bPillar = lerp(P.wsTop, P.roofEnd, 0.47);
    const parts = loftParts(sections, (r, c) => {
      const t = (stations[r] + stations[r + 1]) / 2;
      const isSide = c < SIDE || c > lastCol - SIDE;
      const rail = c === SIDE - 1 || c === lastCol - SIDE + 1;
      const sill = c === 0 || c === lastCol;
      if (t > P.wsTop) {
        if (isSide) return sill ? 'paint' : 'glass';
        return c === SIDE || c === lastCol - SIDE || t < P.wsTop + 0.012 ? 'paint' : 'glass';
      }
      if (t >= P.roofEnd) {
        if (!isSide) return 'paint';
        if (rail || sill || Math.abs(t - bPillar) < 0.011) return 'paint';
        return 'glass';
      }
      if (isSide) return t > P.roofEnd - 0.012 && !rail && !sill && P.roofEnd - P.deck > 0.2 ? 'glass' : 'paint';
      return c === SIDE || c === lastCol - SIDE || t > P.roofEnd - 0.012 || t < P.deck + 0.012 ? 'paint' : 'glass';
    });
    if (parts.paint) this.mesh(parts.paint, paint);
    if (parts.glass) { const glass = this.mesh(parts.glass, mats.glass, this.root, false); glass.renderOrder = 3; }

    if (P.open) {
      const top = halfW(P.wsTop) * 0.965 * 0.77;
      this.box(0.05, 0.035, top * 2.04, X(P.wsTop), heightAt(P.wsTop) + 0.004, 0, paint, this.root, 0.014);
    }

    [1, -1].forEach((side) => {
      const arm = this.box(0.05, 0.022, 0.09, X(P.cowl - 0.03), beltAt(P.cowl) + 0.035, side * (halfW(P.cowl) + 0.035), mats.black);
      arm.castShadow = false;
      const mirror = this.mesh(new THREE.SphereGeometry(0.085, 18, 12), paint);
      mirror.scale.set(0.62, 0.64, 1.18);
      mirror.position.set(X(P.cowl - 0.032), beltAt(P.cowl) + 0.085, side * (halfW(P.cowl) + 0.095));
    });
  }

  buildWheels() {
    const { car, L, radius, axles, halfW, mats } = this;
    const width = car.cat === 'sport' || car.body === 'supercar' ? 0.27 : 0.22;
    const tireGeo = new THREE.CylinderGeometry(radius, radius, width, 44);
    tireGeo.rotateX(Math.PI / 2);
    const rimR = radius * 0.72;
    const barrelGeo = new THREE.CylinderGeometry(rimR, rimR, width + 0.006, 36, 1, true);
    barrelGeo.rotateX(Math.PI / 2);
    const faceGeo = new THREE.CircleGeometry(rimR, 36);
    const lipGeo = new THREE.TorusGeometry(rimR, 0.012, 8, 44);
    const hubGeo = new THREE.CylinderGeometry(radius * 0.17, radius * 0.19, 0.03, 18);
    hubGeo.rotateX(Math.PI / 2);
    const rotorGeo = new THREE.CylinderGeometry(radius * 0.56, radius * 0.56, 0.018, 30);
    rotorGeo.rotateX(Math.PI / 2);
    const spokeGeo = new RoundedBoxGeometry(rimR * 0.86, 0.044, 0.022, 2, 0.008);
    this.disposables.push(tireGeo, barrelGeo, faceGeo, lipGeo, hubGeo, rotorGeo, spokeGeo);
    const spokes = car.cat === 'classic' ? 12 : 10;

    axles.forEach((x) => [1, -1].forEach((side) => {
      const outer = halfW(0.5 + x / L) + 0.006;
      const wheel = new THREE.Group();
      wheel.position.set(x, radius, side * (outer - width / 2));
      this.root.add(wheel);
      const tire = new THREE.Mesh(tireGeo, mats.tire); tire.castShadow = true; wheel.add(tire);
      wheel.add(new THREE.Mesh(barrelGeo, mats.metal));
      const face = new THREE.Mesh(faceGeo, mats.black);
      face.position.z = side * (width / 2 - 0.03);
      if (side < 0) face.rotation.y = Math.PI;
      wheel.add(face);
      const rotor = new THREE.Mesh(rotorGeo, mats.engine);
      rotor.position.z = side * (width / 2 - 0.024);
      wheel.add(rotor);
      const lip = new THREE.Mesh(lipGeo, mats.metal);
      lip.position.z = side * (width / 2 + 0.002);
      wheel.add(lip);
      const hub = new THREE.Mesh(hubGeo, mats.metal);
      hub.position.z = side * (width / 2 - 0.001);
      wheel.add(hub);
      for (let s = 0; s < spokes; s++) {
        const spoke = new THREE.Mesh(spokeGeo, mats.metal);
        const angle = (s / spokes) * Math.PI * 2 + (s % 2 ? 0.1 : -0.1);
        spoke.position.set(Math.cos(angle) * rimR * 0.5, Math.sin(angle) * rimR * 0.5, side * (width / 2 - 0.008));
        spoke.rotation.z = angle;
        wheel.add(spoke);
      }
    }));
  }

  buildDetails() {
    const { X, beltAt, halfW, mats, H, W, P, clearance, axles, car } = this;
    [1, -1].forEach((side) => {
      const tHead = 0.965, tTail = 0.022;
      const housing = this.box(0.13, 0.085, 0.47, X(tHead), beltAt(tHead) - 0.055, side * halfW(tHead) * 0.67, mats.gloss, this.root, 0.03);
      housing.rotation.y = -side * 0.5;
      const blade = this.box(0.135, 0.024, 0.42, X(tHead) + 0.006, beltAt(tHead) - 0.04, side * halfW(tHead) * 0.67, mats.head, this.root, 0.01);
      blade.rotation.y = -side * 0.5; blade.castShadow = false;
      const lamp = this.box(0.13, 0.03, 0.14, X(tHead) + 0.012, beltAt(tHead) - 0.078, side * halfW(tHead) * 0.58, mats.head, this.root, 0.012);
      lamp.rotation.y = -side * 0.5; lamp.castShadow = false;
      const tail = this.box(0.09, 0.055, 0.46, X(tTail), beltAt(tTail) - 0.06, side * halfW(tTail) * 0.68, mats.tail, this.root, 0.02);
      tail.rotation.y = side * 0.42; tail.castShadow = false;

      // Door shut-lines and handles.
      const sideZ = side * (halfW(0.47) + 0.004);
      const doorFront = P.cowl - 0.012, doorRear = lerp(P.wsTop, P.roofEnd, car.seats > 2 ? 0.47 : 0.98);
      const lower = clearance + 0.075, upper = beltAt(0.47) - 0.012;
      [doorFront, doorRear].forEach((t) => this.box(0.006, upper - lower, 0.004, X(t), (upper + lower) / 2, side * (halfW(t) + 0.004), mats.black).castShadow = false);
      if (car.seats > 2 && P.roofEnd - P.deck < 0.3 && !P.bed) {
        const rearDoor = Math.max(P.roofEnd - 0.015, axles[1] / this.L + 0.5 + 0.085);
        this.box(0.006, upper - lower - 0.05, 0.004, X(rearDoor), (upper + lower) / 2 + 0.025, side * (halfW(rearDoor) + 0.004), mats.black).castShadow = false;
        this.box(0.12, 0.024, 0.016, X(doorRear - 0.03), upper - 0.075, side * (halfW(doorRear - 0.03) + 0.006), mats.metal, this.root, 0.008);
      }
      this.box(0.12, 0.024, 0.016, X(doorFront - 0.17), upper - 0.075, sideZ, mats.metal, this.root, 0.008);
      this.box(this.L * 0.44, 0.045, 0.012, X(0.49), clearance + 0.035, side * (halfW(0.49) * 0.965), mats.black).castShadow = false;
    });

    // Radiator support: ties the headlights together when the hood is open.
    this.box(0.08, 0.1, W * 0.74, X(0.95), beltAt(0.95) - 0.085, 0, mats.black).castShadow = false;
    const noseY = H * Math.max(0.2, P.nose * 0.56);
    const grille = this.box(0.05, H * 0.115, halfW(1) * 1.08, X(0.998), noseY + 0.03, 0, mats.gloss, this.root, 0.018);
    grille.castShadow = false;
    for (let i = -4; i <= 4; i++) this.box(0.012, H * 0.09, 0.012, X(0.998) + 0.024, noseY + 0.03, (i / 4) * halfW(1) * 0.48, mats.metal).castShadow = false;
    this.box(0.05, H * 0.065, halfW(1) * 1.34, X(0.992), clearance + H * 0.055, 0, mats.black, this.root, 0.018).castShadow = false;
    this.box(0.04, 0.05, halfW(0) * 1.1, X(0.002), H * 0.32, 0, mats.gloss, this.root, 0.012).castShadow = false;
    this.box(0.05, H * 0.07, W * 0.62, X(0.006), clearance + H * 0.045, 0, mats.black, this.root, 0.018).castShadow = false;
    const exhausts = car.cyl >= 6 || car.cat === 'sport' ? [0.3, 0.2, -0.2, -0.3] : [0.26];
    exhausts.forEach((f) => {
      const geometry = new THREE.CylinderGeometry(0.04, 0.04, 0.12, 18);
      geometry.rotateZ(Math.PI / 2);
      const tip = this.mesh(geometry, mats.metal, this.root, false);
      tip.position.set(X(0.0), clearance + 0.05, f * W);
    });
  }

  buildInterior() {
    const { car, H, W, P, X, mats } = this;
    const cabinFront = X(P.cowl) - 0.03;
    const belt = H * P.belt;
    const floorY = this.clearance + 0.085;
    const rearLimit = X(Math.max(P.deck, P.roofEnd - 0.08));
    const cabinLength = Math.max(0.95, cabinFront - rearLimit);
    this.box(cabinLength + 0.3, 0.02, W * 0.84, cabinFront - cabinLength / 2, floorY, 0, mats.trim);
    [1, -1].forEach((side) => {
      this.box(cabinLength + 0.2, belt - floorY - 0.03, 0.03, cabinFront - cabinLength / 2, (belt + floorY) / 2 - 0.012, side * W * 0.415, mats.trim);
      this.box(cabinLength * 0.82, 0.035, 0.07, cabinFront - cabinLength / 2, belt - 0.2, side * W * 0.39, mats.dash, this.root, 0.012);
      this.box(cabinLength + 0.2, 0.018, W * 0.075, cabinFront - cabinLength / 2, belt + 0.004, side * W * 0.452, mats.trim);
    });
    this.box(0.5, belt - floorY - 0.04, W * 0.82, cabinFront + 0.08, (belt + floorY) / 2 - 0.03, 0, mats.dash);
    const top = this.box(0.62, 0.075, W * 0.82, cabinFront - 0.05, belt - 0.022, 0, mats.leather, this.root, 0.03);
    top.rotation.z = -0.07;
    this.box(0.012, 0.012, W * 0.78, cabinFront - 0.33, belt - 0.052, 0, mats.stitch);

    const seatZ = Math.min(0.37, W * 0.2);
    const seatX = cabinFront - 0.94;
    const headY = floorY + Math.min(0.86, H * 0.97 - floorY - 0.15);
    this.seat(seatX, floorY, seatZ);
    this.seat(seatX, floorY, -seatZ);
    this.driver = new THREE.Vector3(seatX + 0.06, headY, -seatZ);
    this.rearEye = new THREE.Vector3(seatX - 0.16, headY - 0.02, seatZ * 0.4);
    const rearX = seatX - 0.78;
    if (car.seats > 2 && rearX > X(P.deck) + 0.18) {
      this.box(0.5, 0.14, W * 0.72, rearX, floorY + 0.2, 0, mats.leather, this.root, 0.05);
      const back = this.box(0.13, 0.52, W * 0.72, rearX - 0.24, floorY + 0.5, 0, mats.leather, this.root, 0.05);
      back.rotation.z = 0.17;
      [-0.3, 0, 0.3].forEach((f) => this.box(0.08, 0.13, 0.2, rearX - 0.3, floorY + 0.82, f * W * 0.72, mats.black, this.root, 0.03));
      this.rearEye = new THREE.Vector3(rearX + 0.02, headY - 0.03, seatZ * 0.62);
    }

    this.box(0.68, 0.14, 0.18, seatX + 0.3, floorY + 0.19, 0, mats.dash, this.root, 0.035);
    const shifter = this.mesh(new THREE.CylinderGeometry(0.014, 0.02, 0.11, 14), mats.metal);
    shifter.position.set(seatX + 0.42, floorY + 0.31, 0);
    const knob = this.mesh(new THREE.SphereGeometry(0.034, 18, 12), mats.black);
    knob.position.set(seatX + 0.42, floorY + 0.38, 0);

    const wheel = new THREE.Group();
    wheel.position.set(cabinFront - 0.42, belt - 0.13, -seatZ);
    wheel.rotation.z = 0.3;
    this.root.add(wheel);
    const ringGeo = new THREE.TorusGeometry(0.18, 0.021, 14, 56);
    ringGeo.rotateY(Math.PI / 2);
    this.mesh(ringGeo, mats.leather, wheel);
    this.box(0.04, 0.095, 0.12, 0, 0, 0, mats.black, wheel, 0.016);
    [Math.PI / 2, -Math.PI / 2, Math.PI].forEach((a) => {
      const spoke = this.box(0.016, 0.17, 0.035, 0, Math.sin(a) * 0, 0, mats.metal, wheel, 0.006);
      spoke.position.set(0, Math.cos(a) * 0.09, Math.sin(a) * 0.09);
      spoke.rotation.x = -a;
    });
    const column = this.mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.3, 14), mats.black);
    column.rotation.z = Math.PI / 2 - 0.3;
    column.position.set(cabinFront - 0.27, belt - 0.085, -seatZ);

    const binnacle = this.box(0.13, 0.17, 0.42, cabinFront - 0.29, belt - 0.015, -seatZ, mats.black, this.root, 0.035);
    binnacle.castShadow = false;
    const clusterTexture = this.clusterTexture();
    const cluster = this.mesh(new THREE.PlaneGeometry(0.36, 0.143), new THREE.MeshBasicMaterial({ map: clusterTexture, toneMapped: false }), this.root, false);
    cluster.position.set(cabinFront - 0.357, belt - 0.02, -seatZ);
    cluster.rotation.y = -Math.PI / 2;
    this.disposables.push(clusterTexture, cluster.material);

    if (car.screen > 0) {
      const screenW = Math.min(0.4, car.screen * 0.0254 * 0.872);
      const screenH = screenW * 0.56;
      const frame = this.box(0.02, screenH + 0.024, screenW + 0.024, cabinFront - 0.36, belt - 0.03, 0, mats.gloss, this.root, 0.008);
      frame.castShadow = false;
      const texture = this.screenTexture();
      const screen = this.mesh(new THREE.PlaneGeometry(screenW, screenH), new THREE.MeshBasicMaterial({ map: texture, toneMapped: false }), this.root, false);
      screen.position.set(cabinFront - 0.372, belt - 0.03, 0);
      screen.rotation.y = -Math.PI / 2;
      this.disposables.push(texture, screen.material);
    } else {
      [-0.08, 0.08].forEach((z) => {
        const vent = this.mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.014, 24), mats.metal, this.root, false);
        vent.rotation.z = Math.PI / 2;
        vent.position.set(cabinFront - 0.335, belt - 0.07, z);
      });
    }
  }

  seat(x, floorY, z) {
    const { leather, black, stitch } = this.mats;
    const cushion = this.box(0.5, 0.13, 0.46, x, floorY + 0.2, z, leather, this.root, 0.05);
    cushion.rotation.z = 0.07;
    const back = this.box(0.13, 0.62, 0.45, x - 0.27, floorY + 0.53, z, leather, this.root, 0.055);
    back.rotation.z = 0.2;
    [1, -1].forEach((side) => {
      const bolster = this.box(0.14, 0.48, 0.055, x - 0.25, floorY + 0.5, z + side * 0.215, black, this.root, 0.024);
      bolster.rotation.z = 0.2;
    });
    const strip = this.box(0.008, 0.5, 0.03, x - 0.195, floorY + 0.52, z, stitch);
    strip.rotation.z = 0.2;
    const headrest = this.box(0.1, 0.17, 0.25, x - 0.36, floorY + 0.92, z, black, this.root, 0.04);
    headrest.rotation.z = 0.16;
  }

  clusterTexture() {
    const { car } = this;
    return canvasTexture(720, 286, (g, w, h) => {
      g.fillStyle = '#05060a'; g.fillRect(0, 0, w, h);
      const gauge = (cx, label, max, value) => {
        const r = 108, start = Math.PI * 0.75, sweep = Math.PI * 1.5;
        g.lineCap = 'round'; g.lineWidth = 11; g.strokeStyle = '#2c2f39';
        g.beginPath(); g.arc(cx, 148, r, start, start + sweep); g.stroke();
        g.strokeStyle = car.cluster === 'd' ? '#ff4d2e' : '#f1f1ea';
        g.beginPath(); g.arc(cx, 148, r, start, start + sweep * value); g.stroke();
        g.fillStyle = '#fff'; g.font = '700 44px sans-serif'; g.textAlign = 'center'; g.fillText(String(max), cx, 160);
        g.fillStyle = '#9aa0ad'; g.font = '600 21px sans-serif'; g.fillText(label, cx, 196);
      };
      gauge(170, 'km/h', car.top, 0.72);
      gauge(550, 'hp', car.hp, 0.86);
      g.fillStyle = '#ffb627'; g.font = '800 30px sans-serif'; g.textAlign = 'center';
      g.fillText(car.engine, 360, 150);
    });
  }

  screenTexture() {
    const { car } = this;
    return canvasTexture(640, 360, (g, w, h) => {
      const bg = g.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, '#1b2033'); bg.addColorStop(1, '#090a12');
      g.fillStyle = bg; g.fillRect(0, 0, w, h);
      g.fillStyle = '#ff4d2e'; g.fillRect(0, 0, 8, h);
      g.fillStyle = '#fff'; g.font = '800 42px sans-serif'; g.fillText(car.name.slice(0, 24), 36, 76);
      const cells = [[`${car.hp}`, 'hp'], [`${car.nm}`, 'Nm'], [`${car.top}`, 'km/h'], [`${car.acc}s`, '0-100']];
      cells.forEach(([value, label], i) => {
        const x = 36 + (i % 2) * 290, y = 130 + Math.floor(i / 2) * 104;
        g.fillStyle = 'rgba(255,255,255,.09)'; g.fillRect(x, y, 268, 88);
        g.fillStyle = '#fff'; g.font = '700 38px sans-serif'; g.fillText(value, x + 18, y + 56);
        g.fillStyle = '#9aa0ad'; g.font = '600 20px sans-serif'; g.fillText(label, x + 165, y + 56);
      });
    });
  }

  buildEngine() {
    const { car, P, X, H, W, mats, clearance, halfW } = this;
    const t = car.rearEngine ? P.deck * 0.52 : lerp(P.cowl, 1, 0.44);
    const centerX = X(t);
    const lidHeight = this.beltAt(t);
    const available = lidHeight - clearance - 0.1;
    const blockH = Math.max(0.13, Math.min(0.27, available * 0.58));
    const y = clearance + 0.07 + blockH / 2;
    const bayLength = car.rearEngine ? P.deck * this.L * 0.9 : (1 - P.cowl) * this.L * 0.86;
    this.box(bayLength, 0.012, halfW(t) * 1.84, centerX, clearance + 0.04, 0, mats.black).castShadow = false;
    const engine = new THREE.Group();
    engine.position.set(centerX, y, 0);
    this.root.add(engine);
    this.engineCenter = new THREE.Vector3(centerX, y + 0.05, 0);

    const count = Math.max(2, Math.min(car.cyl || 4, 16));
    const type = car.engine[0];
    const banks = type === 'V' || type === 'W' || type === 'B' ? 2 : 1;
    const perBank = Math.ceil(count / banks);
    const blockL = Math.min(bayLength * 0.72, 0.12 * perBank + 0.17);
    const blockW = banks === 2 ? Math.min(W * 0.44, 0.54) : 0.27;
    this.box(blockL, blockH, blockW, 0, 0, 0, mats.engine, engine, 0.02);
    for (let bank = 0; bank < banks; bank++) {
      const z = banks === 2 ? (bank ? 1 : -1) * blockW * 0.29 : 0;
      this.box(blockL * 0.95, 0.05, banks === 2 ? blockW * 0.34 : blockW * 0.74, 0, blockH / 2 + 0.028, z, mats.accent, engine, 0.016);
      for (let c = 0; c < perBank; c++) {
        const px = perBank === 1 ? 0 : -blockL * 0.4 + (c / (perBank - 1)) * blockL * 0.8;
        const coil = this.mesh(new THREE.CylinderGeometry(0.017, 0.017, 0.05, 10), mats.black, engine);
        coil.position.set(px, blockH / 2 + 0.07, z);
      }
    }
    if (car.asp === 'T' || car.asp === 'TT') {
      (car.asp === 'TT' ? [-1, 1] : [1]).forEach((side) => {
        const turbo = this.mesh(new THREE.TorusGeometry(0.05, 0.028, 10, 22), mats.metal, engine);
        turbo.position.set(blockL * 0.2, 0, side * (blockW / 2 + 0.06));
      });
    }
    if (car.asp === 'S') this.box(blockL * 0.7, 0.05, blockW * 0.42, 0, blockH / 2 + 0.085, 0, mats.metal, engine, 0.015);
    const radiator = this.box(0.035, Math.min(blockH * 1.15, 0.28), W * 0.52, car.rearEngine ? -blockL * 0.68 : blockL * 0.68, 0.01, 0, mats.black, engine);
    radiator.castShadow = false;
  }

  buildGround() {
    const geometry = new THREE.CircleGeometry(8, 72);
    const texture = canvasTexture(512, 512, (g, w, h) => {
      const gradient = g.createRadialGradient(w / 2, h / 2, 8, w / 2, h / 2, w / 2);
      gradient.addColorStop(0, 'rgba(58,62,80,.82)');
      gradient.addColorStop(0.42, 'rgba(30,32,44,.6)');
      gradient.addColorStop(1, 'rgba(10,11,16,0)');
      g.fillStyle = gradient; g.fillRect(0, 0, w, h);
    });
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false });
    const ground = new THREE.Mesh(geometry, material);
    ground.rotation.x = -Math.PI / 2;
    ground.renderOrder = -2;
    const shadowGeometry = new THREE.PlaneGeometry(12, 12);
    const shadowMaterial = new THREE.ShadowMaterial({ opacity: 0.62 });
    const shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.001;
    shadow.receiveShadow = true;
    this.scene.add(ground, shadow);
    this.disposables.push(geometry, texture, material, shadowGeometry, shadowMaterial);
  }

  viewPose(name) {
    const { L, H } = this;
    const d = Math.max(L, 3.6);
    const center = new THREE.Vector3(0, H * 0.46, 0);
    switch (name) {
      case 'front': return { pos: new THREE.Vector3(d * 1.75, H * 0.8, 0.001), target: center };
      case 'side': return { pos: new THREE.Vector3(0.001, H * 0.72, d * 1.95), target: center };
      case 'rear': return { pos: new THREE.Vector3(-d * 1.75, H * 0.92, 0.001), target: center };
      case 'driver': return { pos: this.driver.clone(), target: this.driver.clone().add(new THREE.Vector3(0.05, -0.009, 0.004)), inside: true };
      case 'rearseat': return { pos: this.rearEye.clone(), target: this.rearEye.clone().add(new THREE.Vector3(0.05, -0.006, -0.009)), inside: true };
      case 'engine': {
        const c = this.engineCenter, dir = this.car.rearEngine ? -1 : 1;
        const back = this.car.rearEngine ? 1.3 : 1.75, up = this.car.rearEngine ? 2.05 : 1.45;
        return { pos: new THREE.Vector3(c.x + dir * back, c.y + up, 1.05), target: c.clone(), close: true };
      }
      default: return { pos: new THREE.Vector3(d * 1.2, H * 1.12, d * 1.42), target: center };
    }
  }

  setView(name, instant = false) {
    this.viewName = name;
    const pose = this.viewPose(name);
    this.hoodTarget = name === 'engine' ? 1 : 0;
    Object.assign(this.controls, pose.inside
      ? { enableZoom: false, minDistance: 0.01, maxDistance: 0.2, minPolarAngle: 0.45, maxPolarAngle: 2.3, rotateSpeed: -0.42 }
      : { enableZoom: true, minDistance: pose.close ? 1.2 : Math.max(this.L * 0.62, 2.6), maxDistance: 14, minPolarAngle: 0.15, maxPolarAngle: Math.PI / 2 - 0.025, rotateSpeed: 0.8 });
    this.camera.fov = pose.inside ? 70 : 32;
    this.camera.updateProjectionMatrix();
    this.applyAutoRotate();
    if (instant) {
      this.camera.position.copy(pose.pos);
      this.controls.target.copy(pose.target);
      this.controls.update();
      this.transition = null;
      return;
    }
    this.transition = { start: performance.now(), fromPos: this.camera.position.clone(), fromTarget: this.controls.target.clone(), pose };
  }

  applyAutoRotate() { this.controls.autoRotate = this.autoRotate && this.viewName === 'orbit'; }
  setAutoRotate(value) { this.autoRotate = value; this.applyAutoRotate(); }
  setPaint(color) { this.paint.color.set(color); }

  resize() {
    const width = this.container.clientWidth, height = this.container.clientHeight;
    if (!width || !height) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  tick() {
    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.25);
    this.lastTime = now;
    this.hoodAmount += (this.hoodTarget - this.hoodAmount) * Math.min(1, dt * 6);
    if (this.hood) this.hood.rotation.z = this.hoodSign * this.hoodAmount * 1.02;
    if (this.transition) {
      const tr = this.transition;
      const p = clamp01((now - tr.start) / 850);
      const e = smooth(p);
      this.camera.position.lerpVectors(tr.fromPos, tr.pose.pos, e);
      this.controls.target.lerpVectors(tr.fromTarget, tr.pose.target, e);
      this.camera.lookAt(this.controls.target);
      if (p >= 1) { this.transition = null; this.controls.update(); }
    } else this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.renderer.setAnimationLoop(null);
    this.resizeObserver.disconnect();
    this.controls.dispose();
    this.disposables.forEach((item) => item.dispose?.());
    Object.values(this.mats).forEach((m) => m.dispose());
    this.paint.dispose();
    this.envTexture.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
