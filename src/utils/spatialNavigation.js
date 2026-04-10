/**
 * NonoTV — Spatial Navigation v3.0 (Mi Stick Optimized)
 * 
 * Correções críticas:
 * - Focus style leve (sem scale que quebra layout)
 * - Navegação confinada por seções (não pula para sidebar/navbar)
 * - Suporte a scroll automático para elemento focado
 * - Performance otimizada para hardware limitado
 */

const FOCUSABLE_SELECTOR = 'button:not([disabled]):not([tabindex="-1"]), [tabindex="0"], input:not([disabled]), select:not([disabled])';

// Threshold mínimo de distância para considerar direção válida
const MIN_DISTANCE = 10;

function getVisibleFocusable(container) {
  const root = container || document;
  return Array.from(root.querySelectorAll(FOCUSABLE_SELECTOR)).filter(el => {
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && rect.top < window.innerHeight && rect.bottom > 0;
  });
}

function getCenter(el) {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

function findBestCandidate(current, candidates, direction) {
  const { x: cx, y: cy } = getCenter(current);
  let best = null;
  let bestScore = Infinity;

  for (const el of candidates) {
    if (el === current) continue;
    const { x, y } = getCenter(el);
    const dx = x - cx;
    const dy = y - cy;

    let valid = false;
    let primaryDist = 0;
    let secondaryDist = 0;

    switch (direction) {
      case 'right':
        if (dx > MIN_DISTANCE) {
          valid = true;
          primaryDist = dx;
          secondaryDist = Math.abs(dy);
        }
        break;
      case 'left':
        if (dx < -MIN_DISTANCE) {
          valid = true;
          primaryDist = -dx;
          secondaryDist = Math.abs(dy);
        }
        break;
      case 'down':
        if (dy > MIN_DISTANCE) {
          valid = true;
          primaryDist = dy;
          secondaryDist = Math.abs(dx);
        }
        break;
      case 'up':
        if (dy < -MIN_DISTANCE) {
          valid = true;
          primaryDist = -dy;
          secondaryDist = Math.abs(dx);
        }
        break;
    }

    if (valid) {
      // Score: prioriza proximidade no eixo primário, penaliza desvio lateral
      // Penalidade lateral maior = foco fica mais "em linha"
      const score = primaryDist + secondaryDist * 3;
      if (score < bestScore) {
        bestScore = score;
        best = el;
      }
    }
  }

  return best;
}

function scrollToElement(el) {
  // Scroll suave para o elemento focado, sem scrollIntoView que é brusco
  const scrollParent = findScrollParent(el);
  if (!scrollParent) return;

  const elRect = el.getBoundingClientRect();
  const parentRect = scrollParent.getBoundingClientRect();

  // Se o elemento está fora da área visível do scroll parent, ajusta
  if (elRect.bottom > parentRect.bottom - 20) {
    scrollParent.scrollBy({ top: elRect.bottom - parentRect.bottom + 80, behavior: 'smooth' });
  } else if (elRect.top < parentRect.top + 20) {
    scrollParent.scrollBy({ top: elRect.top - parentRect.top - 80, behavior: 'smooth' });
  }
}

function findScrollParent(el) {
  let parent = el.parentElement;
  while (parent) {
    const style = getComputedStyle(parent);
    if (style.overflowY === 'auto' || style.overflowY === 'scroll') return parent;
    parent = parent.parentElement;
  }
  return null;
}

/**
 * Determina a zona de navegação do elemento atual
 * Impede que o foco pule da área de conteúdo para a sidebar/navbar
 */
function getNavigationZone(el) {
  // Player: foco confinado inteiramente
  if (el.closest('[data-nav-zone="player"]')) return 'player';
  // Settings/Overlay: confinado
  if (el.closest('[data-nav-zone="overlay"]')) return 'overlay';
  // Sidebar
  if (el.closest('aside') || el.closest('[data-nav-zone="sidebar"]')) return 'sidebar';
  // Navbar
  if (el.closest('[data-nav-zone="navbar"]')) return 'navbar';
  // Bottom nav (mobile)
  if (el.closest('[data-nav-zone="bottomnav"]')) return 'bottomnav';
  // Conteúdo principal
  return 'content';
}

export function initSpatialNavigation() {
  const isTv = /TV|Android|SmartTV|Tizen|AFT|MiBox/i.test(navigator.userAgent);
  if (!isTv && !import.meta.env.DEV) return;

  console.log('[SpatialNav] v3.0 — Navegação otimizada para TV ativada');

  // Estilo de foco limpo — sem scale, sem position chaos
  const style = document.createElement('style');
  style.textContent = `
    *:focus {
      outline: none !important;
    }
    button:focus-visible,
    [tabindex="0"]:focus-visible,
    input:focus-visible {
      box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.5), 0 0 12px rgba(255, 255, 255, 0.15) !important;
      transition: box-shadow 150ms ease !important;
    }
  `;
  document.head.appendChild(style);

  const DIRECTION_MAP = {
    ArrowRight: 'right',
    ArrowLeft: 'left',
    ArrowDown: 'down',
    ArrowUp: 'up',
  };

  document.addEventListener('keydown', (e) => {
    const direction = DIRECTION_MAP[e.key];
    if (!direction) return;

    const current = document.activeElement;
    if (!current || current === document.body) {
      // Sem foco: dar foco à zona mais importante ativa
      const activeZone = document.querySelector('[data-nav-zone="player"]') || 
                         document.querySelector('[data-nav-zone="overlay"]') || 
                         document.querySelector('main');
      const firstContent = activeZone ? activeZone.querySelector(FOCUSABLE_SELECTOR) : null;
      if (firstContent) {
        e.preventDefault();
        firstContent.focus();
      }
      return;
    }

    const zone = getNavigationZone(current);
    let candidates;
    if (zone === 'sidebar') {
      candidates = getVisibleFocusable(current.closest('aside'));
    } else if (zone === 'player') {
      candidates = getVisibleFocusable(current.closest('[data-nav-zone="player"]'));
    } else if (zone === 'overlay') {
      candidates = getVisibleFocusable(current.closest('[data-nav-zone="overlay"]'));
    } else if (zone === 'bottomnav') {
      candidates = getVisibleFocusable(current.closest('[data-nav-zone="bottomnav"]'));
    } else {
      // Content + navbar podem navegar entre si (vertical: content, horizontal: stays)
      const mainEl = document.querySelector('main');
      candidates = mainEl ? getVisibleFocusable(mainEl) : getVisibleFocusable();
    }

    const best = findBestCandidate(current, candidates, direction);
    if (best) {
      e.preventDefault();
      best.focus({ preventScroll: true });
      scrollToElement(best);
    }
  }, { passive: false });
}
