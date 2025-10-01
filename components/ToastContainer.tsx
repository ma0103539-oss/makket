import React from 'react';
import { useToast } from '../hooks/useToast';
import ToastComponent from './Toast';

const ToastContainer: React.FC = () => {
  const { toasts } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-[1000] w-full max-w-sm">
      {toasts.map(toast => (
        <ToastComponent key={toast.id} toast={toast} />
      ))}
    </div>
  );
};

export default ToastContainer;
