import { useRef, useEffect, useState } from 'react';

interface JoystickProps {
  onMove: (dx: number, dz: number) => void;
  onUpDown?: (dy: number) => void;
}

export function MobileJoystick({ onMove, onUpDown }: JoystickProps) {
  const baseRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const touchId = useRef<number | null>(null);

  useEffect(() => {
    const base = baseRef.current;
    if (!base) return;

    const handleStart = (e: TouchEvent) => {
      if (touchId.current !== null) return;
      const touch = e.touches[0];
      touchId.current = touch.identifier;
      setActive(true);
    };

    const handleMove = (e: TouchEvent) => {
      if (touchId.current === null) return;
      const touch = Array.from(e.touches).find(t => t.identifier === touchId.current);
      if (!touch || !base) return;
      const rect = base.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      let dx = (touch.clientX - centerX) / (rect.width / 2);
      let dy = (touch.clientY - centerY) / (rect.height / 2);
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 1) { dx /= dist; dy /= dist; }
      setPos({ x: dx * 40, y: dy * 40 });
      onMove(dx, dy);
      window.__joystick = { x: dx, y: dy };
      e.preventDefault();
    };

    const handleEnd = (e: TouchEvent) => {
      const ended = Array.from(e.changedTouches).some(t => t.identifier === touchId.current);
      if (!ended) return;
      touchId.current = null;
      setActive(false);
      setPos({ x: 0, y: 0 });
      onMove(0, 0);
      window.__joystick = { x: 0, y: 0 };
    };

    base.addEventListener('touchstart', handleStart, { passive: false });
    window.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleEnd);
    window.addEventListener('touchcancel', handleEnd);

    return () => {
      base.removeEventListener('touchstart', handleStart);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
      window.removeEventListener('touchcancel', handleEnd);
    };
  }, [onMove]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        ref={baseRef}
        className={`relative h-[110px] w-[110px] select-none touch-none rounded-full border-2 bg-black/30 backdrop-blur ${active ? 'border-orange-400 bg-black/50' : 'border-white/20'}`}
      >
        <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/40" />
        <div
          className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/80 shadow-lg transition-transform duration-75"
          style={{ transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))` }}
        />
      </div>
      <div className="text-[10px] font-black text-white/60">WASD джойстик</div>
      {onUpDown && (
        <div className="flex gap-2">
          <button onTouchStart={() => onUpDown(-1)} onTouchEnd={() => onUpDown(0)} className="h-10 w-10 rounded-full bg-white/20 text-white">↓</button>
          <button onTouchStart={() => onUpDown(1)} onTouchEnd={() => onUpDown(0)} className="h-10 w-10 rounded-full bg-white/20 text-white">↑</button>
        </div>
      )}
    </div>
  );
}

export function PerformanceToggle() {
  return null;
}
