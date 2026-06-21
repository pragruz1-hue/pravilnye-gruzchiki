# Telegram Bot Integration

## Как запустить сервер

### 1. Установите Node.js (если не установлен)
- Скачайте с https://nodejs.org/

### 2. Откройте PowerShell в папке проекта
```powershell
cd "c:\Users\Info\Desktop\на сайт\pragruz\pravilnye-gruzchiki"
```

### 3. Запустите сервер
```powershell
node server.js
```

Вы должны увидеть:
```
✓ Server running on http://localhost:3000
✓ Telegram Bot: @pragruz_bot
✓ POST /api/submit-lead - submit lead form
```

### 4. Откройте сайт локально
- Откройте `index.html` в браузере или используйте Live Server

---

## Как это работает

1. **Пользователь заполняет форму** на сайте
2. **Выбирает канал** (WhatsApp/Telegram/Email)
3. **Если выбран Telegram** → данные отправляются на `localhost:3000/api/submit-lead`
4. **Сервер отправляет** сообщение в Telegram через бота `@pragruz_bot`
5. **Вы получаете** заявку в личные сообщения с полной информацией

---

## Конфигурация

Токен бота и другие параметры находятся в начале `server.js`:

```javascript
const TELEGRAM_BOT_TOKEN = '8133133212:AAHa3rr88Oa3QlUDIHkE7xXLLgCRRi2pT1Q';
const TELEGRAM_CHAT_ID = '@flashpointmusik';
const PORT = 3000;
```

---

## Если сервер не запускается

### Ошибка: "command not found: node"
- Переустановите Node.js и добавьте в PATH

### Ошибка: "EADDRINUSE: address already in use :::3000"
- Порт 3000 занят другим приложением
- Используйте другой порт или закройте приложение

### Тестирование
```powershell
# Проверьте, что сервер работает
curl http://localhost:3000/api/health
```

Должны увидеть:
```json
{"status":"ok","bot":"@pragruz_bot"}
```
