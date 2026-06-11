import React, { useEffect, useMemo, useRef, useState } from 'react';

interface MediaLightboxProps {
  url: string;
  type: string; // 'image' or 'video'
  onClose: () => void;
}

export const MediaLightbox: React.FC<MediaLightboxProps> = ({ url, type, onClose }) => {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragStateRef = useRef<{ isDragging: boolean; startX: number; startY: number; originX: number; originY: number }>({
    isDragging: false,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
  });

  // Prevent scrolling when lightbox is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
      if (event.key === '+' || event.key === '=') {
        setScale((current) => Math.min(current + 0.2, 3));
      }
      if (event.key === '-') {
        setScale((current) => Math.max(current - 0.2, 0.5));
      }
      if (event.key === '0') {
        setScale(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const scaleLabel = useMemo(() => `${Math.round(scale * 100)}%`, [scale]);

  const zoomIn = () => setScale((current) => Math.min(current + 0.2, 3));
  const zoomOut = () => setScale((current) => Math.max(current - 0.2, 0.5));
  const resetZoom = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLImageElement>) => {
    if (scale <= 1) return;

    event.preventDefault();
    event.stopPropagation();
    dragStateRef.current = {
      isDragging: true,
      startX: event.clientX,
      startY: event.clientY,
      originX: offset.x,
      originY: offset.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLImageElement>) => {
    if (!dragStateRef.current.isDragging) return;

    event.preventDefault();
    const deltaX = event.clientX - dragStateRef.current.startX;
    const deltaY = event.clientY - dragStateRef.current.startY;

    setOffset({
      x: dragStateRef.current.originX + deltaX,
      y: dragStateRef.current.originY + deltaY,
    });
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLImageElement>) => {
    if (!dragStateRef.current.isDragging) return;

    dragStateRef.current.isDragging = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <button 
        className="absolute top-4 right-4 p-2 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-all"
        onClick={onClose}
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {type === 'image' || type.startsWith('image/') ? (
        <div className="absolute top-4 left-4 flex items-center gap-2 text-white/80 bg-black/30 border border-white/10 rounded-full px-3 py-2 text-sm">
          <button type="button" onClick={zoomOut} className="hover:text-white transition-colors" title="Thu nhỏ">-</button>
          <button type="button" onClick={resetZoom} className="hover:text-white transition-colors min-w-12 text-center" title="Đặt lại zoom">{scaleLabel}</button>
          <button type="button" onClick={zoomIn} className="hover:text-white transition-colors" title="Phóng to">+</button>
        </div>
      ) : null}

      <div 
        className="max-w-5xl max-h-[90vh] w-full h-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {type === 'image' || type.startsWith('image/') ? (
          <img 
            src={url} 
            alt="Fullscreen preview" 
            className={`max-w-full max-h-full object-contain rounded-lg shadow-2xl select-none transition-transform duration-150 ease-out ${scale > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'}`}
            style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`, transformOrigin: 'center center' }}
            draggable={false}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onWheel={(event) => {
              event.preventDefault();
              if (event.deltaY < 0) {
                zoomIn();
              } else {
                zoomOut();
              }
            }}
          />
        ) : (
          <video 
            src={url} 
            controls 
            autoPlay 
            className="max-w-full max-h-full rounded-lg shadow-2xl"
          />
        )}
      </div>
    </div>
  );
};
