import type { LifeReceipt, LifeStats, ReceiptCategory } from '../types/receipt';

export function calculateLifeStats(receipts: LifeReceipt[]): LifeStats {
  const totalReceipts = receipts.length;
  
  const dates = new Set(receipts.map((r) => r.date).filter(Boolean));
  const activeDays = Math.max(dates.size, 1);
  
  const sortedDates = Array.from(dates).sort();
  const dateRange = {
    start: sortedDates[0] || '2013-07-07',
    end: sortedDates[sortedDates.length - 1] || '2024-12-15',
  };
  
  const categoryCounts: Record<ReceiptCategory, number> = {
    music: 0, movie: 0, place: 0, purchase: 0, photo: 0,
    message: 0, search: 0, event: 0, note: 0,
  };
  for (const r of receipts) {
    if (categoryCounts[r.category] !== undefined) {
      categoryCounts[r.category]++;
    }
  }
  
  const dominantCategory = (Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as ReceiptCategory) || 'music';
  
  const locationCounts = new Map<string, number>();
  for (const r of receipts) {
    if (r.location?.city) {
      locationCounts.set(r.location.city, (locationCounts.get(r.location.city) || 0) + 1);
    }
  }
  const topLocation = Array.from(locationCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Bengaluru';
  
  const hourCounts = new Map<number, number>();
  for (const r of receipts) {
    if (r.timestamp) {
      const d = new Date(r.timestamp);
      if (!isNaN(d.getTime())) {
        const hour = d.getHours();
        hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
      }
    }
  }
  const peakHour = Array.from(hourCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 14;
  const busiestPeriod = getPeriodName(peakHour);
  
  const sourceCounts = new Map<string, number>();
  for (const r of receipts) {
    const src = r.metadata?.sourceDataset || 'unknown';
    sourceCounts.set(src, (sourceCounts.get(src) || 0) + 1);
  }
  
  return {
    totalReceipts,
    activeDays,
    dateRange,
    dominantCategory,
    topLocation,
    busiestPeriod,
    connectionCount: 0,
    chapterCount: 0,
    categoryCounts,
    sourceCounts: Object.fromEntries(sourceCounts),
  };
}

function getPeriodName(hour: number): string {
  if (hour >= 5 && hour < 12) return 'Morning (5AM–12PM)';
  if (hour >= 12 && hour < 17) return 'Afternoon (12PM–5PM)';
  if (hour >= 17 && hour < 22) return 'Evening (5PM–10PM)';
  return 'Late Night (10PM–5AM)';
}

export function getCategoryDistribution(receipts: LifeReceipt[]) {
  const counts = new Map<ReceiptCategory, number>();
  for (const r of receipts) {
    counts.set(r.category, (counts.get(r.category) || 0) + 1);
  }
  const total = Math.max(receipts.length, 1);
  return Array.from(counts.entries())
    .map(([category, count]) => ({ category, count, percentage: Math.round((count / total) * 1000) / 10 }))
    .sort((a, b) => b.count - a.count);
}

export function getTimeOfDayPattern(receipts: LifeReceipt[]) {
  const hourCounts = new Map<number, number>();
  for (const r of receipts) {
    if (r.timestamp) {
      const d = new Date(r.timestamp);
      if (!isNaN(d.getTime())) {
        const hour = d.getHours();
        hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
      }
    }
  }
  return Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    count: hourCounts.get(i) || 0,
  }));
}

export function getTopLocations(receipts: LifeReceipt[], limit = 10) {
  const locationCounts = new Map<string, { count: number; category: ReceiptCategory }>();
  for (const r of receipts) {
    if (r.location?.city) {
      const key = r.location.city;
      const existing = locationCounts.get(key) || { count: 0, category: r.category };
      existing.count++;
      locationCounts.set(key, existing);
    }
  }
  return Array.from(locationCounts.entries())
    .map(([city, data]) => ({ city, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function getActivityByDate(receipts: LifeReceipt[]) {
  const dateCounts = new Map<string, number>();
  for (const r of receipts) {
    if (r.date) {
      dateCounts.set(r.date, (dateCounts.get(r.date) || 0) + 1);
    }
  }
  return Array.from(dateCounts.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function getKeyMoments(receipts: LifeReceipt[], connections: Map<string, number>, limit = 5) {
  const scored = receipts.map((r) => ({
    receipt: r,
    connectionCount: connections.get(r.id) || 0,
  }));
  return scored
    .sort((a, b) => b.connectionCount - a.connectionCount)
    .slice(0, limit)
    .map(({ receipt, connectionCount }) => ({ receipt, connectionCount }));
}

export function formatNumber(num: number): string {
  if (isNaN(num) || num === undefined || num === null) return '0';
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toLocaleString();
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return 'Date unavailable';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export function formatTime(timeStr: string): string {
  if (!timeStr) return 'Time unavailable';
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  if (isNaN(hours) || isNaN(minutes)) return timeStr;
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export function getRelativeTime(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}