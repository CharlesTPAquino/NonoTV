/**
 * NonoTV — Spatial Navigation Professional
 * Sistema de foco inteligente para Android TV / Mi Stick
 */

import { NAVIGATION, UI } from '../constants';

const { ARROW_THRESHOLD, MIN_DISTANCE, Z_INDEX_FOCUSED } = NAVIGATION;
const { FOCUS_SCALE, FOCUS_BOX_SHADOW, ANIMATION_DURATION } = UI;

export function initSpatialNavigation() {
  const isTv = /TV|Android|SmartTV|Tizen/i.test(navigator.userAgent);
  if (!isTv && !import.meta.env.DEV) return;

  console.log('[SpatialNav] Ativando navegação inteligente...');

  const style = document.createElement('style');
  style.innerHTML = `
    :focus {
      outline: none !important;
      box-shadow: ${FOCUS_BOX_SHADOW} !important;
      transform: scale(${FOCUS_SCALE});
      transition: all ${ANIMATION_DURATION}ms ease-in-out;
      z-index: ${Z_INDEX_FOCUSED};
      position: relative;
    }
  `;
  document.head.appendChild(style);

  document.addEventListener('keydown', (e) => {
    const focusable = Array.from(document.querySelectorAll(
      'button:not([disabled]), [tabindex]:not([tabindex="-1"]), input, select'
    )).filter(el => el.getBoundingClientRect().width > 0);

    const current = document.activeElement;
    if (!focusable.includes(current)) {
      focusable[0]?.focus();
      return;
    }

    const rect = current.getBoundingClientRect();
    const curX = rect.left + rect.width / 2;
    const curY = rect.top + rect.height / 2;

    let best = null;
    let minDiff = Infinity;

    focusable.forEach(el => {
      if (el === current) return;
      const r = el.getBoundingClientRect();
      const x = r.left + r.width / 2;
      const y = r.top + r.height / 2;

      const dx = x - curX;
      const dy = y - curY;

      let valid = false;
      if (e.key === 'ArrowRight' && dx > ARROW_THRESHOLD && Math.abs(dy) < Math.abs(dx)) valid = true;
      if (e.key === 'ArrowLeft' && dx < -ARROW_THRESHOLD && Math.abs(dy) < Math.abs(dx)) valid = true;
      if (e.key === 'ArrowDown' && dy > ARROW_THRESHOLD && Math.abs(dx) < Math.abs(dy)) valid = true;
      if (e.key === 'ArrowUp' && dy < -ARROW_THRESHOLD && Math.abs(dx) < Math.abs(dy)) valid = true;

      if (valid) {
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDiff && dist >= MIN_DISTANCE) {
          minDiff = dist;
          best = el;
        }
      }
    });

    if (best) {
      e.preventDefault();
      best.focus();
    }
  });
}
