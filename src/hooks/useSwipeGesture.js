import { useState, useEffect, useCallback, useRef } from 'react';

const SWIPE_THRESHOLD = 50;

export function useSwipeGesture({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  disabled = false
}) {
  const touchStart = useRef({ x: 0, y: 0 });
  const touchEnd = useRef({ x: 0, y: 0 });

  const handleTouchStart = useCallback((e) => {
    if (disabled) return;
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
    touchEnd.current = { ...touchStart.current };
  }, [disabled]);

  const handleTouchMove = useCallback((e) => {
    if (disabled) return;
    touchEnd.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
  }, [disabled]);

  const handleTouchEnd = useCallback(() => {
    if (disabled) return;
    
    const diffX = touchEnd.current.x - touchStart.current.x;
    const diffY = touchEnd.current.y - touchStart.current.y;
    const absX = Math.abs(diffX);
    const absY = Math.abs(diffY);

    if (Math.max(absX, absY) < SWIPE_THRESHOLD) return;

    if (absX > absY) {
      if (diffX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (diffX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    } else {
      if (diffY > 0 && onSwipeDown) {
        onSwipeDown();
      } else if (diffY < 0 && onSwipeUp) {
        onSwipeUp();
      }
    }
  }, [disabled, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  };
}

export function useHorizontalSwipe(onNext, onPrev, disabled = false) {
  return useSwipeGesture({
    onSwipeLeft: onNext,
    onSwipeRight: onPrev,
    disabled
  });
}
