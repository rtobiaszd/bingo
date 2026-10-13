/**
 * Non-obstructive visual celebration indicator
 * Strictly prevents any floating confetti or screen obscuring elements over numbers
 */
export function fireBingoConfetti() {
  if (typeof document === 'undefined') return;

  // Flash a subtle, elegant mint/emerald border pulse on the viewport edges
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.inset = '0';
  overlay.style.pointerEvents = 'none';
  overlay.style.zIndex = '9998';
  overlay.style.boxShadow = 'inset 0 0 0 4px #10b981';
  overlay.style.transition = 'opacity 0.8s ease-out';
  overlay.style.opacity = '1';

  document.body.appendChild(overlay);

  setTimeout(() => {
    overlay.style.opacity = '0';
    setTimeout(() => {
      if (document.body.contains(overlay)) {
        document.body.removeChild(overlay);
      }
    }, 800);
  }, 1200);
}
