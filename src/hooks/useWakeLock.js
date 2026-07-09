import { useEffect, useRef } from 'react';

export function useWakeLock(isPlaying) {
  const wakeLockRef = useRef(null);

  useEffect(() => {
    const requestWakeLock = async () => {
      if ('wakeLock' in navigator) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
        } catch (err) {
          console.error(`Wake Lock failed: ${err.message}`);
        }
      }
    };

    const releaseWakeLock = async () => {
      if (wakeLockRef.current !== null) {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
      }
    };

    if (isPlaying) requestWakeLock();
    else releaseWakeLock();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isPlaying) requestWakeLock();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      releaseWakeLock();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPlaying]);
}
