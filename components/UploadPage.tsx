import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ProcessedFile, FileStatus, ProcessingMode } from '../types';
import FileProcessor from './FileProcessor';
import { UploadIcon } from './icons/UploadIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { BellIcon } from './icons/BellIcon';
import { useToast } from '../hooks/useToast';
import { useNotifications } from '../hooks/useNotifications';
import { usePageFocus } from '../hooks/usePageFocus';
import { useTitleAndFavicon } from '../hooks/useTitleAndFavicon';

const MAX_FILES = 30;
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

// Replaced the previous sound with a high-quality, universally compatible WAV file to fix playback errors.
const notificationSound = 'data:audio/wav;base64,UklGRpwYBgBXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YWSAYBgAACEALwA/AEsAVwBnAHMAYABrAFkASgA5ACIA/wDxANgApwB/AEcA8gD4AOwA3gDDALwAugC/AMYA0gDfAPQA/gD5AOkA2gC+AG4AQQDqAMgAfwA/AN4AvgBsADQA8ACvAGUAHgDkAKoAYgAOAM4AowBLABDACwB1AGUAXwBRAEoARgBDAEIAQwBGAEkATgBSAFcAWgBdAGAAZQBqAG0AcQB0AHcAdwB1AHMAcABuAGsAaABlAGIAXwBcAFkAVwBTAFAATgBLAEgARgBDAEAAOwA2ADIANgA5AD8AQwBHAEsATwBTAVwBYgFoAW0BcAF1AXwBggGIAZIBmAGdAZwBmwGZAZQBjQGEAYABfQF4AWwBWwFRAToBLgEcAPYA5wDQAJ0AgwBSADwA7ADaAKYAbgBAAOcAxwCCAEsA6ADKAHoANgDaAK0AbAAaANAApABgABIAzQCQAEQA/QCpAGAAEgDAAIQAOwDSAI0AUgD2AJwAYAAOAMAAhQBAANgAnwBcAAwAxwB8ADwA2wCiAFwA7wCQAEwA+gCUAFQA7gB9ADYA3wCjAFgA6gB3ADIA4ACXAFMA6QB0ADAA4ACVAFIA6ABxACwA3AB8AEoA1gBtADgA2QB1ADIA3QByADIA4wB2ACwA5wB8ABoA6QCHABYA6wCSABAA7gCYAAkA8ACfAAIA8gCiAAEACwCmAAIAEACpAAIAEACpAAQAEgCpAAEAEgCnAAQAEACjAAEACwCiAAIAAgCdAAIA/wCcAAEA/wCaAAEACQCWAAQACQCVAAQACwCSAAcACwCPgAsACgCMgAkACgCIgAgACQCEgAgACQCAgAcACACAgAcACQB/gAgACQB9gAkACgB8gAkACgB5gAoACwB3gAsACwB0gA0ACwBwgA4ACwBygA8ACwBvgBAACwBsgBEACwBpgBIACgCjgBIACgCkgBIACTALQAkwC0AI4AsQCOALEAjACuAIwArgCMALEAhgCxAIYArQCGAK0AhgCvAIQAsgCEALIAhACyAIQAsQCBALAAgQCwAIEAsgB/ALMAbwCyAG4AsgBuALIAawCxAGoAsABpALEAawCwAGoAsABqALAAaQCvAGkArgBqAK4AawCtAGsAqgBqAKkAaQCnAGgApgBoAKUAaACkAGgApQBpAKQAagCkAGwApABtAKMAbwCiAHAAogBxAKEAcQCiAHIAogBzAJ8AcwCeAHMAngBzAJ0AcgCcAHIAngBwAJwAcACaAG4AlwBtAJYAbACVAGsAlQBrAJQAaACVAGgAlQBoAJUAaACVAGgAlQBoAJUAaACUAGgAkwBoAJIAZwC SAGcAkQBnAJAAZwB/AGgAfQBpAHwAaAB6AGgAegBoAHoAaAB6AGkAeQBqAHgAawB3AGsAdgBsAHQAbABzAG0AcQBtAHAAawBvAGsAawBpAGsAZABsAGAAawBcAGwAWgBtAFgAbQBWAGwAVQBtAFQAbQBSAG0AUQBuAFEAbgBQAG8ATwBwAE8AcQBPAG8AUQBvAFMAbgBVAG4AVgBtAFcAbQBaAGsAWwBpAFwAaABeAGgAYQBlAGMAZABlAGYAZgBnAGgAaABqAGsAawBsAG0AawBrAGkAaQBoAGcAZQBjAGIAYABeAF0AWgBZAFcAVQBSAE8ATABJAEUAQwA/ADsAOAAvACEA9gDOAIUAWADpAJgAWwDnAJgAWwDpAJcAWgDkAJUAVwDeAJMAVQDZAI8AUgDUAI0ATwDOAIkATADLAIcASgC/AIYASQC6AIQARwDGAH0APADSAGsAMgDVAGsAMwDTAGEAKADSAFsAJQDQAFoAJgDTAFwAKADWAGEAKADZAHEAJQDcAHoAJgDhAIQAJwDlAIoAJwDpAJAALQDvAJgAMgDwAJwAMQDwAKEAMgDxAKIAMgDxAJ8AMwDxAJ0ANQDwAJcANQDxAJQAOADwAJAAPQDvAI4AQgDwAI0AQwDwAIgAQQDuAIQAQADuAHwAPgDtAHoAPQDSAEwALgC8AFQAIwCtAFEAIAChAE8AHwCCAEsAHgB5AEUAHQBsAEEAHABlAD8AHABbADsAHQBWADoAHQBSADkAHQBQADgAHQBNAAAAAAA=';
const audioPlayer = new Audio(notificationSound);

const UploadPage: React.FC = () => {
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const prevFilesRef = useRef<ProcessedFile[]>([]);
  const { addToast } = useToast();
  const { permission, requestPermission, showNotification } = useNotifications();
  const isFocused = usePageFocus();
  const { setNotificationState, resetState } = useTitleAndFavicon('AI Photo Boost - Free Image Enhancer', '/vite.svg');


  const handleFiles = useCallback((incomingFiles: FileList) => {
    setError(null);
    if (files.length + incomingFiles.length > MAX_FILES) {
      setError(`Cannot add ${incomingFiles.length} file(s), as the total would exceed the limit of ${MAX_FILES}.`);
      return;
    }

    const validFiles: ProcessedFile[] = [];
    const errors: string[] = [];

    Array.from(incomingFiles).forEach(file => {
      if (!file.type.startsWith('image/')) {
        errors.push(`"${file.name}" was ignored (not an image).`);
      } else if (file.size > MAX_FILE_SIZE_BYTES) {
        errors.push(`"${file.name}" was ignored (larger than ${MAX_FILE_SIZE_MB}MB).`);
      } else {
        validFiles.push({
          id: `${file.name}-${file.lastModified}-${Math.random()}`,
          file,
          previewUrl: URL.createObjectURL(file),
          status: FileStatus.PENDING,
          mode: ProcessingMode.ENHANCE,
          resultUrl: null,
          error: null,
        });
      }
    });

    if (errors.length > 0) {
      if (validFiles.length > 0) {
        setError(`${errors.length} file(s) couldn't be added. ${errors.join(' ')}`);
      } else {
        setError(`Couldn't add files. ${errors.join(' ')}`);
      }
    }

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
    }
  }, [files.length]);

  useEffect(() => {
    // Detect newly completed files
    const newlyCompleted = files.filter(f =>
      f.status === FileStatus.COMPLETED &&
      prevFilesRef.current.find(pf => pf.id === f.id)?.status !== FileStatus.COMPLETED
    );

    newlyCompleted.forEach(file => {
      addToast({
        title: 'Processing Complete!',
        message: `${file.file.name} is ready.`,
        type: 'success',
      });
      if (!isFocused) {
        showNotification('Image Ready!', {
          body: `${file.file.name} is ready for download.`,
          icon: '/vite.svg',
        });
      }
    });

    // Detect when all processing is finished
    const wasProcessing = prevFilesRef.current.some(f => f.status === FileStatus.PROCESSING);
    const isDoneProcessing = !files.some(f => f.status === FileStatus.PROCESSING);
    
    if (wasProcessing && isDoneProcessing && files.some(f => f.status === FileStatus.COMPLETED)) {
        addToast({
            title: 'All Done!',
            message: 'All your images have been processed.',
            type: 'success',
            duration: 5000,
        });
        audioPlayer.play().catch(e => console.error("Error playing sound:", e));
        if (!isFocused) {
            showNotification('All Images Ready!', {
                body: 'Your images have been processed and are ready for download.',
                icon: '/vite.svg'
            });
            setNotificationState();
        }
    }

    prevFilesRef.current = files;
  }, [files, isFocused, addToast, showNotification, setNotificationState]);

  useEffect(() => {
      if(isFocused) {
          resetState();
      }
  }, [isFocused, resetState]);


  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const updateFile = (id: string, updates: Partial<ProcessedFile>) => {
    setFiles(prev => prev.map(f => (f.id === id ? { ...f, ...updates } : f)));
  };

  const removeFile = (id: string) => {
    setFiles(prev => {
        const fileToRemove = prev.find(f => f.id === id);
        if (fileToRemove && fileToRemove.previewUrl) {
            URL.revokeObjectURL(fileToRemove.previewUrl);
        }
        if (fileToRemove && fileToRemove.resultUrl) {
            URL.revokeObjectURL(fileToRemove.resultUrl);
        }
        return prev.filter(f => f.id !== id);
    });
  };

  const processAll = () => {
    files.forEach(file => {
      if (file.status === FileStatus.PENDING) {
        // All modes can be processed automatically now.
        updateFile(file.id, { status: FileStatus.PROCESSING });
      }
    });
  };
  
  const clearAll = () => {
    files.forEach(file => {
        if(file.previewUrl) URL.revokeObjectURL(file.previewUrl)
        if(file.resultUrl) URL.revokeObjectURL(file.resultUrl)
    });
    setFiles([]);
    setError(null);
  }

  const pendingFilesCount = files.filter(f => f.status === FileStatus.PENDING).length;
  const isProcessingAny = files.some(f => f.status === FileStatus.PROCESSING);

  const NotificationButton = () => {
    if (permission === 'granted') {
        return <p className="text-xs text-green-400">Browser notifications enabled.</p>
    }
     if (permission === 'denied') {
        return <p className="text-xs text-red-400">Browser notifications blocked.</p>
    }
    return (
        <button onClick={requestPermission} className="text-xs text-brand-primary hover:underline">
            Enable browser notifications
        </button>
    )
  }

  return (
    <div className="space-y-8">
      {files.length === 0 ? (
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${isDragging ? 'border-solid border-brand-primary bg-base-200' : 'border-base-300 hover:border-brand-secondary'}`}
        >
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
          />
          <div className="flex flex-col items-center justify-center space-y-4">
            <UploadIcon className="w-16 h-16 text-gray-500"/>
            <p className="text-xl font-semibold">Drag & drop images here</p>
            <p className="text-gray-400">or click to browse</p>
            <p className="text-xs text-gray-500">Max {MAX_FILES} files, up to {MAX_FILE_SIZE_MB}MB each.</p>
          </div>
          
          {/* Visual feedback overlay */}
          <div className={`absolute inset-0 bg-base-200/90 backdrop-blur-sm rounded-xl flex items-center justify-center pointer-events-none z-10 transition-opacity duration-300 ${isDragging ? 'opacity-100' : 'opacity-0'}`}>
            <div className="text-center">
              <UploadIcon className="w-20 h-20 text-brand-primary mx-auto animate-bounce" />
              <p className="text-2xl font-bold mt-4 text-white">Drop to Upload</p>
            </div>
          </div>
        </div>
      ) : (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 p-4 bg-base-200 rounded-lg">
                <div className='text-center sm:text-left'>
                    <h2 className="text-2xl font-bold">Your Images</h2>
                    <div className="flex items-center gap-2 justify-center sm:justify-start mt-1">
                        <BellIcon className="w-4 h-4 text-gray-400" />
                        <NotificationButton />
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={clearAll} className="bg-red-500/80 hover:bg-red-500 text-white font-semibold py-2 px-4 rounded-md transition-colors">Clear All</button>
                    <button 
                        onClick={processAll} 
                        disabled={pendingFilesCount === 0 || isProcessingAny}
                        className="bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-4 rounded-md transition-colors disabled:bg-base-300 disabled:cursor-not-allowed inline-flex items-center gap-2"
                    >
                        <SparklesIcon className="w-5 h-5"/>
                        Process All ({pendingFilesCount})
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 gap-6">
                {files.map(file => (
                    <FileProcessor key={file.id} fileData={file} onUpdate={updateFile} onRemove={removeFile} />
                ))}
            </div>
        </div>
      )}
      {error && <div className="text-red-400 bg-red-900/50 p-3 rounded-md text-center">{error}</div>}
    </div>
  );
};

export default UploadPage;
