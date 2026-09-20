import type { LifeReceipt, Connection, ConnectionType } from '../types/receipt';

function daysBetween(date1: string, date2: string): number {
  if (!date1 || !date2) return Infinity;
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return Infinity;
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function hoursBetween(date1: string, date2: string): number {
  if (!date1 || !date2) return Infinity;
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return Infinity;
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return diffTime / (1000 * 60 * 60);
}

function sameLocation(loc1: LifeReceipt['location'], loc2: LifeReceipt['location']): boolean {
  if (!loc1 || !loc2) return false;
  if (loc1.name && loc2.name && loc1.name.toLowerCase() === loc2.name.toLowerCase()) return true;
  if (loc1.city && loc2.city && loc1.city.toLowerCase() === loc2.city.toLowerCase()) return true;
  return false;
}

function sharedTags(tags1: string[], tags2: string[]): string[] {
  return tags1.filter((t) => tags2.includes(t));
}

export function findConnections(receipts: LifeReceipt[]): Connection[] {
  const connections: Connection[] = [];
  const byDate = new Map<string, LifeReceipt[]>();
  for (const r of receipts) {
    const key = r.date;
    if (!byDate.has(key)) byDate.set(key, []);
    byDate.get(key)!.push(r);
  }

  const byLocation = new Map<string, LifeReceipt[]>();
  for (const r of receipts) {
    if (r.location?.city) {
      const key = r.location.city.toLowerCase();
      if (!byLocation.has(key)) byLocation.set(key, []);
      byLocation.get(key)!.push(r);
    }
  }

  const processedPairs = new Set<string>();

  for (let i = 0; i < receipts.length; i++) {
    const a = receipts[i];
    
    const sameDayReceipts = byDate.get(a.date) || [];
    for (const b of sameDayReceipts) {
      if (a.id === b.id) continue;
      const pairKey = [a.id, b.id].sort().join('-');
      if (processedPairs.has(pairKey)) continue;
      processedPairs.add(pairKey);

      const shared = sharedTags(a.tags, b.tags);
      const hours = hoursBetween(a.timestamp, b.timestamp);
      
      let type: ConnectionType = 'same-day';
      let score = 0.4;
      const reasons: string[] = [`Same day (${a.date})`];

      if (hours < 2) {
        type = 'temporal-proximity';
        score = 0.7;
        reasons.push(`Within ${Math.round(hours * 60)} minutes`);
      } else if (hours < 6) {
        type = 'temporal-proximity';
        score = 0.55;
        reasons.push(`Within ${Math.round(hours)} hours`);
      }

      if (sameLocation(a.location, b.location)) {
        type = 'same-location';
        score = Math.max(score, 0.8);
        reasons.push(`Same location: ${a.location?.city || a.location?.name}`);
      }

      if (shared.length > 0) {
        type = 'shared-tags';
        score = Math.max(score, 0.5 + shared.length * 0.1);
        reasons.push(`Shared tags: ${shared.join(', ')}`);
      }

      if (a.category !== b.category) {
        type = 'cross-category';
        score = Math.max(score, 0.45);
        reasons.push(`Cross-category: ${a.category} ↔ ${b.category}`);
      }

      if (score > 0.35) {
        connections.push({
          id: `conn-${a.id}-${b.id}`,
          sourceReceiptId: a.id,
          targetReceiptId: b.id,
          type,
          score: Math.min(score, 1),
          reason: reasons.join('; '),
          evidence: reasons,
        });
      }
    }

    if (a.location?.city) {
      const locationReceipts = byLocation.get(a.location.city.toLowerCase()) || [];
      for (const b of locationReceipts) {
        if (a.id === b.id) continue;
        if (a.date === b.date) continue;
        const pairKey = [a.id, b.id].sort().join('-');
        if (processedPairs.has(pairKey)) continue;
        processedPairs.add(pairKey);

        const days = daysBetween(a.date, b.date);
        if (days > 30) continue;

        let type: ConnectionType = 'nearby-location';
        let score = 0.35;
        const reasons: string[] = [`Same location: ${a.location.city}`, `${days} days apart`];

        if (days <= 7) {
          score = 0.55;
          reasons.push('Within a week');
        }

        connections.push({
          id: `conn-${a.id}-${b.id}`,
          sourceReceiptId: a.id,
          targetReceiptId: b.id,
          type,
          score,
          reason: reasons.join('; '),
          evidence: reasons,
        });
      }
    }
  }

  return connections;
}

export function getConnectionsForReceipt(receiptId: string, connections: Connection[]): Connection[] {
  return connections.filter(
    (c) => c.sourceReceiptId === receiptId || c.targetReceiptId === receiptId
  );
}

export function getConnectedReceiptIds(receiptId: string, connections: Connection[]): string[] {
  const conns = getConnectionsForReceipt(receiptId, connections);
  return conns.flatMap((c) =>
    c.sourceReceiptId === receiptId ? [c.targetReceiptId] : [c.sourceReceiptId]
  );
}

export function calculateConnectionScore(
  a: LifeReceipt,
  b: LifeReceipt
): { score: number; type: ConnectionType; reasons: string[] } {
  const shared = sharedTags(a.tags, b.tags);
  const hours = hoursBetween(a.timestamp, b.timestamp);
  const sameDay = a.date === b.date;
  const sameLoc = sameLocation(a.location, b.location);

  let score = 0;
  let type: ConnectionType = 'cross-category';
  const reasons: string[] = [];

  if (sameDay) {
    score += 0.3;
    reasons.push(`Same day (${a.date})`);
    if (hours < 2) {
      score += 0.3;
      reasons.push(`Within ${Math.round(hours * 60)} minutes`);
      type = 'temporal-proximity';
    } else if (hours < 6) {
      score += 0.2;
      reasons.push(`Within ${Math.round(hours)} hours`);
      type = 'temporal-proximity';
    }
  }

  if (sameLoc) {
    score += 0.4;
    reasons.push(`Same location: ${a.location?.city || a.location?.name}`);
    type = 'same-location';
  }

  if (shared.length > 0) {
    score += 0.15 * shared.length;
    reasons.push(`Shared tags: ${shared.join(', ')}`);
    type = 'shared-tags';
  }

  if (a.category !== b.category) {
    score += 0.1;
    reasons.push(`Cross-category: ${a.category} ↔ ${b.category}`);
    if (type === 'cross-category') type = 'cross-category';
  }

  return { score: Math.min(score, 1), type, reasons };
}