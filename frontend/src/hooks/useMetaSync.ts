import { useEffect } from 'react';
import { fetchMeta } from '../api/meta';

const LOCAL_STORAGE_KEY = 'lastSync';

export function useMetaSync(onRefresh: () => Promise<void>): void {
  useEffect(() => {
    fetchMeta()
      .then(async (meta) => {
        const lastSync = localStorage.getItem(LOCAL_STORAGE_KEY);
        const isStale = lastSync === null || meta.updatedAt > lastSync;
        if (!isStale) return;
        await onRefresh();
        localStorage.setItem(LOCAL_STORAGE_KEY, meta.updatedAt);
      })
      .catch(() => undefined);
  }, [onRefresh]);
}
