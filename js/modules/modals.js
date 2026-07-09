/**
 * Modal windows: Order modal, Review modal, Exit-intent popup
 */

import { setupPhoneMask, submitLeadToFormspree, showToast, showButtonSpinner, hideButtonSpinner } from "./forms.js";
import { CITIES_DATA } from "./geotargeting.js";

// ==========================================
// ORDER MODAL
// ==========================================
export function initOrderModal() {
  const orderModal = document.getElementById("order-modal");
  if (!orderModal) return;

  const modalCloseBtn = document.getElementById("modal-close-btn");
  const modalSuccessCloseBtn = document.getElementById("modal-success-close-btn");
  const modalBookingForm = document.getElementById("modal-booking-form");
  const modalSuccessConfirm = document.getElementById("modal-success-confirm");
  const modalServiceName = document.getElementById("modal-service-name");
  const modalServiceInput = document.getElementById("modal-service-input");
  const modalDetailsInput = document.getElementById("modal-details-input");
  const modalSummaryBadge = document.getElementById("modal-summary-badge");

  function openModal(serviceName, details, calculatedPrice) {
    if (modalBookingForm) { modalBookingForm.reset(); modalBookingForm.style.display = "block"; }
    if (modalSuccessConfirm) modalSuccessConfirm.classList.remove("active");
    if (modalServiceName) modalServiceName.textContent = serviceName;
    if (modalServiceInput) modalServiceInput.value = serviceName;
    if (modalDetailsInput) modalDetailsInput.value = details;

    if (modalSummaryBadge) {
      if (calculatedPrice === "Договорная" || calculatedPrice === 0) {
        modalSummaryBadge.style.display = "block";
        modalSummaryBadge.innerHTML = `Сумма расчета: <span>Договорная</span>`;
      } else if (calculatedPrice) {
        modalSummaryBadge.style.display = "block";
        modalSummaryBadge.innerHTML = `Сумма расчета: <span>${calculatedPrice.toLocaleString("ru-RU")}</span> ₽`;
      } else {
        modalSummaryBadge.style.display = "none";
      }
    }
    orderModal.classList.add("active");
    document.body.classList.add("no-scroll");
  }

  function closeModal() {
    orderModal.classList.remove("active");
    document.body.classList.remove("no-scroll");
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeModal);
  if (modalSuccessCloseBtn) modalSuccessCloseBtn.addEventListener("click", closeModal);
  orderModal.addEventListener("click", (e) => { if (e.target === orderModal) closeModal(); });

  // Handle form submission
  if (modalBookingForm && modalSuccessConfirm) {
    modalBookingForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById("modal-submit-btn");
      if (submitBtn) showButtonSpinner(submitBtn);
      const nameVal = document.getElementById("modal-name").value.trim();
      const phoneVal = document.getElementById("modal-phone").value.trim();
      const serviceVal = modalServiceInput ? modalServiceInput.value : (modalServiceName ? modalServiceName.textContent : "Заявка из модального окна");
      const detailsVal = modalDetailsInput ? modalDetailsInput.value : "";
      if (!nameVal || phoneVal.length < 10) {
        if (submitBtn) hideButtonSpinner(submitBtn);
        showToast("Пожалуйста, введите имя и номер телефона.", "error");
        return;
      }
      try {
        await submitLeadToFormspree({ name: nameVal, phone: phoneVal, service: serviceVal, details: detailsVal, source: "Order Modal" }, modalBookingForm);
        modalBookingForm.style.display = "none";
        modalSuccessConfirm.classList.add("active");
        if (submitBtn) hideButtonSpinner(submitBtn);
      } catch (error) {
        if (submitBtn) hideButtonSpinner(submitBtn);
        showToast(error.message || "Не удалось отправить заявку.", "error");
      }
    });
  }

  // Listen for external triggers
  document.addEventListener("openOrderModal", (e) => {
    const { serviceName, details, calculatedPrice } = e.detail;
    openModal(serviceName, details, calculatedPrice);
    const modalPhoneField = document.getElementById("modal-phone");
    if (modalPhoneField) {
      // Pre-fill phone from any visible phone input
      const visiblePhone = document.querySelector('input[type="tel"]:not(#modal-phone):not(#review-phone)');
      if (visiblePhone && visiblePhone.value.length > 5) modalPhoneField.value = visiblePhone.value;
    }
  });

  // Service order buttons
  document.querySelectorAll(".service-order-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const serviceName = btn.getAttribute("data-service") || "Заказ персонала";
      const isNego = serviceName.includes("Такелаж") || serviceName.includes("Сборка мебели");
      let rate = isNego ? 0 : 800;
      let detailsStr = isNego ? `Заказ услуги: ${serviceName}. Расчет стоимости индивидуальный.` : `Заказ услуги: ${serviceName}. Минимальный заказ от 2 часов.`;
      let minPrice = isNego ? "Договорная" : rate * 2;
      openModal(serviceName, detailsStr, minPrice);
    });
  });

  // Fleet order buttons
  document.querySelectorAll(".fleet-order-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const truckName = btn.getAttribute("data-truck") || "Газель";
      let rate = truckName.includes("Удлиненная") ? 2500 : 2000;
      openModal(`Аренда авто: ${truckName}`, `Аренда грузовика: ${truckName}. Минимальный заказ от 2 часов.`, rate * 2);
    });
  });

  // Outsourcing link
  const outProposalLink = document.querySelector(".outsourcing-glass .btn");
  if (outProposalLink) {
    outProposalLink.addEventListener("click", (e) => {
      e.preventDefault();
      openModal("Аутсорсинг персонала", "Запрос коммерческого предложения по аутсорсингу линейного персонала.", null);
    });
  }

  // Hero quick form
  const heroForm = document.getElementById("hero-quick-form");
  if (heroForm) {
    heroForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const selectElem = document.getElementById("quick-service");
      const phoneInput = document.getElementById("quick-phone");
      if (selectElem && phoneInput) {
        const serviceVal = selectElem.options[selectElem.selectedIndex].text;
        const phoneVal = phoneInput.value;
        const serviceCode = selectElem.value;
        let rate = serviceCode === "rigging" ? 0 : 800;
        let detailsStr = rate === 0 ? `Заявка с главного экрана. Номер: ${phoneVal}. Тариф: договорной` : `Заявка с главного экрана. Номер: ${phoneVal}. Тариф: от ${rate} ₽/ч`;
        let minPrice = rate === 0 ? "Договорная" : rate * 2;
        openModal(serviceVal, detailsStr, minPrice);
        const modalPhoneField = document.getElementById("modal-phone");
        if (modalPhoneField) modalPhoneField.value = phoneVal;
      }
    });
  }

  // Main booking form
  const mainForm = document.getElementById("main-booking-form");
  const successConfirm = document.getElementById("success-confirm");
  const successBackBtn = document.getElementById("success-back-btn");
  if (mainForm && successConfirm) {
    mainForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById("form-submit-btn");
      if (submitBtn) showButtonSpinner(submitBtn);
      const nameVal = document.getElementById("form-name").value.trim();
      const phoneVal = document.getElementById("form-phone").value.trim();
      const serviceEl = document.getElementById("form-service");
      const commentEl = document.getElementById("form-comment");
      if (!nameVal || phoneVal.length < 10) {
        if (submitBtn) hideButtonSpinner(submitBtn);
        showToast("Пожалуйста, введите корректное имя и номер телефона.", "error");
        return;
      }
      try {
        await submitLeadToFormspree({
          name: nameVal, phone: phoneVal,
          service: serviceEl ? serviceEl.options[serviceEl.selectedIndex].text : "Заявка с основной формы",
          comment: commentEl ? commentEl.value.trim() : "",
          source: "Main Booking Form",
        }, mainForm);
        if (submitBtn) hideButtonSpinner(submitBtn);
        mainForm.style.display = "none";
        successConfirm.classList.add("active");
      } catch (error) {
        if (submitBtn) hideButtonSpinner(submitBtn);
        showToast(error.message || "Не удалось отправить заявку.", "error");
      }
    });
    if (successBackBtn) {
      successBackBtn.addEventListener("click", () => {
        mainForm.reset();
        mainForm.style.display = "block";
        successConfirm.classList.remove("active");
      });
    }
  }
}

// ==========================================
// REVIEW MODAL
// ==========================================
function openReviewModal() {
  const modal = document.getElementById("review-modal");
  if (!modal) return;

  const currentCity = localStorage.getItem("selected_city") || "krasnodar";
  const cityData = CITIES_DATA[currentCity];
  const cityInput = document.getElementById("review-city");
  if (cityInput && cityData) cityInput.value = cityData.name;

  const form = document.getElementById("review-form");
  const success = document.getElementById("review-success");
  if (form) form.style.display = "block";
  if (success) success.classList.remove("active");

  setRating(5);
  modal.classList.add("active");
  document.body.classList.add("no-scroll");
}

function closeReviewModal() {
  const modal = document.getElementById("review-modal");
  if (!modal) return;
  modal.classList.remove("active");
  document.body.classList.remove("no-scroll");
}

function setRating(value) {
  const stars = document.querySelectorAll(".star-rating span");
  const input = document.getElementById("review-rating");
  stars.forEach((star) => {
    const starValue = parseInt(star.getAttribute("data-value"));
    star.classList.toggle("active", starValue <= value);
  });
  if (input) input.value = value;
}

export function initReviewModal() {
  const reviewModalCloseBtn = document.getElementById("review-modal-close");
  if (reviewModalCloseBtn) reviewModalCloseBtn.addEventListener("click", closeReviewModal);

  const reviewModalOverlay = document.getElementById("review-modal");
  if (reviewModalOverlay) {
    reviewModalOverlay.addEventListener("click", (e) => { if (e.target === reviewModalOverlay) closeReviewModal(); });
  }

  const starRatingContainer = document.getElementById("star-rating");
  if (starRatingContainer) {
    starRatingContainer.addEventListener("click", (e) => {
      if (e.target.tagName === "SPAN") setRating(parseInt(e.target.getAttribute("data-value")));
    });
  }

  const reviewPhone = document.getElementById("review-phone");
  if (reviewPhone) setupPhoneMask(reviewPhone);

  const reviewBtn = document.getElementById("open-review-btn");
  if (reviewBtn) reviewBtn.addEventListener("click", openReviewModal);

  // Submit review handler (exposed globally for inline onsubmit)
  window.submitReview = async function(e) {
    e.preventDefault();
    const submitBtn = document.querySelector('#review-form button[type="submit"]');
    if (submitBtn) showButtonSpinner(submitBtn);
    const name = document.getElementById("review-name").value.trim();
    const phone = document.getElementById("review-phone").value.trim();
    const service = document.getElementById("review-service").value;
    const text = document.getElementById("review-text").value.trim();
    const rating = document.getElementById("review-rating").value;
    const city = document.getElementById("review-city").value;
    if (!name || phone.length < 10 || !service || !text) {
      if (submitBtn) hideButtonSpinner(submitBtn);
      showToast("Пожалуйста, заполните все поля корректно.", "error");
      return;
    }
    try {
      await submitLeadToFormspree({ name, phone, service, text, rating, city, source: "Review Modal", timestamp: new Date().toISOString() }, document.getElementById("review-form"));
      if (submitBtn) hideButtonSpinner(submitBtn);
      document.getElementById("review-form").style.display = "none";
      document.getElementById("review-success").classList.add("active");
    } catch (error) {
      if (submitBtn) hideButtonSpinner(submitBtn);
      showToast(error.message || "Не удалось отправить отзыв.", "error");
    }
  };
  window.closeReviewModal = closeReviewModal;
}

// ==========================================
// EXIT-INTENT POPUP
// ==========================================
export function initExitIntentPopup() {
  if (localStorage.getItem("exit_popup_shown")) return;

  const popupHtml = `
    <div class="exit-modal-overlay" id="exit-intent-overlay">
      <div class="exit-modal-card premium-card">
        <div class="card-glow"></div>
        <button class="exit-modal-close" id="exit-close-btn" aria-label="Закрыть">×</button>
        <div class="exit-modal-content">
          <div class="exit-gift-icon">🎁</div>
          <h2>Подождите, не уходите!</h2>
          <p class="exit-modal-promo">Получите гарантированную <span class="text-gradient">скидку 10%</span> на ваш первый заказ!</p>
          <p class="exit-modal-desc">Закрепите за своим номером скидку. Мы перезвоним, проконсультируем и зафиксируем спецтариф.</p>
          <form id="exit-booking-form" class="exit-form">
            <div class="form-group-custom">
              <input type="tel" id="exit-phone" placeholder="+7 (999) 000-00-00" required class="form-input-custom">
            </div>
            <button type="submit" class="btn btn-primary btn-block btn-lg" id="exit-submit-btn">Получить скидку 10%</button>
          </form>
          <div class="success-screen" id="exit-success-confirm">
            <div class="success-icon-box">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="success-svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M8 12L11 15L16 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <h3>Скидка 10% забронирована!</h3>
            <p>Ваш промокод: <strong style="color: var(--primary);">OFFER10</strong></p>
            <p>Мы перезвоним вам в течение 5 минут для подтверждения и расчета стоимости со скидкой.</p>
            <button type="button" class="btn btn-secondary btn-sm" id="exit-success-close-btn">Отлично</button>
          </div>
        </div>
      </div>
    </div>`;

  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = popupHtml.trim();
  const exitPopupOverlay = tempDiv.firstChild;
  document.body.appendChild(exitPopupOverlay);

  const exitCard = exitPopupOverlay.querySelector(".exit-modal-card");
  if (exitCard) {
    exitCard.addEventListener("mousemove", (e) => {
      const rect = exitCard.getBoundingClientRect();
      exitCard.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
      exitCard.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
    });
  }

  const phoneInput = document.getElementById("exit-phone");
  if (phoneInput) setupPhoneMask(phoneInput);

  const closeBtn = document.getElementById("exit-close-btn");
  const successCloseBtn = document.getElementById("exit-success-close-btn");
  const exitForm = document.getElementById("exit-booking-form");
  const exitSuccessConfirm = document.getElementById("exit-success-confirm");

  function closeExitPopup() {
    exitPopupOverlay.classList.remove("active");
    localStorage.setItem("exit_popup_shown", "true");
  }

  if (closeBtn) closeBtn.addEventListener("click", closeExitPopup);
  if (successCloseBtn) successCloseBtn.addEventListener("click", closeExitPopup);
  exitPopupOverlay.addEventListener("click", (e) => { if (e.target === exitPopupOverlay) closeExitPopup(); });

  if (exitForm && exitSuccessConfirm) {
    exitForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById("exit-submit-btn");
      if (submitBtn) showButtonSpinner(submitBtn);
      const phoneVal = phoneInput.value.trim();
      if (phoneVal.length < 10) {
        if (submitBtn) hideButtonSpinner(submitBtn);
        showToast("Пожалуйста, введите корректный номер телефона.", "error");
        return;
      }
      try {
        await submitLeadToFormspree({ phone: phoneVal, service: "Скидка 10%", promo: "OFFER10", source: "Exit Intent Popup" }, exitForm);
        if (submitBtn) hideButtonSpinner(submitBtn);
        exitForm.style.display = "none";
        exitSuccessConfirm.classList.add("active");
        localStorage.setItem("exit_popup_shown", "true");
      } catch (error) {
        if (submitBtn) hideButtonSpinner(submitBtn);
        showToast(error.message || "Не удалось отправить заявку.", "error");
      }
    });
  }

  document.addEventListener("mouseleave", (e) => {
    if (e.clientY < 50 && !localStorage.getItem("exit_popup_shown")) {
      exitPopupOverlay.classList.add("active");
    }
  });
}