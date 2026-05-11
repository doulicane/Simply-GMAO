import { useState, useEffect, useRef, useCallback } from 'react';

const INACTIVITY_TIMEOUT = 60_000; // 60 secondes

export function useKioskMode() {
  const [kiosk, setKiosk] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const enterKiosk = useCallback(() => {
    setKiosk(true);
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
    else if ((el as any).webkitRequestFullscreen) (el as any).webkitRequestFullscreen();
  }, []);

  const exitKiosk = useCallback(() => {
    setKiosk(false);
    if (document.exitFullscreen) document.exitFullscreen();
    else if ((document as any).webkitExitFullscreen) (document as any).webkitExitFullscreen();
  }, []);

  const resetTimer = useCallback(() => {
    if (!kiosk) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      // Dispatch event pour reset l'UI du portail opérateur
      window.dispatchEvent(new CustomEvent('kiosk:reset'));
    }, INACTIVITY_TIMEOUT);
  }, [kiosk]);

  useEffect(() => {
    if (!kiosk) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    const handler = () => resetTimer();
    events.forEach((e) => window.addEventListener(e, handler));
    resetTimer();
    return () => {
      events.forEach((e) => window.removeEventListener(e, handler));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [kiosk, resetTimer]);

  return { kiosk, enterKiosk, exitKiosk };
}
