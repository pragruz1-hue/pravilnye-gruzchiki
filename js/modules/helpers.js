/**
 * Global helpers and pluralization utilities
 */

export function getWorkersWord(num) {
  const lastDigit = num % 10;
  const lastTwoDigits = num % 100;
  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return "человек";
  if (lastDigit === 1) return "человек";
  if (lastDigit >= 2 && lastDigit <= 4) return "человека";
  return "человек";
}

export function getHoursWord(num) {
  const lastDigit = num % 10;
  const lastTwoDigits = num % 100;
  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return "часов";
  if (lastDigit === 1) return "час";
  if (lastDigit >= 2 && lastDigit <= 4) return "часа";
  return "часов";
}

export function getFloorWord(num) {
  const lastDigit = num % 10;
  const lastTwoDigits = num % 100;
  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return "этаж";
  if (lastDigit === 1) return "этаж";
  if (lastDigit >= 2 && lastDigit <= 4) return "этаж";
  return "этаж";
}

export function detectSiteBasePath() {
  return document.querySelector('link[href^="../css/"]') ? "../" : "";
}
