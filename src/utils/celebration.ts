import confetti from 'canvas-confetti';

const CELEBRATION_COLORS = ['#176B50', '#23946F', '#17191D', '#D97706', '#D4D0C5'];

export function triggerDealCelebration(): void {
  if (typeof window === 'undefined') return;

  const prefersReducedMotion = window.matchMedia?.(
    '(prefers-reduced-motion: reduce)'
  ).matches;
  if (prefersReducedMotion) return;

  try {
    confetti({
      particleCount: 70,
      spread: 68,
      origin: { y: 0.65 },
      colors: CELEBRATION_COLORS,
      disableForReducedMotion: true,
    });

    window.setTimeout(() => {
      confetti({
        particleCount: 40,
        angle: 60,
        spread: 55,
        origin: { x: 0.15, y: 0.65 },
        colors: CELEBRATION_COLORS,
        disableForReducedMotion: true,
      });
      confetti({
        particleCount: 40,
        angle: 120,
        spread: 55,
        origin: { x: 0.85, y: 0.65 },
        colors: CELEBRATION_COLORS,
        disableForReducedMotion: true,
      });
    }, 180);
  } catch {
    // Ignore canvas initialization errors in headless or restricted environments
  }
}
