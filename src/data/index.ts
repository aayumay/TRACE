// Data loader for the filtered receipts dataset
// This is loaded at runtime via fetch to avoid bundling large JSON

import type { LifeReceipt } from '../types/receipt';

// Runtime data loading function
export async function loadLifeReceipts(): Promise<LifeReceipt[]> {
  const response = await fetch('/data/lifeReceipts.filtered.json');
  if (!response.ok) {
    throw new Error(`Failed to load receipts: ${response.statusText}`);
  }
  const data = await response.json();
  return data.receipts || [];
}

// For backward compatibility - empty array, real data comes from loader
export const lifeReceipts: LifeReceipt[] = [];

export type { LifeReceipt };