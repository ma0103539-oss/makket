import React, { useState, useRef, useCallback } from 'react';

interface ImageComparatorProps {
  beforeSrc: string;
  afterSrc: string;
}

const ImageComparator: React.FC<ImageComparatorProps> = ({ beforeSrc, afterSrc }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    e.preventDefault();
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    handleMove(e.clientX);
  };
  
  const handleTouchStart = (e: React.TouchEvent) => {
    isDragging.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
     if (!isDragging.current) return;
     handleMove(e.touches[0].clientX);
  };


  return (
    <div
      ref={containerRef}
      className="relative w-full h-full select-none overflow-hidden rounded-lg shadow-2xl"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseMove={handleMouseMove}
      onTouchEnd={handleMouseUp}
      onTouchMove={handleTouchMove}
    >
      <img
        src={afterSrc}
        alt="After"
        className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none"
      />
      <div
        className="absolute top-0 left-0 w-full h-full object-contain overflow-hidden pointer-events-none"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img
          src={beforeSrc}
          alt="Before"
          className="w-full h-full object-contain pointer-events-none"
        />
      </div>

       <div
        className="absolute top-0 bottom-0 w-1 bg-white/50 cursor-ew-resize backdrop-invert-[.1]"
        style={{ left: `calc(${sliderPosition}% - 2px)` }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -left-4 w-9 h-9 bg-white/80 rounded-full flex items-center justify-center shadow-lg border-2 border-white/50 backdrop-blur-sm">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-700">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
            </svg>
        </div>
      </div>

        <div className="absolute top-2 left-2 px-3 py-1 bg-black/50 text-white rounded-full text-sm font-semibold pointer-events-none">
            Before
        </div>
        <div className="absolute top-2 right-2 px-3 py-1 bg-black/50 text-white rounded-full text-sm font-semibold pointer-events-none">
            After
        </div>

    </div>
  );
};

export default ImageComparator;