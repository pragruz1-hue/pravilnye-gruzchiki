/**
 * Blog City Links Module
 * Dynamically replaces city prefix in service links within blog articles
 * based on the currently selected city (from localStorage or cityChanged event)
 */

const SERVICE_SLUGS = [
  "arenda-gazeli-3m.html",
  "arenda-gazeli-udlinennoj.html",
  "autsorsing.html",
  "furniture.html",
  "gruzchiki-na-chas.html",
  "gruzchiki-na-smenu.html",
  "kvartirnyj-pereezd.html",
  "loaders.html",
  "ofisnyj-pereezd.html",
  "perevozka-mebeli.html",
  "raznorabochie-na-sklad.html",
  "raznorabochie-na-stroyku.html",
  "raznorabochie.html",
  "rigging.html",
  "vyvoz-musora.html",
  "gruzoperevozki.html",
  "mezhdugorodnie-pereezdy.html",
];

const CITY_FOLDERS = ["krasnodar", "anapa", "novorossiysk", "sochi", "gelendzhik"];

/**
 * Get the current city code from localStorage
 */
function getCurrentCity() {
  return localStorage.getItem("selected_city") || "krasnodar";
}

/**
 * Build the city prefix for hrefs
 * Краснодар is at root (no folder), others have /city/ prefix
 */
function getCityPrefix(cityCode) {
  if (cityCode === "krasnodar") return "../";
  return `../${cityCode}/`;
}

/**
 * Check if a slug is a "root" service (no city folder)
 */
function isRootService(slug) {
  return slug === "gruzoperevozki.html" || slug === "mezhdugorodnie-pereezdy.html";
}

/**
 * Update all service links in blog articles
 */
function updateBlogServiceLinks(cityCode) {
  const prefix = getCityPrefix(cityCode);
  
  // Select all links with data-service attribute in blog-related-box and blog-services-nav
  const links = document.querySelectorAll(
    '.blog-related-box a[data-service], .blog-services-nav a[data-service]'
  );
  
  links.forEach((link) => {
    const slug = link.getAttribute("data-service");
    if (!slug) return;
    
    // Skip if not a known service slug
    if (!SERVICE_SLUGS.includes(slug)) return;
    
    let newHref;
    if (isRootService(slug)) {
      // Root services: ../gruzoperevozki.html
      newHref = `../${slug}`;
    } else {
      // City services: ../krasnodar/arenda-gazeli-3m.html -> ../anapa/arenda-gazeli-3m.html
      newHref = `${prefix}${slug}`;
    }
    
    link.setAttribute("href", newHref);
  });
}

/**
 * Initialize the module
 */
export function initBlogCityLinks() {
  // Initial update
  const cityCode = getCurrentCity();
  updateBlogServiceLinks(cityCode);
  
  // Listen for city changes
  document.addEventListener("cityChanged", (event) => {
    const cityCode = event.detail?.cityCode;
    if (cityCode) {
      updateBlogServiceLinks(cityCode);
    }
  });
}