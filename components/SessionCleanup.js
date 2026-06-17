'use client';
import { useEffect } from 'react';
import { clearUserSession } from '@/lib/cleanup';

export default function SessionCleanup() {
  useEffect(() => {
    const handleBeforeUnload = () => {
      clearUserSession();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        clearUserSession();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return null;
}
