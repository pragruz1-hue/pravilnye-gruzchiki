/**
 * Защита 3D-калькулятора от копирования
 * Версия: 2.0
 * Дата: 2026-07-19
 */

// === DOMAIN PROTECTION ===
const ALLOWED_DOMAINS = [
  'pragruz.ru',
  'www.pragruz.ru',
  'pravilnye-gruzchiki.ru',
  'localhost',
  '127.0.0.1',
  '0.0.0.0'
];

function isAllowedDomain(): boolean {
  if (typeof window === 'undefined') return true;

  const hostname = window.location.hostname.toLowerCase();
  
  return ALLOWED_DOMAINS.some(domain => {
    if (hostname === domain) return true;
    if (hostname.endsWith('.' + domain)) return true;
    return false;
  });
}

// === REFERER PROTECTION ===
function isAllowedReferer(): boolean {
  if (typeof document === 'undefined') return true;

  const referrer = document.referrer;
  if (!referrer) return true; // Прямой заход (браузерная строка) — разрешаем

  try {
    const refUrl = new URL(referrer);
    const refHost = refUrl.hostname.toLowerCase();

    return ALLOWED_DOMAINS.some(domain => 
      refHost === domain || refHost.endsWith('.' + domain)
    );
  } catch {
    return false;
  }
}

// === IFRAME PROTECTION ===
function isNotInIframe(): boolean {
  if (typeof window === 'undefined') return true;
  return window.self === window.top;
}

// === WATERMARK (невидимая защита) ===
const WATERMARK = 'PG-CARGO-3D-v2026-07-19-019f78c0';

// === SELF-DEFENDING ===
function selfDefend() {
  if (typeof window === 'undefined') return;

  // Блокируем devtools
  const devtools = { open: false, orientation: null as any };
  const threshold = 160;

  setInterval(() => {
    if (
      window.outerHeight - window.innerHeight > threshold ||
      window.outerWidth - window.innerWidth > threshold
    ) {
      if (!devtools.open) {
        devtools.open = true;
        // Можно добавить редирект или очистку
        // window.location.href = 'about:blank';
      }
    } else {
      devtools.open = false;
    }
  }, 500);

  // Блокируем правую кнопку мыши на canvas
  document.addEventListener('contextmenu', (e) => {
    if ((e.target as HTMLElement)?.tagName === 'CANVAS') {
      e.preventDefault();
    }
  });

  // Блокируем F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
  document.addEventListener('keydown', (e) => {
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
      (e.ctrlKey && e.key === 'U')
    ) {
      e.preventDefault();
      return false;
    }
  });
}

// === MAIN PROTECTION ===
export function initProtection() {
  if (typeof window === 'undefined') return;

  const violations: string[] = [];

  // 1. Domain check
  if (!isAllowedDomain()) {
    violations.push('domain');
  }

  // 2. Referer check
  if (!isAllowedReferer()) {
    violations.push('referer');
  }

  // 3. Iframe check
  if (!isNotInIframe()) {
    violations.push('iframe');
  }

  if (violations.length > 0) {
    console.warn('%c[PG] Доступ к калькулятору ограничен. Нарушения: ' + violations.join(', '), 'color:#ff6b00');

    setTimeout(() => {
      document.body.innerHTML = `
        <div style="
          display: flex; 
          align-items: center; 
          justify-content: center; 
          height: 100vh; 
          background: #10131b; 
          color: #fff; 
          font-family: Inter, sans-serif;
          text-align: center;
          padding: 20px;
        ">
          <div>
            <div style="font-size: 64px; margin-bottom: 20px;">🚫</div>
            <h1 style="font-size: 28px; margin: 0 0 16px;">Доступ ограничен</h1>
            <p style="font-size: 16px; color: #94a3b8; max-width: 420px; margin: 0 auto 20px;">
              Этот калькулятор доступен только на официальном сайте<br>
              <strong>pragruz.ru</strong>
            </p>
            <p style="font-size: 12px; color: #64748b;">
              Код нарушения: ${violations.join('+')}
            </p>
          </div>
        </div>
      `;
    }, 100);
    
    throw new Error('Protection triggered: ' + violations.join(', '));
  }

  // 2. Watermark в консоль (для тех, кто откроет)
  console.log(
    '%c[PG Cargo Calculator] Protected build • ' + WATERMARK,
    'color:#64748b; font-size:9px'
  );

  // 3. Self-defending
  selfDefend();

  // 4. Блокируем копирование текста в определённых местах
  document.addEventListener('copy', (e) => {
    const target = e.target as HTMLElement;
    if (target.closest('#root') && target.tagName === 'CANVAS') {
      e.preventDefault();
    }
  });

  // 5. Дополнительная защита от инспектирования
  Object.defineProperty(window, 'pg_protected', {
    value: true,
    writable: false,
    configurable: false
  });
}

// Автоматический запуск
if (typeof window !== 'undefined') {
  initProtection();
}