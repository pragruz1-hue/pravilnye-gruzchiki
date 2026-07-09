#!/usr/bin/env node
/**
 * Build script for Правильные Грузчики
 * Assembles HTML pages from partials by replacing {{BASE}} and injecting components.
 *
 * Usage: node build.js
 *
 * Structure:
 *   partials/          — HTML partials with {{BASE}} placeholders
 *   pages/             — Page-specific content templates (body content between header and footer)
 *   index.html (root)  — assembled from pages/ and partials/
 *   {city}/*.html      — assembled with BASE="../"
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname);
const PARTIALS_DIR = path.join(ROOT, "partials");
const PAGES_DIR = path.join(ROOT, "pages");

// Read partial
function readPartial(name) {
  const filePath = path.join(PARTIALS_DIR, name);
  if (!fs.existsSync(filePath)) return "";
  return fs.readFileSync(filePath, "utf-8");
}

// Replace {{BASE}} with the given base path
function resolve(partialName, base) {
  return readPartial(partialName).replace(/\{\{BASE\}\}/g, base);
}

// All cities
const CITIES = [
  "krasnodar", "anapa", "novorossiysk", "sochi", "gelendzhik",
  "moscow", "spb", "novosibirsk", "ekaterinburg", "kazan",
  "nn", "chelyabinsk", "samara", "rostov", "ufa",
  "voronezh", "volgograd"
];

// Shared page end (modals + floating buttons + scripts)
function sharedPageEnd(base) {
  return [
    resolve("modals.html", base),
    resolve("floating-buttons.html", base),
  ].join("\n");
}

// City service pages that exist for each city
const CITY_SERVICE_PAGES = [
  "index.html",
  "loaders.html",
  "workers.html",
  "moving.html",
  "office-moving.html",
  "rigging.html",
  "furniture.html",
  "kvartirnyj-pereezd.html",
  "ofisnyj-pereezd.html",
  "raznorabochie.html",
  "arenda-gazeli-3m.html",
  "arenda-gazeli-udlinennoj.html",
  "autsorsing.html",
];

// Find page content between markers in original HTML files
function extractPageContent(html, pageType) {
  // Try to extract content between <main> and </main> or </section> before footer
  let mainMatch = html.match(/<main>([\s\S]*?)<\/main>/i);
  if (mainMatch) return mainMatch[1];

  // If no main tag, try to get everything between header end and footer start
  let bodyMatch = html.match(/<\/header>([\s\S]*?)<footer/i);
  if (bodyMatch) return bodyMatch[1];

  // Last resort: return body content
  let bodyMatch2 = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch2) return bodyMatch2[1];

  return "";
}

// Extract <head> title and meta from original
function extractHeadMeta(html) {
  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
  const keywordsMatch = html.match(/<meta\s+name="keywords"\s+content="([^"]*)"/i);
  const ogTitleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]*)"/i);
  const ogDescMatch = html.match(/<meta\s+property="og:description"\s+content="([^"]*)"/i);
  const ogImageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]*)"/i);
  const canonicalMatch = html.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i);
  const jsonLdMatches = html.match(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi);

  let meta = "";
  if (titleMatch) meta += `    <title>${titleMatch[1].trim()}</title>\n`;
  if (descMatch) meta += `    <meta name="description" content="${descMatch[1]}" />\n`;
  if (keywordsMatch) meta += `    <meta name="keywords" content="${keywordsMatch[1]}" />\n`;
  meta += `    <meta name="author" content="Правильные Грузчики" />\n`;
  if (ogTitleMatch) meta += `    <meta property="og:title" content="${ogTitleMatch[1]}" />\n`;
  if (ogDescMatch) meta += `    <meta property="og:description" content="${ogDescMatch[1]}" />\n`;
  if (ogImageMatch) meta += `    <meta property="og:image" content="${ogImageMatch[1]}" />\n`;
  meta += `    <meta property="og:type" content="website" />\n`;
  if (canonicalMatch) meta += `    <link rel="canonical" href="${canonicalMatch[1]}" />\n`;

  // Keep JSON-LD (Schema.org) — but we'll also generate dynamically
  if (jsonLdMatches) {
    jsonLdMatches.forEach(m => {
      meta += `    ${m}\n`;
    });
  }

  return meta;
}

// Assemble a root-level page
function buildRootPage(pageName, base = "") {
  const srcPath = path.join(ROOT, pageName);
  if (!fs.existsSync(srcPath)) {
    console.log(`  ⚠ Skipping ${pageName} — source not found`);
    return;
  }

  const originalHtml = fs.readFileSync(srcPath, "utf-8");
  const headMeta = extractHeadMeta(originalHtml);
  const pageContent = extractPageContent(originalHtml);
  const pageType = pageName.replace(".html", "");

  // Determine body data-page attribute
  let bodyAttr = 'data-page="index"';
  if (pageName === "about.html") bodyAttr = 'data-page="about"';
  else if (pageName === "loaders.html") bodyAttr = 'data-page="loaders"';
  else if (pageName === "workers.html") bodyAttr = 'data-page="workers"';
  else if (pageName === "moving.html") bodyAttr = 'data-page="moving"';
  else if (pageName === "office-moving.html") bodyAttr = 'data-page="moving"';
  else if (pageName === "rigging.html") bodyAttr = 'data-page="rigging"';
  else if (pageName === "furniture.html") bodyAttr = 'data-page="furniture"';
  else if (pageName === "gruzoperevozki.html") bodyAttr = 'data-page="cargo"';
  else if (pageName === "thank-you.html") bodyAttr = 'data-page="thank-you"';

  const assembled = [
    '<!doctype html>',
    '<html lang="ru">',
    '  <head>',
    readPartial("metrika.html"),
    '',
    resolve("head-common.html", base),
    headMeta,
    '  </head>',
    '',
    `  <body ${bodyAttr}>`,
    '    <div class="glow-bg">',
    '      <div class="glow-orb orb-1"></div>',
    '      <div class="glow-orb orb-2"></div>',
    '    </div>',
    '',
    resolve("header.html", base),
    '<main>',
    pageContent,
    '</main>',
    resolve("footer.html", base),
    sharedPageEnd(base),
    '</body>',
    '</html>',
  ].join("\n");

  // Clean up duplicates (old footer, header in page content)
  let cleaned = assembled
    .replace(/<footer[\s\S]*?<\/footer>/gi, (match, offset) => {
      // Only keep the first footer occurrence
      return "";
    })
    .replace(/<header[\s\S]*?<\/header>/gi, (match, offset) => {
      return ""; // Remove any header in the page content
    });

  // ...actually the replacement approach is fragile. Let me just write assembled content.
  fs.writeFileSync(srcPath, assembled);
  console.log(`  ✓ Built ${pageName}`);
}

// Build city subpage
function buildCityPage(city, pageName, base = "../") {
  const srcPath = path.join(ROOT, city, pageName);
  if (!fs.existsSync(srcPath)) {
    console.log(`  ⚠ Skipping ${city}/${pageName} — source not found`);
    return;
  }

  const originalHtml = fs.readFileSync(srcPath, "utf-8");
  const headMeta = extractHeadMeta(originalHtml);

  // For city pages, the body content is simpler
  let bodyMatch = originalHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (!bodyMatch) return;

  let bodyContent = bodyMatch[1];

  // Remove existing header, footer, mobile menu, modals, floating buttons, scripts
  bodyContent = bodyContent
    .replace(/<header[\s\S]*?<\/header>/gi, "")
    .replace(/<div class="mobile-nav-overlay"[\s\S]*?<\/div>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<div class="modal-overlay"[\s\S]*?<\/div>\s*<\/div>/gi, "")
    .replace(/<div class="glass-float-btn[\s\S]*?<\/div>/gi, "")
    .replace(/<button class="scroll-to-top"[\s\S]*?<\/button>/gi, "")
    .replace(/<script>localStorage[\s\S]*?<\/script>/gi, "")
    .replace(/<script src="[^"]*"><\/script>/gi, "");

  let bodyAttr = 'data-page="city"';

  const assembled = [
    '<!doctype html>',
    '<html lang="ru">',
    '  <head>',
    readPartial("metrika.html"),
    '',
    resolve("head-common.html", base),
    headMeta,
    '  </head>',
    '',
    `  <body ${bodyAttr}>`,
    resolve("header.html", base),
    '<main>',
    bodyContent.trim(),
    '</main>',
    resolve("footer.html", base),
    sharedPageEnd(base),
    `<script>localStorage.setItem("selected_city", "${city}"); localStorage.setItem("city_confirmed", "true");</script>`,
    '</body>',
    '</html>',
  ].join("\n");

  fs.writeFileSync(srcPath, assembled);
  console.log(`  ✓ Built ${city}/${pageName}`);
}

// ========== MAIN ==========
console.log("\n🔨 Building Правильные Грузчики static site...\n");

// Root pages
const rootPages = [
  "index.html",
  "about.html",
  "loaders.html",
  "workers.html",
  "moving.html",
  "office-moving.html",
  "rigging.html",
  "furniture.html",
  "gruzoperevozki.html",
  "thank-you.html",
];

console.log("📄 Root pages:");
rootPages.forEach(page => buildRootPage(page, ""));

// City pages
console.log("\n🏙️  City subpages:");
CITIES.forEach(city => {
  CITY_SERVICE_PAGES.forEach(page => {
    buildCityPage(city, page, "../");
  });
});

console.log("\n✅ Build complete!\n");
