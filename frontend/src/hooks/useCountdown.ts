import { useEffect, useState } from "react";

/** Sekundy pozostałe do `target` (ms), odświeżane co sekundę; 0, gdy brak celu lub minął. */
export const useCountdown = (target: number | undefined): number => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!target) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [target]);

  return target ? Math.max(0, Math.ceil((target - now) / 1000)) : 0;
};

export const formatCountdown = (seconds: number): string =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
