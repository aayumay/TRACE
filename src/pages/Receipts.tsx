import { useActivities } from '../hooks/useActivities';
import { useReceiptFilters, useReceiptSearch, useReceiptSort, useFilterState, useAvailableFilters } from '../hooks/useReceipts';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, LayoutGrid, List, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import type { LifeReceipt, ReceiptCategory } from '../types/receipt';
import { CinematicReveal } from '../components/cinematic/CinematicReveal';

const CATEGORY_LABELS: Record<ReceiptCategory, string> = {
  music: '🎵 Music',
  movie: '🎬 Movie',
  place: '📍 Place',
  purchase: '🛍 Purchase',
  photo: '📷 Photo',
  message: '💬 Message',
  search: '🔍 Search',
  event: '🎟 Event',
  note: '📝 Note',
};

export function ReceiptsPage() {
  const { receipts, loading, error } = useActivities();
  const { filters, updateFilter, clearFilters, activeFilterCount } = useFilterState();
  const [showFilters, setShowFilters] = useState(false);

  const searched = useReceiptSearch(receipts, filters.search);
  const filtered = useReceiptFilters(searched, filters);
  const sorted = useReceiptSort(filtered, filters.sortBy, filters.sortOrder);
  const available = useAvailableFilters(receipts);

  // Pagination
  const PAGE_SIZE = 48;
  const [page, setPage] = useState(1);
  const pageCount = Math.ceil(sorted.length / PAGE_SIZE);
  const paged = sorted.slice(0, page * PAGE_SIZE);

  if (loading) {
    return (
      <div className="container-page py-20 flex items-center justify-center min-h-[60vh]" data-testid="receipt-explorer">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" aria-hidden="true" />
          <p className="font-ibm-mono text-xs uppercase tracking-[0.2em] text-muted">Indexing digital life receipts…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-page py-16 flex items-center justify-center min-h-[60vh]" data-testid="receipt-explorer">
        <div className="text-center max-w-md">
          <p className="font-ibm-mono text-sm text-destructive mb-2">Failed to load receipts</p>
          <p className="font-ui text-muted text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page pt-8 pb-20 sm:pt-12 sm:pb-24" data-testid="receipt-explorer">
      {/* Header */}
      <CinematicReveal>
        <header className="mb-8">
          <div className="font-ibm-mono text-[10px] tracking-[0.24em] uppercase text-accent mb-2">
            INDEX & CATALOGUE
          </div>
          <h1 className="font-fraunces text-4xl sm:text-5xl font-medium tracking-tight text-foreground mb-3">
            Receipt Explorer
          </h1>
          <p className="font-ui text-sm sm:text-base text-muted max-w-2xl leading-relaxed">
            Browse, query, and filter your complete life archive across all datasets with preserved provenance.
        </p>
      </header>
      </CinematicReveal>

      {/* Search + Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" aria-hidden="true" />
          <input
            type="search"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface/80 border border-white/10 text-foreground font-ui text-sm placeholder:text-muted/60 focus:outline-none focus:border-accent/60 transition-colors"
            placeholder="Search receipts, artists, merchants, locations…"
            value={filters.search}
            onChange={e => { updateFilter('search', e.target.value); setPage(1); }}
            aria-label="Search receipts"
            data-testid="receipt-search"
          />
        </div>

        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl liquid-glass border border-white/10 text-xs font-ibm-mono uppercase tracking-wider text-foreground hover:bg-white/10 transition-colors relative"
            aria-expanded={showFilters}
            aria-controls="filter-panel"
            data-testid="category-filter"
          >
            <SlidersHorizontal className="h-4 w-4 text-accent" aria-hidden="true" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-accent text-accent-foreground text-[10px] flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          <div className="flex border border-white/10 rounded-xl overflow-hidden liquid-glass" data-testid="view-toggle">
            <button
              onClick={() => updateFilter('viewMode', 'grid')}
              className={`p-2.5 transition-colors ${filters.viewMode === 'grid' ? 'bg-accent text-accent-foreground' : 'text-muted hover:text-foreground'}`}
              aria-label="Grid view"
              aria-pressed={filters.viewMode === 'grid'}
            >
              <LayoutGrid className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              onClick={() => updateFilter('viewMode', 'list')}
              className={`p-2.5 transition-colors ${filters.viewMode === 'list' ? 'bg-accent text-accent-foreground' : 'text-muted hover:text-foreground'}`}
              aria-label="List view"
              aria-pressed={filters.viewMode === 'list'}
            >
              <List className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div id="filter-panel" className="p-5 mb-5 rounded-2xl liquid-glass border border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-slide-down">
          {/* Category */}
          <div>
            <label className="font-ibm-mono text-[10px] uppercase tracking-[0.16em] text-muted block mb-2">Category</label>
            <div className="flex flex-wrap gap-1.5" data-testid="category-filter">
              {available.categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    const next = filters.categories.includes(cat)
                      ? filters.categories.filter(c => c !== cat)
                      : [...filters.categories, cat];
                    updateFilter('categories', next);
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-ibm-mono tracking-wider transition-colors cursor-pointer ${
                    filters.categories.includes(cat)
                      ? 'bg-accent/20 text-accent border border-accent/40 font-medium'
                      : 'bg-surface text-muted/80 hover:text-foreground border border-white/5'
                  }`}
                >
                  {CATEGORY_LABELS[cat] || cat}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div data-testid="date-filter">
            <label className="font-ibm-mono text-[10px] uppercase tracking-[0.16em] text-muted block mb-1">Date From</label>
            <input
              type="date"
              className="w-full px-3 py-1.5 rounded-lg bg-surface border border-white/10 text-xs font-ibm-mono text-foreground focus:outline-none focus:border-accent"
              value={filters.dateRange.start || ''}
              min={available.dateRange.min || undefined}
              max={available.dateRange.max || undefined}
              onChange={e => { updateFilter('dateRange', { ...filters.dateRange, start: e.target.value || null }); setPage(1); }}
            />
            <label className="font-ibm-mono text-[10px] uppercase tracking-[0.16em] text-muted block mt-2 mb-1">Date To</label>
            <input
              type="date"
              className="w-full px-3 py-1.5 rounded-lg bg-surface border border-white/10 text-xs font-ibm-mono text-foreground focus:outline-none focus:border-accent"
              value={filters.dateRange.end || ''}
              min={available.dateRange.min || undefined}
              max={available.dateRange.max || undefined}
              onChange={e => { updateFilter('dateRange', { ...filters.dateRange, end: e.target.value || null }); setPage(1); }}
            />
          </div>

          {/* Sort */}
          <div data-testid="sort-control">
            <label className="font-ibm-mono text-[10px] uppercase tracking-[0.16em] text-muted block mb-1">Sort By</label>
            <select
              className="w-full px-3 py-1.5 rounded-lg bg-surface border border-white/10 text-xs font-ibm-mono text-foreground focus:outline-none focus:border-accent"
              value={filters.sortBy}
              onChange={e => updateFilter('sortBy', e.target.value as typeof filters.sortBy)}
            >
              <option value="date">Date</option>
              <option value="category">Category</option>
              <option value="title">Title</option>
              <option value="location">Location</option>
            </select>
            <label className="font-ibm-mono text-[10px] uppercase tracking-[0.16em] text-muted block mt-2 mb-1">Order</label>
            <select
              className="w-full px-3 py-1.5 rounded-lg bg-surface border border-white/10 text-xs font-ibm-mono text-foreground focus:outline-none focus:border-accent"
              value={filters.sortOrder}
              onChange={e => updateFilter('sortOrder', e.target.value as typeof filters.sortOrder)}
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>

          {/* Clear */}
          <div className="flex items-end">
            <button
              onClick={() => { clearFilters(); setPage(1); }}
              className="w-full py-2.5 rounded-lg bg-surface hover:bg-white/10 text-xs font-ibm-mono uppercase tracking-wider text-muted hover:text-foreground border border-white/5 flex items-center justify-center gap-1.5 transition-colors"
              data-testid="clear-filters"
            >
              <X className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>
      )}

      {/* Active Filter Chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4" data-testid="active-filter-chips">
          {filters.categories.map(cat => (
            <button
              key={cat}
              onClick={() => updateFilter('categories', filters.categories.filter(c => c !== cat))}
              className="px-2.5 py-1 rounded-full bg-accent/15 text-accent border border-accent/30 text-xs font-ibm-mono flex items-center gap-1.5"
            >
              <span>{CATEGORY_LABELS[cat] || cat}</span>
              <X className="h-3 w-3" aria-hidden="true" />
            </button>
          ))}
          {filters.search && (
            <button
              onClick={() => updateFilter('search', '')}
              className="px-2.5 py-1 rounded-full bg-accent/15 text-accent border border-accent/30 text-xs font-ibm-mono flex items-center gap-1.5"
            >
              <span>"{filters.search}"</span>
              <X className="h-3 w-3" aria-hidden="true" />
            </button>
          )}
        </div>
      )}

      {/* Result Count */}
      <p className="font-ibm-mono text-xs text-muted mb-4 tracking-wider" data-testid="result-count">
        {sorted.length.toLocaleString()} receipt{sorted.length !== 1 ? 's' : ''}
        {activeFilterCount > 0 ? ` (filtered from ${receipts.length.toLocaleString()})` : ''}
      </p>

      {/* Empty State */}
      {sorted.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center" data-testid="empty-state">
          <Search className="h-10 w-10 text-muted/30 mb-4" aria-hidden="true" />
          <p className="font-fraunces text-2xl text-foreground mb-2">No receipts found</p>
          <p className="font-ui text-sm text-muted mb-6">Try adjusting your search query or reset active filters.</p>
          <button
            onClick={() => { clearFilters(); setPage(1); }}
            className="px-5 py-2.5 rounded-full liquid-glass border border-white/10 text-xs font-ibm-mono uppercase tracking-wider text-foreground hover:bg-white/10 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Grid / List */}
      {sorted.length > 0 && (
        <>
          {filters.viewMode === 'grid' ? (
            <div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4"
              data-testid="receipt-grid"
            >
              {paged.map(r => <ReceiptCard key={r.id} receipt={r} />)}
            </div>
          ) : (
            <div className="space-y-2.5" data-testid="receipt-list">
              {paged.map(r => <ReceiptListItem key={r.id} receipt={r} />)}
            </div>
          )}

          {/* Load More */}
          {page < pageCount && (
            <div className="mt-10 text-center">
              <button
                onClick={() => setPage(p => p + 1)}
                className="px-7 py-3 rounded-full liquid-glass border border-white/10 text-xs font-ibm-mono uppercase tracking-[0.14em] text-foreground hover:bg-white/10 transition-all hover:border-accent/40"
              >
                Load More ({sorted.length - paged.length} remaining)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ReceiptCard({ receipt }: { receipt: LifeReceipt }) {
  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.02, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
    >
      <NavLink
        to={`/receipts/${receipt.id}`}
        className="p-3.5 rounded-xl liquid-glass border border-white/10 hover:border-accent/50 hover:shadow-[0_0_20px_rgba(155,107,255,0.2)] transition-all group block text-left h-full"
        data-testid="receipt-card"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="font-ibm-mono text-[9px] uppercase tracking-wider text-accent font-medium">
            {receipt.category}
          </span>
          <span className="font-ibm-mono text-[10px] text-muted">{receipt.time}</span>
        </div>
        <p className="font-fraunces text-sm font-medium text-foreground leading-snug line-clamp-2 mb-1 group-hover:text-accent transition-colors">
          {receipt.title}
        </p>
        {receipt.description && (
          <p className="font-ui text-[11px] text-muted line-clamp-1">{receipt.description}</p>
        )}
        <p className="font-ibm-mono text-[10px] text-muted/70 mt-2.5">{receipt.date}</p>
      </NavLink>
    </motion.div>
  );
}

function ReceiptListItem({ receipt }: { receipt: LifeReceipt }) {
  return (
    <motion.div
      whileHover={{ x: 3, scale: 1.005, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.99 }}
    >
      <NavLink
        to={`/receipts/${receipt.id}`}
        className="p-3.5 rounded-xl liquid-glass border border-white/10 flex items-center gap-4 hover:border-accent/50 hover:shadow-[0_0_20px_rgba(155,107,255,0.15)] transition-all group"
        data-testid="receipt-card"
      >
        <span className="font-ibm-mono text-[10px] uppercase tracking-wider text-accent shrink-0 w-20 font-medium">
          {receipt.category}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-fraunces text-base font-medium text-foreground truncate group-hover:text-accent transition-colors">
            {receipt.title}
          </p>
          {receipt.description && (
            <p className="font-ui text-xs text-muted truncate">{receipt.description}</p>
          )}
        </div>
        {receipt.location?.city && (
          <span className="font-ibm-mono text-xs text-muted shrink-0 hidden sm:block">{receipt.location.city}</span>
        )}
        <span className="font-ibm-mono text-xs text-muted/70 shrink-0">{receipt.date}</span>
      </NavLink>
    </motion.div>
  );
}
