import { useRef, useCallback } from 'react';

// A simple sparkle SVG with a red notification dot, base64 encoded for use in a data URI
const alertFaviconSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke-width="1.5" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.543l.227 1.001.227-1.001a2.25 2.25 0 00-1.523-1.523l-1.001-.227 1.001-.227a2.25 2.25 0 001.523-1.523l.227-1.001.227 1.001a2.25 2.25 0 001.523 1.523l1.001.227-1.001.227a2.25 2.25 0 00-1.523 1.523z" stroke="#14b8a6"/>
  <circle cx="20" cy="4" r="4" fill="#ef4444"/>
</svg>`;
const alertFaviconDataUri = `data:image/svg+xml;base64,${btoa(alertFaviconSVG)}`;


export const useTitleAndFavicon = (originalTitle: string, originalFavicon: string) => {
  const stateRef = useRef({
    originalTitle: originalTitle,
    originalFavicon: originalFavicon,
  });

  const setNotificationState = useCallback(() => {
    document.title = `✅ All Ready! | ${stateRef.current.originalTitle}`;
    const faviconElement = document.getElementById('favicon') as HTMLLinkElement;
    if (faviconElement) {
        faviconElement.href = alertFaviconDataUri;
    }
  }, []);

  const resetState = useCallback(() => {
    document.title = stateRef.current.originalTitle;
     const faviconElement = document.getElementById('favicon') as HTMLLinkElement;
    if (faviconElement) {
        faviconElement.href = stateRef.current.originalFavicon;
    }
  }, []);

  return { setNotificationState, resetState };
};
