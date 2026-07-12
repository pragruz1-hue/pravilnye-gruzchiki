/**
 * Live application status based on the managers' Moscow working hours.
 * The visitor's device supplies the current instant; Intl converts that instant
 * to Europe/Moscow before it is compared with the 08:00–20:00 schedule.
 */

const MOSCOW_TIME_ZONE = "Europe/Moscow";
const OPENING_HOUR = 8;
const CLOSING_HOUR = 20;
const OPEN_TEXT = "Принимаем заявки сейчас";
const CLOSED_TEXT = "Заявку можно оставить — ответим с 8:00 МСК";

const LIVE_ORDER_STORAGE_PREFIX = "pg_live_order_crm_v1";
const FALLBACK_CRM_CITY = "site";
const MIN_INITIAL_ORDER_AGE_MINUTES = 7;
const MAX_INITIAL_ORDER_AGE_MINUTES = 28;
const MAX_VISIBLE_ORDER_AGE_MINUTES = 34;
const MIN_NEW_ORDER_INTERVAL_MS = 65 * 1000;
const MAX_NEW_ORDER_INTERVAL_MS = 4 * 60 * 1000;
const MINUTE_MS = 60 * 1000;

const CRM_BRIGADES_STORAGE_PREFIX = "pg_live_crm_brigades_v1";
const CRM_ORDERS_STORAGE_PREFIX = "pg_live_crm_orders_v1";

const BRIGADES_MIN = 1;
const BRIGADES_MAX = 12;
const BRIGADES_INITIAL_MIN = 3;
const BRIGADES_INITIAL_MAX = 8;
const BRIGADES_UPDATE_INTERVAL_MIN_MS = 5 * 60 * 1000;
const BRIGADES_UPDATE_INTERVAL_MAX_MS = 15 * 60 * 1000;

const ORDERS_INITIAL_MIN = 5;
const ORDERS_INITIAL_MAX = 12;
const ORDERS_DAY_INCREMENT_MIN_MS = 10 * 60 * 1000;
const ORDERS_DAY_INCREMENT_MAX_MS = 30 * 60 * 1000;
const ORDERS_NIGHT_INCREMENT_MIN_MS = 60 * 60 * 1000;
const ORDERS_NIGHT_INCREMENT_MAX_MS = 2 * 60 * 60 * 1000;
const ORDERS_TARGET_DAY_END_MIN = 30;
const ORDERS_TARGET_DAY_END_MAX = 55;

const inMemoryCrmStateByKey = new Map();

const moscowTimeFormatter = new Intl.DateTimeFormat("ru-RU", {
  timeZone: MOSCOW_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/**
 * Return the Moscow wall-clock time for a Date representing the visitor's
 * current instant. Exported to keep the boundary logic easy to verify.
 */
export function getMoscowTime(date = new Date()) {
  const parts = moscowTimeFormatter.formatToParts(date);
  const hour = Number(parts.find((part) => part.type === "hour")?.value);
  const minute = Number(parts.find((part) => part.type === "minute")?.value);

  return {
    hour,
    minute,
    formatted: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
  };
}

/**
 * Managers accept calls every day from 08:00 inclusive until 20:00 exclusive,
 * Moscow time. Online forms remain available outside these hours.
 */
export function getApplicationAvailability(date = new Date()) {
  const moscowTime = getMoscowTime(date);
  const isOpen = moscowTime.hour >= OPENING_HOUR && moscowTime.hour < CLOSING_HOUR;

  return {
    isOpen,
    text: isOpen ? OPEN_TEXT : CLOSED_TEXT,
    moscowTime: moscowTime.formatted,
  };
}

function clampNumber(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getSafeLocalStorage() {
  try {
    if (!window.localStorage) return null;
    const testKey = "__pg_live_order_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return window.localStorage;
  } catch (error) {
    return null;
  }
}

function normalizeCrmStoragePart(value) {
  return (String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")) || FALLBACK_CRM_CITY;
}

function getCurrentCrmCity() {
  const bodyCity = document.body?.dataset?.city;
  if (bodyCity) return normalizeCrmStoragePart(bodyCity);

  const storage = getSafeLocalStorage();
  const storedCity = storage?.getItem("selected_city");
  if (storedCity) return normalizeCrmStoragePart(storedCity);

  const pathCity = window.location.pathname.split("/").filter(Boolean)[0];
  return normalizeCrmStoragePart(pathCity || FALLBACK_CRM_CITY);
}

function getLiveOrderStorageKey(cityCode) {
  return `${LIVE_ORDER_STORAGE_PREFIX}:${normalizeCrmStoragePart(cityCode)}`;
}

function readStoredCrmState(storageKey) {
  const storage = getSafeLocalStorage();
  if (!storage) return inMemoryCrmStateByKey.get(storageKey) || null;

  try {
    const parsed = JSON.parse(storage.getItem(storageKey) || "null");
    if (!parsed || parsed.version !== 1) return null;

    const seed = Number(parsed.seed);
    const lastOrderAt = Number(parsed.lastOrderAt);
    const nextOrderAt = Number(parsed.nextOrderAt);
    const updatedAt = Number(parsed.updatedAt);

    if (![seed, lastOrderAt, nextOrderAt, updatedAt].every(Number.isFinite)) return null;

    return {
      version: 1,
      seed: seed >>> 0,
      lastOrderAt,
      nextOrderAt,
      updatedAt,
    };
  } catch (error) {
    return null;
  }
}

function writeStoredCrmState(storageKey, state) {
  inMemoryCrmStateByKey.set(storageKey, state);
  const storage = getSafeLocalStorage();
  if (!storage) return;

  try {
    storage.setItem(storageKey, JSON.stringify(state));
  } catch (error) {
    // Ignore quota/private-mode errors; the in-memory state keeps the page stable.
  }
}

function nextCrmRandom(state) {
  state.seed = (Math.imul(state.seed, 1664525) + 1013904223) >>> 0;
  return state.seed / 4294967296;
}

function getCrmInt(state, min, max) {
  return Math.floor(nextCrmRandom(state) * (max - min + 1)) + min;
}

function getNextOrderInterval(state) {
  return getCrmInt(state, MIN_NEW_ORDER_INTERVAL_MS, MAX_NEW_ORDER_INTERVAL_MS);
}

function createCrmState(nowMs, initialAgeMinutes) {
  const state = {
    version: 1,
    seed: Math.floor(Math.random() * 4294967295) >>> 0,
    lastOrderAt: nowMs - clampNumber(initialAgeMinutes, 1, MAX_INITIAL_ORDER_AGE_MINUTES) * MINUTE_MS,
    nextOrderAt: nowMs,
    updatedAt: nowMs,
  };

  state.nextOrderAt = nowMs + getNextOrderInterval(state);
  return state;
}

function parseInitialOrderAgeMinutes(items) {
  for (const item of items) {
    const value = item.querySelector(".hero-live-value")?.textContent || "";
    const match = value.match(/(\d+)/);
    if (match) {
      return clampNumber(Number(match[1]), 1, MAX_INITIAL_ORDER_AGE_MINUTES);
    }
  }

  return Math.floor(
    MIN_INITIAL_ORDER_AGE_MINUTES
      + Math.random() * (MAX_INITIAL_ORDER_AGE_MINUTES - MIN_INITIAL_ORDER_AGE_MINUTES + 1),
  );
}

function getMinuteWord(minutes) {
  const lastTwo = minutes % 100;
  const last = minutes % 10;

  if (lastTwo >= 11 && lastTwo <= 14) return "минут";
  if (last === 1) return "минуту";
  if (last >= 2 && last <= 4) return "минуты";
  return "минут";
}

function formatOrderAge(minutes) {
  const safeMinutes = Math.max(1, Math.round(minutes));
  return `${safeMinutes} ${getMinuteWord(safeMinutes)} назад`;
}

function markValueAsUpdating(valueElement) {
  if (!valueElement) return;
  valueElement.classList.remove("updating");
  // Force reflow to replay the subtle flash when the CRM value changes.
  void valueElement.offsetWidth;
  valueElement.classList.add("updating");
}

function bindLiveOrderItems() {
  const items = new Set(
    Array.from(document.querySelectorAll('[data-live-order-item="last-order"]')),
  );

  document.querySelectorAll(".hero-live-bar").forEach((bar) => {
    const valueById = bar.querySelector("#last-order-time");
    const itemById = valueById?.closest(".hero-live-item");

    if (itemById) {
      items.add(itemById);
      return;
    }

    const itemByLabel = Array.from(bar.querySelectorAll(".hero-live-item")).find((item) => {
      const label = item.querySelector(".hero-live-label")?.textContent?.trim().toLowerCase() || "";
      return label.startsWith("последний заказ");
    });

    if (itemByLabel) items.add(itemByLabel);
  });

  return Array.from(items).filter((item) => {
    const label = item.querySelector(".hero-live-label");
    const value = item.querySelector(".hero-live-value");
    if (!label || !value) return false;

    item.dataset.liveOrderItem = "last-order";
    if (!item.dataset.defaultLabel) item.dataset.defaultLabel = "Последний заказ:";
    if (!item.dataset.defaultValue) item.dataset.defaultValue = value.textContent.trim();
    if (!item.hasAttribute("aria-live")) item.setAttribute("aria-live", "polite");

    return true;
  });
}

function isCrmStateUsable(state, nowMs) {
  if (!state) return false;
  if (state.lastOrderAt > nowMs + 5 * MINUTE_MS) return false;
  if (state.nextOrderAt > nowMs + 24 * 60 * MINUTE_MS) return false;
  return true;
}

function getLiveOrderCrmState(nowMs, initialAgeMinutes, isOpen, storageKey) {
  let state = readStoredCrmState(storageKey);
  if (!isCrmStateUsable(state, nowMs)) {
    state = createCrmState(nowMs, initialAgeMinutes);
  }

  if (!isOpen) {
    state.updatedAt = nowMs;
    writeStoredCrmState(storageKey, state);
    return state;
  }

  // If the user returns after a long pause, keep the CRM believable instead of
  // showing an overnight age. Short gaps are preserved, so "12 минут" naturally
  // becomes "14 минут" unless a simulated CRM order arrives.
  const currentAgeMinutes = Math.floor((nowMs - state.lastOrderAt) / MINUTE_MS);
  if (currentAgeMinutes > MAX_VISIBLE_ORDER_AGE_MINUTES) {
    const freshAgeMinutes = getCrmInt(
      state,
      MIN_INITIAL_ORDER_AGE_MINUTES,
      Math.min(MAX_INITIAL_ORDER_AGE_MINUTES, MAX_VISIBLE_ORDER_AGE_MINUTES),
    );
    state.lastOrderAt = nowMs - freshAgeMinutes * MINUTE_MS;
    state.nextOrderAt = nowMs + getNextOrderInterval(state);
  }

  let safety = 0;
  while (nowMs >= state.nextOrderAt && safety < 120) {
    state.lastOrderAt = state.nextOrderAt;
    state.nextOrderAt += getNextOrderInterval(state);
    safety += 1;
  }

  state.updatedAt = nowMs;
  writeStoredCrmState(storageKey, state);
  return state;
}

function getClosedLiveOrderText(availability) {
  const [hour = 0] = availability.moscowTime.split(":").map(Number);
  return hour >= CLOSING_HOUR
    ? "закрыт до 8:00 МСК"
    : "откроется в 8:00 МСК";
}

function renderLiveOrderItems(items, availability, state, nowMs, cityCode) {
  const ageMinutes = Math.max(1, Math.floor((nowMs - state.lastOrderAt) / MINUTE_MS));
  const openText = formatOrderAge(ageMinutes);
  const closedText = getClosedLiveOrderText(availability);

  items.forEach((item) => {
    const label = item.querySelector(".hero-live-label");
    const value = item.querySelector(".hero-live-value");
    if (!label || !value) return;

    const nextLabel = availability.isOpen ? "Последний заказ:" : "Приём звонков:";
    const nextValue = availability.isOpen ? openText : closedText;
    const previousText = `${label.textContent}|${value.textContent}`;

    label.textContent = nextLabel;
    value.textContent = nextValue;

    item.classList.toggle("is-open", availability.isOpen);
    item.classList.toggle("is-closed", !availability.isOpen);
    item.dataset.moscowTime = availability.moscowTime;
    item.dataset.crmCity = cityCode;
    item.dataset.crmLastOrderAt = String(state.lastOrderAt);
    item.title = availability.isOpen
      ? `Сейчас ${availability.moscowTime} МСК. Приём звонков до 20:00 МСК. CRM: последний заказ ${openText}.`
      : `Сейчас ${availability.moscowTime} МСК. Приём звонков с 08:00 до 20:00 МСК; время последнего заказа не показывается.`;

    if (previousText !== `${nextLabel}|${nextValue}`) markValueAsUpdating(value);
  });
}

/* ===== LIVE CRM: BRIGADES & ORDERS ===== */

function bindLiveCrmItems() {
  const items = Array.from(document.querySelectorAll("[data-live-crm]"));
  return items.filter((item) => {
    const label = item.querySelector(".hero-live-label");
    const value = item.querySelector(".hero-live-value");
    if (!label || !value) return false;

    if (!item.dataset.defaultLabel) item.dataset.defaultLabel = label.textContent.trim();
    if (!item.dataset.defaultValue) item.dataset.defaultValue = value.textContent.trim();
    if (!item.hasAttribute("aria-live")) item.setAttribute("aria-live", "polite");

    return true;
  });
}

function getCrmStorageKey(prefix, cityCode) {
  return `${prefix}:${normalizeCrmStoragePart(cityCode)}`;
}

function readCrmState(storageKey) {
  const storage = getSafeLocalStorage();
  if (!storage) return inMemoryCrmStateByKey.get(storageKey) || null;

  try {
    const parsed = JSON.parse(storage.getItem(storageKey) || "null");
    if (!parsed || parsed.version !== 1) return null;
    if (![parsed.seed, parsed.updatedAt].every(Number.isFinite)) return null;
    return parsed;
  } catch (error) {
    return null;
  }
}

function writeCrmState(storageKey, state) {
  inMemoryCrmStateByKey.set(storageKey, state);
  const storage = getSafeLocalStorage();
  if (!storage) return;
  try {
    storage.setItem(storageKey, JSON.stringify(state));
  } catch (error) {
    // Ignore quota/private-mode errors.
  }
}

function getMoscowDayKey(date = new Date()) {
  const parts = moscowTimeFormatter.formatToParts(date);
  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;
  return `${year}-${month}-${day}`;
}

function createBrigadesCrmState(nowMs) {
  const state = {
    version: 1,
    seed: Math.floor(Math.random() * 4294967295) >>> 0,
    value: Math.floor(Math.random() * (BRIGADES_INITIAL_MAX - BRIGADES_INITIAL_MIN + 1)) + BRIGADES_INITIAL_MIN,
    nextUpdateAt: nowMs + Math.floor(Math.random() * (BRIGADES_UPDATE_INTERVAL_MAX_MS - BRIGADES_UPDATE_INTERVAL_MIN_MS + 1)) + BRIGADES_UPDATE_INTERVAL_MIN_MS,
    updatedAt: nowMs,
  };
  return state;
}

function updateBrigadesCrmState(state, nowMs, isOpen) {
  let safety = 0;
  while (nowMs >= state.nextUpdateAt && safety < 120) {
    const change = isOpen
      ? (nextCrmRandom(state) < 0.45 ? -1 : nextCrmRandom(state) < 0.75 ? 0 : 1)
      : (nextCrmRandom(state) < 0.7 ? 1 : nextCrmRandom(state) < 0.9 ? 0 : -1);
    state.value = clampNumber(state.value + change, BRIGADES_MIN, BRIGADES_MAX);
    state.nextUpdateAt += getCrmInt(state, BRIGADES_UPDATE_INTERVAL_MIN_MS, BRIGADES_UPDATE_INTERVAL_MAX_MS);
    safety += 1;
  }
  state.updatedAt = nowMs;
  return state;
}

function getBrigadesCrmState(nowMs, cityCode, isOpen) {
  const storageKey = getCrmStorageKey(CRM_BRIGADES_STORAGE_PREFIX, cityCode);
  let state = readCrmState(storageKey);
  if (!state) {
    state = createBrigadesCrmState(nowMs);
  }
  state = updateBrigadesCrmState(state, nowMs, isOpen);
  writeCrmState(storageKey, state);
  return state;
}

function createOrdersCrmState(nowMs, dayKey) {
  const seed = Math.floor(Math.random() * 4294967295) >>> 0;
  const state = {
    version: 1,
    seed,
    value: Math.floor(Math.random() * (ORDERS_INITIAL_MAX - ORDERS_INITIAL_MIN + 1)) + ORDERS_INITIAL_MIN,
    dayKey,
    nextUpdateAt: nowMs + getCrmInt({ seed }, ORDERS_DAY_INCREMENT_MIN_MS, ORDERS_DAY_INCREMENT_MAX_MS),
    updatedAt: nowMs,
  };
  return state;
}

function updateOrdersCrmState(state, nowMs, isOpen) {
  const incrementMin = isOpen ? ORDERS_DAY_INCREMENT_MIN_MS : ORDERS_NIGHT_INCREMENT_MIN_MS;
  const incrementMax = isOpen ? ORDERS_DAY_INCREMENT_MAX_MS : ORDERS_NIGHT_INCREMENT_MAX_MS;

  let safety = 0;
  while (nowMs >= state.nextUpdateAt && safety < 240) {
    state.value += 1;
    state.nextUpdateAt += getCrmInt(state, incrementMin, incrementMax);
    safety += 1;
  }
  state.updatedAt = nowMs;
  return state;
}

function getOrdersCrmState(nowMs, cityCode, isOpen) {
  const storageKey = getCrmStorageKey(CRM_ORDERS_STORAGE_PREFIX, cityCode);
  const currentDayKey = getMoscowDayKey(new Date(nowMs));
  let state = readCrmState(storageKey);

  if (!state || state.dayKey !== currentDayKey) {
    state = createOrdersCrmState(nowMs, currentDayKey);
  }

  state = updateOrdersCrmState(state, nowMs, isOpen);
  writeCrmState(storageKey, state);
  return state;
}

function renderLiveCrmItems(items, nowMs, cityCode, isOpen) {
  const brigadesState = getBrigadesCrmState(nowMs, cityCode, isOpen);
  const ordersState = getOrdersCrmState(nowMs, cityCode, isOpen);

  items.forEach((item) => {
    const type = item.dataset.liveCrm;
    const valueEl = item.querySelector(".hero-live-value");
    if (!valueEl) return;

    let nextValue;
    if (type === "brigades") {
      nextValue = String(brigadesState.value);
    } else if (type === "orders-today") {
      nextValue = String(ordersState.value);
    } else {
      return;
    }

    if (valueEl.textContent !== nextValue) {
      markValueAsUpdating(valueEl);
      valueEl.textContent = nextValue;
    }

    item.dataset.crmCity = cityCode;
    item.classList.toggle("is-open", isOpen);
    item.classList.toggle("is-closed", !isOpen);
  });
}

export function initApplicationAvailability() {
  const statusElements = document.querySelectorAll("[data-application-status]");
  const liveOrderItems = bindLiveOrderItems();
  const liveCrmItems = bindLiveCrmItems();
  if (!statusElements.length && !liveOrderItems.length && !liveCrmItems.length) return;

  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "local";
  const crmCity = getCurrentCrmCity();
  const liveOrderStorageKey = getLiveOrderStorageKey(crmCity);
  const initialOrderAgeMinutes = parseInitialOrderAgeMinutes(liveOrderItems);
  let updateTimer;

  const updateStatus = () => {
    const now = new Date();
    const nowMs = now.getTime();
    const availability = getApplicationAvailability(now);

    statusElements.forEach((statusElement) => {
      const textElement = statusElement.querySelector("[data-application-status-text]");
      if (textElement && textElement.textContent !== availability.text) {
        textElement.textContent = availability.text;
      }

      statusElement.classList.toggle("is-open", availability.isOpen);
      statusElement.classList.toggle("is-closed", !availability.isOpen);
      statusElement.dataset.userTimeZone = userTimeZone;
      statusElement.dataset.moscowTime = availability.moscowTime;
      statusElement.title = `Сейчас ${availability.moscowTime} МСК. Менеджеры на связи ежедневно с 08:00 до 20:00 МСК.`;
    });

    if (liveOrderItems.length) {
      const state = getLiveOrderCrmState(
        nowMs,
        initialOrderAgeMinutes,
        availability.isOpen,
        liveOrderStorageKey,
      );
      renderLiveOrderItems(liveOrderItems, availability, state, nowMs, crmCity);
    }

    if (liveCrmItems.length) {
      renderLiveCrmItems(liveCrmItems, nowMs, crmCity, availability.isOpen);
    }
  };

  const scheduleNextUpdate = () => {
    window.clearTimeout(updateTimer);
    const now = new Date();
    const delayUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds() + 50;

    updateTimer = window.setTimeout(() => {
      updateStatus();
      scheduleNextUpdate();
    }, Math.max(1000, delayUntilNextMinute));
  };

  updateStatus();
  scheduleNextUpdate();

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      updateStatus();
      scheduleNextUpdate();
    }
  });
}
