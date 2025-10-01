import React, { useRef, useEffect, useState, useCallback } from 'react';
import { XCircleIcon } from './icons/XCircleIcon';

interface ImageMaskEditorProps {
  src: string;
  onSave: (maskDataUrl: string) => void;
  onClose: () => void;
}

type Tool = 'brush' | 'eraser';

const ImageMaskEditor: React.FC<ImageMaskEditorProps> = ({ src, onSave, onClose }) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(30);
  const [tool, setTool] = useState<Tool>('brush');
  
  const getCoords = (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e.nativeEvent) {
      clientX = e.nativeEvent.touches[0].clientX;
      clientY = e.nativeEvent.touches[0].clientY;
    } else {
      clientX = e.nativeEvent.clientX;
      clientY = e.nativeEvent.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const coords = getCoords(e);
    const ctx = canvasRef.current?.getContext('2d');
    if (!coords || !ctx) return;

    ctx.globalCompositeOperation = tool === 'brush' ? 'source-over' : 'destination-out';
    ctx.beginPath();
    ctx.arc(coords.x, coords.y, brushSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = tool === 'brush' ? 'rgba(239, 68, 68, 0.7)' : '#000'; // Red for brush
    ctx.fill();
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };
  const endDrawing = () => setIsDrawing(false);
  const clearCanvas = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
  }

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas || !imageRef.current) return;

    // Create a new in-memory canvas to generate the black and white mask
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = imageRef.current.naturalWidth;
    maskCanvas.height = imageRef.current.naturalHeight;
    const maskCtx = maskCanvas.getContext('2d');

    if (!maskCtx) return;

    // Fill the mask with black
    maskCtx.fillStyle = 'black';
    maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);
    
    // Draw the user's selection in white
    maskCtx.drawImage(canvas, 0, 0, maskCanvas.width, maskCanvas.height);
    
    // Use globalCompositeOperation to turn the colored drawing into a white shape
    maskCtx.globalCompositeOperation = 'source-in';
    maskCtx.fillStyle = 'white';
    maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height);

    onSave(maskCanvas.toDataURL('image/png'));
  };

  useEffect(() => {
    const image = imageRef.current;
    const canvas = canvasRef.current;

    const setupCanvas = () => {
      if (image && canvas) {
        canvas.width = image.clientWidth;
        canvas.height = image.clientHeight;
      }
    };
    if (image?.complete) {
      setupCanvas();
    } else if (image) {
      image.onload = setupCanvas;
    }
  }, [src]);

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[999]"
      onClick={onClose}
    >
      <div
        className="bg-base-200 rounded-xl shadow-2xl p-4 flex flex-col max-w-[95vw] max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-center mb-4">Select Watermark Area</h2>
        
        {/* Canvas Area */}
        <div className="relative w-full h-full flex-grow flex items-center justify-center overflow-hidden">
            <div className="relative">
                <img ref={imageRef} src={src} alt="Source" className="max-w-full max-h-[70vh] object-contain select-none" />
                <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 w-full h-full cursor-crosshair"
                    onMouseDown={startDrawing}
                    onMouseUp={endDrawing}
                    onMouseLeave={endDrawing}
                    onMouseMove={draw}
                    onTouchStart={startDrawing}
                    onTouchEnd={endDrawing}
                    onTouchMove={draw}
                />
            </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-base-300/50 rounded-b-lg mt-4">
            <div className="flex items-center gap-4">
                <label className="text-sm">Tool:</label>
                <div className="flex items-center gap-2">
                    <button onClick={() => setTool('brush')} className={`px-3 py-1 rounded ${tool === 'brush' ? 'bg-brand-primary text-white' : 'bg-base-100'}`}>Brush</button>
                    <button onClick={() => setTool('eraser')} className={`px-3 py-1 rounded ${tool === 'eraser' ? 'bg-brand-primary text-white' : 'bg-base-100'}`}>Eraser</button>
                </div>
                <label htmlFor="brushSize" className="text-sm ml-4">Size:</label>
                <input
                    id="brushSize"
                    type="range"
                    min="2"
                    max="100"
                    value={brushSize}
                    onChange={(e) => setBrushSize(Number(e.target.value))}
                    className="w-32"
                />
            </div>
            <div className="flex items-center gap-2">
                <button onClick={clearCanvas} className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-md">Clear</button>
                <button onClick={onClose} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md">Cancel</button>
                <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md">Save Selection</button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ImageMaskEditor;
