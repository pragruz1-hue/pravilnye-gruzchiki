import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppErrorBoundary } from './components/ui/AppErrorBoundary';
import { initProtection } from './protect';
import './index.css';

// === ЗАЩИТА КАЛЬКУЛЯТОРА (выполняется до рендера) ===
initProtection();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </React.StrictMode>
);
