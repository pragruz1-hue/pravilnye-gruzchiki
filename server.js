"use strict";

/**
 * Production server for deployment on infrastructure physically located in РФ.
 * It serves the static site and stores form submissions locally. It does not
 * forward personal data to Telegram, Formspree, foreign webhooks or SaaS.
 */

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const querystring = require("node:querystring");

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "127.0.0.1";
const SITE_ROOT = __dirname;
const DATA_DIR = process.env.LEADS_DATA_DIR || path.join(__dirname, "data");
const LEADS_FILE = path.join(DATA_DIR, "leads.ndjson");
const RETENTION_DAYS = Number(process.env.LEAD_RETENTION_DAYS || 90);
const MAX_BODY_BYTES = 48 * 1024;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 10;
const rateLimits = new Map();

const ALLOWED_FIELDS = new Set([
  "name", "phone", "service", "comment", "details", "message", "text",
  "rating", "city", "source", "promo", "route", "direction", "vehicle",
  "cargo_summary", "workers", "hours", "calculatedPrice", "page",
]);

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".webmanifest": "application/manifest+json",
};
const PUBLIC_EXTENSIONS = new Set(Object.keys(MIME_TYPES));

function ensureDataStorage() {
  fs.mkdirSync(DATA_DIR, { recursive: true, mode: 0o700 });
  if (!fs.existsSync(LEADS_FILE)) fs.writeFileSync(LEADS_FILE, "", { mode: 0o600 });
  try { fs.chmodSync(LEADS_FILE, 0o600); } catch (_) { /* filesystem may not support chmod */ }
}

function cleanupExpiredLeads() {
  ensureDataStorage();
  const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;
  const retained = fs.readFileSync(LEADS_FILE, "utf8").split("\n").filter(Boolean).filter((line) => {
    try {
      const lead = JSON.parse(line);
      return Date.parse(lead.receivedAt || 0) >= cutoff;
    } catch (_) {
      return false;
    }
  });
  fs.writeFileSync(LEADS_FILE, retained.length ? `${retained.join("\n")}\n` : "", { mode: 0o600 });
}

function setSecurityHeaders(res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
}

function sendJson(res, status, payload) {
  setSecurityHeaders(res);
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(payload));
}

function getClientAddress(req) {
  const socketAddress = req.socket.remoteAddress || "unknown";
  const isLocalProxy = socketAddress === "127.0.0.1" || socketAddress === "::1" || socketAddress === "::ffff:127.0.0.1";
  if (isLocalProxy && req.headers["x-forwarded-for"]) {
    return String(req.headers["x-forwarded-for"]).split(",")[0].trim().slice(0, 64);
  }
  return socketAddress;
}

function isRateLimited(req) {
  const now = Date.now();
  const address = getClientAddress(req);
  const entry = rateLimits.get(address);
  if (!entry || now - entry.startedAt > RATE_LIMIT_WINDOW_MS) {
    rateLimits.set(address, { startedAt: now, count: 1 });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

function hasValidOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  try { return new URL(origin).host === req.headers.host; } catch (_) { return false; }
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    let bytes = 0;
    req.on("data", (chunk) => {
      bytes += chunk.length;
      if (bytes > MAX_BODY_BYTES) {
        reject(new Error("Слишком большой объём данных."));
        req.destroy();
        return;
      }
      body += chunk.toString("utf8");
    });
    req.on("end", () => {
      try {
        const contentType = String(req.headers["content-type"] || "");
        if (contentType.includes("application/json")) resolve(JSON.parse(body || "{}"));
        else if (contentType.includes("application/x-www-form-urlencoded")) resolve(querystring.parse(body));
        else reject(new Error("Неподдерживаемый формат запроса."));
      } catch (_) {
        reject(new Error("Некорректные данные формы."));
      }
    });
    req.on("error", reject);
  });
}

function cleanText(value, maxLength = 2000) {
  if (value === undefined || value === null) return "";
  return String(value).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, maxLength);
}

function normalizeLead(input) {
  const consentGiven = input.personalDataConsent === true || input.personal_data_consent === "accepted";
  if (!consentGiven) throw new Error("Не подтверждено согласие на обработку персональных данных.");
  if (cleanText(input._gotcha, 200)) throw new Error("Проверка формы не пройдена.");

  const phone = cleanText(input.phone, 40);
  const phoneDigits = phone.replace(/\D/g, "");
  if (phoneDigits.length < 10 || phoneDigits.length > 15) throw new Error("Укажите корректный номер телефона.");

  const source = cleanText(input.source, 120) || "Форма сайта";
  const isReview = /review|отзыв/i.test(source) || Boolean(input.review_publication_consent);
  const publicationConsent = input.reviewPublicationConsent === true || input.review_publication_consent === "accepted";
  if (isReview && !publicationConsent) throw new Error("Не подтверждено отдельное согласие на публикацию отзыва.");

  const fields = {};
  for (const [key, value] of Object.entries(input)) {
    if (!ALLOWED_FIELDS.has(key)) continue;
    fields[key] = cleanText(value, key === "phone" ? 40 : 4000);
  }
  fields.phone = phone;
  fields.source = source;

  return {
    id: crypto.randomUUID(),
    receivedAt: new Date().toISOString(),
    ...fields,
    consent: {
      accepted: true,
      version: cleanText(input.consentVersion || input.consent_version, 80),
      acceptedAt: cleanText(input.consentTimestamp, 80) || new Date().toISOString(),
      publicationAccepted: isReview ? true : false,
      publicationVersion: isReview ? cleanText(input.publicationConsentVersion || input.publication_consent_version, 80) : "",
    },
    retentionUntil: new Date(Date.now() + RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString(),
  };
}

function saveLead(lead) {
  ensureDataStorage();
  fs.appendFileSync(LEADS_FILE, `${JSON.stringify(lead)}\n`, { encoding: "utf8", mode: 0o600 });
}

async function handleLead(req, res) {
  if (!hasValidOrigin(req)) return sendJson(res, 403, { success: false, error: "Запрос с другого сайта отклонён." });
  if (isRateLimited(req)) return sendJson(res, 429, { success: false, error: "Слишком много попыток. Повторите позже." });

  try {
    const input = await readRequestBody(req);
    const lead = normalizeLead(input);
    saveLead(lead);
    sendJson(res, 200, { success: true, requestId: lead.id });
  } catch (error) {
    sendJson(res, 422, { success: false, error: error.message || "Не удалось обработать заявку." });
  }
}

function resolvePublicFile(requestUrl) {
  let pathname;
  try { pathname = decodeURIComponent(new URL(requestUrl, "http://localhost").pathname); } catch (_) { return null; }
  if (pathname.includes("\0") || pathname.split("/").some((segment) => segment.startsWith("."))) return null;
  if (pathname === "/") pathname = "/index.html";
  if (pathname.endsWith("/")) pathname += "index.html";

  const filePath = path.resolve(SITE_ROOT, `.${pathname}`);
  if (!filePath.startsWith(`${SITE_ROOT}${path.sep}`)) return null;
  if (!PUBLIC_EXTENSIONS.has(path.extname(filePath).toLowerCase())) return null;
  if (filePath.startsWith(`${DATA_DIR}${path.sep}`)) return null;
  return filePath;
}

function serveStatic(req, res) {
  const filePath = resolvePublicFile(req.url);
  if (!filePath || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    const notFound = path.join(SITE_ROOT, "404.html");
    setSecurityHeaders(res);
    res.writeHead(404, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
    fs.createReadStream(notFound).pipe(res);
    return;
  }

  const extension = path.extname(filePath).toLowerCase();
  setSecurityHeaders(res);
  res.writeHead(200, {
    "Content-Type": MIME_TYPES[extension],
    "Cache-Control": extension === ".html" ? "no-cache" : "public, max-age=604800",
  });
  if (req.method === "HEAD") res.end();
  else fs.createReadStream(filePath).pipe(res);
}

cleanupExpiredLeads();
setInterval(cleanupExpiredLeads, 24 * 60 * 60 * 1000).unref();
setInterval(() => {
  const cutoff = Date.now() - RATE_LIMIT_WINDOW_MS;
  for (const [address, entry] of rateLimits.entries()) if (entry.startedAt < cutoff) rateLimits.delete(address);
}, RATE_LIMIT_WINDOW_MS).unref();

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/api/submit-lead") return void handleLead(req, res);
  if (req.method === "GET" && req.url === "/api/health") return void sendJson(res, 200, { status: "ok", storage: "local-rf-required" });
  if (req.url.startsWith("/api/")) return void sendJson(res, 404, { error: "Not found" });
  if (req.method === "GET" || req.method === "HEAD") return void serveStatic(req, res);
  sendJson(res, 405, { error: "Method not allowed" });
});

server.listen(PORT, HOST, () => {
  console.log(`Site and lead API: http://${HOST}:${PORT}`);
  console.log(`Lead storage: ${LEADS_FILE}`);
  console.log(`Retention: ${RETENTION_DAYS} days`);
});
