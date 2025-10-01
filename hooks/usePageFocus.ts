import { useState, useEffect } from 'react';

export const usePageFocus = (): boolean => {
  const [isFocused, setIsFocused] = useState(!document.hidden);

  useEffect(() => {
    const handleVisibilityChange = () => setIsFocused(!document.hidden);

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return isFocused;
};
