/**
 * NonoTV — Spatial Navigation
 * Navegação por controle remoto / TV Box
 * Implementação segura: nunca lança exceção mesmo em ambientes sem suporte
 */

export function initSpatialNavigation() {
  try {
    // Só ativa em ambientes de TV / controle remoto
    // Em mobile/desktop é no-op seguro
    const isTvLike = window.navigator?.userAgent?.includes('TV') ||
                     window.navigator?.userAgent?.includes('SmartTV') ||
                     window.navigator?.userAgent?.includes('Tizen') ||
                     window.navigator?.userAgent?.includes('WebOS');

    if (!isTvLike) return;

    // Navegação por setas — foca o próximo elemento focável na direção
    document.addEventListener('keydown', (e) => {
      const focusable = [
        ...document.querySelectorAll(
          'button:not([disabled]), [tabindex]:not([tabindex="-1"]), input:not([disabled]), select:not([disabled])'
        )
      ].filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });

      const current = document.activeElement;
      const idx = focusable.indexOf(current);
      if (idx === -1) {
        focusable[0]?.focus();
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        focusable[(idx + 1) % focusable.length]?.focus();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        focusable[(idx - 1 + focusable.length) % focusable.length]?.focus();
      }
    });

  } catch (err) {
    // Nunca deixa o erro subir — spatial nav é enhancement, não core
    console.warn('[SpatialNav] Não inicializado:', err.message);
  }
}
