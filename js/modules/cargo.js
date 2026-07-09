/**
 * Cargo visual 2.5D calculator (for gruzoperevozki.html)
 */
import { setupPhoneMask, submitLeadToFormspree, showToast, initFormsAntiSpam } from "./forms.js";

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

  let selectedVehicle = "gazel3";
  let selectedItems = [];

  const bay = document.getElementById("cargo-bay");
  const fill = document.getElementById("cargo-progress-fill");
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
      const pos = { key, item, x, y, w, h, over };
      x += w + gap;
      rowH = Math.max(rowH, h);
      return pos;
    });
  }

  function updateCargoCalculator() {
    const vehicle = vehicles[selectedVehicle];
    const usedVolume = selectedItems.reduce((sum, key) => sum + itemVolume(cargoItems[key]), 0);
    const usedArea = selectedItems.reduce((sum, key) => sum + itemArea(cargoItems[key]), 0);
    const usedWeight = selectedItems.reduce((sum, key) => sum + cargoItems[key].weight, 0);
    const floorArea = (vehicle.length * vehicle.width) / 10000;
    const volumePercent = Math.round((usedVolume / vehicle.volume) * 100);
    const areaPercent = Math.round((usedArea / floorArea) * 100);
    const weightPercent = Math.round((usedWeight / vehicle.weight) * 100);
    const percent = Math.max(volumePercent, areaPercent, weightPercent);

    document.querySelectorAll(".cargo-car-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.vehicle === selectedVehicle);
    });

    vehicleEl.textContent = vehicle.name;
    dimsEl.textContent = `${vehicle.length}×${vehicle.width}×${vehicle.height} см · ${vehicle.volume.toFixed(1)} м³ · ${vehicle.price}`;
    volumeEl.textContent = `${usedVolume.toFixed(1)} м³`;
    areaEl.textContent = `${Math.min(999, areaPercent)}%`;
    weightEl.textContent = `${usedWeight} кг`;
    fill.style.width = `${Math.min(100, percent)}%`;

    let rec = "Добавьте предметы — покажем подходящий кузов и подскажем, когда лучше взять машину больше.";
    recEl.style.borderColor = "rgba(16,185,129,0.24)";
    recEl.style.background = "rgba(16,185,129,0.11)";
    if (selectedItems.length) {
      if (percent <= 72) rec = `${vehicle.name} предварительно подходит. Диспетчер уточнит упаковку, этаж, вес и маршрут.`;
      else if (percent <= 100) rec = `${vehicle.name} может подойти, но запас небольшой. Диспетчер может предложить кузов больше.`;
      else {
        rec = `По расчету текущего кузова мало. Лучше рассмотреть машину 4.2–6 м или вторую ходку.`;
        recEl.style.borderColor = "rgba(239,68,68,0.32)";
        recEl.style.background = "rgba(239,68,68,0.11)";
      }
    }
    recEl.textContent = rec;

    bay.innerHTML = "";
    layoutItems(vehicle).forEach((pos) => {
      const el = document.createElement("div");
      el.className = `cargo-load-item ${pos.over ? "over" : ""}`;
      el.style.left = `${pos.x}px`; el.style.top = `${pos.y}px`; el.style.width = `${pos.w}px`; el.style.height = `${pos.h}px`;
      if (pos.item.color === "gray") el.style.background = "linear-gradient(135deg,#7c8797,#334155)";
      if (pos.item.color === "dark") el.style.background = "linear-gradient(135deg,#1f2937,#05070c)";
      if (pos.item.color === "light") { el.style.background = "linear-gradient(135deg,#eef2f7,#94a3b8)"; el.style.color = "#111827"; }
      el.innerHTML = `<span>${pos.item.name}<br>${pos.item.length}×${pos.item.width}</span>`;
      bay.appendChild(el);
    });

    listEl.innerHTML = "";
    if (!selectedItems.length) {
      listEl.innerHTML = `<div class="cargo-selected-row"><span>Список пуст. Добавьте мебель, коробки или технику.</span></div>`;
    } else {
      selectedItems.forEach((key, index) => {
        const row = document.createElement("div");
        row.className = "cargo-selected-row";
        row.innerHTML = `<span>${cargoItems[key].name} · ${cargoItems[key].length}×${cargoItems[key].width}×${cargoItems[key].height} см</span><button type="button" aria-label="Удалить">×</button>`;
        row.querySelector("button").addEventListener("click", () => { selectedItems.splice(index, 1); updateCargoCalculator(); });
        listEl.appendChild(row);
      });
    }

    const summary = `${vehicle.name}; ${summarizeItems()}; объем ${usedVolume.toFixed(1)} м³; вес ${usedWeight} кг; заполнение ${percent}%`;
    if (hiddenEl) hiddenEl.value = summary;
    if (vehicleHiddenEl) vehicleHiddenEl.value = vehicle.name;
  }

  document.querySelectorAll(".cargo-car-btn").forEach((btn) => {
    btn.addEventListener("click", () => { selectedVehicle = btn.dataset.vehicle; updateCargoCalculator(); });
  });
  document.querySelectorAll(".cargo-item-btn").forEach((btn) => {
    btn.addEventListener("click", () => { selectedItems.push(btn.dataset.item); updateCargoCalculator(); });
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
        await submitLeadToFormspree({
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