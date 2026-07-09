/**
 * Phone mask, Formspree integration, and form submission handling
 */

const FORMSPREE_ENDPOINT = "https://formspree.io/f/xeebjwkn";
const MIN_FORM_TIME_MS = 2500;

/**
 * Russian phone input masking
 */
export function setupPhoneMask(input) {
  input.addEventListener("input", (e) => {
    let inputNumbersValue = input.value.replace(/\D/g, "");
    let formattedInputValue = "";
    let selectionStart = input.selectionStart;

    if (!inputNumbersValue) { input.value = ""; return; }
    if (input.value.length !== selectionStart) {
      if (e.data && /\D/g.test(e.data)) input.value = inputNumbersValue;
      return;
    }

    if (["7", "8", "9"].indexOf(inputNumbersValue[0]) > -1) {
      if (inputNumbersValue[0] === "9") inputNumbersValue = "7" + inputNumbersValue;
      let firstChar = "+7";
      if (inputNumbersValue[0] === "8") inputNumbersValue = "7" + inputNumbersValue.substring(1);
      formattedInputValue = firstChar + " ";
      if (inputNumbersValue.length > 1) formattedInputValue += "(" + inputNumbersValue.substring(1, 4);
      if (inputNumbersValue.length >= 5) formattedInputValue += ") " + inputNumbersValue.substring(4, 7);
      if (inputNumbersValue.length >= 8) formattedInputValue += "-" + inputNumbersValue.substring(7, 9);
      if (inputNumbersValue.length >= 10) formattedInputValue += "-" + inputNumbersValue.substring(9, 11);
    } else {
      formattedInputValue = "+" + inputNumbersValue.substring(0, 16);
    }
    input.value = formattedInputValue;
  });

  input.addEventListener("keydown", (e) => {
    let numVal = input.value.replace(/\D/g, "");
    if (e.keyCode === 8 && numVal.length <= 1) input.value = "";
  });
  input.addEventListener("focus", () => { if (!input.value) input.value = "+7 "; });
  input.addEventListener("blur", () => { if (input.value === "+7 " || input.value === "+7") input.value = ""; });
}

/**
 * Initialize phone masks on all tel inputs
 */
export function initPhoneMasks() {
  document.querySelectorAll('input[type="tel"]').forEach(setupPhoneMask);
}

/**
 * Anti-spam field injection
 */
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

  const started = document.createElement("input");
  started.type = "hidden"; started.name = "_startedAt"; started.value = form.dataset.formStartedAt;
  form.appendChild(started);

  const token = document.createElement("input");
  token.type = "hidden"; token.name = "_formToken";
  const nonce = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  token.value = btoa(`${form.dataset.formStartedAt}:${nonce}`);
  form.appendChild(token);
}

function getAntiSpamPayload(form) {
  ensureAntiSpamFields(form);
  const hp = form.querySelector('input[name="_gotcha"]');
  const started = form.querySelector('input[name="_startedAt"]');
  const token = form.querySelector('input[name="_formToken"]');
  return {
    _gotcha: hp ? hp.value : "",
    _startedAt: started ? started.value : form.dataset.formStartedAt || "",
    _formToken: token ? token.value : "",
    page: window.location.pathname,
  };
}

function isLikelyBot(form) {
  const anti = getAntiSpamPayload(form);
  const elapsed = Date.now() - Number(anti._startedAt || 0);
  return Boolean(anti._gotcha) || !anti._formToken || elapsed < MIN_FORM_TIME_MS;
}

/**
 * Submit lead data to Formspree with anti-spam checks
 */
export async function submitLeadToFormspree(payload, form) {
  ensureAntiSpamFields(form);
  if (isLikelyBot(form)) {
    throw new Error("Проверка формы не пройдена. Пожалуйста, попробуйте еще раз через несколько секунд.");
  }

  const endpoint = form && form.action ? form.action : FORMSPREE_ENDPOINT;
  const data = new FormData(form);
  Object.entries({
    ...payload,
    page: window.location.pathname,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
  }).forEach(([key, value]) => {
    if (value !== undefined && value !== null) data.set(key, String(value));
  });

  const response = await fetch(endpoint, { method: "POST", headers: { Accept: "application/json" }, body: data });

  if (!response.ok) {
    let message = "Не удалось отправить заявку. Позвоните нам напрямую.";
    try {
      const result = await response.json();
      if (result && result.errors && result.errors[0] && result.errors[0].message) message = result.errors[0].message;
    } catch (_) {}
    throw new Error(message);
  }
  return true;
}

/**
 * Initialize anti-spam on all forms
 */
export function initFormsAntiSpam() {
  document.querySelectorAll("form").forEach(ensureAntiSpamFields);
}

/**
 * Show a toast notification instead of alert()
 */
export function showToast(message, type = "error") {
  // Remove existing toasts
  document.querySelectorAll(".pg-toast").forEach(t => t.remove());

  const toast = document.createElement("div");
  toast.className = `pg-toast pg-toast-${type}`;
  toast.setAttribute("role", "alert");
  toast.innerHTML = `<span>${message}</span>`;
  toast.style.cssText = `
    position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
    background: ${type === "error" ? "#ef4444" : "#10b981"};
    color: white; padding: 12px 24px; border-radius: 8px;
    font-size: 15px; z-index: 10000; box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    animation: toastIn 0.3s ease;
  `;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.3s";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}
