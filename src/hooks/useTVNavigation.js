import { useEffect, useCallback } from 'react';

export function useTVNavigation() {
  const handleKey = useCallback((e) => {
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(e.key)) return;

    const focused = document.activeElement;
    if (!focused) return;

    // Find all focusable elements
    const allButtons = document.querySelectorAll('button:not([disabled]), [data-focusable]');
    const allIndices = Array.from(allButtons).map(el => ({ el, zone: el.closest('[data-nav-zone]')?.getAttribute('data-nav-zone') }));

    const currentIdx = allIndices.findIndex(item => item.el === focused);
    if (currentIdx === -1) return;

    let nextEl = null;

    // Arrow Right - find next element in same zone or move right
    if (e.key === 'ArrowRight') {
      const currentZone = allIndices[currentIdx].zone;
      const sameZoneItems = allIndices.filter((item, idx) => idx > currentIdx && item.zone === currentZone);
      if (sameZoneItems.length > 0) {
        nextEl = sameZoneItems[0].el;
      } else {
        // Try to find next zone to the right
        const nextZoneItems = allIndices.filter((item, idx) => idx > currentIdx);
        if (nextZoneItems.length > 0) nextEl = nextZoneItems[0].el;
      }
    }

    // Arrow Left - find previous element in same zone or move left
    if (e.key === 'ArrowLeft') {
      const currentZone = allIndices[currentIdx].zone;
      const sameZoneItems = allIndices.filter((item, idx) => idx < currentIdx && item.zone === currentZone).reverse();
      if (sameZoneItems.length > 0) {
        nextEl = sameZoneItems[0].el;
      } else {
        const prevZoneItems = allIndices.filter((item, idx) => idx < currentIdx).reverse();
        if (prevZoneItems.length > 0) nextEl = prevZoneItems[0].el;
      }
    }

    // Arrow Down - find element below (next in grid or next zone)
    if (e.key === 'ArrowDown') {
      const currentZone = allIndices[currentIdx].zone;
      // Same zone first
      let sameZoneItems = allIndices.filter((item, idx) => idx > currentIdx && item.zone === currentZone);
      if (sameZoneItems.length > 0) {
        // Try to find element roughly below (skip a few based on columns)
        nextEl = sameZoneItems[0].el;
      } else {
        // Try different zones
        const otherZones = allIndices.filter((item, idx) => idx > currentIdx && item.zone !== currentZone);
        if (otherZones.length > 0) nextEl = otherZones[0].el;
      }
    }

    // Arrow Up - find element above
    if (e.key === 'ArrowUp') {
      const currentZone = allIndices[currentIdx].zone;
      let sameZoneItems = allIndices.filter((item, idx) => idx < currentIdx && item.zone === currentZone).reverse();
      if (sameZoneItems.length > 0) {
        nextEl = sameZoneItems[0].el;
      } else {
        const otherZones = allIndices.filter((item, idx) => idx < currentIdx && item.zone !== currentZone).reverse();
        if (otherZones.length > 0) nextEl = otherZones[0].el;
      }
    }

    if (nextEl && nextEl !== focused) {
      e.preventDefault();
      nextEl.focus();
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);
}

export default useTVNavigation;