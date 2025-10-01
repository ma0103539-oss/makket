import { useState, useEffect } from 'react';

type Permission = 'default' | 'granted' | 'denied';

export const useNotifications = () => {
  const [permission, setPermission] = useState<Permission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission as Permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      console.error('This browser does not support desktop notification');
      return;
    }
    const result = await Notification.requestPermission();
    setPermission(result);
  };
  
  const showNotification = (title: string, options?: NotificationOptions) => {
    if (permission === 'granted') {
      new Notification(title, options);
    }
  };

  return { permission, requestPermission, showNotification };
};
