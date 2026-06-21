/**
 * Правильные Грузчики - Interactive Engine
 * Dynamic Geotargeting, Cost Calculator, Phone Masking, Modal System, FAQ Accordion, and Animations
 * Author: Antigravity AI
 * Date: 2026-06-20
 */

document.addEventListener("DOMContentLoaded", () => {
  // ==========================================
  // 1. GLOBAL HELPERS & PLURALIZATION
  // ==========================================

  // Pluralization for "workers" in Russian (человек / человека)
  function getWorkersWord(num) {
    const lastDigit = num % 10;
    const lastTwoDigits = num % 100;
    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
      return "человек";
    }
    if (lastDigit === 1) {
      return "человек";
    }
    if (lastDigit >= 2 && lastDigit <= 4) {
      return "человека";
    }
    return "человек";
  }

  // Pluralization for "hours" in Russian (час / часа / часов)
  function getHoursWord(num) {
    const lastDigit = num % 10;
    const lastTwoDigits = num % 100;
    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
      return "часов";
    }
    if (lastDigit === 1) {
      return "час";
    }
    if (lastDigit >= 2 && lastDigit <= 4) {
      return "часа";
    }
    return "часов";
  }

  // ==========================================
  // 2. DYNAMIC GEOTARGETING SYSTEM (MULTI-CITY)
  // ==========================================
  const CITIES_DATA = {
    krasnodar: {
      name: "Краснодар",
      cases: {
        nom: "Краснодар",
        prep: "в Краснодаре",
        gen: "Краснодара",
      },
      address: "350004, г. Краснодар, ул. Кропоткина д.50, офис 339",
      region: "Краснодарского края",
      phone: "+7 (928) 333-32-81",
    },
    moscow: {
      name: "Москва",
      cases: {
        nom: "Москва",
        prep: "в Москве",
        gen: "Москвы",
      },
      address: "101000, г. Москва, ул. Мясницкая д.24, оф. 102",
      region: "Московской области",
      phone: "+7 (928) 333-32-81",
    },
    spb: {
      name: "Санкт-Петербург",
      cases: {
        nom: "Санкт-Петербург",
        prep: "в Санкт-Петербурге",
        gen: "Санкт-Петербурга",
      },
      address: "190000, г. Санкт-Петербург, Невский проспект д.42, оф. 15",
      region: "Ленинградской области",
      phone: "+7 (928) 333-32-81",
    },
    novosibirsk: {
      name: "Новосибирск",
      cases: {
        nom: "Новосибирск",
        prep: "в Новосибирске",
        gen: "Новосибирска",
      },
      address: "630000, г. Новосибирск, Красный проспект д.28, оф. 412",
      region: "Новосибирской области",
      phone: "+7 (928) 333-32-81",
    },
    ekaterinburg: {
      name: "Екатеринбург",
      cases: {
        nom: "Екатеринбург",
        prep: "в Екатеринбурге",
        gen: "Екатеринбурга",
      },
      address: "620000, г. Екатеринбург, ул. Малышева д.51, оф. 805",
      region: "Свердловской области",
      phone: "+7 (928) 333-32-81",
    },
    kazan: {
      name: "Казань",
      cases: {
        nom: "Казань",
        prep: "в Казани",
        gen: "Казани",
      },
      address: "420000, г. Казань, ул. Баумана д.12, оф. 301",
      region: "Республики Татарстан",
      phone: "+7 (928) 333-32-81",
    },
    nn: {
      name: "Нижний Новгород",
      cases: {
        nom: "Нижний Новгород",
        prep: "в Нижнем Новгороде",
        gen: "Нижнего Новгорода",
      },
      address:
        "603000, г. Нижний Новгород, ул. Большая Покровская д.15, оф. 204",
      region: "Нижегородской области",
      phone: "+7 (928) 333-32-81",
    },
    chelyabinsk: {
      name: "Челябинск",
      cases: {
        nom: "Челябинск",
        prep: "в Челябинске",
        gen: "Челябинска",
      },
      address: "454000, г. Челябинск, проспект Ленина д.64, оф. 512",
      region: "Челябинской области",
      phone: "+7 (928) 333-32-81",
    },
    samara: {
      name: "Самара",
      cases: {
        nom: "Самара",
        prep: "в Самаре",
        gen: "Самары",
      },
      address: "443000, г. Самара, ул. Ленинградская д.45, оф. 311",
      region: "Самарской области",
      phone: "+7 (928) 333-32-81",
    },
    rostov: {
      name: "Ростов-на-Дону",
      cases: {
        nom: "Ростов-на-Дону",
        prep: "в Ростове-на-Дону",
        gen: "Ростова-на-Дону",
      },
      address: "344000, г. Ростов-на-Дону, Большая Садовая ул. д.82, оф. 219",
      region: "Ростовской области",
      phone: "+7 (928) 333-32-81",
    },
    ufa: {
      name: "Уфа",
      cases: {
        nom: "Уфа",
        prep: "в Уфе",
        gen: "Уфы",
      },
      address: "450000, г. Уфа, ул. Ленина д.32, оф. 104",
      region: "Республики Башкортостан",
      phone: "+7 (928) 333-32-81",
    },
    voronezh: {
      name: "Воронеж",
      cases: {
        nom: "Воронеж",
        prep: "в Воронеже",
        gen: "Воронежа",
      },
      address: "394000, г. Воронеж, проспект Революции д.18, оф. 302",
      region: "Воронежской области",
      phone: "+7 (928) 333-32-81",
    },
    volgograd: {
      name: "Волгоград",
      cases: {
        nom: "Волгоград",
        prep: "в Волгограде",
        gen: "Волгограда",
      },
      address: "400000, г. Волгоград, проспект Ленина д.12, оф. 410",
      region: "Волгоградской области",
      phone: "+7 (928) 333-32-81",
    },
  };

  // Render city specific content
  function renderCity(cityCode) {
    if (!CITIES_DATA[cityCode]) return;
    const data = CITIES_DATA[cityCode];

    // Save to LocalStorage
    localStorage.setItem("selected_city", cityCode);

    // 1. Update text spans for city names with correct declensions
    const citySpans = document.querySelectorAll(".city-name");
    citySpans.forEach((span) => {
      const caseName = span.getAttribute("data-case") || "nom";
      if (data.cases[caseName]) {
        span.textContent = data.cases[caseName];
      }
    });

    // 2. Update address fields
    const addressSpans = document.querySelectorAll(".city-address");
    addressSpans.forEach((span) => {
      span.textContent = data.address;
    });

    // 3. Update region fields
    const regionSpans = document.querySelectorAll(".city-region");
    regionSpans.forEach((span) => {
      span.textContent = data.region;
    });

    // 4. Update phone links dynamically
    const cleanPhone = data.phone.replace(/\D/g, "");
    const formattedPhone = data.phone;

    const headerPhone = document.getElementById("header-phone");
    if (headerPhone) {
      headerPhone.textContent = formattedPhone;
      headerPhone.href = `tel:${cleanPhone}`;
    }
    const mobilePhone = document.querySelector(".mobile-phone-link");
    if (mobilePhone) {
      mobilePhone.textContent = formattedPhone;
      mobilePhone.href = `tel:${cleanPhone}`;
    }
    const footerPhone = document.querySelector(
      '.footer-contacts a[href^="tel:"]',
    );
    if (footerPhone) {
      footerPhone.textContent = formattedPhone;
      footerPhone.href = `tel:${cleanPhone}`;
    }

    // 5. Update browser window title and meta description for premium SEO (Page-aware)
    const pageType = document.body.getAttribute("data-page") || "index";
    let titleStr = "";
    let descStr = "";

    if (pageType === "loaders") {
      titleStr = `Услуги профессиональных грузчиков ${data.cases.prep} | Заказать грузчиков недорого круглосуточно`;
      descStr = `Заказать профессиональных грузчиков ${data.cases.prep} от 800 руб/час. Квартирные и офисные переезды, разгрузка фур, складские работы. Быстрая подача за 30 минут, работаем 24/7.`;
    } else if (pageType === "workers") {
      titleStr = `Услуги разнорабочих ${data.cases.prep} | Разнорабочие на стройку, склад и производство`;
      descStr = `Аренда разнорабочих ${data.cases.prep} от 800 руб/час. Предоставим линейный персонал на склады, производства, демонтаж, подсобные работы. Срочный вывод от 1 до 50 человек за сутки.`;
    } else if (pageType === "moving") {
      titleStr = `Квартирные и офисные переезды ${data.cases.prep} | Заказать переезд под ключ`;
      descStr = `Бережный квартирный и офисный переезд ${data.cases.prep} под ключ. Перевозка мебели, бытовой техники, оргтехники от 800 руб/час. Опытные грузчики, надежные крепежи, чистые Газели.`;
    } else if (pageType === "rigging") {
      titleStr = `Такелажные работы ${data.cases.prep} | Перевозка тяжелого оборудования и сейфов`;
      descStr = `Профессиональный такелаж любой сложности ${data.cases.prep}. Договорные цены. Транспортировка сейфов, банкоматов, медицинского и промышленного оборудования. Опыт более 12 лет.`;
    } else if (pageType === "furniture") {
      titleStr = `Сборка мебели и стеллажей ${data.cases.prep} | Услуги сборщиков мебели`;
      descStr = `Профессиональная сборка мебели, монтаж торгового оборудования и складских стеллажей ${data.cases.prep}. Договорные цены. Опытные сборщики со своим инструментом, работаем аккуратно.`;
    } else {
      titleStr = `Правильные Грузчики ${data.name} | Услуги грузчиков, разнорабочих и такелажников 24/7`;
      descStr = `Услуги профессиональных грузчиков, разнорабочих и такелажников ${data.cases.prep} от 800 руб/час. Квартирные и офисные переезды, аутсорсинг персонала для компаний. Работаем 24/7.`;
    }

    document.title = titleStr;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", descStr);
    }

    // 6. Update selector button text
    const btnText = document.getElementById("city-btn-text");
    if (btnText) {
      btnText.textContent = data.name;
    }

    // 7. Update active state in dropdown
    const cityItems = document.querySelectorAll(".city-item");
    cityItems.forEach((item) => {
      if (item.getAttribute("data-city") === cityCode) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });
  }

  // Geotargeting IP Auto-Detect Logic
  async function detectUserCity() {
    const defaultCity = "krasnodar";

    // Check if user has already made a manual choice
    const savedCity = localStorage.getItem("selected_city");
    if (savedCity && CITIES_DATA[savedCity]) {
      return { cityCode: savedCity, isConfirmed: true };
    }

    // Try auto-detection via secure public endpoint with 2.5s abort timeout
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const response = await fetch("https://ipapi.co/json/", {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) throw new Error("Response error");
      const data = await response.json();

      const geoCityName = data.city; // e.g. "Moscow", "Krasnodar"
      if (geoCityName) {
        const lowerGeoCity = geoCityName.toLowerCase();

        if (lowerGeoCity.includes("moscow"))
          return { cityCode: "moscow", isConfirmed: false };
        if (lowerGeoCity.includes("petersburg"))
          return { cityCode: "spb", isConfirmed: false };
        if (lowerGeoCity.includes("krasnodar"))
          return { cityCode: "krasnodar", isConfirmed: false };
        if (lowerGeoCity.includes("novosibirsk"))
          return { cityCode: "novosibirsk", isConfirmed: false };
        if (lowerGeoCity.includes("ekaterinburg"))
          return { cityCode: "ekaterinburg", isConfirmed: false };
        if (lowerGeoCity.includes("kazan"))
          return { cityCode: "kazan", isConfirmed: false };
        if (lowerGeoCity.includes("novgorod"))
          return { cityCode: "nn", isConfirmed: false };
        if (lowerGeoCity.includes("chelyabinsk"))
          return { cityCode: "chelyabinsk", isConfirmed: false };
        if (lowerGeoCity.includes("samara"))
          return { cityCode: "samara", isConfirmed: false };
        if (lowerGeoCity.includes("rostov"))
          return { cityCode: "rostov", isConfirmed: false };
        if (lowerGeoCity.includes("ufa"))
          return { cityCode: "ufa", isConfirmed: false };
        if (lowerGeoCity.includes("voronezh"))
          return { cityCode: "voronezh", isConfirmed: false };
        if (lowerGeoCity.includes("volgograd"))
          return { cityCode: "volgograd", isConfirmed: false };
      }
    } catch (e) {
      console.warn(
        "Geotargeting auto-detect failed or timed out. Defaulting to Краснодар.",
        e,
      );
    }

    return { cityCode: defaultCity, isConfirmed: false };
  }

  // Geotargeting DOM Binding
  const cityBtn = document.getElementById("current-selected-city");
  const cityDropdown = document.getElementById("city-dropdown-menu");
  const cityConfirmBanner = document.getElementById("city-confirm-banner");
  const detectedCityName = document.getElementById("detected-city-name");
  const btnYes = document.getElementById("btn-city-confirm-yes");
  const btnNo = document.getElementById("btn-city-confirm-no");
  const cityItems = document.querySelectorAll(".city-item");

  // Toggle dropdown on click
  if (cityBtn && cityDropdown) {
    cityBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      cityDropdown.classList.toggle("active");
      if (cityConfirmBanner) cityConfirmBanner.classList.remove("active");
    });
  }

  // Close dropdown when clicking elsewhere
  document.addEventListener("click", () => {
    if (cityDropdown) cityDropdown.classList.remove("active");
  });

  // Handle city selection
  cityItems.forEach((item) => {
    item.addEventListener("click", () => {
      const cityCode = item.getAttribute("data-city");
      if (cityCode && CITIES_DATA[cityCode]) {
        localStorage.setItem("city_confirmed", "true");
        renderCity(cityCode);
        if (cityConfirmBanner) cityConfirmBanner.classList.remove("active");
      }
    });
  });

  // Initialize Geotargeting
  async function initGeotargeting() {
    const { cityCode, isConfirmed } = await detectUserCity();
    renderCity(cityCode);

    const wasConfirmed = localStorage.getItem("city_confirmed") === "true";

    if (!wasConfirmed && !isConfirmed) {
      // Show confirmation banner
      if (cityConfirmBanner && detectedCityName) {
        detectedCityName.textContent = CITIES_DATA[cityCode].name;
        // Natural visual delay for loading feel
        setTimeout(() => {
          cityConfirmBanner.classList.add("active");
        }, 1200);
      }
    }
  }

  if (btnYes) {
    btnYes.addEventListener("click", () => {
      localStorage.setItem("city_confirmed", "true");
      if (cityConfirmBanner) cityConfirmBanner.classList.remove("active");
    });
  }

  if (btnNo) {
    btnNo.addEventListener("click", (e) => {
      e.stopPropagation();
      if (cityConfirmBanner) cityConfirmBanner.classList.remove("active");
      if (cityDropdown) cityDropdown.classList.add("active");
    });
  }

  // Run Geotargeting Engine
  initGeotargeting();

  // ==========================================
  // 3. HEADER FX (STICKY SCROLL)
  // ==========================================
  const header = document.getElementById("site-header");
  if (header) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 50) {
        header.classList.add("sticky");
      } else {
        header.classList.remove("sticky");
      }
    });
  }

  // ==========================================
  // 4. MOBILE MENU TOGGLE
  // ==========================================
  const burgerBtn = document.getElementById("burger-btn");
  const mobileMenuOverlay = document.getElementById("mobile-menu-overlay");
  const mobileLinks = document.querySelectorAll(".mobile-link");
  const mobileCta = document.getElementById("mobile-menu-cta");

  function toggleMobileMenu() {
    burgerBtn.classList.toggle("active");
    mobileMenuOverlay.classList.toggle("active");
    document.body.classList.toggle("no-scroll");
  }

  if (burgerBtn && mobileMenuOverlay) {
    burgerBtn.addEventListener("click", toggleMobileMenu);

    mobileLinks.forEach((link) => {
      link.addEventListener("click", () => {
        if (mobileMenuOverlay.classList.contains("active")) {
          toggleMobileMenu();
        }
      });
    });

    if (mobileCta) {
      mobileCta.addEventListener("click", () => {
        if (mobileMenuOverlay.classList.contains("active")) {
          toggleMobileMenu();
        }
      });
    }
  }

  // ==========================================
  // 5. PREMIUM CARD SPOTLIGHT GLOW EFFECT
  // ==========================================
  const premiumCards = document.querySelectorAll(".premium-card");
  premiumCards.forEach((card) => {
    if (!card.querySelector(".card-glow")) {
      const glowDiv = document.createElement("div");
      glowDiv.classList.add("card-glow");
      card.appendChild(glowDiv);
    }

    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty("--mouse-x", `${x}px`);
      card.style.setProperty("--mouse-y", `${y}px`);
    });
  });

  // ==========================================
  // 6. INTERACTIVE COST CALCULATOR
  // ==========================================
  const calcTabs = document.querySelectorAll(".calc-tab");
  const workersRange = document.getElementById("workers-range");
  const hoursRange = document.getElementById("hours-range");
  const workersVal = document.getElementById("workers-val");
  const hoursVal = document.getElementById("hours-val");
  const rateDisplay = document.getElementById("rate-display");
  const priceDisplay = document.getElementById("price-display");
  const calcSubmitBtn = document.getElementById("calc-submit-btn");

  let currentRate = 800; // Updated default rate (loaders: 800 ₽/h)
  let currentServiceName = "Грузчики";

  function updateCalculator() {
    if (!workersRange || !hoursRange) return;

    const workers = parseInt(workersRange.value, 10);
    const hours = parseInt(hoursRange.value, 10);

    if (workersVal) {
      workersVal.textContent = `${workers} ${getWorkersWord(workers)}`;
    }
    if (hoursVal) {
      hoursVal.textContent = `${hours} ${getHoursWord(hours)}`;
    }

    const isNegotiable = currentRate === 0;
    const totalPrice = currentRate * workers * hours;
    const currencySpan = priceDisplay
      ? priceDisplay.parentNode.querySelector(".currency")
      : null;
    const rateInfo = document.querySelector(".result-rate-info");

    if (rateInfo) {
      if (isNegotiable) {
        rateInfo.innerHTML = `Тариф: <span id="rate-display">договорной</span>`;
      } else {
        rateInfo.innerHTML = `Тариф: <span id="rate-display">${currentRate}</span> руб/час`;
      }
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

    return {
      service: currentServiceName,
      workers,
      hours,
      rate: currentRate,
      price: isNegotiable ? "Договорная" : totalPrice,
    };
  }

  if (calcTabs.length > 0) {
    calcTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        calcTabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");

        // Update active rate & name
        currentRate = parseInt(tab.getAttribute("data-rate"), 10) || 800;
        currentServiceName = tab.getAttribute("data-name") || "Грузчики";

        updateCalculator();
      });
    });
  }

  if (workersRange) workersRange.addEventListener("input", updateCalculator);
  if (hoursRange) hoursRange.addEventListener("input", updateCalculator);

  // Initial Calculation
  updateCalculator();

  // ==========================================
  // 7. RUSSIAN PHONE INPUT MASKING (PURE JS)
  // ==========================================
  const phoneInputs = document.querySelectorAll('input[type="tel"]');

  function setupPhoneMask(input) {
    input.addEventListener("input", (e) => {
      let inputNumbersValue = input.value.replace(/\D/g, "");
      let formattedInputValue = "";
      let selectionStart = input.selectionStart;

      if (!inputNumbersValue) {
        input.value = "";
        return;
      }

      if (input.value.length !== selectionStart) {
        if (e.data && /\D/g.test(e.data)) {
          input.value = inputNumbersValue;
        }
        return;
      }

      if (["7", "8", "9"].indexOf(inputNumbersValue[0]) > -1) {
        if (inputNumbersValue[0] === "9")
          inputNumbersValue = "7" + inputNumbersValue;
        let firstChar = "+7";
        if (inputNumbersValue[0] === "8") {
          inputNumbersValue = "7" + inputNumbersValue.substring(1);
        }

        formattedInputValue = firstChar + " ";
        if (inputNumbersValue.length > 1) {
          formattedInputValue += "(" + inputNumbersValue.substring(1, 4);
        }
        if (inputNumbersValue.length >= 5) {
          formattedInputValue += ") " + inputNumbersValue.substring(4, 7);
        }
        if (inputNumbersValue.length >= 8) {
          formattedInputValue += "-" + inputNumbersValue.substring(7, 9);
        }
        if (inputNumbersValue.length >= 10) {
          formattedInputValue += "-" + inputNumbersValue.substring(9, 11);
        }
      } else {
        formattedInputValue = "+" + inputNumbersValue.substring(0, 16);
      }

      input.value = formattedInputValue;
    });

    input.addEventListener("keydown", (e) => {
      let numVal = input.value.replace(/\D/g, "");
      if (e.keyCode === 8 && numVal.length <= 1) {
        input.value = "";
      }
    });

    input.addEventListener("focus", () => {
      if (!input.value) {
        input.value = "+7 ";
      }
    });

    input.addEventListener("blur", () => {
      if (input.value === "+7 " || input.value === "+7") {
        input.value = "";
      }
    });
  }

  phoneInputs.forEach(setupPhoneMask);

  // ==========================================
  // 8. MODAL WINDOW SYSTEM
  // ==========================================
  const orderModal = document.getElementById("order-modal");
  const modalCloseBtn = document.getElementById("modal-close-btn");
  const modalSuccessCloseBtn = document.getElementById(
    "modal-success-close-btn",
  );
  const modalBookingForm = document.getElementById("modal-booking-form");
  const modalSuccessConfirm = document.getElementById("modal-success-confirm");

  const modalServiceName = document.getElementById("modal-service-name");
  const modalServiceInput = document.getElementById("modal-service-input");
  const modalDetailsInput = document.getElementById("modal-details-input");
  const modalSummaryBadge = document.getElementById("modal-summary-badge");

  function openModal(serviceName, details, calculatedPrice) {
    if (!orderModal) return;

    if (modalBookingForm) {
      modalBookingForm.reset();
      modalBookingForm.style.display = "block";
    }
    if (modalSuccessConfirm) {
      modalSuccessConfirm.classList.remove("active");
    }

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
    if (!orderModal) return;
    orderModal.classList.remove("active");
    document.body.classList.remove("no-scroll");
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeModal);
  if (modalSuccessCloseBtn)
    modalSuccessCloseBtn.addEventListener("click", closeModal);

  if (orderModal) {
    orderModal.addEventListener("click", (e) => {
      if (e.target === orderModal) {
        closeModal();
      }
    });
  }

  // Cost calculator submission
  if (calcSubmitBtn) {
    calcSubmitBtn.addEventListener("click", () => {
      const calcData = updateCalculator();
      if (calcData) {
        const detailsStr =
          calcData.rate === 0
            ? `${calcData.workers} чел., ${calcData.hours} ч. (Тариф: договорной)`
            : `${calcData.workers} чел., ${calcData.hours} ч. (Тариф: ${calcData.rate} ₽/ч)`;
        openModal(calcData.service, detailsStr, calcData.price);
      }
    });
  }

  // Service Cards order binding (with updated rates)
  const serviceOrderBtns = document.querySelectorAll(".service-order-btn");
  serviceOrderBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const serviceName = btn.getAttribute("data-service") || "Заказ персонала";
      const isNego =
        serviceName.includes("Такелаж") ||
        serviceName.includes("Сборка мебели") ||
        serviceName.includes("стеллаж") ||
        serviceName.includes("Сборщик");

      let rate = isNego ? 0 : 800;
      let detailsStr = "";
      let minPrice = 0;

      if (isNego) {
        detailsStr = `Заказ услуги: ${serviceName}. Расчет стоимости индивидуальный (договорной).`;
        minPrice = "Договорная";
      } else {
        detailsStr = `Заказ услуги: ${serviceName}. Минимальный заказ от 2 часов.`;
        minPrice = rate * 2;
      }

      openModal(serviceName, detailsStr, minPrice);
    });
  });

  // Fleet Cards order binding (with updated rates)
  const fleetOrderBtns = document.querySelectorAll(".fleet-order-btn");
  fleetOrderBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const truckName = btn.getAttribute("data-truck") || "Газель";

      let rate = 2000; // standard truck default rate (2000 ₽/h)
      if (truckName.includes("Удлиненная")) rate = 2500; // extended rate (2500 ₽/h)

      const detailsStr = `Аренда грузовика: ${truckName}. Минимальный заказ от 2 часов.`;
      const minPrice = rate * 2; // Min order is 2 hours

      openModal(`Аренда авто: ${truckName}`, detailsStr, minPrice);
    });
  });

  // Outsourcing proposal CTA
  const outProposalLink = document.querySelector(".outsourcing-glass .btn");
  if (outProposalLink) {
    outProposalLink.addEventListener("click", (e) => {
      e.preventDefault();
      openModal(
        "Аутсорсинг персонала",
        "Запрос коммерческого предложения по аутсорсингу линейного персонала.",
        null,
      );
    });
  }

  // ==========================================
  // 9. FAQ ACCORDION ENGINE
  // ==========================================
  const faqTriggers = document.querySelectorAll(".faq-trigger");

  faqTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const faqItem = trigger.closest(".faq-item");
      const panel = faqItem.querySelector(".faq-panel");
      const isExpanded = trigger.getAttribute("aria-expanded") === "true";

      document.querySelectorAll(".faq-item").forEach((item) => {
        if (item !== faqItem) {
          item.classList.remove("active");
          const itemTrigger = item.querySelector(".faq-trigger");
          if (itemTrigger) itemTrigger.setAttribute("aria-expanded", "false");
          const itemPanel = item.querySelector(".faq-panel");
          if (itemPanel) itemPanel.style.maxHeight = null;
        }
      });

      faqItem.classList.toggle("active");
      trigger.setAttribute("aria-expanded", !isExpanded);

      if (faqItem.classList.contains("active")) {
        panel.style.maxHeight = panel.scrollHeight + "px";
      } else {
        panel.style.maxHeight = null;
      }
    });
  });

  // ==========================================
  // 10. ANIMATED STATISTICS COUNTER (OBSERVER)
  // ==========================================
  const statNumbers = document.querySelectorAll(".stat-num");

  const countUp = (element) => {
    const target = parseInt(element.getAttribute("data-target"), 10) || 0;
    const duration = 1500;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);

      const easeProgress = progress * (2 - progress);
      const currentValue = Math.floor(easeProgress * target);

      element.textContent = currentValue.toLocaleString("ru-RU");

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        element.textContent = target.toLocaleString("ru-RU");
      }
    };

    requestAnimationFrame(animate);
  };

  if ("IntersectionObserver" in window && statNumbers.length > 0) {
    const statsObserver = new IntersectionObserver(
      (entries, observer) => {
        if (entries[0].isIntersecting) {
          statNumbers.forEach((stat) => countUp(stat));
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    const statsGrid = document.querySelector(".stats-grid");
    if (statsGrid) statsObserver.observe(statsGrid);
  } else {
    statNumbers.forEach((stat) => {
      stat.textContent = stat.getAttribute("data-target");
    });
  }

  // ==========================================
  // 11. FORM SUBMISSIONS (AJAX STUBS & FX)
  // ==========================================

  // A. Hero Quick Form (Redirects to Modal)
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

        let rate = 800; // default for loaders, workers, moving (all 800 now)
        const isNego = serviceCode === "rigging";
        if (isNego) rate = 0;

        let detailsStr = "";
        let minPrice = 0;

        if (isNego) {
          detailsStr = `Заявка с главного экрана. Номер: ${phoneVal}. Тариф: договорной`;
          minPrice = "Договорная";
        } else {
          detailsStr = `Заявка с главного экрана. Номер: ${phoneVal}. Тариф: от ${rate} ₽/ч`;
          minPrice = rate * 2;
        }

        openModal(serviceVal, detailsStr, minPrice);

        const modalPhoneField = document.getElementById("modal-phone");
        if (modalPhoneField) modalPhoneField.value = phoneVal;
      }
    });
  }

  // B. Main Booking Form
  const mainForm = document.getElementById("main-booking-form");
  const successConfirm = document.getElementById("success-confirm");
  const successBackBtn = document.getElementById("success-back-btn");

  if (mainForm && successConfirm) {
    mainForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const nameVal = document.getElementById("form-name").value.trim();
      const phoneVal = document.getElementById("form-phone").value.trim();
      const serviceVal =
        document.getElementById("form-service").options[
          document.getElementById("form-service").selectedIndex
        ].text;
      const commentVal = document.getElementById("form-comment").value.trim();

      if (!nameVal || phoneVal.length < 10) {
        alert("Пожалуйста, введите корректное имя и номер телефона.");
        return;
      }

      const leadData = {
        name: nameVal,
        phone: phoneVal,
        service: serviceVal,
        comment: commentVal,
        source: "Main Form",
        timestamp: new Date().toISOString(),
      };

      console.log("Sending lead to backend (Stub):", leadData);

      mainForm.style.display = "none";
      successConfirm.classList.add("active");
    });

    if (successBackBtn) {
      successBackBtn.addEventListener("click", () => {
        mainForm.reset();
        mainForm.style.display = "block";
        successConfirm.classList.remove("active");
      });
    }
  }

  // C. Modal Booking Form
  if (modalBookingForm && modalSuccessConfirm) {
    modalBookingForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const nameVal = document.getElementById("modal-name").value.trim();
      const phoneVal = document.getElementById("modal-phone").value.trim();
      const serviceVal = modalServiceInput ? modalServiceInput.value : "";
      const detailsVal = modalDetailsInput ? modalDetailsInput.value : "";

      if (!nameVal || phoneVal.length < 10) {
        alert("Пожалуйста, введите имя и номер телефона.");
        return;
      }

      const leadData = {
        name: nameVal,
        phone: phoneVal,
        service: serviceVal,
        details: detailsVal,
        source: "Modal Form",
        timestamp: new Date().toISOString(),
      };

      console.log("Sending lead to backend (Stub):", leadData);

      modalBookingForm.style.display = "none";
      modalSuccessConfirm.classList.add("active");
    });
  }

  // ==========================================
  // D. REAL-TIME ACTIVE WORKERS FLUCTUATION
  // ==========================================
  const activeWorkersElement = document.getElementById("active-workers-count");
  if (activeWorkersElement) {
    let currentCount = 128;

    // Dynamically inject delta element next to count
    let deltaBadge = document.getElementById("active-workers-delta");
    if (!deltaBadge) {
      deltaBadge = document.createElement("span");
      deltaBadge.id = "active-workers-delta";
      deltaBadge.className = "workers-delta";
      activeWorkersElement.parentNode.insertBefore(
        deltaBadge,
        activeWorkersElement.nextSibling,
      );
    }

    setInterval(
      () => {
        // Create a small, natural fluctuation: -3 to +3 (excluding 0 to ensure movement)
        let change = 0;
        while (change === 0) {
          change = Math.floor(Math.random() * 7) - 3;
        }
        currentCount = Math.max(118, Math.min(138, currentCount + change));

        // Configure delta animation
        deltaBadge.className = "workers-delta";
        void deltaBadge.offsetWidth; // Trigger reflow to restart CSS animation

        if (change > 0) {
          deltaBadge.textContent = `+${change}`;
          deltaBadge.classList.add("delta-positive");
        } else {
          deltaBadge.textContent = `${change}`;
          deltaBadge.classList.add("delta-negative");
        }

        // Pulse animation trigger
        activeWorkersElement.classList.add("number-pulse");

        // Update text right after scale up
        setTimeout(() => {
          activeWorkersElement.textContent = currentCount;
        }, 150);

        // Remove pulse class to return to normal
        setTimeout(() => {
          activeWorkersElement.classList.remove("number-pulse");
        }, 450);
      },
      6000 + Math.random() * 4000,
    ); // Trigger every 6-10 seconds
  }

  // ==========================================
  // 12. AUTO-SELECT CALCULATOR TAB BASED ON PAGE
  // ==========================================
  const activePage = document.body.getAttribute("data-page") || "index";
  if (calcTabs.length > 0) {
    let tabToClick = null;
    if (activePage === "loaders") {
      tabToClick = Array.from(calcTabs).find(
        (t) => t.getAttribute("data-name") === "Грузчики",
      );
    } else if (activePage === "workers") {
      tabToClick = Array.from(calcTabs).find(
        (t) => t.getAttribute("data-name") === "Разнорабочие",
      );
    } else if (activePage === "moving") {
      tabToClick = Array.from(calcTabs).find(
        (t) => t.getAttribute("data-name") === "Переезд",
      );
    } else if (activePage === "rigging") {
      tabToClick = Array.from(calcTabs).find(
        (t) => t.getAttribute("data-name") === "Такелажники",
      );
    } else if (activePage === "furniture") {
      tabToClick = Array.from(calcTabs).find(
        (t) => t.getAttribute("data-name") === "Грузчики",
      );
    }

    if (tabToClick) {
      tabToClick.click();
    }
  }

  // ==========================================
  // 13. DYNAMIC EXIT-INTENT RETENTION POPUP
  // ==========================================
  function initExitIntentPopup() {
    // Check if exit intent is already shown or closed
    if (localStorage.getItem("exit_popup_shown")) {
      return;
    }

    // Inject popup HTML into body
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
      </div>
    `;

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = popupHtml.trim();
    const exitPopupOverlay = tempDiv.firstChild;
    document.body.appendChild(exitPopupOverlay);

    // Bind spotlight glow to exit card
    const exitCard = exitPopupOverlay.querySelector(".exit-modal-card");
    if (exitCard) {
      exitCard.addEventListener("mousemove", (e) => {
        const rect = exitCard.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        exitCard.style.setProperty("--mouse-x", `${x}px`);
        exitCard.style.setProperty("--mouse-y", `${y}px`);
      });
    }

    const phoneInput = document.getElementById("exit-phone");
    if (phoneInput) {
      setupPhoneMask(phoneInput);
    }

    const closeBtn = document.getElementById("exit-close-btn");
    const successCloseBtn = document.getElementById("exit-success-close-btn");
    const exitForm = document.getElementById("exit-booking-form");
    const exitSuccessConfirm = document.getElementById("exit-success-confirm");

    function closeExitPopup() {
      exitPopupOverlay.classList.remove("active");
      localStorage.setItem("exit_popup_shown", "true");
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", closeExitPopup);
    }
    if (successCloseBtn) {
      successCloseBtn.addEventListener("click", closeExitPopup);
    }

    exitPopupOverlay.addEventListener("click", (e) => {
      if (e.target === exitPopupOverlay) {
        closeExitPopup();
      }
    });

    if (exitForm && exitSuccessConfirm) {
      exitForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const phoneVal = phoneInput.value.trim();

        if (phoneVal.length < 10) {
          alert("Пожалуйста, введите корректный номер телефона.");
          return;
        }

        const leadData = {
          phone: phoneVal,
          promo: "OFFER10",
          source: "Exit Intent Form",
          timestamp: new Date().toISOString(),
        };

        console.log("Sending exit lead to backend (Stub):", leadData);

        exitForm.style.display = "none";
        exitSuccessConfirm.classList.add("active");
        localStorage.setItem("exit_popup_shown", "true");
      });
    }

    // Trigger on mouseleave
    document.addEventListener("mouseleave", (e) => {
      if (e.clientY < 50 && !localStorage.getItem("exit_popup_shown")) {
        exitPopupOverlay.classList.add("active");
      }
    });
  }

  // Delay trigger initialization slightly for better feel
  setTimeout(initExitIntentPopup, 2000);
});
