# Настройка отправки писем на info@pragruz.ru

## Текущее состояние

- ✅ Форма отправляет данные на backend сервер
- ✅ Сервер логирует все заявки в файл `leads_emails.log`
- ✅ Заявки отправляются в Telegram
- ⚠️ Письма НЕ отправляются на почту (требует настройки SMTP)

## Как включить отправку писем на почту

### Вариант 1: Использовать Nodemailer + Gmail (Рекомендуется для локального тестирования)

1. Установите `nodemailer`:

```bash
npm install nodemailer
```

2. Обновите `server.js`, добавив в начало файла после импортов:

```javascript
const nodemailer = require("nodemailer");

// Создайте транспортер для отправки писем через Gmail
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "your-email@gmail.com", // Ваш Gmail адрес
    pass: "your-app-password", // Пароль приложения (см. ниже)
  },
});
```

3. Получите пароль приложения для Gmail:
   - Откройте https://myaccount.google.com/apppasswords
   - Выберите "Mail" и "Windows Computer"
   - Скопируйте 16-символьный пароль
   - Вставьте его в `your-app-password` выше

4. Найдите функцию `logLeadToEmail` в `server.js` и замените её на:

```javascript
async function logLeadToEmail(leadData) {
  try {
    const logPath = path.join(__dirname, "leads_emails.log");
    const entry = {
      timestamp: new Date().toISOString(),
      ...leadData,
    };
    fs.appendFileSync(logPath, JSON.stringify(entry) + "\n", {
      encoding: "utf8",
    });

    // Send email
    const emailBody = formatEmailBody(leadData);
    const mailOptions = {
      from: "your-email@gmail.com",
      to: "info@pragruz.ru",
      subject: `Новая заявка - ${leadData.source}`,
      text: emailBody,
    };

    await transporter.sendMail(mailOptions);
    console.log("✓ Email sent to info@pragruz.ru");
    return true;
  } catch (err) {
    console.error("Failed to send email:", err);
    return true; // Still return true so form works even if email fails
  }
}
```

### Вариант 2: Использовать SendGrid (Для production)

1. Зарегистрируйтесь на https://sendgrid.com
2. Получите API ключ
3. Установите sendgrid:

```bash
npm install @sendgrid/mail
```

4. Обновите функцию отправки писем (аналогично вышеприведённому варианту)

### Вариант 3: Встроенный `sendmail` (Linux/Mac)

Если у вас Linux или Mac, можно использовать встроенный `sendmail`.

## Проверка работы

1. Запустите сервер:

```bash
node server.js
```

2. Заполните форму на сайте
3. Проверьте:
   - Наличие файла `leads_emails.log` с записью
   - Сообщение в Telegram
   - Письмо на почту (если настроили)

## Файл логов

Все заявки записываются в `leads_emails.log` в JSON формате:

```json
{
  "timestamp": "2026-06-21T10:30:00.000Z",
  "name": "Иван Иванов",
  "phone": "+7(999)123-45-67",
  "service": "Грузчики на склад / разгрузку",
  "comment": "Нужно 2 грузчика",
  "source": "Main Form"
}
```

## Контакты для помощи

Если возникли вопросы по настройке SMTP, обратитесь к документации:

- Gmail: https://support.google.com/accounts/answer/185833
- Nodemailer: https://nodemailer.com
- SendGrid: https://sendgrid.com/docs
