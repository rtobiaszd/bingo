import confetti from 'canvas-confetti';

/**
 * Festive celebratory confetti using canvas-confetti for Bingo wins
 */
export function fireBingoConfetti(durationMs = 4000) {
  if (typeof window === 'undefined') return;

  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    zIndex: 9999,
  };

  const fire = (particleRatio: number, opts: confetti.Options) => {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  };

  // Left & right cannons
  fire(0.25, {
    spread: 50,
    startVelocity: 55,
    origin: { x: 0.15, y: 0.7 },
    colors: ['#f59e0b', '#fbbf24', '#ffffff', '#ec4899', '#3b82f6', '#10b981'],
  });

  fire(0.25, {
    spread: 50,
    startVelocity: 55,
    origin: { x: 0.85, y: 0.7 },
    colors: ['#f59e0b', '#fbbf24', '#ffffff', '#ec4899', '#3b82f6', '#10b981'],
  });

  // Center golden burst
  fire(0.2, {
    spread: 75,
    startVelocity: 45,
    origin: { x: 0.5, y: 0.6 },
    colors: ['#ffd700', '#ff9900', '#ff0055', '#00ffcc'],
  });

  fire(0.3, {
    spread: 120,
    decay: 0.91,
    scalar: 1.2,
    origin: { x: 0.5, y: 0.65 },
    colors: ['#f59e0b', '#10b981', '#6366f1', '#f43f5e'],
  });

  // Cascading raining confetti
  const end = Date.now() + durationMs;
  const interval = setInterval(() => {
    if (Date.now() > end) {
      clearInterval(interval);
      return;
    }
    confetti({
      startVelocity: 28,
      spread: 360,
      ticks: 60,
      origin: { x: Math.random(), y: Math.random() * 0.4 },
      colors: ['#f59e0b', '#fbbf24', '#38bdf8', '#a855f7', '#34d399', '#f43f5e'],
      zIndex: 9999,
      shapes: ['circle', 'square'],
      scalar: 1.15,
    });
  }, 400);
}

