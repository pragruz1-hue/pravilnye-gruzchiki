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

export function initApplicationAvailability() {
  const statusElements = document.querySelectorAll("[data-application-status]");
  if (!statusElements.length) return;

  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "local";
  let updateTimer;

  const updateStatus = () => {
    const availability = getApplicationAvailability(new Date());

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
