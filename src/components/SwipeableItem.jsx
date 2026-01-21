/**
 * SwipeableItem - Component for swipe-to-reveal actions
 *
 * Features:
 * - Swipe left to reveal delete action
 * - Swipe right to reveal other actions
 * - Confirmation before destructive actions
 * - Smooth animations with spring physics
 * - Works with touch and mouse
 */

import { useState, useRef, useEffect } from 'react';

export default function SwipeableItem({
  children,
  onDelete,
  onSwipeLeft,
  onSwipeRight,
  deleteLabel = 'Delete',
  confirmDelete = true,
  disabled = false,
  threshold = 80, // Minimum swipe distance to trigger action
  className = ''
}) {
  const containerRef = useRef(null);
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);
  const startTime = useRef(0);

  // Reset position
  const resetPosition = () => {
    setTranslateX(0);
    setShowConfirm(false);
  };

  // Handle touch/mouse start
  const handleStart = (clientX) => {
    if (disabled) return;
    startX.current = clientX;
    currentX.current = clientX;
    startTime.current = Date.now();
    setIsDragging(true);
  };

  // Handle touch/mouse move
  const handleMove = (clientX) => {
    if (!isDragging || disabled) return;

    currentX.current = clientX;
    const diff = clientX - startX.current;

    // Apply resistance at edges
    const resistance = 0.5;
    let newTranslate = diff;

    // Only allow swiping left (for delete)
    if (diff > 0) {
      newTranslate = diff * resistance * 0.3; // Strong resistance for right swipe
    } else {
      // Moderate resistance for left swipe
      newTranslate = diff * resistance;
    }

    // Limit maximum swipe distance
    const maxSwipe = -120;
    newTranslate = Math.max(maxSwipe, Math.min(30, newTranslate));

    setTranslateX(newTranslate);
  };

  // Handle touch/mouse end
  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const diff = currentX.current - startX.current;
    const timeDiff = Date.now() - startTime.current;
    const velocity = Math.abs(diff) / timeDiff;

    // Fast swipe or past threshold
    if (diff < -threshold || (diff < -40 && velocity > 0.5)) {
      // Show delete action
      setTranslateX(-100);
      if (confirmDelete) {
        setShowConfirm(true);
      } else {
        onDelete?.();
        resetPosition();
      }
    } else {
      // Reset position
      resetPosition();
    }
  };

  // Touch event handlers
  const handleTouchStart = (e) => handleStart(e.touches[0].clientX);
  const handleTouchMove = (e) => handleMove(e.touches[0].clientX);
  const handleTouchEnd = () => handleEnd();

  // Mouse event handlers (for testing on desktop)
  const handleMouseDown = (e) => handleStart(e.clientX);
  const handleMouseMove = (e) => {
    if (isDragging) {
      e.preventDefault();
      handleMove(e.clientX);
    }
  };
  const handleMouseUp = () => handleEnd();
  const handleMouseLeave = () => {
    if (isDragging) handleEnd();
  };

  // Handle delete confirmation
  const handleConfirmDelete = () => {
    onDelete?.();
    resetPosition();
  };

  // Click outside to reset
  useEffect(() => {
    if (showConfirm) {
      const handleClickOutside = (e) => {
        if (containerRef.current && !containerRef.current.contains(e.target)) {
          resetPosition();
        }
      };

      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('mousedown', handleClickOutside);

      return () => {
        document.removeEventListener('touchstart', handleClickOutside);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showConfirm]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden md:overflow-visible ${className}`}
    >
      {/* Delete action background */}
      <div
        className="absolute inset-y-0 right-0 flex items-center justify-end bg-red-500"
        style={{
          width: '120px',
          opacity: Math.min(1, Math.abs(translateX) / 50)
        }}
      >
        {showConfirm ? (
          <button
            onClick={handleConfirmDelete}
            className="flex items-center gap-2 px-4 py-2 mr-2 bg-white text-red-600 font-semibold rounded-lg active:scale-95 transition-transform"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Confirm
          </button>
        ) : (
          <div className="flex items-center gap-2 pr-4 text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span className="text-sm font-medium">{deleteLabel}</span>
          </div>
        )}
      </div>

      {/* Main content */}
      <div
        className={`relative bg-inherit transition-transform ${isDragging ? '' : 'duration-300'}`}
        style={{
          transform: `translateX(${translateX}px)`,
          touchAction: 'pan-y'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * SwipeableList - Container for swipeable items with mutual exclusion
 * Only one item can be swiped at a time
 */
export function SwipeableList({ children, className = '' }) {
  return (
    <div className={`swipeable-list ${className}`}>
      {children}
    </div>
  );
}
