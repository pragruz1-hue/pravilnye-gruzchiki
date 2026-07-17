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
import { initPhoneMasks, initFormsAntiSpam, initCookieBanner } from "./modules/forms.js";
import { initOrderModal, initReviewModal, initExitIntentPopup } from "./modules/modals.js";
import { initFaqAccordion } from "./modules/faq.js";
import { renderReviews, initReviewsCarouselControls } from "./modules/reviews.js";
import { initApplicationAvailability } from "./modules/availability.js";
import { initBlogCityLinks } from "./modules/blogCityLinks.js";

document.addEventListener("DOMContentLoaded", () => {
  // 0. Cookie consent banner (before Metrika loads)
  initCookieBanner();

  // 1. Core UI
  initHeaderFX();
  initMobileMenu();
  initScrollToTop();
  initCardGlow();
  initStatsCounter();
  initActiveWorkers();
  initApplicationAvailability();

  // 2. Geotargeting + city management
  initGeotargeting();

  // 2.5. Blog city links (dynamic city prefix in article service links)
  initBlogCityLinks();

  // 2.5. Reviews carousel (city-specific; also listens to cityChanged)
  const cityCode = localStorage.getItem("selected_city") || "krasnodar";
  renderReviews(cityCode);
  initReviewsCarouselControls();

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
  // Load the heavy Three.js module only on cargo pages. Keeping it out of the
  // common startup path prevents one calculator dependency from breaking reviews
  // and the rest of the site if the cargo bundle fails to load.
  if (document.getElementById("cargo-visual-calculator")) {
    import("./modules/cargo.js")
      .then(({ initCargoCalculator }) => initCargoCalculator())
      .catch((error) => {
        console.error("Не удалось загрузить грузовой калькулятор", error);
      });
  }

  // 8. Exit-intent popup (delayed)
  setTimeout(initExitIntentPopup, 2000);

  // Tooltip click handler for mobile / touch devices
  document.addEventListener("click", function(e) {
    const tooltips = document.querySelectorAll(".info-tooltip");
    tooltips.forEach(t => {
      if (t.contains(e.target)) {
        t.classList.toggle("active");
      } else {
        t.classList.remove("active");
      }
    });
  });

});