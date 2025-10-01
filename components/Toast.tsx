import React, { useEffect, useState } from 'react';
import { Toast, useToast } from '../hooks/useToast';
import { XCircleIcon } from './icons/XCircleIcon';

interface ToastProps {
  toast: Toast;
}

const typeClasses = {
  success: {
    bg: 'bg-green-500/90',
    border: 'border-green-400',
    icon: '✅',
  },
  error: {
    bg: 'bg-red-500/90',
    border: 'border-red-400',
    icon: '❌',
  },
  info: {
    bg: 'bg-blue-500/90',
    border: 'border-blue-400',
    icon: 'ℹ️',
  },
};

const ToastComponent: React.FC<ToastProps> = ({ toast }) => {
  const { removeToast } = useToast();
  const [isExiting, setIsExiting] = useState(false);

  const duration = toast.duration || 3000;
  const classes = typeClasses[toast.type] || typeClasses.info;

  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(() => removeToast(toast.id), 300); // Wait for animation
  };

  useEffect(() => {
    const timer = setTimeout(handleRemove, duration);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast.id, duration]);

  return (
    <div
      className={`
        w-full max-w-sm rounded-lg shadow-2xl p-4 my-2 flex items-start gap-3
        text-white border ${classes.border} ${classes.bg} backdrop-blur-md
        transition-all duration-300 ease-in-out
        ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
      `}
      role="alert"
    >
      <div className="text-xl pt-1">{classes.icon}</div>
      <div className="flex-1">
        <p className="font-bold">{toast.title}</p>
        <p className="text-sm text-gray-200">{toast.message}</p>
      </div>
      <button onClick={handleRemove} className="p-1 rounded-full hover:bg-black/20">
        <XCircleIcon className="w-5 h-5"/>
      </button>
    </div>
  );
};

export default ToastComponent;
