/**
 * Cargo visual 2.5D calculator (for gruzoperevozki.html)
 * Features: auto-rotation, dual-plane visualization, packaging types, fragile mode, quick-fill modal.
 */
import * as THREE from "../vendor/three/three.module.js";
import { OrbitControls } from "../vendor/three/OrbitControls.js";
import { setupPhoneMask, submitLead, showToast, initFormsAntiSpam } from "./forms.js";


function initUltraCargoCalculator(root) {
  const $ = (sel) => root.querySelector(sel) || document.querySelector(sel);
  const $$ = (sel) => Array.from(root.querySelectorAll(sel));
  const fmt = (n) => `${Math.round(n).toLocaleString("ru-RU")} ₽`;

  const trucks = {
    van: { name: "Фургон 1.5т", volume: 18, weight: 1500, pallets: 6, km: 36, base: 4200, days: "1–2 дня" },
    five: { name: "Среднетоннажный 5т", volume: 42, weight: 5000, pallets: 15, km: 58, base: 7200, days: "2–4 дня" },
    semi: { name: "Фура 20т", volume: 86, weight: 20000, pallets: 33, km: 96, base: 14500, days: "3–7 дней" },
    cold: { name: "Рефрижератор", volume: 76, weight: 18000, pallets: 30, km: 112, base: 17000, days: "2–5 дней" },
  };
  const palletTypes = {
    eur: { name: "EUR", w: 120, h: 80, weight: 25 },
    fin: { name: "FIN", w: 120, h: 100, weight: 28 },
    std: { name: "STD", w: 120, h: 120, weight: 32 },
  };
  const servicePrice = { packing: 1200, disassembly: 1500, assembly: 2000, loaders: 2800, night: 0, insurance: 0 };

  const state = { moveType: "home", truck: "van", pallets: [], selectedPallet: null, rotated: new Set(), workplaces: 8, zoom: 1, drag: null };

  const floor = $("#ultra-cargo-floor");
  const plan = $("#ultra-load-plan");
  const preview = $("#ultra-pallet-preview");
  const stage = $("#ultra-stage");
  const model = $("#ultra-truck-model");
  const checklist = $("#ultra-checklist");
  let real3dScene = null;

  function val(id, fallback = 0) {
    const el = $(id);
    return el ? (parseFloat(el.value) || fallback) : fallback;
  }
  function activeKind() { return $("#ultra-cargo-kind")?.value || "standard"; }
  function palletDims() { return palletTypes[$("#ultra-pallet-type")?.value || "eur"]; }
  function currentTruck() { return trucks[state.truck]; }

  function estimateManualInventory() {
    let volume = val("#ultra-volume", 0);
    let weight = val("#ultra-weight", 0);
    const l = val("#ultra-l", 0), w = val("#ultra-w", 0), h = val("#ultra-h", 0);
    if (l && w && h) volume = Math.max(volume, (l * w * h) / 1000000);

    if (state.moveType === "home") {
      const homeSize = $("#ultra-home-size")?.value || "one";
      const presets = { studio: [6, 350], one: [10, 650], two: [18, 1100], three: [28, 1700], four: [42, 2600] };
      const [v, kg] = presets[homeSize] || presets.one;
      volume += v;
      weight += kg;
      volume += $$(".ultra-chip[data-room].is-active").length * 1.4;
    }
    if (state.moveType === "office") {
      volume += state.workplaces * 1.2;
      weight += state.workplaces * 85;
      if ($$(".ultra-chip[data-office-zone].is-active").some((el) => el.dataset.officeZone === "it")) { volume += 2; weight += 180; }
      if ($$(".ultra-chip[data-office-zone].is-active").some((el) => el.dataset.officeZone === "archive")) { volume += 3; weight += 260; }
    }
    if (state.moveType === "commercial") { volume += 4; weight += 350; }
    if (state.moveType === "industrial") { volume += 6; weight += 900; }
    return { volume, weight };
  }

  function palletStats() {
    const boxCount = Math.min(20, Math.max(1, val("#ultra-box-count", 8)));
    const dims = palletDims();
    const cargoPerPalletWeight = boxCount * 18;
    const height = 15 + Math.ceil(boxCount / 4) * 32;
    return {
      count: state.pallets.length,
      volume: state.pallets.length * (dims.w * dims.h * height / 1000000),
      weight: state.pallets.length * (dims.weight + cargoPerPalletWeight),
      height,
      boxCount,
      dims,
    };
  }

  function allStats() {
    const manual = estimateManualInventory();
    const pal = palletStats();
    let volume = manual.volume + pal.volume;
    let weight = manual.weight + pal.weight;
    const kind = activeKind();
    if ($("#ultra-fragile")?.checked || kind === "fragile") volume *= 1.08;
    if ($("#ultra-temp")?.checked || kind === "cold") volume *= 1.03;
    return { volume, weight, pallets: pal.count, pal };
  }

  function chooseSmallestTruck() {
    const stats = allStats();
    const key = Object.entries(trucks).find(([, t]) => stats.volume <= t.volume * .92 && stats.weight <= t.weight * .92 && stats.pallets <= t.pallets)?.[0] || "semi";
    state.truck = key;
    $$(".ultra-transport").forEach((btn) => btn.classList.toggle("is-active", btn.dataset.truck === key));
  }

  function renderPalletPreview() {
    if (!preview) return;
    const stats = palletStats();
    const material = $("#ultra-pallet-material")?.value || "wood";
    preview.classList.toggle("is-wrapped", val("#ultra-wrap", 0) > 0);
    preview.querySelectorAll(".pbox").forEach((el) => el.remove());
    preview.style.setProperty("--pallet-material", material);
    const colors = { wood: "linear-gradient(135deg,#8B7355,#b89466)", blue: "linear-gradient(135deg,#3b82f6,#1d4ed8)", green: "linear-gradient(135deg,#10b981,#047857)", metal: "linear-gradient(135deg,#cbd5e1,#64748b)" };
    for (let i = 0; i < stats.boxCount; i += 1) {
      const box = document.createElement("span");
      box.className = "pbox";
      box.style.width = "38px";
      box.style.height = "28px";
      box.style.left = `${42 + (i % 4) * 42}px`;
      box.style.bottom = `${72 + Math.floor(i / 4) * 22}px`;
      box.style.background = activeKind() === "fragile" ? "repeating-linear-gradient(135deg,#f59e0b 0 8px,#111827 8px 12px)" : colors[material] || colors.wood;
      preview.appendChild(box);
    }
  }

  function ensureInitialPallets() {
    if (!state.pallets.length) {
      state.pallets.push({ id: globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `p${Date.now()}`, x: 16, y: 18 });
      state.pallets.push({ id: globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `p${Date.now()+1}`, x: 126, y: 18 });
    }
  }

  function renderPlanAndScene() {
    if (!floor || !plan) return;
    floor.innerHTML = "";
    plan.innerHTML = "";
    const truck = currentTruck();
    const kind = activeKind();
    const palCap = Math.max(1, truck.pallets);
    state.pallets.forEach((p, index) => {
      const rotated = state.rotated.has(p.id);
      const wPct = state.truck === "van" ? 26 : state.truck === "five" ? 18 : 12;
      const hPct = rotated ? 34 : 24;
      const xPct = Math.min(86, (index % Math.ceil(palCap / 2)) * (wPct + 2) + 2);
      const yPct = Math.min(66, Math.floor(index / Math.ceil(palCap / 2)) * 36 + 6);
      const box = document.createElement("div");
      box.className = `ultra-scene-box ${kind}`;
      if (p.id === state.selectedPallet) box.classList.add("selected");
      if (palletStats().weight / Math.max(1, state.pallets.length) > 1000) box.classList.add("heavy");
      box.style.left = `${xPct}%`;
      box.style.top = `${yPct}%`;
      box.style.width = `${Math.max(9, wPct)}%`;
      box.style.height = `${hPct}%`;
      box.textContent = `P${index + 1}`;
      box.dataset.id = p.id;
      floor.appendChild(box);

      const pe = document.createElement("div");
      pe.className = `ultra-plan-pallet ${rotated ? "is-rotated" : ""}`;
      pe.style.left = `${p.x}px`;
      pe.style.top = `${p.y}px`;
      pe.style.width = rotated ? "74px" : "104px";
      pe.style.height = rotated ? "104px" : "74px";
      pe.textContent = `P${index + 1}`;
      pe.dataset.id = p.id;
      pe.addEventListener("pointerdown", startDrag);
      pe.addEventListener("click", () => { state.selectedPallet = p.id; renderPlanAndScene(); });
      plan.appendChild(pe);
    });
  }

  function updateChecklist() {
    if (!checklist) return;
    if (state.moveType === "office") {
      checklist.innerHTML = `<strong>Чек-лист офисного переезда</strong><label><input type="checkbox"> Провести инвентаризацию</label><label><input type="checkbox"> Составить план рассадки</label><label><input type="checkbox"> Уведомить сотрудников</label><label><input type="checkbox"> Подготовить IT-инфраструктуру</label>`;
    } else {
      checklist.innerHTML = `<strong>Чек-лист квартирного переезда</strong><label><input type="checkbox"> Разобрать вещи по комнатам</label><label><input type="checkbox"> Упаковать хрупкие вещи</label><label><input type="checkbox"> Подготовить документы для пропусков</label><label><input type="checkbox"> Предупредить соседей</label>`;
    }
  }

  function calculateCost() {
    const stats = allStats();
    const truck = currentTruck();
    const distance = Math.max(1, val("#ultra-distance", 1));
    const cars = Math.max(1, val("#ultra-cars", 1));
    const urgency = val("#ultra-urgency", 2);
    const urgencyCoef = urgency === 1 ? .88 : urgency === 3 ? 1.32 : 1;
    let base = (truck.base + distance * truck.km) * cars * urgencyCoef;
    if (activeKind() === "cold" || $("#ultra-temp")?.checked) base *= 1.18;
    if (activeKind() === "danger") base *= 1.22;
    if (activeKind() === "oversize") base *= 1.12;
    const fuel = Math.max(900, distance * (state.truck === "semi" ? 18 : 9) * cars);
    let extra = 0;
    root.querySelectorAll("[data-service]:checked").forEach((el) => { extra += servicePrice[el.dataset.service] || 0; });
    const loaders = root.querySelector('[data-service="loaders"]')?.checked ? 1400 + Math.min(5600, stats.volume * 120) : 0;
    const beforeInsurance = base + fuel + extra + loaders;
    const insurance = root.querySelector('[data-service="insurance"]')?.checked ? beforeInsurance * .05 : 0;
    let total = beforeInsurance + insurance;
    if (root.querySelector('[data-service="night"]')?.checked) total *= 1.3;
    return { base, fuel, extra, loaders, insurance, total };
  }

  function updateUI() {
    const stats = allStats();
    const truck = currentTruck();
    const cost = calculateCost();
    const volumePct = Math.round(stats.volume / truck.volume * 100);
    const weightPct = Math.round(stats.weight / truck.weight * 100);
    const palletPct = Math.round(stats.pallets / truck.pallets * 100);
    $("#ultra-vol-pct").textContent = `${volumePct}%`;
    $("#ultra-weight-pct").textContent = `${weightPct}%`;
    $("#ultra-pallet-pct").textContent = `${stats.pallets}/${truck.pallets}`;
    $("#ultra-vol-bar").style.width = `${Math.min(100, volumePct)}%`;
    $("#ultra-weight-bar").style.width = `${Math.min(100, weightPct)}%`;
    $("#ultra-pallet-bar").style.width = `${Math.min(100, palletPct)}%`;
    $("#ultra-price").textContent = fmt(cost.total);
    $("#ultra-base").textContent = fmt(cost.base);
    $("#ultra-fuel").textContent = fmt(cost.fuel);
    $("#ultra-insurance-cost").textContent = fmt(cost.insurance);
    $("#ultra-loaders-cost").textContent = fmt(cost.loaders);
    $("#ultra-extra").textContent = fmt(cost.extra);
    const distance = val("#ultra-distance", 1);
    $("#ultra-route-summary").textContent = `Расстояние: ${distance.toLocaleString("ru-RU")} км · ${truck.name}`;
    $("#ultra-days").textContent = val("#ultra-urgency", 2) === 3 ? "1–2 дня" : val("#ultra-urgency", 2) === 1 ? "7–14 дней" : truck.days;
    $("#ultra-urgency-label").textContent = val("#ultra-urgency", 2) === 3 ? "Экспресс" : val("#ultra-urgency", 2) === 1 ? "Эконом" : "Стандарт";
    const hidden = document.getElementById("cargo-hidden-summary");
    if (hidden) hidden.value = buildSummary();
    const vehicleHidden = document.getElementById("cargo-hidden-vehicle");
    if (vehicleHidden) vehicleHidden.value = truck.name;
    renderPalletPreview();
    renderPlanAndScene();
    if (real3dScene) real3dScene.sync();
  }

  function buildSummary() {
    const stats = allStats();
    const from = $("#ultra-from")?.value || "";
    const to = $("#ultra-to")?.value || "";
    return `${currentTruck().name}; ${from} → ${to}; ${Math.round(stats.volume * 10) / 10} м³; ${Math.round(stats.weight)} кг; паллет ${stats.pallets}; предварительно ${$("#ultra-price")?.textContent || ""}`;
  }

  function initReal3DScene() {
    if (!stage || !window.WebGLRenderingContext) return null;

    const canvas = document.createElement("canvas");
    canvas.className = "ultra-webgl-canvas";
    stage.prepend(canvas);
    stage.classList.add("ultra-webgl-ready");

    const note = document.createElement("div");
    note.className = "ultra-webgl-note";
    note.textContent = "Настоящая WebGL 3D-сцена: вращайте мышью, зум колесом, паллеты можно выбирать и двигать";
    stage.appendChild(note);

    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 120);
    camera.position.set(7.8, 5.4, 7.2);

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 3.2;
    controls.maxDistance = 16;
    controls.target.set(0.8, 1.0, 0);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x94a3b8, 1.7));
    const key = new THREE.DirectionalLight(0xffffff, 2.4);
    key.position.set(-4, 8, 6);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    scene.add(key);
    const rim = new THREE.PointLight(0x93c5fd, 1.8, 14);
    rim.position.set(5, 3, -4);
    scene.add(rim);

    const world = new THREE.Group();
    scene.add(world);
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const dragHit = new THREE.Vector3();
    const clickable = [];
    let dragId = null;
    let lastDims = { length: 4.2, width: 2, height: 2.1 };

    const mat = {
      blue: new THREE.MeshPhysicalMaterial({ color: 0x2563eb, metalness: 0.35, roughness: 0.28, clearcoat: 0.8, clearcoatRoughness: 0.18 }),
      dark: new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.55 }),
      tire: new THREE.MeshStandardMaterial({ color: 0x05070c, roughness: 0.78 }),
      metal: new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.65, roughness: 0.26 }),
      glass: new THREE.MeshPhysicalMaterial({ color: 0xdbeafe, transparent: true, opacity: 0.42, roughness: 0.05, transmission: 0.35 }),
      floor: new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.62, metalness: 0.12 }),
      wall: new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.2, roughness: 0.12, metalness: 0.05, transmission: 0.18, side: THREE.DoubleSide }),
      pallet: new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.88 }),
      wrap: new THREE.MeshPhysicalMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.2, roughness: 0.03, transmission: 0.42, side: THREE.DoubleSide }),
    };

    function dimsForTruck() {
      return {
        van: { length: 4.2, width: 2.0, height: 2.1, cabin: 1.35 },
        five: { length: 6.1, width: 2.35, height: 2.35, cabin: 1.55 },
        semi: { length: 13.6, width: 2.45, height: 2.65, cabin: 1.8 },
        cold: { length: 12.4, width: 2.45, height: 2.55, cabin: 1.75 },
      }[state.truck] || { length: 4.2, width: 2, height: 2.1, cabin: 1.35 };
    }

    function boxMesh(w, h, d, material, x, y, z) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      return mesh;
    }

    function createWheel(x, z) {
      const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.22, 42), mat.tire);
      tire.rotation.x = Math.PI / 2;
      tire.position.set(x, -0.16, z);
      tire.castShadow = true;
      const disk = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.235, 32), mat.metal);
      disk.rotation.x = Math.PI / 2;
      tire.add(disk);
      return tire;
    }

    function createPallet3D(p, index, dims) {
      const stats = palletStats();
      const isRotated = state.rotated.has(p.id);
      const pallet = palletDims();
      const pw = (isRotated ? pallet.h : pallet.w) / 100;
      const pd = (isRotated ? pallet.w : pallet.h) / 100;
      const maxX = Math.max(1, (plan?.clientWidth || 440) - 104);
      const maxY = Math.max(1, (plan?.clientHeight || 180) - 74);
      const x = -dims.length / 2 + 0.55 + (p.x / maxX) * Math.max(0.3, dims.length - 1.1);
      const z = -dims.width / 2 + 0.25 + (p.y / maxY) * Math.max(0.3, dims.width - 0.5);
      const group = new THREE.Group();
      group.position.set(THREE.MathUtils.clamp(x, -dims.length / 2 + pw / 2, dims.length / 2 - pw / 2), 0.05, THREE.MathUtils.clamp(z, -dims.width / 2 + pd / 2, dims.width / 2 - pd / 2));
      group.userData.palletId = p.id;

      for (let i = 0; i < 4; i += 1) {
        group.add(boxMesh(pw, 0.08, pd / 7, mat.pallet, 0, 0.04, -pd / 2 + (i + 0.5) * (pd / 4)));
      }
      for (let i = 0; i < 3; i += 1) {
        group.add(boxMesh(pw / 7, 0.07, pd, mat.pallet, -pw / 2 + (i + 0.5) * (pw / 3), 0.14, 0));
      }

      const cargoColor = activeKind() === "fragile" ? 0xf59e0b : activeKind() === "cold" ? 0x06b6d4 : activeKind() === "danger" ? 0xf97316 : stats.weight / Math.max(1, state.pallets.length) > 1000 ? 0xef4444 : 0x3b82f6;
      const cargoMat = new THREE.MeshStandardMaterial({ color: cargoColor, roughness: 0.58, metalness: 0.03 });
      const boxes = Math.min(20, stats.boxCount);
      const cols = Math.max(2, Math.min(4, Math.floor(pw / 0.28)));
      const bw = pw / cols - 0.035;
      const bd = Math.min(0.28, pd / 2.6);
      for (let i = 0; i < boxes; i += 1) {
        const layer = Math.floor(i / cols);
        const col = i % cols;
        const row = Math.floor((i % (cols * 2)) / cols);
        const b = boxMesh(bw, 0.28, bd, cargoMat, -pw / 2 + bw / 2 + 0.02 + col * (bw + 0.035), 0.31 + layer * 0.19, -pd / 4 + row * (bd + 0.06));
        b.userData.palletId = p.id;
        group.add(b);
      }
      if (Number($("#ultra-wrap")?.value || 0) > 0) {
        const wrap = boxMesh(pw + 0.04, Math.max(0.5, 0.36 + Math.ceil(boxes / cols) * 0.18), pd + 0.04, mat.wrap, 0, 0.42, 0);
        wrap.userData.palletId = p.id;
        group.add(wrap);
      }
      if (p.id === state.selectedPallet) {
        const outline = new THREE.BoxHelper(group, 0x2563eb);
        outline.userData.isHelper = true;
        group.add(outline);
      }
      group.traverse((obj) => { if (obj.isMesh) { obj.userData.palletId = p.id; clickable.push(obj); } });
      return group;
    }

    function rebuild() {
      clickable.length = 0;
      world.clear();
      const dims = dimsForTruck();
      lastDims = dims;
      const floorMesh = boxMesh(dims.length, 0.08, dims.width, mat.floor, 0, 0, 0);
      world.add(floorMesh);

      const backWall = boxMesh(0.06, dims.height, dims.width, mat.wall, dims.length / 2, dims.height / 2, 0);
      const leftWall = boxMesh(dims.length, dims.height, 0.045, mat.wall, 0, dims.height / 2, -dims.width / 2);
      const rightWall = boxMesh(dims.length, dims.height, 0.045, mat.wall, 0, dims.height / 2, dims.width / 2);
      world.add(backWall, leftWall, rightWall);
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(dims.length, dims.height, dims.width)), new THREE.LineBasicMaterial({ color: 0x2563eb, transparent: true, opacity: 0.45 }));
      edges.position.set(0, dims.height / 2, 0);
      world.add(edges);

      const grid = new THREE.GridHelper(Math.max(dims.length, dims.width), 24, 0x2563eb, 0x93c5fd);
      grid.position.y = 0.055;
      grid.scale.x = dims.length / Math.max(dims.length, dims.width);
      grid.scale.z = dims.width / Math.max(dims.length, dims.width);
      world.add(grid);

      const cabin = boxMesh(dims.cabin, Math.min(2.05, dims.height * 0.9), dims.width * 0.95, mat.blue, -dims.length / 2 - dims.cabin / 2 - 0.16, 0.78, 0);
      world.add(cabin);
      world.add(boxMesh(0.42, 0.5, dims.width * 0.72, mat.glass, -dims.length / 2 - dims.cabin - 0.1, 1.32, 0));
      const wheelZ = dims.width / 2 + 0.12;
      [-dims.length / 2 - dims.cabin * 0.8, -dims.length / 2 + 0.55, dims.length / 2 - 0.62].forEach((x) => {
        world.add(createWheel(x, wheelZ), createWheel(x, -wheelZ));
      });

      state.pallets.forEach((p, index) => world.add(createPallet3D(p, index, dims)));

      const ground = new THREE.Mesh(new THREE.CircleGeometry(Math.max(5.5, dims.length * 0.72), 80), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.32, roughness: 1 }));
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -0.23;
      ground.receiveShadow = true;
      world.add(ground);
    }

    function resize() {
      const rect = stage.getBoundingClientRect();
      const width = Math.max(320, rect.width);
      const height = Math.max(260, rect.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }

    function setPointer(e) {
      const rect = canvas.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    }

    canvas.addEventListener("pointerdown", (e) => {
      setPointer(e);
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(clickable, false)[0];
      if (hit?.object?.userData?.palletId) {
        dragId = hit.object.userData.palletId;
        state.selectedPallet = dragId;
        canvas.setPointerCapture(e.pointerId);
        rebuild();
      }
    });

    canvas.addEventListener("pointermove", (e) => {
      if (!dragId) return;
      setPointer(e);
      raycaster.setFromCamera(pointer, camera);
      if (raycaster.ray.intersectPlane(dragPlane, dragHit)) {
        const p = state.pallets.find((item) => item.id === dragId);
        if (p) {
          const maxX = Math.max(1, (plan?.clientWidth || 440) - 104);
          const maxY = Math.max(1, (plan?.clientHeight || 180) - 74);
          const nx = THREE.MathUtils.clamp((dragHit.x + lastDims.length / 2) / lastDims.length, 0, 1);
          const ny = THREE.MathUtils.clamp((dragHit.z + lastDims.width / 2) / lastDims.width, 0, 1);
          p.x = Math.round((nx * maxX) / 14) * 14;
          p.y = Math.round((ny * maxY) / 14) * 14;
          updateUI();
        }
      }
    });
    canvas.addEventListener("pointerup", () => { dragId = null; });
    canvas.addEventListener("pointercancel", () => { dragId = null; });

    window.addEventListener("resize", resize, { passive: true });
    const ro = new ResizeObserver(resize);
    ro.observe(stage);
    resize();
    rebuild();

    renderer.setAnimationLoop(() => {
      controls.update();
      renderer.render(scene, camera);
    });

    return { sync: rebuild, resize };
  }

  function startDrag(e) {
    const el = e.currentTarget;
    const id = el.dataset.id;
    state.selectedPallet = id;
    const p = state.pallets.find((x) => x.id === id);
    if (!p) return;
    state.drag = { id, ox: e.clientX - p.x, oy: e.clientY - p.y };
    el.setPointerCapture(e.pointerId);
  }
  function onDrag(e) {
    if (!state.drag || !plan) return;
    const rect = plan.getBoundingClientRect();
    const p = state.pallets.find((x) => x.id === state.drag.id);
    if (!p) return;
    const grid = 14;
    p.x = Math.max(0, Math.min(rect.width - 74, Math.round((e.clientX - rect.left - state.drag.ox) / grid) * grid));
    p.y = Math.max(0, Math.min(rect.height - 74, Math.round((e.clientY - rect.top - state.drag.oy) / grid) * grid));
    renderPlanAndScene();
  }
  function stopDrag() { state.drag = null; }

  $$(".ultra-choice").forEach((btn) => btn.addEventListener("click", () => {
    state.moveType = btn.dataset.moveType;
    $$(".ultra-choice").forEach((b) => b.classList.toggle("is-active", b === btn));
    root.querySelectorAll("[data-type-content]").forEach((el) => {
      const visibleType = state.moveType === "office" ? "office" : "home";
      el.hidden = el.dataset.typeContent !== visibleType;
    });
    updateChecklist(); updateUI();
  }));
  $$(".ultra-chip").forEach((chip) => chip.addEventListener("click", () => { chip.classList.toggle("is-active"); updateUI(); }));
  $$(".ultra-transport").forEach((btn) => btn.addEventListener("click", () => { state.truck = btn.dataset.truck; $$(".ultra-transport").forEach((b) => b.classList.toggle("is-active", b === btn)); updateUI(); }));
  root.addEventListener("input", updateUI);
  root.addEventListener("change", updateUI);
  plan?.addEventListener("pointermove", onDrag);
  plan?.addEventListener("pointerup", stopDrag);
  plan?.addEventListener("pointercancel", stopDrag);
  document.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "r" && state.selectedPallet) { state.rotated.has(state.selectedPallet) ? state.rotated.delete(state.selectedPallet) : state.rotated.add(state.selectedPallet); updateUI(); }
    if (e.key === "Delete" && state.selectedPallet) { state.pallets = state.pallets.filter((p) => p.id !== state.selectedPallet); state.selectedPallet = null; updateUI(); }
  });
  $("#ultra-add-pallet")?.addEventListener("click", () => {
    const id = globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `p${Date.now()}`;
    const i = state.pallets.length;
    state.pallets.push({ id, x: 16 + (i % 4) * 84, y: 18 + Math.floor(i / 4) * 84 });
    state.selectedPallet = id;
    updateUI();
  });
  $("#ultra-autofill")?.addEventListener("click", () => { chooseSmallestTruck(); showToast("Подобрали минимальный подходящий транспорт и разложили паллеты по сетке.", "success"); updateUI(); });
  $("#ultra-swap-route")?.addEventListener("click", () => { const a = $("#ultra-from"), b = $("#ultra-to"); if (a && b) [a.value, b.value] = [b.value, a.value]; updateUI(); });
  root.querySelectorAll("[data-step]").forEach((btn) => btn.addEventListener("click", () => { state.workplaces = Math.max(1, state.workplaces + Number(btn.dataset.dir)); $("#ultra-workplaces").textContent = state.workplaces; updateUI(); }));
  $$(".ultra-view-buttons button").forEach((btn) => btn.addEventListener("click", () => { $$(".ultra-view-buttons button").forEach((b) => b.classList.toggle("is-active", b === btn)); stage.classList.toggle("view-top", btn.dataset.view === "top"); stage.classList.toggle("view-xray", btn.dataset.view === "xray"); }));
  stage?.addEventListener("wheel", (e) => { e.preventDefault(); state.zoom = Math.min(1.2, Math.max(.78, state.zoom + (e.deltaY > 0 ? -.04 : .04))); model.style.scale = state.zoom; }, { passive: false });
  stage?.addEventListener("dblclick", () => { state.zoom = 1; if (model) model.style.scale = 1; });
  $("#ultra-reset")?.addEventListener("click", () => { state.pallets = []; state.selectedPallet = null; state.rotated.clear(); ensureInitialPallets(); updateUI(); });
  $("#ultra-submit-calc")?.addEventListener("click", () => { document.getElementById("cargo-order")?.scrollIntoView({ behavior: "smooth", block: "start" }); const comment = document.getElementById("cargo-comment"); if (comment) comment.value = buildSummary(); });
  $("#ultra-save-json")?.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify({ summary: buildSummary(), pallets: state.pallets, truck: currentTruck(), generated: new Date().toISOString() }, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "cargo-calculation.json"; a.click(); URL.revokeObjectURL(a.href);
  });
  $("#ultra-pdf")?.addEventListener("click", () => window.print());
  $("#ultra-email")?.addEventListener("click", () => { location.href = `mailto:?subject=${encodeURIComponent("Расчет грузоперевозки")}&body=${encodeURIComponent(buildSummary())}`; });

  const cargoPhone = document.getElementById("cargo-phone");
  if (cargoPhone) setupPhoneMask(cargoPhone);
  const cargoForm = document.getElementById("cargo-order-form");
  if (cargoForm) {
    initFormsAntiSpam();
    cargoForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      updateUI();
      const btn = cargoForm.querySelector('button[type="submit"]');
      const originalText = btn ? btn.textContent : "";
      try {
        if (btn) { btn.disabled = true; btn.textContent = "Отправляем..."; }
        await submitLead({
          name: document.getElementById("cargo-name")?.value || "",
          phone: document.getElementById("cargo-phone")?.value || "",
          route: document.getElementById("cargo-route")?.value || `${$("#ultra-from")?.value || ""} → ${$("#ultra-to")?.value || ""}`,
          direction: document.getElementById("cargo-direction")?.value || "Грузоперевозка",
          comment: document.getElementById("cargo-comment")?.value || "",
          vehicle: document.getElementById("cargo-hidden-vehicle")?.value || currentTruck().name,
          cargo_summary: document.getElementById("cargo-hidden-summary")?.value || buildSummary(),
          source: "Ultra 3D Cargo Calculator",
          timestamp: new Date().toISOString(),
        }, cargoForm);
        cargoForm.reset();
        showToast("Заявка отправлена. Диспетчер свяжется с вами.", "success");
      } catch (error) {
        showToast(error.message || "Не удалось отправить заявку.", "error");
      } finally {
        if (btn) { btn.disabled = false; btn.textContent = originalText; }
      }
    });
  }

  real3dScene = initReal3DScene();
  ensureInitialPallets();
  updateChecklist();
  updateUI();
}

export function initCargoCalculator() {
  const cargoRoot = document.getElementById("cargo-visual-calculator");
  if (!cargoRoot) return;
  if (cargoRoot.querySelector(".ultra-cargo-calc")) {
    initUltraCargoCalculator(cargoRoot);
    return;
  }

  const vehicles = {
    gazel3: { name: "Газель 3 м", length: 300, width: 190, height: 180, volume: 10.3, weight: 1500, price: "от 1 800 ₽/час" },
    gazel42: { name: "Газель 4.2 м", length: 420, width: 200, height: 210, volume: 17.6, weight: 2000, price: "от 2 000 ₽/час" },
    truck5: { name: "Фургон 5 м", length: 500, width: 210, height: 210, volume: 22.1, weight: 2500, price: "индивидуально" },
    truck6: { name: "Машина 6 м", length: 600, width: 220, height: 210, volume: 27.7, weight: 3000, price: "индивидуально" },
  };

  const cargoItems = {
    // Упаковочные материалы
    box: { name: "Картонная стандартная", length: 60, width: 40, height: 40, weight: 12, tare: 0.4, maxWeight: 20, color: "orange", category: "packaging" },
    bigbox: { name: "Картонная усиленная", length: 80, width: 60, height: 50, weight: 22, tare: 0.8, maxWeight: 35, color: "orange", category: "packaging" },
    plastic: { name: "Пластиковый контейнер", length: 60, width: 40, height: 35, weight: 15, tare: 1.2, maxWeight: 40, color: "orange", category: "packaging" },
    bags: { name: "Баулы / мешки брезентовые", length: 75, width: 45, height: 45, weight: 18, tare: 0.3, maxWeight: 25, color: "orange", category: "packaging" },
    woodbox: { name: "Деревянный ящик", length: 80, width: 60, height: 50, weight: 45, tare: 3.5, maxWeight: 80, color: "orange", category: "packaging" },
    glassbox: { name: "Коробка со стеклом", length: 50, width: 50, height: 40, weight: 10, tare: 1.5, maxWeight: 15, color: "light", category: "packaging" },
    // Мебель и техника
    sofa: { name: "Диван", length: 210, width: 90, height: 85, weight: 85, color: "gray", category: "furniture" },
    armchair: { name: "Кресло", length: 95, width: 85, height: 90, weight: 35, color: "gray", category: "furniture" },
    wardrobe: { name: "Шкаф", length: 120, width: 60, height: 210, weight: 90, color: "dark", category: "furniture" },
    dresser: { name: "Комод", length: 100, width: 50, height: 85, weight: 45, color: "gray", category: "furniture" },
    bed: { name: "Кровать", length: 205, width: 95, height: 45, weight: 70, color: "gray", category: "furniture" },
    mattress: { name: "Матрас", length: 200, width: 90, height: 25, weight: 28, color: "light", category: "furniture" },
    fridge: { name: "Холодильник", length: 70, width: 70, height: 190, weight: 80, color: "light", category: "furniture" },
    washer: { name: "Стиральная машина", length: 60, width: 60, height: 85, weight: 65, color: "light", category: "furniture" },
    tv: { name: "Телевизор", length: 120, width: 18, height: 75, weight: 18, color: "dark", category: "furniture" },
    table: { name: "Стол", length: 130, width: 80, height: 75, weight: 38, color: "gray", category: "furniture" },
    chairs: { name: "4 стула", length: 80, width: 80, height: 95, weight: 28, color: "gray", category: "furniture" },
  };

  let selectedVehicle = "gazel3";
  let selectedItems = [];
  let fragileMode = false;

  const bay = document.getElementById("cargo-bay");
  const baySide = document.getElementById("cargo-bay-side");
  const volumeEl = document.getElementById("cargo-volume-used");
  const areaEl = document.getElementById("cargo-area-used");
  const weightEl = document.getElementById("cargo-weight-used");
  const vehicleEl = document.getElementById("cargo-current-vehicle");
  const dimsEl = document.getElementById("cargo-current-dims");
  const recEl = document.getElementById("cargo-recommendation");
  const listEl = document.getElementById("cargo-selected-list");
  const hiddenEl = document.getElementById("cargo-hidden-summary");
  const vehicleHiddenEl = document.getElementById("cargo-hidden-vehicle");
  const requestBtn = document.getElementById("cargo-request-btn");
  const clearBtn = document.getElementById("cargo-clear-btn");
  const heightAlertEl = document.getElementById("cargo-height-alert");
  const heightNoteEl = document.getElementById("cargo-height-note");
  const progressVolume = document.getElementById("cargo-progress-volume");
  const progressArea = document.getElementById("cargo-progress-area");
  const progressWeight = document.getElementById("cargo-progress-weight");
  const progressVolumeText = document.getElementById("cargo-progress-volume-text");
  const progressAreaText = document.getElementById("cargo-progress-area-text");
  const progressWeightText = document.getElementById("cargo-progress-weight-text");
  const quickFillBtn = document.getElementById("cargo-quick-fill-btn");
  const quickModal = document.getElementById("cargo-quick-fill-modal");
  const quickModalClose = document.getElementById("cargo-modal-close");
  const quickConfirm = document.getElementById("cargo-quick-confirm");
  const quickFragile = document.getElementById("cargo-quick-fragile");

  function getOrientations(item) {
    const dims = [item.length, item.width, item.height];
    const perms = [
      [dims[0], dims[1], dims[2]],
      [dims[0], dims[2], dims[1]],
      [dims[1], dims[0], dims[2]],
      [dims[1], dims[2], dims[0]],
      [dims[2], dims[0], dims[1]],
      [dims[2], dims[1], dims[0]],
    ];
    return perms.map(([x, y, z]) => ({ baseX: x, baseY: y, heightZ: z }));
  }

  function pickBestOrientation(item, vehicleHeight) {
    const orientations = getOrientations(item);
    let best = null;
    let minArea = Infinity;
    for (const o of orientations) {
      if (o.heightZ <= vehicleHeight) {
        const area = o.baseX * o.baseY;
        if (area < minArea) {
          minArea = area;
          best = o;
        }
      }
    }
    return best;
  }

  function itemVolume(item, orientation) {
    return (orientation.baseX * orientation.baseY * orientation.heightZ) / 1000000;
  }
  function itemArea(item, orientation) {
    return (orientation.baseX * orientation.baseY) / 10000;
  }

  function summarizeItems() {
    if (!selectedItems.length) return "Предметы пока не выбраны";
    const counts = {};
    selectedItems.forEach((key) => { counts[key] = (counts[key] || 0) + 1; });
    return Object.entries(counts).map(([key, count]) => `${cargoItems[key].name} — ${count} шт.`).join("; ");
  }

  function layoutItems(vehicle) {
    const gap = 8;
    const bayWidth = bay.clientWidth || 700;
    const bayHeight = bay.clientHeight || 300;
    const usableWidth = bayWidth - 54;
    const scaleX = usableWidth / vehicle.length;
    const scaleY = bayHeight / vehicle.width;

    const sideHeight = baySide ? (baySide.clientHeight || 120) : 0;
    const sideWidth = baySide ? (baySide.clientWidth || usableWidth) : 0;
    const scaleSideX = sideWidth / vehicle.length;
    const scaleSideH = sideHeight / vehicle.height;

    let x = 8, y = 8, rowH = 0;
    return selectedItems.map((key) => {
      const item = cargoItems[key];
      const orientation = pickBestOrientation(item, vehicle.height);
      const tooHigh = orientation === null;
      const actualOrient = orientation || { baseX: item.length, baseY: item.width, heightZ: item.height };
      const rotated = actualOrient.baseX !== item.length || actualOrient.baseY !== item.width || actualOrient.heightZ !== item.height;

      let w = Math.max(34, actualOrient.baseX * scaleX);
      let h = Math.max(28, actualOrient.baseY * scaleY);
      if (w > usableWidth && h <= usableWidth) { const temp = w; w = h; h = temp; }
      if (x + w > usableWidth) { x = 8; y += rowH + gap; rowH = 0; }
      const over = y + h > bayHeight - 8;

      const sw = Math.max(20, actualOrient.baseX * scaleSideX);
      const sh = Math.max(10, actualOrient.heightZ * scaleSideH);
      const sx = x;
      const sy = sideHeight - sh - 4;

      const pos = { key, item, orientation: actualOrient, tooHigh, rotated, x, y, w, h, over, sx, sy, sw, sh };
      x += w + gap;
      rowH = Math.max(rowH, h);
      return pos;
    });
  }

  function updateItemCounters() {
    const counts = {};
    selectedItems.forEach((key) => { counts[key] = (counts[key] || 0) + 1; });
    document.querySelectorAll(".cargo-item-btn").forEach((btn) => {
      const key = btn.dataset.item;
      let counter = btn.querySelector(".cargo-item-count");
      if (!counter) {
        counter = document.createElement("span");
        counter.className = "cargo-item-count";
        btn.appendChild(counter);
      }
      const count = counts[key] || 0;
      counter.textContent = count > 0 ? `×${count}` : "";
      counter.classList.toggle("is-visible", count > 0);
    });
  }

  function updateCargoCalculator() {
    const vehicle = vehicles[selectedVehicle];
    const positions = layoutItems(vehicle);

    const validItems = positions.filter((p) => !p.over && !p.tooHigh);
    const overflowItems = positions.filter((p) => p.over);
    const heightOverflowItems = positions.filter((p) => p.tooHigh);

    let usedVolume = validItems.reduce((sum, p) => sum + itemVolume(p.item, p.orientation), 0);
    if (fragileMode) usedVolume *= 1.15;
    const usedArea = validItems.reduce((sum, p) => sum + itemArea(p.item, p.orientation), 0);
    const usedWeight = validItems.reduce((sum, p) => sum + p.item.weight, 0);

    const floorArea = (vehicle.length * vehicle.width) / 10000;
    const volumePercent = Math.round((usedVolume / vehicle.volume) * 100);
    const areaPercent = Math.round((usedArea / floorArea) * 100);
    const weightPercent = Math.round((usedWeight / vehicle.weight) * 100);

    document.querySelectorAll(".cargo-car-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.vehicle === selectedVehicle);
    });

    vehicleEl.textContent = vehicle.name;
    dimsEl.textContent = `${vehicle.length}×${vehicle.width}×${vehicle.height} см · ${vehicle.volume.toFixed(1)} м³ · ${vehicle.price}`;

    if (heightNoteEl) {
      if (vehicle.height === 210) {
        heightNoteEl.style.display = "block";
        heightNoteEl.textContent = "Высота 210 см — условный средний показатель. Точные габариты определяются моделью автомобиля и могут варьироваться. Уточняйте параметры у диспетчера.";
      } else {
        heightNoteEl.style.display = "none";
      }
    }

    volumeEl.textContent = `${usedVolume.toFixed(1)} м³`;
    areaEl.textContent = `${Math.min(999, areaPercent)}%`;
    weightEl.textContent = `${usedWeight} кг`;

    if (progressVolume) {
      progressVolume.style.width = `${Math.min(100, volumePercent)}%`;
      progressVolumeText.textContent = `${volumePercent}%`;
      progressVolume.classList.toggle("is-over", volumePercent > 100);
    }
    if (progressArea) {
      progressArea.style.width = `${Math.min(100, areaPercent)}%`;
      progressAreaText.textContent = `${areaPercent}%`;
      progressArea.classList.toggle("is-over", areaPercent > 100);
    }
    if (progressWeight) {
      progressWeight.style.width = `${Math.min(100, weightPercent)}%`;
      progressWeightText.textContent = `${weightPercent}%`;
      progressWeight.classList.toggle("is-over", weightPercent > 100);
    }

    if (heightAlertEl) {
      if (heightOverflowItems.length > 0) {
        const names = [...new Set(heightOverflowItems.map((p) => p.item.name))].join(", ");
        heightAlertEl.innerHTML = `<strong>Внимание:</strong> ${names} — данное изделие превышает допустимые габариты по высоте при стандартной ориентации. Возможен перевоз в альтернативной плоскости либо подбор транспорта увеличенного объёма.`;
        heightAlertEl.classList.add("is-visible");
      } else {
        heightAlertEl.innerHTML = "";
        heightAlertEl.classList.remove("is-visible");
      }
    }

    let rec = "Добавьте предметы — покажем подходящий кузов и подскажем, когда лучше взять машину больше.";
    recEl.style.borderColor = "rgba(16,185,129,0.24)";
    recEl.style.background = "rgba(16,185,129,0.11)";

    if (selectedItems.length) {
      const maxPercent = Math.max(volumePercent, areaPercent, weightPercent);
      const overflowCount = overflowItems.length + heightOverflowItems.length;

      if (overflowCount > 0) {
        rec = "Расчётная загрузка превышает номинальную вместимость кузова. Рекомендуется увеличить тип транспорта или запланировать дополнительный рейс.";
        recEl.style.borderColor = "rgba(239,68,68,0.32)";
        recEl.style.background = "rgba(239,68,68,0.11)";
      } else if (maxPercent <= 50) {
        const remaining = Math.floor((vehicle.volume - usedVolume) / 0.1) * 0.1;
        rec = `${vehicle.name} подходит с запасом. Можно добавить ещё ≈ ${remaining.toFixed(1)} м³. Диспетчер уточнит упаковку, этаж, вес и маршрут.`;
      } else if (maxPercent <= 80) {
        rec = `${vehicle.name} предварительно подходит. Запас комфортный. Диспетчер уточнит упаковку, этаж, вес и маршрут.`;
      } else if (maxPercent <= 100) {
        rec = `${vehicle.name} может подойти, но запас небольшой. Диспетчер может предложить кузов больше.`;
        recEl.style.borderColor = "rgba(255,165,0,0.32)";
        recEl.style.background = "rgba(255,165,0,0.11)";
      } else {
        rec = "Расчётная загрузка превышает номинальную вместимость кузова. Рекомендуется увеличить тип транспорта или запланировать дополнительный рейс.";
        recEl.style.borderColor = "rgba(239,68,68,0.32)";
        recEl.style.background = "rgba(239,68,68,0.11)";
      }
    }

    if (fragileMode && selectedItems.length) {
      rec += " Учтена защитная упаковка хрупких грузов.";
    }

    recEl.textContent = rec;

    // Render top bay
    bay.innerHTML = "";
    positions.forEach((pos, index) => {
      const el = document.createElement("div");
      el.className = `cargo-load-item ${pos.over ? "over" : ""} ${pos.tooHigh ? "too-high" : ""}`;
      el.style.left = `${pos.x}px`;
      el.style.top = `${pos.y}px`;
      el.style.width = `${pos.w}px`;
      el.style.height = `${pos.h}px`;

      if (pos.item.color === "gray") el.style.background = "linear-gradient(135deg,#7c8797,#334155)";
      if (pos.item.color === "dark") el.style.background = "linear-gradient(135deg,#1f2937,#05070c)";
      if (pos.item.color === "light") {
        el.style.background = "linear-gradient(135deg,#eef2f7,#94a3b8)";
        el.style.color = "#111827";
      }

      let label = `<span>${pos.item.name}<br>${pos.orientation.baseX}×${pos.orientation.baseY}</span>`;
      if (pos.tooHigh) {
        label = `<span>${pos.item.name}<br><small>выс. ${pos.orientation.heightZ} см ⚠️</small></span>`;
      } else if (pos.rotated) {
        label = `<span>${pos.item.name}<br>${pos.orientation.baseX}×${pos.orientation.baseY}<small class="cargo-rotated-badge" title="Изделие размещено в альтернативной плоскости для оптимизации загрузки"> ↻</small></span>`;
      }
      el.innerHTML = label;

      el.style.animationDelay = `${index * 40}ms`;
      el.classList.add("cargo-load-item-appear");

      bay.appendChild(el);
    });

    // Render side bay
    if (baySide) {
      baySide.innerHTML = "";
      positions.forEach((pos, index) => {
        const el = document.createElement("div");
        el.className = `cargo-load-item cargo-load-item-side ${pos.over ? "over" : ""} ${pos.tooHigh ? "too-high" : ""}`;
        el.style.left = `${pos.sx}px`;
        el.style.bottom = `${4}px`;
        el.style.width = `${pos.sw}px`;
        el.style.height = `${pos.sh}px`;

        if (pos.item.color === "gray") el.style.background = "linear-gradient(135deg,#7c8797,#334155)";
        if (pos.item.color === "dark") el.style.background = "linear-gradient(135deg,#1f2937,#05070c)";
        if (pos.item.color === "light") {
          el.style.background = "linear-gradient(135deg,#eef2f7,#94a3b8)";
          el.style.color = "#111827";
        }

        el.style.animationDelay = `${index * 40}ms`;
        el.classList.add("cargo-load-item-appear");
        baySide.appendChild(el);
      });
    }

    // Selected list
    listEl.innerHTML = "";
    if (!selectedItems.length) {
      listEl.innerHTML = `<div class="cargo-selected-row"><span>Список пуст. Добавьте мебель, коробки или технику.</span></div>`;
    } else {
      selectedItems.forEach((key, index) => {
        const item = cargoItems[key];
        const orientation = pickBestOrientation(item, vehicle.height);
        const tooHigh = orientation === null;
        const actualOrient = orientation || { baseX: item.length, baseY: item.width, heightZ: item.height };
        const row = document.createElement("div");
        row.className = "cargo-selected-row";
        const warning = tooHigh ? ' <span class="cargo-row-warning">(превышение по высоте)</span>' : "";
        const rotatedBadge = (actualOrient.baseX !== item.length || actualOrient.baseY !== item.width) ? ' <span class="cargo-row-rotated" title="Альтернативная плоскость">↻</span>' : "";
        row.innerHTML = `<span>${item.name} · ${actualOrient.baseX}×${actualOrient.baseY}×${actualOrient.heightZ} см${warning}${rotatedBadge}</span><button type="button" aria-label="Удалить">×</button>`;
        row.querySelector("button").addEventListener("click", () => { selectedItems.splice(index, 1); updateCargoCalculator(); });
        listEl.appendChild(row);
      });
    }

    updateItemCounters();

    const summary = `${vehicle.name}; ${summarizeItems()}; объем ${usedVolume.toFixed(1)} м³; вес ${usedWeight} кг; заполнение ${Math.max(volumePercent, areaPercent, weightPercent)}%${fragileMode ? "; защитная упаковка" : ""}`;
    if (hiddenEl) hiddenEl.value = summary;
    if (vehicleHiddenEl) vehicleHiddenEl.value = vehicle.name;
  }

  document.querySelectorAll(".cargo-car-btn").forEach((btn) => {
    btn.addEventListener("click", () => { selectedVehicle = btn.dataset.vehicle; updateCargoCalculator(); });
  });

  document.querySelectorAll(".cargo-item-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedItems.push(btn.dataset.item);
      updateCargoCalculator();
    });
  });

  if (clearBtn) clearBtn.addEventListener("click", () => { selectedItems = []; fragileMode = false; updateCargoCalculator(); });

  if (requestBtn) requestBtn.addEventListener("click", () => {
    updateCargoCalculator();
    document.getElementById("cargo-order-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  window.addEventListener("resize", updateCargoCalculator, { passive: true });

  // Quick fill modal
  function openQuickModal() {
    if (quickModal) quickModal.classList.add("active");
    document.body.style.overflow = "hidden";
  }
  function closeQuickModal() {
    if (quickModal) quickModal.classList.remove("active");
    document.body.style.overflow = "";
  }

  if (quickFillBtn) quickFillBtn.addEventListener("click", openQuickModal);
  if (quickModalClose) quickModalClose.addEventListener("click", closeQuickModal);
  if (quickModal) quickModal.addEventListener("click", (e) => { if (e.target === quickModal) closeQuickModal(); });

  if (quickConfirm) {
    quickConfirm.addEventListener("click", () => {
      selectedItems = [];
      fragileMode = quickFragile ? quickFragile.checked : false;

      quickModal.querySelectorAll("input[type='number']").forEach((input) => {
        const key = input.dataset.item;
        const count = parseInt(input.value, 10) || 0;
        for (let i = 0; i < count; i++) {
          selectedItems.push(key);
        }
      });

      // Auto-select smallest fitting vehicle
      const vehicleKeys = ["gazel3", "gazel42", "truck5", "truck6"];
      let bestVehicle = "truck6";
      for (const vKey of vehicleKeys) {
        const v = vehicles[vKey];
        let fits = true;
        let totalVol = 0;
        let totalWeight = 0;
        for (const key of selectedItems) {
          const item = cargoItems[key];
          const orient = pickBestOrientation(item, v.height);
          if (!orient) { fits = false; break; }
          totalVol += itemVolume(item, orient);
          totalWeight += item.weight;
        }
        if (fragileMode) totalVol *= 1.15;
        if (fits && totalVol <= v.volume && totalWeight <= v.weight) {
          bestVehicle = vKey;
          break;
        }
      }
      selectedVehicle = bestVehicle;

      closeQuickModal();
      updateCargoCalculator();
      showToast("Груз рассчитан. Проверьте визуальную загрузку и уточните детали у диспетчера.", "success");
    });
  }

  const cargoPhone = document.getElementById("cargo-phone");
  if (cargoPhone) setupPhoneMask(cargoPhone);

  const cargoForm = document.getElementById("cargo-order-form");
  if (cargoForm) {
    initFormsAntiSpam();
    cargoForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      updateCargoCalculator();
      const btn = cargoForm.querySelector('button[type="submit"]');
      const originalText = btn ? btn.textContent : "";
      try {
        if (btn) { btn.disabled = true; btn.textContent = "Отправляем..."; }
        await submitLead({
          name: document.getElementById("cargo-name")?.value || "",
          phone: document.getElementById("cargo-phone")?.value || "",
          route: document.getElementById("cargo-route")?.value || "",
          direction: document.getElementById("cargo-direction")?.value || "",
          comment: document.getElementById("cargo-comment")?.value || "",
          vehicle: vehicleHiddenEl?.value || vehicles[selectedVehicle].name,
          cargo_summary: hiddenEl?.value || summarizeItems(),
          source: "Visual Cargo Calculator",
          timestamp: new Date().toISOString(),
        }, cargoForm);
        cargoForm.reset();
        selectedItems = [];
        fragileMode = false;
        updateCargoCalculator();
        showToast("Заявка отправлена. Диспетчер свяжется с вами.", "success");
      } catch (error) {
        showToast(error.message || "Не удалось отправить заявку.", "error");
      } finally {
        if (btn) { btn.disabled = false; btn.textContent = originalText; }
      }
    });
  }

  updateCargoCalculator();
}
