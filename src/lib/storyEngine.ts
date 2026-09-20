import type { LifeReceipt, StoryChapter, Insight, Connection, ReceiptCategory } from '../types/receipt';

function formatDate(dateStr: string): string {
  if (!dateStr) return 'Date unavailable';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function getCategoryLabel(category: ReceiptCategory): string {
  const labels: Record<ReceiptCategory, string> = {
    music: 'Music',
    movie: 'Movies & Entertainment',
    place: 'Places',
    purchase: 'Purchases',
    photo: 'Photos',
    message: 'Messages',
    search: 'Searches',
    event: 'Events',
    note: 'Personal Notes',
  };
  return labels[category] || category;
}

export function groupReceiptsIntoChapters(receipts: LifeReceipt[], connections: Connection[]): StoryChapter[] {
  if (receipts.length === 0) return [];

  const chapters: StoryChapter[] = [];
  const sortedReceipts = [...receipts].sort((a, b) => {
    const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return (isNaN(timeA) ? 0 : timeA) - (isNaN(timeB) ? 0 : timeB);
  });

  const clusters = findClusters(sortedReceipts, connections);
  
  for (let i = 0; i < clusters.length; i++) {
    const cluster = clusters[i];
    if (cluster.receiptIds.length < 3) continue;

    const chapterReceipts = cluster.receiptIds.map((id) => sortedReceipts.find((r) => r.id === id)).filter(Boolean) as LifeReceipt[];
    const startDate = chapterReceipts[0].date;
    const endDate = chapterReceipts[chapterReceipts.length - 1].date;
    
    const categoryCounts = new Map<ReceiptCategory, number>();
    const locationCounts = new Map<string, number>();
    
    for (const r of chapterReceipts) {
      categoryCounts.set(r.category, (categoryCounts.get(r.category) || 0) + 1);
      if (r.location?.city) {
        locationCounts.set(r.location.city, (locationCounts.get(r.location.city) || 0) + 1);
      }
    }

    const dominantCategories = Array.from(categoryCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat]) => cat);

    const topLocations = Array.from(locationCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([loc]) => loc);

    const chapterConnections = connections.filter(
      (c) => cluster.receiptIds.includes(c.sourceReceiptId) && cluster.receiptIds.includes(c.targetReceiptId)
    );

    const title = generateChapterTitle(chapterReceipts, dominantCategories, topLocations);
    const summary = generateChapterSummary(chapterReceipts, dominantCategories, topLocations, chapterConnections.length);

    chapters.push({
      id: `chapter-${i + 1}`,
      title,
      startDate,
      endDate,
      receiptIds: cluster.receiptIds,
      dominantCategories,
      locations: topLocations,
      summary,
      insightIds: [],
      connectionCount: chapterConnections.length,
    });
  }

  return chapters;
}

interface Cluster {
  receiptIds: string[];
  centerDate: string;
}

function findClusters(receipts: LifeReceipt[], connections: Connection[]): Cluster[] {
  if (receipts.length === 0) return [];
  
  const clusters: Cluster[] = [];
  const visited = new Set<string>();
  const connectionMap = new Map<string, Set<string>>();
  
  for (const c of connections) {
    if (!connectionMap.has(c.sourceReceiptId)) connectionMap.set(c.sourceReceiptId, new Set());
    if (!connectionMap.has(c.targetReceiptId)) connectionMap.set(c.targetReceiptId, new Set());
    connectionMap.get(c.sourceReceiptId)!.add(c.targetReceiptId);
    connectionMap.get(c.targetReceiptId)!.add(c.sourceReceiptId);
  }

  for (const r of receipts) {
    if (visited.has(r.id)) continue;
    
    const cluster: Cluster = { receiptIds: [], centerDate: r.date };
    const queue = [r.id];
    
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (visited.has(currentId)) continue;
      visited.add(currentId);
      cluster.receiptIds.push(currentId);
      
      const connected = connectionMap.get(currentId) || new Set();
      for (const neighborId of connected) {
        if (!visited.has(neighborId)) {
          queue.push(neighborId);
        }
      }
    }
    
    if (cluster.receiptIds.length >= 3) {
      const dates = cluster.receiptIds
        .map((id) => receipts.find((r) => r.id === id)?.date)
        .filter((d): d is string => Boolean(d));
      dates.sort();
      cluster.centerDate = dates[Math.floor(dates.length / 2)];
      clusters.push(cluster);
    }
  }

  clusters.sort((a, b) => {
    const timeA = a.centerDate ? new Date(a.centerDate).getTime() : 0;
    const timeB = b.centerDate ? new Date(b.centerDate).getTime() : 0;
    return (isNaN(timeA) ? 0 : timeA) - (isNaN(timeB) ? 0 : timeB);
  });
  return clusters;
}

function generateChapterTitle(
  receipts: LifeReceipt[],
  dominantCategories: ReceiptCategory[],
  topLocations: string[]
): string {
  if (topLocations.length > 0) {
    const loc = topLocations[0];
    const catLabels = dominantCategories.map(getCategoryLabel).join(', ');
    return `${loc.toUpperCase()}: ${catLabels}`;
  }
  
  const catLabels = dominantCategories.map(getCategoryLabel).join(' & ');
  const start = formatDate(receipts[0].date);
  const end = formatDate(receipts[receipts.length - 1].date);
  
  if (receipts[0].date === receipts[receipts.length - 1].date) {
    return `${catLabels} — ${start}`;
  }
  
  return `${catLabels} — ${start} to ${end}`;
}

function generateChapterSummary(
  receipts: LifeReceipt[],
  dominantCategories: ReceiptCategory[],
  topLocations: string[],
  connectionCount: number
): string {
  const parts: string[] = [];
  
  parts.push(`${receipts.length} moments across ${dominantCategories.length} categories.`);
  
  if (topLocations.length > 0) {
    parts.push(`Centered around ${topLocations.slice(0, 2).join(' and ')}.`);
  }
  
  const catLabels = dominantCategories.map(getCategoryLabel).join(', ');
  parts.push(`Activity spans ${catLabels.toLowerCase()}.`);
  
  if (connectionCount > 0) {
    parts.push(`${connectionCount} connections link these moments.`);
  }
  
  const timeRange = getTimeRangeDescription(receipts);
  if (timeRange) parts.push(timeRange);
  
  return parts.join(' ');
}

function getTimeRangeDescription(receipts: LifeReceipt[]): string | null {
  const hours = receipts.map((r) => new Date(r.timestamp).getHours());
  const nightCount = hours.filter((h) => h >= 22 || h < 6).length;
  const morningCount = hours.filter((h) => h >= 6 && h < 12).length;
  const eveningCount = hours.filter((h) => h >= 17 && h < 22).length;
  
  const total = hours.length;
  if (nightCount / total > 0.4) return 'Predominantly late-night activity.';
  if (morningCount / total > 0.4) return 'Mostly morning activity.';
  if (eveningCount / total > 0.4) return 'Primarily evening moments.';
  return null;
}

export function generateInsights(receipts: LifeReceipt[], connections: Connection[], chapters: StoryChapter[]): Insight[] {
  const insights: Insight[] = [];
  
  const categoryCounts = new Map<ReceiptCategory, number>();
  for (const r of receipts) {
    categoryCounts.set(r.category, (categoryCounts.get(r.category) || 0) + 1);
  }
  const totalReceipts = receipts.length;
  
  const topCategory = Array.from(categoryCounts.entries()).sort((a, b) => b[1] - a[1])[0];
  if (topCategory) {
    const pct = Math.round((topCategory[1] / totalReceipts) * 100);
    insights.push({
      id: 'insight-dominant-category',
      title: 'Dominant Activity',
      description: `${getCategoryLabel(topCategory[0])} accounts for ${pct}% of all recorded moments (${topCategory[1]} of ${totalReceipts}).`,
      metric: `${pct}%`,
      receiptIds: receipts.filter((r) => r.category === topCategory[0]).slice(0, 10).map((r) => r.id),
      category: topCategory[0],
      evidence: [`${topCategory[1]} ${getCategoryLabel(topCategory[0]).toLowerCase()} receipts out of ${totalReceipts} total`],
    });
  }

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
  const peakHour = Array.from(hourCounts.entries()).sort((a, b) => b[1] - a[1])[0];
  if (peakHour) {
    const period = getPeriodName(peakHour[0]);
    insights.push({
      id: 'insight-peak-hour',
      title: 'Most Active Period',
      description: `Activity peaks during ${period} (${peakHour[0]}:00–${peakHour[0]+1}:00) with ${peakHour[1]} recorded moments.`,
      metric: `${peakHour[1]} moments`,
      receiptIds: receipts.filter((r) => {
        if (!r.timestamp) return false;
        const d = new Date(r.timestamp);
        return !isNaN(d.getTime()) && d.getHours() === peakHour[0];
      }).slice(0, 10).map((r) => r.id),
      category: 'cross-category',
      evidence: [`${peakHour[1]} receipts between ${peakHour[0]}:00–${peakHour[0]+1}:00`],
    });
  }

  const locationCounts = new Map<string, number>();
  for (const r of receipts) {
    if (r.location?.city) {
      locationCounts.set(r.location.city, (locationCounts.get(r.location.city) || 0) + 1);
    }
  }
  const topLocation = Array.from(locationCounts.entries()).sort((a, b) => b[1] - a[1])[0];
  if (topLocation && topLocation[1] > 2) {
    insights.push({
      id: 'insight-top-location',
      title: 'Recurring Location',
      description: `${topLocation[0]} appears in ${topLocation[1]} receipts across multiple dates.`,
      metric: `${topLocation[1]} visits`,
      receiptIds: receipts.filter((r) => r.location?.city === topLocation[0]).slice(0, 10).map((r) => r.id),
      category: 'place',
      evidence: [`${topLocation[1]} receipts at ${topLocation[0]}`],
    });
  }

  const crossCategoryConnections = connections.filter((c) => c.type === 'cross-category');
  if (crossCategoryConnections.length > 0) {
    const pairCounts = new Map<string, number>();
    for (const c of crossCategoryConnections) {
      const a = receipts.find((r) => r.id === c.sourceReceiptId);
      const b = receipts.find((r) => r.id === c.targetReceiptId);
      if (a && b) {
        const key = [a.category, b.category].sort().join('↔');
        pairCounts.set(key, (pairCounts.get(key) || 0) + 1);
      }
    }
    const topPair = Array.from(pairCounts.entries()).sort((a, b) => b[1] - a[1])[0];
    if (topPair && topPair[1] > 3) {
      insights.push({
        id: 'insight-cross-category',
        title: 'Frequent Cross-Category Pattern',
        description: `${topPair[0].replace('↔', ' and ')} moments frequently occur together (${topPair[1]} connections).`,
        metric: `${topPair[1]} connections`,
        receiptIds: crossCategoryConnections
          .filter((c) => {
            const a = receipts.find((r) => r.id === c.sourceReceiptId);
            const b = receipts.find((r) => r.id === c.targetReceiptId);
            return a && b && [a.category, b.category].sort().join('↔') === topPair[0];
          })
          .slice(0, 5)
          .flatMap((c) => [c.sourceReceiptId, c.targetReceiptId]),
        category: 'cross-category',
        evidence: [`${topPair[1]} cross-category connections between ${topPair[0].replace('↔', ' and ')}`],
      });
    }
  }

  const sameDayConnections = connections.filter((c) => c.type === 'same-day' || c.type === 'temporal-proximity');
  if (sameDayConnections.length > 0) {
    const dateConnectionCounts = new Map<string, number>();
    for (const c of sameDayConnections) {
      const a = receipts.find((r) => r.id === c.sourceReceiptId);
      if (a) dateConnectionCounts.set(a.date, (dateConnectionCounts.get(a.date) || 0) + 1);
    }
    const busiestDay = Array.from(dateConnectionCounts.entries()).sort((a, b) => b[1] - a[1])[0];
    if (busiestDay && busiestDay[1] > 5) {
      insights.push({
        id: 'insight-busiest-day',
        title: 'Most Connected Day',
        description: `${formatDate(busiestDay[0])} has ${busiestDay[1]} temporal connections between moments.`,
        metric: `${busiestDay[1]} connections`,
        receiptIds: receipts.filter((r) => r.date === busiestDay[0]).slice(0, 15).map((r) => r.id),
        category: 'cross-category',
        evidence: [`${busiestDay[1]} connections on ${formatDate(busiestDay[0])}`],
      });
    }
  }

  if (chapters.length > 0) {
    const largestChapter = chapters.reduce((max, c) => (c.receiptIds.length > max.receiptIds.length ? c : max), chapters[0]);
    insights.push({
      id: 'insight-largest-chapter',
      title: 'Most Significant Chapter',
      description: `"${largestChapter.title}" contains ${largestChapter.receiptIds.length} moments with ${largestChapter.connectionCount} internal connections.`,
      metric: `${largestChapter.receiptIds.length} moments`,
      receiptIds: largestChapter.receiptIds.slice(0, 10),
      category: 'cross-category',
      evidence: [`Chapter spans ${formatDate(largestChapter.startDate)} to ${formatDate(largestChapter.endDate)}`, `${largestChapter.connectionCount} internal connections`],
    });
  }

  return insights;
}

function getPeriodName(hour: number): string {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'late night';
}

export function getChapterEvidence(chapter: StoryChapter, receipts: LifeReceipt[]): string[] {
  const chapterReceipts = chapter.receiptIds.map((id) => receipts.find((r) => r.id === id)).filter(Boolean) as LifeReceipt[];
  const evidence: string[] = [];
  
  evidence.push(`${chapterReceipts.length} moments from ${formatDate(chapter.startDate)} to ${formatDate(chapter.endDate)}`);
  
  const catCounts = new Map<ReceiptCategory, number>();
  for (const r of chapterReceipts) {
    catCounts.set(r.category, (catCounts.get(r.category) || 0) + 1);
  }
  for (const [cat, count] of catCounts) {
    evidence.push(`${count} ${getCategoryLabel(cat).toLowerCase()}${count > 1 ? 's' : ''}`);
  }
  
  if (chapter.locations.length > 0) {
    evidence.push(`Locations: ${chapter.locations.join(', ')}`);
  }
  
  if (chapter.connectionCount > 0) {
    evidence.push(`${chapter.connectionCount} connections between moments`);
  }
  
  return evidence;
}