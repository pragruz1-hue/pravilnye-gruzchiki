/**
 * Cargo visual 2.5D calculator (for gruzoperevozki.html)
 * Features: auto-rotation, dual-plane visualization, packaging types, fragile mode, quick-fill modal.
 */
import { setupPhoneMask, submitLead, showToast, initFormsAntiSpam } from "./forms.js";

export function initCargoCalculator() {
  const cargoRoot = document.getElementById("cargo-visual-calculator");
  if (!cargoRoot) return;

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
