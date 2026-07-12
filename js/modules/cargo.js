/**
 * Cargo visual 2.5D calculator (for gruzoperevozki.html)
 */
import { setupPhoneMask, submitLead, showToast, initFormsAntiSpam } from "./forms.js";

export function initCargoCalculator() {
  const cargoRoot = document.getElementById("cargo-visual-calculator");
  if (!cargoRoot) return;

  const vehicles = {
    gazel3: { name: "Газель 3 м", length: 300, width: 190, height: 180, volume: 10.2, weight: 1500, price: "от 2 000 ₽/час" },
    gazel42: { name: "Газель 4.2 м", length: 420, width: 200, height: 210, volume: 17.6, weight: 2000, price: "от 2 500 ₽/час" },
    truck5: { name: "Фургон 5 м", length: 500, width: 210, height: 220, volume: 23.1, weight: 2500, price: "индивидуально" },
    truck6: { name: "Машина 6 м", length: 600, width: 220, height: 230, volume: 30.4, weight: 3000, price: "индивидуально" },
  };

  const cargoItems = {
    box: { name: "Коробка", length: 60, width: 40, height: 40, weight: 12, color: "orange" },
    bigbox: { name: "Большая коробка", length: 80, width: 60, height: 50, weight: 22, color: "orange" },
    bags: { name: "Мешки / баулы", length: 75, width: 45, height: 45, weight: 18, color: "orange" },
    sofa: { name: "Диван", length: 210, width: 90, height: 85, weight: 85, color: "gray" },
    armchair: { name: "Кресло", length: 95, width: 85, height: 90, weight: 35, color: "gray" },
    wardrobe: { name: "Шкаф", length: 120, width: 60, height: 210, weight: 90, color: "dark" },
    dresser: { name: "Комод", length: 100, width: 50, height: 85, weight: 45, color: "gray" },
    bed: { name: "Кровать", length: 205, width: 95, height: 45, weight: 70, color: "gray" },
    mattress: { name: "Матрас", length: 200, width: 90, height: 25, weight: 28, color: "light" },
    fridge: { name: "Холодильник", length: 70, width: 70, height: 190, weight: 80, color: "light" },
    washer: { name: "Стиральная машина", length: 60, width: 60, height: 85, weight: 65, color: "light" },
    tv: { name: "Телевизор", length: 120, width: 18, height: 75, weight: 18, color: "dark" },
    table: { name: "Стол", length: 130, width: 80, height: 75, weight: 38, color: "gray" },
    chairs: { name: "4 стула", length: 80, width: 80, height: 95, weight: 28, color: "gray" },
  };

  const MAX_ITEMS = 25;

  let selectedVehicle = "gazel3";
  let selectedItems = [];

  const bay = document.getElementById("cargo-bay");
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

  // Progress bars
  const progressVolume = document.getElementById("cargo-progress-volume");
  const progressArea = document.getElementById("cargo-progress-area");
  const progressWeight = document.getElementById("cargo-progress-weight");
  const progressVolumeText = document.getElementById("cargo-progress-volume-text");
  const progressAreaText = document.getElementById("cargo-progress-area-text");
  const progressWeightText = document.getElementById("cargo-progress-weight-text");

  function itemVolume(item) { return (item.length * item.width * item.height) / 1000000; }
  function itemArea(item) { return (item.length * item.width) / 10000; }

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
    let x = 8, y = 8, rowH = 0;
    return selectedItems.map((key) => {
      const item = cargoItems[key];
      let w = Math.max(34, item.length * scaleX);
      let h = Math.max(28, item.width * scaleY);
      if (w > usableWidth && h <= usableWidth) { const temp = w; w = h; h = temp; }
      if (x + w > usableWidth) { x = 8; y += rowH + gap; rowH = 0; }
      const over = y + h > bayHeight - 8;
      const tooHigh = item.height > vehicle.height;
      const pos = { key, item, x, y, w, h, over, tooHigh };
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

    // Separate valid and overflow items
    const validItems = positions.filter((p) => !p.over && !p.tooHigh);
    const overflowItems = positions.filter((p) => p.over);
    const heightOverflowItems = positions.filter((p) => p.tooHigh);

    const usedVolume = validItems.reduce((sum, p) => sum + itemVolume(p.item), 0);
    const usedArea = validItems.reduce((sum, p) => sum + itemArea(p.item), 0);
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
    volumeEl.textContent = `${usedVolume.toFixed(1)} м³`;
    areaEl.textContent = `${Math.min(999, areaPercent)}%`;
    weightEl.textContent = `${usedWeight} кг`;

    // Update three progress bars
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

    // Height alert
    if (heightAlertEl) {
      if (heightOverflowItems.length > 0) {
        const names = [...new Set(heightOverflowItems.map((p) => p.item.name))].join(", ");
        heightAlertEl.innerHTML = `<strong>⚠️ Внимание:</strong> ${names} — не влезает по высоте (${vehicle.height} см). Рассмотрите машину побольше или перевезите отдельно.`;
        heightAlertEl.classList.add("is-visible");
      } else {
        heightAlertEl.innerHTML = "";
        heightAlertEl.classList.remove("is-visible");
      }
    }

    // Recommendation
    let rec = "Добавьте предметы — покажем подходящий кузов и подскажем, когда лучше взять машину больше.";
    recEl.style.borderColor = "rgba(16,185,129,0.24)";
    recEl.style.background = "rgba(16,185,129,0.11)";

    if (selectedItems.length) {
      const maxPercent = Math.max(volumePercent, areaPercent, weightPercent);
      const overflowCount = overflowItems.length + heightOverflowItems.length;

      if (overflowCount > 0) {
        rec = `⚠️ ${overflowCount} предмет(ов) не влезает в кузов. Рекомендуем рассмотреть ${vehicles.gazel42.name} или больше.`;
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
        rec = `По расчету текущего кузова мало. Лучше рассмотреть машину 4.2–6 м или вторую ходку.`;
        recEl.style.borderColor = "rgba(239,68,68,0.32)";
        recEl.style.background = "rgba(239,68,68,0.11)";
      }
    }
    recEl.textContent = rec;

    // Render bay
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

      let label = `<span>${pos.item.name}<br>${pos.item.length}×${pos.item.width}</span>`;
      if (pos.tooHigh) {
        label = `<span>${pos.item.name}<br><small>выс. ${pos.item.height} см ⚠️</small></span>`;
      }
      el.innerHTML = label;

      // Staggered animation
      el.style.animationDelay = `${index * 40}ms`;
      el.classList.add("cargo-load-item-appear");

      bay.appendChild(el);
    });

    // Selected list
    listEl.innerHTML = "";
    if (!selectedItems.length) {
      listEl.innerHTML = `<div class="cargo-selected-row"><span>Список пуст. Добавьте мебель, коробки или технику.</span></div>`;
    } else {
      selectedItems.forEach((key, index) => {
        const row = document.createElement("div");
        row.className = "cargo-selected-row";
        const warning = cargoItems[key].height > vehicle.height ? ' <span class="cargo-row-warning">(выс.)</span>' : "";
        row.innerHTML = `<span>${cargoItems[key].name} · ${cargoItems[key].length}×${cargoItems[key].width}×${cargoItems[key].height} см${warning}</span><button type="button" aria-label="Удалить">×</button>`;
        row.querySelector("button").addEventListener("click", () => { selectedItems.splice(index, 1); updateCargoCalculator(); });
        listEl.appendChild(row);
      });
    }

    updateItemCounters();

    const summary = `${vehicle.name}; ${summarizeItems()}; объем ${usedVolume.toFixed(1)} м³; вес ${usedWeight} кг; заполнение ${Math.max(volumePercent, areaPercent, weightPercent)}%`;
    if (hiddenEl) hiddenEl.value = summary;
    if (vehicleHiddenEl) vehicleHiddenEl.value = vehicle.name;
  }

  document.querySelectorAll(".cargo-car-btn").forEach((btn) => {
    btn.addEventListener("click", () => { selectedVehicle = btn.dataset.vehicle; updateCargoCalculator(); });
  });

  document.querySelectorAll(".cargo-item-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (selectedItems.length >= MAX_ITEMS) {
        showToast(`Максимум ${MAX_ITEMS} предметов. Вызовите диспетчера для точного расчёта.`, "warning");
        return;
      }
      selectedItems.push(btn.dataset.item);
      updateCargoCalculator();
    });
  });

  if (clearBtn) clearBtn.addEventListener("click", () => { selectedItems = []; updateCargoCalculator(); });

  if (requestBtn) requestBtn.addEventListener("click", () => {
    updateCargoCalculator();
    document.getElementById("cargo-order-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  window.addEventListener("resize", updateCargoCalculator, { passive: true });

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