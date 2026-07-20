import { useRef, useCallback } from 'react';
import { Html } from '@react-three/drei';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  showScreenshot?: boolean;
  screenshotRef?: React.RefObject<HTMLDivElement>;
  onScreenshot?: () => void;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Да, сбросить и переключить',
  cancelText = 'Отмена',
  showScreenshot = false,
  screenshotRef,
  onScreenshot,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'Enter' && !e.shiftKey) onConfirm();
  }, [onClose, onConfirm]);

  return (
    <Html
      position={[0, 0, 0]}
      style={{
        pointerEvents: 'none',
        zIndex: 10000,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          pointerEvents: 'auto',
          background: 'rgba(0, 0, 0, 0.6)',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          zIndex: 10000,
        }}
        onClick={onClose}
      >
        <div
          ref={screenshotRef}
          style={{
            pointerEvents: 'auto',
            background: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            maxWidth: '420px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            animation: 'modalIn 0.2s ease-out',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <style>{`
            @keyframes modalIn {
              from { opacity: 0; transform: scale(0.95) translateY(10px); }
              to { opacity: 1; transform: scale(1) translateY(0); }
            }
          `}</style>

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#10131b' }}>
              {title}
            </h3>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.25rem',
                color: '#94a3b8',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Закрыть"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div style={{ marginBottom: '1.5rem', color: '#374151', lineHeight: 1.6 }}>
            {message}
          </div>

          {/* Screenshot Button */}
          {true && (
            <div style={{ marginBottom: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
              <button
                onClick={async () => {
                  try {
                    const target = document.getElementById('calculator-viewport') || document.body;
                    const canvas = await html2canvas(target, {
                      useCORS: true,
                      scale: window.devicePixelRatio || 2,
                      logging: false,
                      backgroundColor: '#ffffff',
                    });
                    
                    const blob = await new Promise<Blob>((resolve) => {
                      canvas.toBlob((b) => resolve(b!), 'image/png', 0.9);
                    });
                    
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    const date = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
                    a.download = `cargo-calculator-${date}.png`;
                    a.click();
                    URL.revokeObjectURL(url);
                    
                    // Show toast notification
                    const toast = document.createElement('div');
                    toast.textContent = '📸 Скриншот сохранён';
                    Object.assign(toast.style, {
                      position: 'fixed',
                      bottom: '2rem',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: '#10131b',
                      color: 'white',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      zIndex: 10001,
                      boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                      animation: 'slideUp 0.3s ease-out',
                    });
                    document.body.appendChild(toast);
                    setTimeout(() => {
                      toast.style.animation = 'slideDown 0.3s ease-in';
                      setTimeout(() => toast.remove(), 300);
                    }, 3000);
                    
                    const style = document.createElement('style');
                    style.textContent = `
                      @keyframes slideUp { from { opacity: 0; transform: translateX(-50%) translateY(20px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
                      @keyframes slideDown { from { opacity: 1; transform: translateX(-50%) translateY(0); } to { opacity: 0; transform: translateX(-50%) translateY(20px); } }
                    `;
                    document.head.appendChild(style);
                  } catch (e) {
                    console.error('Screenshot failed:', e);
                    alert('Не удалось сделать скриншот. Попробуйте вручную (Win+Shift+S / Cmd+Shift+4).');
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  color: '#10131b',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h3l2-3h6l2 3h3a2 2 0 0 1 2 2z"></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
                <span>📸 Сделать скриншот загрузки</span>
              </button>
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center' }}>
                Работает на компьютере и телефоне. Сохранится как PNG.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '0.875rem 1rem',
                background: '#f3f4f6',
                color: '#374151',
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#e5e7eb'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#f3f4f6'; }}
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              style={{
                flex: 1,
                padding: '0.875rem 1rem',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(239, 68, 68, 0.35)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.45)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(239, 68, 68, 0.35)'; }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </Html>
  );
}