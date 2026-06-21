const http = require("http");
const url = require("url");
const querystring = require("querystring");
const https = require("https");
const fs = require("fs");
const path = require("path");

// Конфигурация бота
const TELEGRAM_BOT_TOKEN = "8133133212:AAHa3rr88Oa3QlUDIHkE7xXLLgCRRi2pT1Q";
const TELEGRAM_CHAT_ID = "@flashpointmusik"; // или ID чата если числовой
const WHATSAPP_NUMBER = "79283333281";
const CONTACT_EMAIL = "info@pragruz.ru";
const PORT = 3000;

// Функция для отправки сообщения в Telegram через Bot API
function sendToTelegram(message) {
  return new Promise((resolve, reject) => {
    const postData = querystring.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      parse_mode: "HTML",
    });

    const options = {
      hostname: "api.telegram.org",
      port: 443,
      path: `/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Telegram API error: ${res.statusCode}`));
        }
      });
    });

    req.on("error", (e) => {
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

// Функция для форматирования сообщения
function formatMessage(leadData) {
  const lines = [
    leadData.name ? `<b>Имя:</b> ${escapeHtml(leadData.name)}` : null,
    leadData.phone ? `<b>Телефон:</b> ${escapeHtml(leadData.phone)}` : null,
    leadData.service ? `<b>Услуга:</b> ${escapeHtml(leadData.service)}` : null,
    leadData.comment
      ? `<b>Комментарий:</b> ${escapeHtml(leadData.comment)}`
      : null,
    leadData.details ? `<b>Детали:</b> ${escapeHtml(leadData.details)}` : null,
    leadData.promo ? `<b>Промокод:</b> ${escapeHtml(leadData.promo)}` : null,
    `<b>Источник:</b> ${escapeHtml(leadData.source || "Не указано")}`,
    `<b>Время:</b> ${new Date(leadData.timestamp || Date.now()).toLocaleString("ru-RU")}`,
  ].filter(Boolean);

  return lines.join("\n");
}

function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Log leads to file (for email notification)
function logLeadToEmail(leadData) {
  try {
    const logPath = path.join(__dirname, "leads_emails.log");
    const entry = {
      timestamp: new Date().toISOString(),
      ...leadData,
    };
    fs.appendFileSync(logPath, JSON.stringify(entry) + "\n", {
      encoding: "utf8",
    });
    console.log("✓ Lead logged to email log");
    return true;
  } catch (err) {
    console.error("Failed to log lead:", err);
    return false;
  }
}

// Format lead for email body
function formatEmailBody(leadData) {
  const lines = [
    `Имя: ${leadData.name || "-"}`,
    `Телефон: ${leadData.phone || "-"}`,
    `Услуга: ${leadData.service || "-"}`,
    leadData.comment ? `Детали: ${leadData.comment}` : null,
    leadData.details ? `Информация: ${leadData.details}` : null,
    leadData.promo ? `Промокод: ${leadData.promo}` : null,
    `Источник: ${leadData.source || "Не указано"}`,
    `Дата: ${new Date(leadData.timestamp || Date.now()).toLocaleString("ru-RU")}`,
  ].filter(Boolean);

  return lines.join("\n");
}

// Создание HTTP сервера
const server = http.createServer((req, res) => {
  // CORS заголовки
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === "POST" && req.url === "/api/submit-lead") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      try {
        const leadData = JSON.parse(body);

        // Log lead for email notification
        logLeadToEmail(leadData);

        // Format and send to Telegram
        const message = formatMessage(leadData);
        await sendToTelegram(message);

        res.writeHead(200);
        res.end(
          JSON.stringify({
            success: true,
            message: "Lead received and logged",
          }),
        );
      } catch (error) {
        console.error("Error:", error);
        res.writeHead(400);
        res.end(JSON.stringify({ success: false, error: error.message }));
      }
    });

    return;
  }

  if (req.url === "/api/health") {
    res.writeHead(200);
    res.end(JSON.stringify({ status: "ok", bot: "@pragruz_bot" }));
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ Telegram Bot: @pragruz_bot`);
  console.log(`✓ POST /api/submit-lead - submit lead form`);
});
