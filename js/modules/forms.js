/**
 * Phone masks, compliant form submission and analytics consent.
 * Personal-data forms post only to the same-origin Russian backend.
 */

import { detectSiteBasePath } from "./helpers.js";

const LEAD_ENDPOINT = "/api/submit-lead";
const MIN_FORM_TIME_MS = 2500;
const PERSONAL_DATA_CONSENT_VERSION = "2026-07-09-1";
const METRIKA_ID = 110161606;
const COOKIE_CONSENT_KEY = "pg_cookie_consent";
const COOKIE_CONSENT_VERSION = "2026-07-09-1";
const COOKIE_CONSENT_MAX_AGE_MS = 180 * 24 * 60 * 60 * 1000;
let leadBackendCheck = null;

/** Russian phone input masking. */
export function setupPhoneMask(input) {
  if (!input || input.dataset.phoneMaskReady === "true") return;
  input.dataset.phoneMaskReady = "true";

  input.addEventListener("input", (e) => {
    let inputNumbersValue = input.value.replace(/\D/g, "");
    let formattedInputValue = "";
    const selectionStart = input.selectionStart;

    if (!inputNumbersValue) { input.value = ""; return; }
    if (input.value.length !== selectionStart) {
      if (e.data && /\D/g.test(e.data)) input.value = inputNumbersValue;
      return;
    }

    if (["7", "8", "9"].includes(inputNumbersValue[0])) {
      if (inputNumbersValue[0] === "9") inputNumbersValue = `7${inputNumbersValue}`;
      if (inputNumbersValue[0] === "8") inputNumbersValue = `7${inputNumbersValue.substring(1)}`;
      formattedInputValue = "+7 ";
      if (inputNumbersValue.length > 1) formattedInputValue += `(${inputNumbersValue.substring(1, 4)}`;
      if (inputNumbersValue.length >= 5) formattedInputValue += `) ${inputNumbersValue.substring(4, 7)}`;
      if (inputNumbersValue.length >= 8) formattedInputValue += `-${inputNumbersValue.substring(7, 9)}`;
      if (inputNumbersValue.length >= 10) formattedInputValue += `-${inputNumbersValue.substring(9, 11)}`;
    } else {
      formattedInputValue = `+${inputNumbersValue.substring(0, 16)}`;
    }
    input.value = formattedInputValue;
  });

  input.addEventListener("keydown", (e) => {
    const numVal = input.value.replace(/\D/g, "");
    if (e.key === "Backspace" && numVal.length <= 1) input.value = "";
  });
  input.addEventListener("focus", () => { if (!input.value) input.value = "+7 "; });
  input.addEventListener("blur", () => { if (input.value === "+7 " || input.value === "+7") input.value = ""; });
}

export function initPhoneMasks() {
  document.querySelectorAll('input[type="tel"]').forEach(setupPhoneMask);
}

function ensureAntiSpamFields(form) {
  if (!form || form.dataset.antiSpamReady === "true") return;
  form.dataset.antiSpamReady = "true";
  form.dataset.formStartedAt = String(Date.now());

  if (!form.querySelector('input[name="_gotcha"]')) {
    const hpWrap = document.createElement("div");
    hpWrap.className = "form-hp-field";
    hpWrap.setAttribute("aria-hidden", "true");
    hpWrap.innerHTML = '<label>Не заполняйте это поле</label><input type="text" name="_gotcha" tabindex="-1" autocomplete="off">';
    form.appendChild(hpWrap);
  }

  if (!form.querySelector('input[name="_startedAt"]')) {
    const started = document.createElement("input");
    started.type = "hidden";
    started.name = "_startedAt";
    started.value = form.dataset.formStartedAt;
    form.appendChild(started);
  }

  if (!form.querySelector('input[name="_formToken"]')) {
    const token = document.createElement("input");
    token.type = "hidden";
    token.name = "_formToken";
    const nonce = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    token.value = btoa(`${form.dataset.formStartedAt}:${nonce}`);
    form.appendChild(token);
  }
}

function isPersonalDataForm(form) {
  if (!form) return false;
  const method = String(form.method || form.getAttribute("method") || "get").toLowerCase();
  if (form.id === "hero-quick-form" || method === "get") return false;
  return Boolean(form.querySelector('input[type="tel"], input[name="name"], textarea'));
}

/** Add a separate, explicit personal-data consent to a form. */
export function preparePersonalDataForm(form) {
  if (!form) return;
  ensureAntiSpamFields(form);

  form.querySelectorAll("input, textarea, select").forEach((field) => {
    field.classList.add("ym-disable-keys");
  });

  if (!isPersonalDataForm(form) || form.dataset.personalDataReady === "true") return;
  form.dataset.personalDataReady = "true";
  form.dataset.requiresPersonalDataConsent = "true";

  const basePath = detectSiteBasePath();
  const checkboxId = `personal-data-consent-${form.id || Math.random().toString(36).slice(2)}`;
  const consent = document.createElement("div");
  consent.className = "personal-data-consent";
  consent.innerHTML = `
    <label class="personal-data-consent-label" for="${checkboxId}">
      <input type="checkbox" id="${checkboxId}" name="personal_data_consent" value="accepted" required>
      <span>Я даю отдельное <a href="${basePath}consent-personal-data.html" target="_blank" rel="noopener">согласие на обработку персональных данных</a> для обработки заявки и обратной связи.</span>
    </label>
    <input type="hidden" name="consent_version" value="${PERSONAL_DATA_CONSENT_VERSION}">
  `;

  const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
  if (submitButton) submitButton.insertAdjacentElement("beforebegin", consent);
  else form.appendChild(consent);

  if (form.id === "review-form") {
    const publicationConsent = document.createElement("div");
    publicationConsent.className = "personal-data-consent";
    publicationConsent.innerHTML = `
      <label class="personal-data-consent-label" for="review-publication-consent">
        <input type="checkbox" id="review-publication-consent" name="review_publication_consent" value="accepted" required>
        <span>Я даю отдельное <a href="${basePath}consent-review-publication.html" target="_blank" rel="noopener">согласие на публикацию отзыва</a>. Телефон публиковаться не будет.</span>
      </label>
      <input type="hidden" name="publication_consent_version" value="2026-07-09-1">
    `;
    consent.insertAdjacentElement("afterend", publicationConsent);
  }
}

function hasPersonalDataConsent(form) {
  if (!form || form.dataset.requiresPersonalDataConsent !== "true") return true;
  if (form.checkValidity()) return true;
  form.reportValidity();
  form.querySelector(":invalid")?.focus();
  return false;
}

function isLikelyBot(form) {
  const hp = form.querySelector('input[name="_gotcha"]');
  const token = form.querySelector('input[name="_formToken"]');
  const startedAt = Number(form.querySelector('input[name="_startedAt"]')?.value || form.dataset.formStartedAt || 0);
  return Boolean(hp?.value) || !token?.value || Date.now() - startedAt < MIN_FORM_TIME_MS;
}

async function ensureLeadBackendAvailable() {
  if (!leadBackendCheck) {
    leadBackendCheck = fetch("/api/health", {
      method: "GET",
      credentials: "same-origin",
      headers: { Accept: "application/json" },
      cache: "no-store",
    }).then(async (response) => {
      let result = null;
      try { result = await response.json(); } catch (_) { /* static hosting returns HTML */ }
      if (!response.ok || result?.status !== "ok" || result?.storage !== "local-rf-required") {
        throw new Error("Сервис онлайн-заявок ещё не подключён. Позвоните нам по номеру +7 (928) 333-32-81.");
      }
      return true;
    }).catch((error) => {
      leadBackendCheck = null;
      throw error;
    });
  }
  return leadBackendCheck;
}

/** Submit a lead to the same-origin endpoint. No foreign form processor is used. */
export async function submitLead(payload, form) {
  preparePersonalDataForm(form);

  if (!hasPersonalDataConsent(form)) {
    throw new Error("Подтвердите отдельное согласие на обработку персональных данных.");
  }
  if (isLikelyBot(form)) {
    throw new Error("Проверка формы не пройдена. Пожалуйста, попробуйте ещё раз через несколько секунд.");
  }

  // Verify a compatible RF-hosted backend before creating or transmitting the payload.
  // On static GitHub Pages this harmless GET fails and personal data never leaves the form.
  await ensureLeadBackendAvailable();

  const formValues = Object.fromEntries(new FormData(form).entries());
  const data = {
    ...formValues,
    ...payload,
    personalDataConsent: true,
    consentVersion: PERSONAL_DATA_CONSENT_VERSION,
    consentTimestamp: new Date().toISOString(),
    reviewPublicationConsent: form.querySelector('input[name="review_publication_consent"]')?.checked || false,
    publicationConsentVersion: form.querySelector('input[name="publication_consent_version"]')?.value || "",
    page: window.location.pathname,
  };

  const response = await fetch(LEAD_ENDPOINT, {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(data),
  });

  let result = null;
  try { result = await response.json(); } catch (_) { /* non-JSON proxy error */ }
  if (!response.ok) {
    throw new Error(result?.error || "Онлайн-заявки временно недоступны. Позвоните нам по номеру +7 (928) 333-32-81.");
  }
  return result || { success: true };
}

function initGenericLeadForm(form) {
  if (!form || form.dataset.genericLeadReady === "true") return;
  if (form.id !== "intercity-form") return;
  form.dataset.genericLeadReady = "true";

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    showButtonSpinner(button);
    try {
      await submitLead({ source: "Intercity Form" }, form);
      hideButtonSpinner(button);
      form.reset();
      showToast("Заявка отправлена. Менеджер свяжется с вами в рабочее время.", "success");
    } catch (error) {
      hideButtonSpinner(button);
      showToast(error.message || "Не удалось отправить заявку.", "error");
    }
  });
}

export function initFormsAntiSpam() {
  document.querySelectorAll("form").forEach((form) => {
    preparePersonalDataForm(form);
    initGenericLeadForm(form);
  });
}

export function showToast(message, type = "error") {
  document.querySelectorAll(".pg-toast").forEach((toast) => toast.remove());
  const toast = document.createElement("div");
  toast.className = `pg-toast pg-toast-${type}`;
  toast.setAttribute("role", "alert");
  toast.innerHTML = `<span>${message}</span>`;
  toast.style.cssText = `
    position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
    background: ${type === "error" ? "#ef4444" : "#10b981"};
    color: white; padding: 12px 24px; border-radius: 8px;
    font-size: 15px; z-index: 10000; box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    animation: toastIn 0.3s ease; max-width: min(92vw, 680px);
  `;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.3s";
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

export function showButtonSpinner(btn) {
  if (!btn || btn.classList.contains("btn-loading")) return;
  btn.classList.add("btn-loading");
  btn.dataset.originalText = btn.textContent || btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `<span class="btn-text" style="visibility:hidden">${btn.dataset.originalText}</span><span class="btn-spinner"></span>`;
}

export function hideButtonSpinner(btn) {
  if (!btn) return;
  btn.classList.remove("btn-loading");
  btn.disabled = false;
  if (btn.dataset.originalText) btn.innerHTML = btn.dataset.originalText;
}

function getCookieConsent() {
  try {
    const value = JSON.parse(localStorage.getItem(COOKIE_CONSENT_KEY) || "null");
    if (!value || value.version !== COOKIE_CONSENT_VERSION) return null;
    if (!value.savedAt || Date.now() - Date.parse(value.savedAt) > COOKIE_CONSENT_MAX_AGE_MS) return null;
    return value.choice === "analytics" || value.choice === "necessary" ? value : null;
  } catch (_) {
    return null;
  }
}

function saveCookieConsent(choice) {
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
    choice,
    version: COOKIE_CONSENT_VERSION,
    savedAt: new Date().toISOString(),
  }));
  localStorage.removeItem("cookie_consent");
}

function loadYandexMetrika() {
  if (document.querySelector('script[data-pg-metrika="true"]')) return;
  window[`disableYaCounter${METRIKA_ID}`] = false;
  window.ym = window.ym || function metrikaQueue() { (window.ym.a = window.ym.a || []).push(arguments); };
  window.ym.l = Date.now();
  window.ym(METRIKA_ID, "init", {
    clickmap: false,
    trackLinks: true,
    accurateTrackBounce: true,
    webvisor: false,
  });

  const script = document.createElement("script");
  script.async = true;
  script.dataset.pgMetrika = "true";
  script.src = `https://mc.yandex.ru/metrika/tag.js?id=${METRIKA_ID}`;
  document.head.appendChild(script);
}

function disableYandexMetrika() {
  window[`disableYaCounter${METRIKA_ID}`] = true;
  const cookieNames = String(document.cookie || "").split(";").map((part) => part.split("=")[0].trim()).filter(Boolean);
  cookieNames.filter((name) => name.startsWith("_ym_")).forEach((name) => {
    document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
    document.cookie = `${name}=; Max-Age=0; path=/; domain=.${window.location.hostname}; SameSite=Lax`;
  });
  Object.keys(localStorage).filter((key) => key.startsWith("_ym") || key.startsWith("ym:")).forEach((key) => localStorage.removeItem(key));
}

function createCookieUi() {
  document.getElementById("cookie-banner")?.remove();
  document.getElementById("cookie-settings-btn")?.remove();
  const basePath = detectSiteBasePath();

  const banner = document.createElement("div");
  banner.className = "cookie-consent-banner";
  banner.id = "cookie-banner";
  banner.setAttribute("role", "dialog");
  banner.setAttribute("aria-label", "Настройки аналитических cookies");
  banner.innerHTML = `
    <div class="cookie-consent-content">
      <p>Необходимые настройки сохраняют выбранный город и параметры сайта. Яндекс.Метрика включается только с вашего согласия. Подробнее — в <a href="${basePath}cookies.html">политике cookies</a>.</p>
      <div class="cookie-consent-btns">
        <button type="button" class="btn btn-primary btn-sm" id="cookie-accept-btn">Разрешить аналитику</button>
        <button type="button" class="btn btn-secondary btn-sm" id="cookie-decline-btn">Только необходимые</button>
      </div>
    </div>
  `;

  const settingsButton = document.createElement("button");
  settingsButton.type = "button";
  settingsButton.className = "cookie-settings-button";
  settingsButton.id = "cookie-settings-btn";
  settingsButton.textContent = "Настройки cookies";
  settingsButton.setAttribute("aria-controls", "cookie-banner");

  document.body.append(banner, settingsButton);
  return { banner, settingsButton };
}

/** Consent manager. Analytics never loads before an explicit opt-in. */
export function initCookieBanner() {
  const { banner, settingsButton } = createCookieUi();
  const storedConsent = getCookieConsent();

  if (storedConsent?.choice === "analytics") loadYandexMetrika();
  else disableYandexMetrika();

  const showBanner = () => banner.classList.add("active");
  const hideBanner = () => banner.classList.remove("active");

  settingsButton.addEventListener("click", showBanner);
  document.getElementById("cookie-accept-btn")?.addEventListener("click", () => {
    saveCookieConsent("analytics");
    loadYandexMetrika();
    hideBanner();
  });
  document.getElementById("cookie-decline-btn")?.addEventListener("click", () => {
    const analyticsWasLoaded = Boolean(document.querySelector('script[data-pg-metrika="true"]'));
    saveCookieConsent("necessary");
    disableYandexMetrika();
    hideBanner();
    if (analyticsWasLoaded) window.location.reload();
  });

  if (!storedConsent) setTimeout(showBanner, 300);
}
