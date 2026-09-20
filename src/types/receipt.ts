export type ReceiptCategory =
  | 'music'
  | 'movie'
  | 'place'
  | 'purchase'
  | 'photo'
  | 'message'
  | 'search'
  | 'event'
  | 'note';

export interface LocationData {
  name?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}

export interface ReceiptMetadata {
  source: string;
  sourceDataset: string;
  sourceId: string;
  durationMinutes?: number;
  amount?: number;
  currency?: string;
  artist?: string;
  album?: string;
  platform?: string;
  reasonStart?: string;
  reasonEnd?: string;
  shuffled?: boolean;
  skipped?: boolean;
  type?: 'expense' | 'income';
  mode?: string;
  category?: string;
  subcategory?: string;
  merchant?: string;
  city?: string;
  state?: string;
  job?: string;
  isFraud?: boolean;
  customerId?: string | number;
  [key: string]: unknown;
}

export interface LifeReceipt {
  id: string;
  category: ReceiptCategory;
  title: string;
  description: string;
  timestamp: string;
  date: string;
  time: string;
  location?: LocationData;
  tags: string[];
  metadata: ReceiptMetadata;
}

export type ConnectionType =
  | 'same-day'
  | 'temporal-proximity'
  | 'same-location'
  | 'nearby-location'
  | 'shared-tags'
  | 'cross-category'
  | 'event-place'
  | 'music-place'
  | 'search-activity'
  | 'recurring-pattern';

export interface Connection {
  id: string;
  sourceReceiptId: string;
  targetReceiptId: string;
  type: ConnectionType;
  score: number;
  reason: string;
  evidence: string[];
}

export interface StoryChapter {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  receiptIds: string[];
  dominantCategories: ReceiptCategory[];
  locations: string[];
  summary: string;
  insightIds: string[];
  connectionCount: number;
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  metric?: string;
  receiptIds: string[];
  category: ReceiptCategory | 'cross-category';
  evidence: string[];
}

export interface LifeStats {
  totalReceipts: number;
  activeDays: number;
  dateRange: { start: string; end: string };
  dominantCategory: ReceiptCategory;
  topLocation: string;
  busiestPeriod: string;
  connectionCount: number;
  chapterCount: number;
  categoryCounts: Record<ReceiptCategory, number>;
  sourceCounts: Record<string, number>;
}

export interface FilterState {
  search: string;
  categories: ReceiptCategory[];
  dateRange: { start: string | null; end: string | null };
  locations: string[];
  timeRange: { start: string | null; end: string | null };
  sortBy: 'date' | 'category' | 'title' | 'location';
  sortOrder: 'asc' | 'desc';
  viewMode: 'grid' | 'list';
}

export interface ConstellationNode {
  id: string;
  receipt: LifeReceipt;
  x: number;
  y: number;
  connections: string[];
  clusterId?: number;
}

export interface ConstellationEdge {
  id: string;
  source: string;
  target: string;
  type: ConnectionType;
  score: number;
}