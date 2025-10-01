import React, { useEffect } from 'react';
import { XCircleIcon } from './icons/XCircleIcon';
import ImageComparator from './ImageComparator';

interface ImagePreviewModalProps {
  originalSrc: string;
  processedSrc: string;
  onClose: () => void;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ originalSrc, processedSrc, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[999]"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="relative max-w-[90vw] max-h-[90vh] w-full h-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the image itself
      >
        <div className="w-full h-full max-w-6xl max-h-full p-8">
            <ImageComparator
                beforeSrc={originalSrc}
                afterSrc={processedSrc}
            />
        </div>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-0 sm:-right-12 text-white bg-base-300/50 rounded-full hover:scale-110 hover:bg-base-300/80 transition-all"
          aria-label="Close image preview"
        >
          <XCircleIcon className="w-10 h-10" />
        </button>
      </div>
    </div>
  );
};

export default ImagePreviewModal;