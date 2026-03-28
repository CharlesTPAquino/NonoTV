import { useCallback, useRef } from 'react';

export function useTouchNavigation({ 
  onSwipeLeft, 
  onSwipeRight, 
  onSwipeUp, 
  onSwipeDown,
  onDoubleTap,
  onLongPress,
  threshold = 50,
  delay = 300
}) {
  const touchStart = useRef({ x: 0, y: 0, time: 0 });
  const lastTap = useRef({ x: 0, y: 0, time: 0 });

  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
  }, []);

  const handleTouchEnd = useCallback((e) => {
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.current.x;
    const deltaY = touch.clientY - touchStart.current.y;
    const deltaTime = Date.now() - touchStart.current.time;
    const now = Date.now();
    
    if (deltaTime < 300 && Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
      if (now - lastTap.current.time < delay) {
        onDoubleTap?.(touchStart.current);
        lastTap.current = { x: touch.clientX, y: touch.clientY, time: now };
        return;
      }
      lastTap.current = { x: touch.clientX, y: touch.clientY, time: now };
    }
    
    if (deltaTime > 500) return;
    
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
      if (deltaX > 0) {
        onSwipeRight?.();
      } else {
        onSwipeLeft?.();
      }
    } else if (Math.abs(deltaY) > threshold) {
      if (deltaY > 0) {
        onSwipeDown?.();
      } else {
        onSwipeUp?.();
      }
    }
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onDoubleTap, threshold, delay]);

  return { handleTouchStart, handleTouchEnd };
}

export function useKeyboardNavigation({ 
  onArrowUp, 
  onArrowDown, 
  onArrowLeft, 
  onArrowRight,
  onEnter,
  onEscape,
  onNumber 
}) {
  const handleKeyDown = useCallback((e) => {
    if (e.key >= '0' && e.key <= '9') {
      onNumber?.(parseInt(e.key));
      return;
    }
    
    switch (e.key) {
      case 'ArrowUp': onArrowUp?.(); break;
      case 'ArrowDown': onArrowDown?.(); break;
      case 'ArrowLeft': onArrowLeft?.(); break;
      case 'ArrowRight': onArrowRight?.(); break;
      case 'Enter': onEnter?.(); break;
      case 'Escape': onEscape?.(); break;
    }
  }, [onArrowUp, onArrowDown, onArrowLeft, onArrowRight, onEnter, onEscape, onNumber]);

  return { handleKeyDown };
}

export function useChannelNavigator({ 
  channels, 
  currentIndex, 
  setCurrentIndex,
  columns = 4 
}) {
  const totalChannels = channels.length;
  
  const goToNext = useCallback(() => {
    setCurrentIndex(i => Math.min(i + 1, totalChannels - 1));
  }, [totalChannels, setCurrentIndex]);
  
  const goToPrev = useCallback(() => {
    setCurrentIndex(i => Math.max(i - 1, 0));
  }, [setCurrentIndex]);
  
  const goToNextRow = useCallback(() => {
    setCurrentIndex(i => Math.min(i + columns, totalChannels - 1));
  }, [columns, totalChannels, setCurrentIndex]);
  
  const goToPrevRow = useCallback(() => {
    setCurrentIndex(i => Math.max(i - columns, 0));
  }, [columns, setCurrentIndex]);
  
  const goToChannelByNumber = useCallback((num) => {
    if (num === 0) {
      setCurrentIndex(totalChannels - 1);
    } else {
      const target = num - 1;
      if (target < totalChannels) {
        setCurrentIndex(target);
      }
    }
  }, [totalChannels, setCurrentIndex]);

  return {
    goToNext,
    goToPrev,
    goToNextRow,
    goToPrevRow,
    goToChannelByNumber
  };
}
