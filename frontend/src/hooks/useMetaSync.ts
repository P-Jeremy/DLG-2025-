import { useEffect } from 'react';
import { fetchMeta } from '../api/meta';

const LAST_SYNC_KEY = 'lastSync';
const PENDING_SYNC_KEY = 'pendingSync';

export function confirmPendingSync(): void {
  const pending = localStorage.getItem(PENDING_SYNC_KEY);
  if (!pending) return;
  localStorage.setItem(LAST_SYNC_KEY, pending);
  localStorage.removeItem(PENDING_SYNC_KEY);
}

export function useMetaSync(onRefresh: () => Promise<void>): void {
  useEffect(() => {
    fetchMeta()
      .then(async (meta) => {
        const lastSync = localStorage.getItem(LAST_SYNC_KEY);
        const isStale = lastSync === null || meta.updatedAt > lastSync;
        if (!isStale) return;
        localStorage.setItem(PENDING_SYNC_KEY, meta.updatedAt);
        await onRefresh();
      })
      .catch(() => undefined);
  }, [onRefresh]);
}
