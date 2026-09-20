import { useState, useEffect, useRef } from 'react';
import type { LifeReceipt } from '../types/receipt';
import { loadLifeReceipts } from '../data';

interface ActivitiesState {
  receipts: LifeReceipt[];
  loading: boolean;
  error: string | null;
}

// Module-level cache to avoid re-fetching across component remounts
let cachedReceipts: LifeReceipt[] | null = null;
let fetchPromise: Promise<LifeReceipt[]> | null = null;

async function getReceipts(): Promise<LifeReceipt[]> {
  if (cachedReceipts !== null) return cachedReceipts;
  if (fetchPromise !== null) return fetchPromise;

  fetchPromise = loadLifeReceipts().then(data => {
    cachedReceipts = data;
    fetchPromise = null;
    return data;
  });

  return fetchPromise;
}

export function useActivities(): ActivitiesState {
  const [state, setState] = useState<ActivitiesState>({
    receipts: cachedReceipts ?? [],
    loading: cachedReceipts === null,
    error: null,
  });

  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    if (cachedReceipts !== null) {
      // Already cached — no fetch needed
      setState({ receipts: cachedReceipts, loading: false, error: null });
      return;
    }

    getReceipts()
      .then(data => {
        if (mounted.current) {
          setState({ receipts: data, loading: false, error: null });
        }
      })
      .catch((err: unknown) => {
        if (mounted.current) {
          const message = err instanceof Error ? err.message : 'Unknown error loading receipts';
          setState(prev => ({ ...prev, loading: false, error: message }));
        }
      });

    return () => {
      mounted.current = false;
    };
  }, []);

  return state;
}
