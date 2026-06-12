import { useRef, useCallback } from 'react';

interface SwipeHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
}

export function useSwipeNavigation(
  onSwipeLeft: () => void,
  onSwipeRight: () => void,
  canSwipeLeft: boolean,
  canSwipeRight: boolean,
): { handlers: SwipeHandlers; offsetRef: React.MutableRefObject<number>; animatingRef: React.MutableRefObject<boolean> } {
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const startTimeRef = useRef(0);
  const offsetRef = useRef(0);
  const movedRef = useRef(false);
  const directionLockedRef = useRef(false);
  const isHorizontalRef = useRef(false);
  const animatingRef = useRef(false);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (animatingRef.current) return;
    const touch = e.touches[0];
    startXRef.current = touch.clientX;
    startYRef.current = touch.clientY;
    startTimeRef.current = Date.now();
    offsetRef.current = 0;
    movedRef.current = false;
    directionLockedRef.current = false;
    isHorizontalRef.current = false;
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (animatingRef.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - startXRef.current;
    const dy = touch.clientY - startYRef.current;

    if (!directionLockedRef.current) {
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
      directionLockedRef.current = true;
      isHorizontalRef.current = Math.abs(dx) > Math.abs(dy);
    }

    if (!isHorizontalRef.current) return;

    e.preventDefault();
    movedRef.current = true;

    const maxOffset = window.innerWidth * 0.3;
    let offset = dx;
    if (!canSwipeRight && dx > 0) offset = dx * 0.3;
    if (!canSwipeLeft && dx < 0) offset = dx * 0.3;
    offset = Math.max(-maxOffset, Math.min(maxOffset, offset));
    offsetRef.current = offset;
  }, [canSwipeLeft, canSwipeRight]);

  const onTouchEnd = useCallback(() => {
    if (animatingRef.current || !movedRef.current) return;
    const offset = offsetRef.current;
    const elapsed = Date.now() - startTimeRef.current;
    const velocity = Math.abs(offset) / Math.max(elapsed, 1);
    const threshold = window.innerWidth * 0.2;

    if (offset < -threshold || (offset < 0 && velocity > 0.5)) {
      animatingRef.current = true;
      onSwipeLeft();
    } else if (offset > threshold || (offset > 0 && velocity > 0.5)) {
      animatingRef.current = true;
      onSwipeRight();
    }
  }, [onSwipeLeft, onSwipeRight]);

  return {
    handlers: { onTouchStart, onTouchMove, onTouchEnd },
    offsetRef,
    animatingRef,
  };
}
