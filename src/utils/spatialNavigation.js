/**
 * NonoTV - Spatial Navigation Engine (Geometric Focus)
 * Permite navegação fluida pelo controle remoto (D-pad) da Android TV / Mi Stick
 */

export function initSpatialNavigation() {
  window.addEventListener('keydown', (e) => {
    const KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    if (!KEYS.includes(e.key)) return;

    // Elementos focáveis do NonoTV
    const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const elements = Array.from(document.querySelectorAll(focusableSelectors))
      .filter(el => !el.disabled && el.offsetWidth > 0 && el.offsetHeight > 0 && window.getComputedStyle(el).visibility !== 'hidden');

    if (elements.length === 0) return;

    let current = document.activeElement;
    if (!elements.includes(current)) {
      // Se nada tem foco, foca o primeiro
      elements[0].focus();
      e.preventDefault();
      return;
    }

    const currentRect = current.getBoundingClientRect();
    let bestMatch = null;
    let minDistance = Infinity;

    elements.forEach(el => {
      if (el === current) return;
      const rect = el.getBoundingClientRect();

      let isCandidate = false;
      let distance = Infinity;

      // Distância Euclidiana do centro
      const centerX1 = currentRect.left + currentRect.width / 2;
      const centerY1 = currentRect.top + currentRect.height / 2;
      const centerX2 = rect.left + rect.width / 2;
      const centerY2 = rect.top + rect.height / 2;
      const dist = Math.sqrt(Math.pow(centerX2 - centerX1, 2) + Math.pow(centerY2 - centerY1, 2));

      // Filtro Geométrico Direcional Estrito
      switch (e.key) {
        case 'ArrowUp':
          isCandidate = centerY2 < centerY1 && Math.abs(centerX2 - centerX1) < currentRect.width;
          if (!isCandidate && dist < minDistance && centerY2 < centerY1) isCandidate = true; // Fallback
          break;
        case 'ArrowDown':
          isCandidate = centerY2 > centerY1 && Math.abs(centerX2 - centerX1) < currentRect.width;
          if (!isCandidate && dist < minDistance && centerY2 > centerY1) isCandidate = true;
          break;
        case 'ArrowLeft':
          isCandidate = centerX2 < centerX1 && Math.abs(centerY2 - centerY1) < currentRect.height;
          if (!isCandidate && dist < minDistance && centerX2 < centerX1) isCandidate = true;
          break;
        case 'ArrowRight':
          isCandidate = centerX2 > centerX1 && Math.abs(centerY2 - centerY1) < currentRect.height;
          if (!isCandidate && dist < minDistance && centerX2 > centerX1) isCandidate = true;
          break;
      }

      if (isCandidate && dist < minDistance) {
        minDistance = dist;
        bestMatch = el;
      }
    });

    if (bestMatch) {
      bestMatch.focus();
      e.preventDefault();
      
      // Garante que o item focado apareça na tela (Scroll suave)
      bestMatch.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    }
  });

  // Corrige o foco perdido ao fechar o player
  window.addEventListener('keyup', (e) => {
    if (e.key === 'Escape' || e.key === 'Backspace') {
      setTimeout(() => {
        if (document.activeElement === document.body) {
           const firstCard = document.querySelector('.group.relative.flex.flex-col');
           if (firstCard) firstCard.focus();
        }
      }, 100);
    }
  });
}
