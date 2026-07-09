/**
 * UI interactions: sticky header, mobile menu, scroll-to-top, card glow, stats counter, workers fluctuation
 */

import { getWorkersWord } from "./helpers.js";

// Sticky header
export function initHeaderFX() {
  const header = document.getElementById("site-header");
  if (!header) return;
  window.addEventListener("scroll", () => {
    header.classList.toggle("sticky", window.scrollY > 50);
  });
}

// Mobile menu toggle
export function initMobileMenu() {
  const burgerBtn = document.getElementById("burger-btn");
  const mobileMenuOverlay = document.getElementById("mobile-menu-overlay");
  if (!burgerBtn || !mobileMenuOverlay) return;

  function toggleMobileMenu() {
    burgerBtn.classList.toggle("active");
    mobileMenuOverlay.classList.toggle("active");
    document.body.classList.toggle("no-scroll");
  }

  burgerBtn.addEventListener("click", toggleMobileMenu);

  const mobileMenuClose = document.getElementById("mobile-menu-close");
  if (mobileMenuClose) {
    mobileMenuClose.addEventListener("click", () => {
      if (mobileMenuOverlay.classList.contains("active")) toggleMobileMenu();
    });
  }

  mobileMenuOverlay.addEventListener("click", (e) => {
    if (e.target === mobileMenuOverlay && mobileMenuOverlay.classList.contains("active")) toggleMobileMenu();
  });

  document.querySelectorAll(".mobile-link").forEach((link) => {
    link.addEventListener("click", () => {
      if (mobileMenuOverlay.classList.contains("active")) toggleMobileMenu();
    });
  });

  const mobileCta = document.getElementById("mobile-menu-cta");
  if (mobileCta) {
    mobileCta.addEventListener("click", () => {
      if (mobileMenuOverlay.classList.contains("active")) toggleMobileMenu();
    });
  }
}

// Scroll-to-top button
export function initScrollToTop() {
  const btn = document.getElementById("scrollTopBtn");
  if (!btn) return;

  const toggle = () => {
    btn.style.display = window.scrollY > 300 ? "flex" : "none";
  };
  toggle();
  window.addEventListener("scroll", toggle, { passive: true });
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

// Premium card spot glow
export function initCardGlow() {
  document.querySelectorAll(".premium-card").forEach((card) => {
    if (!card.querySelector(".card-glow")) {
      const glowDiv = document.createElement("div");
      glowDiv.classList.add("card-glow");
      card.appendChild(glowDiv);
    }
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
      card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
    });
  });
}

// Animated stats counter
export function initStatsCounter() {
  const statNumbers = document.querySelectorAll(".stat-num");
  if (!statNumbers.length) return;

  const countUp = (element) => {
    const target = parseInt(element.getAttribute("data-target"), 10) || 0;
    const duration = 1500;
    const startTime = performance.now();
    const animate = (currentTime) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeProgress = progress * (2 - progress);
      element.textContent = Math.floor(easeProgress * target).toLocaleString("ru-RU");
      if (progress < 1) requestAnimationFrame(animate);
      else element.textContent = target.toLocaleString("ru-RU");
    };
    requestAnimationFrame(animate);
  };

  if ("IntersectionObserver" in window) {
    const statsObserver = new IntersectionObserver((entries, observer) => {
      if (entries[0].isIntersecting) {
        statNumbers.forEach((stat) => countUp(stat));
        observer.disconnect();
      }
    }, { threshold: 0.1 });
    const statsGrid = document.querySelector(".stats-grid");
    if (statsGrid) statsObserver.observe(statsGrid);
  }
}

// Active workers fluctuation
export function initActiveWorkers() {
  const el = document.getElementById("active-workers-count");
  if (!el) return;

  let currentCount = 128;
  let deltaBadge = document.getElementById("active-workers-delta");
  if (!deltaBadge) {
    deltaBadge = document.createElement("span");
    deltaBadge.id = "active-workers-delta";
    deltaBadge.className = "workers-delta";
    el.parentNode.insertBefore(deltaBadge, el.nextSibling);
  }

  setInterval(() => {
    let change = 0;
    while (change === 0) change = Math.floor(Math.random() * 7) - 3;
    currentCount = Math.max(118, Math.min(138, currentCount + change));
    deltaBadge.className = "workers-delta";
    void deltaBadge.offsetWidth;
    if (change > 0) { deltaBadge.textContent = `+${change}`; deltaBadge.classList.add("delta-positive"); }
    else { deltaBadge.textContent = `${change}`; deltaBadge.classList.add("delta-negative"); }
    el.classList.add("number-pulse");
    setTimeout(() => { el.textContent = currentCount; }, 150);
    setTimeout(() => { el.classList.remove("number-pulse"); }, 450);
  }, 6000 + Math.random() * 4000);
}