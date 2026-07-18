import { useEffect, useRef } from 'react';
import { useCalculatorStore } from '../../store/useCalculatorStore';

export function SoundManager() {
  const isSoundEnabled = useCalculatorStore((s) => s.isSoundEnabled);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!isSoundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = ctx;
      const resume = () => { if (ctx.state === 'suspended') ctx.resume(); };
      window.addEventListener('pointerdown', resume, { once: true });
      window.addEventListener('keydown', resume, { once: true });
    } catch {}

    (window as any).pgPlaySound = (type: 'add' | 'remove' | 'snap' | 'click' | 'error') => {
      if (!isSoundEnabled || !audioCtxRef.current) return;
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      const now = ctx.currentTime;
      switch (type) {
        case 'add':
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
          osc.start(now);
          osc.stop(now + 0.26);
          break;
        case 'remove':
          osc.frequency.setValueAtTime(660, now);
          osc.frequency.exponentialRampToValueAtTime(220, now + 0.18);
          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
          osc.start(now);
          osc.stop(now + 0.23);
          break;
        case 'snap':
          osc.frequency.setValueAtTime(1200, now);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
          osc.start(now);
          osc.stop(now + 0.09);
          break;
        case 'error':
          osc.frequency.setValueAtTime(180, now);
          osc.frequency.setValueAtTime(120, now + 0.1);
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
          osc.start(now);
          osc.stop(now + 0.31);
          break;
        default:
          osc.frequency.setValueAtTime(600, now);
          gain.gain.setValueAtTime(0.06, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
          osc.start(now);
          osc.stop(now + 0.08);
      }
    };

    return () => {
      try { audioCtxRef.current?.close(); } catch {}
    };
  }, [isSoundEnabled]);

  return null;
}
