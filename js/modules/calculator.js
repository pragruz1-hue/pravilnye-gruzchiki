/**
 * Interactive cost calculator with localStorage state persistence
 */

import { getWorkersWord, getHoursWord, getFloorWord } from "./helpers.js";

const STORAGE_KEY = "pg_calculator_state";

export function initCalculator() {
  const calcTabs = document.querySelectorAll(".calc-tab");
  const workersRange = document.getElementById("workers-range");
  const hoursRange = document.getElementById("hours-range");
  const workersVal = document.getElementById("workers-val");
  const hoursVal = document.getElementById("hours-val");
  const rateDisplay = document.getElementById("rate-display");
  const priceDisplay = document.getElementById("price-display");
  const calcSubmitBtn = document.getElementById("calc-submit-btn");
  const floorRange = document.getElementById("floor-range");
  const floorVal = document.getElementById("floor-val");
  const elevatorSelect = document.getElementById("elevator-select");
  const truckSelect = document.getElementById("truck-select");
  const distanceSelect = document.getElementById("distance-select");
  const heavySelect = document.getElementById("heavy-select");

  if (!workersRange || !hoursRange) return;

  // ==========================================
  // CALCULATOR STATE PERSISTENCE (localStorage)
  // ==========================================
  function saveCalculatorState() {
    const state = {
      currentRate,
      currentServiceName,
      workers: workersRange ? workersRange.value : "2",
      hours: hoursRange ? hoursRange.value : "4",
      floor: floorRange ? floorRange.value : "1",
      elevator: elevatorSelect ? elevatorSelect.value : "yes",
      truck: truckSelect ? truckSelect.value : "none",
      distance: distanceSelect ? distanceSelect.value : "0",
      heavy: heavySelect ? heavySelect.value : "0",
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) { /* quota exceeded, ignore */ }
  }

  function restoreCalculatorState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const state = JSON.parse(saved);
      currentRate = state.currentRate || 800;
      currentServiceName = state.currentServiceName || "Грузчики";
      if (workersRange) workersRange.value = state.workers || "2";
      if (hoursRange) hoursRange.value = state.hours || "4";
      if (floorRange) floorRange.value = state.floor || "1";
      if (elevatorSelect) elevatorSelect.value = state.elevator || "yes";
      if (truckSelect) truckSelect.value = state.truck || "none";
      if (distanceSelect) distanceSelect.value = state.distance || "0";
      if (heavySelect) heavySelect.value = state.heavy || "0";

      // Restore active tab
      if (calcTabs.length > 0) {
        calcTabs.forEach(t => t.classList.remove("active"));
        const matchingTab = Array.from(calcTabs).find(
          t => t.getAttribute("data-name") === currentServiceName
        );
        if (matchingTab) matchingTab.classList.add("active");
        else calcTabs[0].classList.add("active");
      }
    } catch (e) { /* corrupted data, ignore */ }
  }

  let currentRate = 800;
  let currentServiceName = "Грузчики";

  function getCalculatorExtras(workers, hours) {
    const floor = floorRange ? parseInt(floorRange.value, 10) || 1 : 1;
    const elevator = elevatorSelect ? elevatorSelect.value : "yes";
    const truck = truckSelect ? truckSelect.value : "none";
    const distanceSurcharge = distanceSelect ? parseInt(distanceSelect.value, 10) || 0 : 0;
    const heavySurcharge = heavySelect ? parseInt(heavySelect.value, 10) || 0 : 0;

    const floorSurcharge = elevator === "no" && floor > 1 ? (floor - 1) * workers * 250 : 0;
    const truckRate = truck === "extended" ? 2500 : truck === "standard" ? 2000 : 0;
    const truckSurcharge = truckRate ? truckRate * hours : 0;
    const extrasTotal = floorSurcharge + truckSurcharge + distanceSurcharge + heavySurcharge;

    const truckLabel = truck === "extended" ? "Газель 4.2 м" : truck === "standard" ? "Газель 3 м" : "без машины";
    const elevatorLabel = elevator === "no" ? "лифта нет/нельзя использовать" : "лифт есть";
    const distanceLabel = distanceSelect ? distanceSelect.options[distanceSelect.selectedIndex].text : "до 20 метров";
    const heavyLabel = heavySelect ? heavySelect.options[heavySelect.selectedIndex].text : "нет";

    return { floor, elevator, truck, distanceSurcharge, heavySurcharge, floorSurcharge, truckSurcharge, extrasTotal, truckLabel, elevatorLabel, distanceLabel, heavyLabel };
  }

  function updateCalculator() {
    if (!workersRange || !hoursRange) return null;
    const workers = parseInt(workersRange.value, 10);
    const hours = parseInt(hoursRange.value, 10);

    if (workersVal) workersVal.textContent = `${workers} ${getWorkersWord(workers)}`;
    if (hoursVal) hoursVal.textContent = `${hours} ${getHoursWord(hours)}`;
    if (floorRange && floorVal) {
      const floor = parseInt(floorRange.value, 10) || 1;
      floorVal.textContent = `${floor} ${getFloorWord(floor)}`;
    }

    const isNegotiable = currentRate === 0;
    const basePrice = currentRate * workers * hours;
    const extras = getCalculatorExtras(workers, hours);
    const totalPrice = basePrice + extras.extrasTotal;
    const currencySpan = priceDisplay ? priceDisplay.parentNode.querySelector(".currency") : null;
    const rateInfo = document.querySelector(".result-rate-info");

    if (rateInfo) {
      if (isNegotiable) rateInfo.innerHTML = `Тариф: <span id="rate-display">договорной</span>`;
      else rateInfo.innerHTML = `Тариф: <span id="rate-display">${currentRate}</span> руб/час`;
    } else if (rateDisplay) {
      rateDisplay.textContent = isNegotiable ? "договорной" : currentRate;
    }

    if (priceDisplay) {
      if (isNegotiable) {
        priceDisplay.textContent = "Договорная";
        if (currencySpan) currencySpan.style.display = "none";
      } else {
        priceDisplay.textContent = totalPrice.toLocaleString("ru-RU");
        if (currencySpan) currencySpan.style.display = "inline";
      }
    }

    saveCalculatorState();

    return { service: currentServiceName, workers, hours, rate: currentRate, basePrice, price: isNegotiable ? "Договорная" : totalPrice, extras };
  }

  // Tab switching
  if (calcTabs.length > 0) {
    calcTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        calcTabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        currentRate = parseInt(tab.getAttribute("data-rate"), 10) || 800;
        currentServiceName = tab.getAttribute("data-name") || "Грузчики";
        updateCalculator();
      });
    });
  }

  // Input listeners
  if (workersRange) workersRange.addEventListener("input", updateCalculator);
  if (hoursRange) hoursRange.addEventListener("input", updateCalculator);
  if (floorRange) floorRange.addEventListener("input", updateCalculator);
  if (elevatorSelect) elevatorSelect.addEventListener("change", updateCalculator);
  if (truckSelect) truckSelect.addEventListener("change", updateCalculator);
  if (distanceSelect) distanceSelect.addEventListener("change", updateCalculator);
  if (heavySelect) heavySelect.addEventListener("change", updateCalculator);

  // Restore saved state then update
  restoreCalculatorState();
  updateCalculator();

  // Auto-select tab based on page type
  const activePage = document.body.getAttribute("data-page") || "index";
  if (calcTabs.length > 0) {
    const tabMap = { loaders: "Грузчики", workers: "Разнорабочие", moving: "Переезд", rigging: "Такелажники", furniture: "Грузчики" };
    const targetName = tabMap[activePage];
    if (targetName) {
      const tabToClick = Array.from(calcTabs).find(t => t.getAttribute("data-name") === targetName);
      if (tabToClick) tabToClick.click();
    }
  }

  // Bind calculator submit to modal
  if (calcSubmitBtn) {
    calcSubmitBtn.addEventListener("click", () => {
      const calcData = updateCalculator();
      if (calcData) {
        const extra = calcData.extras;
        const detailsStr = calcData.rate === 0
          ? `${calcData.workers} чел., ${calcData.hours} ч. (Тариф: договорной). Этаж: ${extra.floor}, ${extra.elevatorLabel}, машина: ${extra.truckLabel}, переноска: ${extra.distanceLabel}, тяжелые предметы: ${extra.heavyLabel}.`
          : `${calcData.workers} чел., ${calcData.hours} ч. (Тариф: ${calcData.rate} ₽/ч). Этаж: ${extra.floor}, ${extra.elevatorLabel}, машина: ${extra.truckLabel}, переноска: ${extra.distanceLabel}, тяжелые предметы: ${extra.heavyLabel}.`;
        document.dispatchEvent(new CustomEvent("openOrderModal", {
          detail: { serviceName: calcData.service, details: detailsStr, calculatedPrice: calcData.price }
        }));
      }
    });
  }

  // Expose for external use
  return { updateCalculator };
}