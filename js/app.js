/**
 * Правильные Грузчики — Interactive Engine
 * Dynamic Geotargeting, Cost Calculator, Phone Masking, Modal System, FAQ Accordion, and Animations
 * Modular architecture — each module handles a specific concern.
 * 
 * Author: Виталий С
 * Date: 2026-07-09
 */

import { initHeaderFX, initMobileMenu, initScrollToTop, initCardGlow, initStatsCounter, initActiveWorkers } from "./modules/ui.js";
import { initGeotargeting } from "./modules/geotargeting.js";
import { initCalculator } from "./modules/calculator.js";
import { initPhoneMasks, initFormsAntiSpam } from "./modules/forms.js";
import { initOrderModal, initReviewModal, initExitIntentPopup } from "./modules/modals.js";
import { initFaqAccordion } from "./modules/faq.js";
import { initCargoCalculator } from "./modules/cargo.js";

document.addEventListener("DOMContentLoaded", () => {
  // 1. Core UI
  initHeaderFX();
  initMobileMenu();
  initScrollToTop();
  initCardGlow();
  initStatsCounter();
  initActiveWorkers();

  // 2. Geotargeting + city management
  initGeotargeting();

  // 3. Forms & phone masks
  initPhoneMasks();
  initFormsAntiSpam();

  // 4. Calculator
  initCalculator();

  // 5. Modals
  initOrderModal();
  initReviewModal();

  // 6. FAQ
  initFaqAccordion();

  // 7. Cargo visual calculator
  initCargoCalculator();

  // 8. Exit-intent popup (delayed)
  setTimeout(initExitIntentPopup, 2000);
});