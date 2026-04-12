import { useEffect } from 'react';

const API_CACHE_CHANNEL = 'api-updates';

export function useApiCacheUpdate(onUpdate: () => void): void {
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const channel = new BroadcastChannel(API_CACHE_CHANNEL);
    channel.onmessage = onUpdate;
    return () => channel.close();
  }, [onUpdate]);
}
