import { useMemo, useState } from 'react';
import { useActivities } from './useActivities';
import type { LifeReceipt, FilterState, ReceiptCategory } from '../types/receipt';

const DEFAULT_FILTERS: FilterState = {
  search: '',
  categories: [],
  dateRange: { start: null, end: null },
  locations: [],
  timeRange: { start: null, end: null },
  sortBy: 'date',
  sortOrder: 'desc',
  viewMode: 'grid',
};

export function useReceipts() {
  const { receipts } = useActivities();
  return receipts;
}

export function useReceiptSearch(receipts: LifeReceipt[], search: string) {
  return useMemo(() => {
    if (!search?.trim()) return receipts;
    const query = search.toLowerCase().trim();
    return receipts.filter((r) =>
      (r.title?.toLowerCase().includes(query) ?? false) ||
      (r.description?.toLowerCase().includes(query) ?? false) ||
      (r.category?.toLowerCase().includes(query) ?? false) ||
      (r.location?.name?.toLowerCase().includes(query) ?? false) ||
      (r.location?.city?.toLowerCase().includes(query) ?? false) ||
      (r.tags?.some((t) => t?.toLowerCase().includes(query)) ?? false) ||
      (r.metadata?.artist?.toLowerCase().includes(query) ?? false) ||
      (r.metadata?.merchant?.toLowerCase().includes(query) ?? false) ||
      (r.metadata?.category?.toLowerCase().includes(query) ?? false)
    );
  }, [receipts, search]);
}

export function useReceiptFilters(receipts: LifeReceipt[], filters: FilterState) {
  return useMemo(() => {
    let result = receipts;

    if (filters.categories.length > 0) {
      result = result.filter((r) => filters.categories.includes(r.category));
    }

    if (filters.dateRange.start) {
      result = result.filter((r) => r.date >= filters.dateRange.start!);
    }
    if (filters.dateRange.end) {
      result = result.filter((r) => r.date <= filters.dateRange.end!);
    }

    if (filters.locations.length > 0) {
      result = result.filter((r) =>
        r.location?.city && filters.locations.includes(r.location.city)
      );
    }

    if (filters.timeRange.start) {
      result = result.filter((r) => r.time >= filters.timeRange.start!);
    }
    if (filters.timeRange.end) {
      result = result.filter((r) => r.time <= filters.timeRange.end!);
    }

    return result;
  }, [receipts, filters]);
}

export function useReceiptSort(receipts: LifeReceipt[], sortBy: FilterState['sortBy'], sortOrder: FilterState['sortOrder']) {
  return useMemo(() => {
    const sorted = [...receipts].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date': {
          const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
          const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
          comparison = (isNaN(timeA) ? 0 : timeA) - (isNaN(timeB) ? 0 : timeB);
          break;
        }
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'location':
          comparison = (a.location?.city || '').localeCompare(b.location?.city || '');
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    return sorted;
  }, [receipts, sortBy, sortOrder]);
}

export function useFilterState() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  
  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => setFilters(DEFAULT_FILTERS);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.categories.length) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.locations.length) count++;
    if (filters.timeRange.start || filters.timeRange.end) count++;
    return count;
  }, [filters]);

  return { filters, updateFilter, clearFilters, activeFilterCount };
}

export function useAvailableFilters(receipts: LifeReceipt[]) {
  return useMemo(() => {
    const categories = Array.from(new Set(receipts.map((r) => r.category))).sort() as ReceiptCategory[];
    const locations = Array.from(
      new Set(receipts.map((r) => r.location?.city).filter(Boolean))
    ).sort() as string[];
    
    const dates = receipts.map((r) => r.date).sort();
    const dateRange = {
      min: dates[0] || null,
      max: dates[dates.length - 1] || null,
    };

    return { categories, locations, dateRange };
  }, [receipts]);
}