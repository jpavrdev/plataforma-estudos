import { useEffect, useState } from 'react';

// Ticks once per second so the deadline clock stays live. Only the seconds
// tile animates (G7); the caller restarts it by changing the React key.
export function useCountdown(deadline: number) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const rest = Math.max(0, deadline - now);
  const totalSeconds = Math.floor(rest / 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    dd: pad(Math.floor(totalSeconds / 86_400)),
    hh: pad(Math.floor((totalSeconds % 86_400) / 3_600)),
    mm: pad(Math.floor((totalSeconds % 3_600) / 60)),
    ss: pad(totalSeconds % 60),
  };
}
