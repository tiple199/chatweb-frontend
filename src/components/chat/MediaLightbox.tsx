import React, { useEffect } from 'react';

interface MediaLightboxProps {
  url: string;
  type: string; // 'image' or 'video'
  onClose: () => void;
}

export const MediaLightbox: React.FC<MediaLightboxProps> = ({ url, type, onClose }) => {
  // Prevent scrolling when lightbox is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

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

      <div 
        className="max-w-5xl max-h-[90vh] w-full h-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {type === 'image' || type.startsWith('image/') ? (
          <img 
            src={url} 
            alt="Fullscreen preview" 
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
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
