import { useMemo } from 'react';
import { useActivities } from '../hooks/useActivities';
import { getActivityByDate } from '../lib/analytics';
import { groupReceiptsIntoChapters } from '../lib/storyEngine';
import { findConnections } from '../lib/connectionEngine';
import { NavLink } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { CinematicReveal } from '../components/cinematic/CinematicReveal';

export function JourneyPage() {
  const { receipts, loading, error } = useActivities();

  const { activityByDate, chapters } = useMemo(() => {
    if (receipts.length === 0) return { activityByDate: [], chapters: [] };
    const dates = getActivityByDate(receipts);
    const conns = findConnections(receipts.slice(0, 500));
    const chaps = groupReceiptsIntoChapters(receipts, conns);
    return { activityByDate: dates, chapters: chaps };
  }, [receipts]);

  // Build monthly buckets
  const monthlyBuckets = useMemo(() => {
    const buckets = new Map<string, { count: number; date: string }>();
    for (const d of activityByDate) {
      const key = d.date.slice(0, 7); // YYYY-MM
      const existing = buckets.get(key) || { count: 0, date: d.date };
      existing.count += d.count;
      buckets.set(key, existing);
    }
    return Array.from(buckets.entries())
      .map(([month, data]) => ({ month, count: data.count }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [activityByDate]);

  const maxCount = Math.max(...monthlyBuckets.map(b => b.count), 1);

  // Find which months each chapter covers
  const chapterMarkers = useMemo(() => {
    return chapters.map(ch => ({
      chapter: ch,
      startMonth: ch.startDate.slice(0, 7),
      endMonth: ch.endDate.slice(0, 7),
    }));
  }, [chapters]);

  if (loading) {
    return (
      <div className="container-page py-20 flex items-center justify-center min-h-[60vh]" data-testid="digital-journey">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" aria-hidden="true" />
          <p className="font-ibm-mono text-xs uppercase tracking-[0.2em] text-muted">Plotting longitudinal journey…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-page py-16" data-testid="digital-journey">
        <p className="font-ibm-mono text-sm text-destructive">Failed to load data: {error}</p>
      </div>
    );
  }

  return (
    <div className="pt-8 pb-20 sm:pt-12 sm:pb-24" data-testid="digital-journey">
      <div className="container-page mb-10">
        <CinematicReveal as="header">
          <div className="font-ibm-mono text-[10px] tracking-[0.24em] uppercase text-accent mb-2 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5" />
            <span>TEMPORAL TRAJECTORY</span>
          </div>
          <h1 className="font-fraunces text-4xl sm:text-5xl font-medium tracking-tight text-foreground mb-3">
            Digital Journey
          </h1>
          <p className="font-ui text-sm sm:text-base text-muted max-w-2xl leading-relaxed">
            Longitudinal visual record spanning {monthlyBuckets.length} months of digital footprint from {monthlyBuckets[0]?.month || '2013-08'} to {monthlyBuckets[monthlyBuckets.length - 1]?.month || '2024-05'}.
          </p>
        </CinematicReveal>
      </div>

      {/* Horizontal Scrollable Timeline */}
      <div className="overflow-x-auto pb-8 scrollbar-thin px-4 sm:px-8" data-testid="journey-timeline">
        <div className="flex items-end gap-1.5 px-4 min-w-max p-6 rounded-2xl liquid-glass border border-white/10" style={{ height: '260px', alignItems: 'flex-end' }}>
          {monthlyBuckets.map(bucket => {
            const barHeight = Math.max(8, (bucket.count / maxCount) * 170);
            const isChapterStart = chapterMarkers.some(m => m.startMonth === bucket.month);
            const chapterForMonth = chapterMarkers.find(m => m.startMonth <= bucket.month && m.endMonth >= bucket.month);
            const label = new Date(bucket.month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

            return (
              <div
                key={bucket.month}
                className="flex flex-col items-center group cursor-pointer"
                title={`${bucket.month}: ${bucket.count} moments`}
                data-testid="journey-month"
              >
                {/* Chapter marker */}
                {isChapterStart && chapterForMonth && (
                  <div className="mb-2 w-full flex justify-center">
                    <NavLink
                      to={`/stories/${chapterForMonth.chapter.id}`}
                      className="w-2.5 h-2.5 rounded-full bg-accent ring-4 ring-accent/20 hover:scale-125 transition-all"
                      title={chapterForMonth.chapter.title}
                      aria-label={`Story chapter: ${chapterForMonth.chapter.title}`}
                      data-testid="journey-chapter-marker"
                    />
                  </div>
                )}
                {!isChapterStart && <div className="mb-2 w-2.5 h-2.5" aria-hidden="true" />}

                {/* Bar */}
                <div
                  className="w-5 rounded-t-sm transition-all duration-200 group-hover:bg-accent group-hover:brightness-125"
                  style={{
                    height: `${barHeight}px`,
                    backgroundColor: chapterForMonth
                      ? 'hsl(var(--accent) / 0.7)'
                      : 'rgba(255, 255, 255, 0.18)',
                  }}
                  role="img"
                  aria-label={`${bucket.month}: ${bucket.count} moments`}
                />

                {/* Label */}
                <p className="font-ibm-mono text-[9px] text-muted group-hover:text-foreground mt-2 -rotate-45 origin-top-left translate-y-3 whitespace-nowrap">
                  {label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chapter List */}
      {chapters.length > 0 && (
        <div className="container-page mt-16">
          <div className="font-ibm-mono text-[10px] tracking-[0.2em] uppercase text-accent mb-1">
            TEMPORAL LANDMARKS
          </div>
          <h2 className="font-fraunces text-2xl sm:text-3xl font-medium text-foreground mb-6">
            Story Chapters on the Timeline
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {chapters.map((ch, i) => (
              <NavLink
                key={ch.id}
                to={`/stories/${ch.id}`}
                className="p-5 rounded-2xl liquid-glass border border-white/10 hover:border-accent/40 transition-all group block text-left"
                data-testid="journey-chapter"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-ibm-mono text-[10px] text-accent tracking-widest uppercase">
                    CH. {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="font-ibm-mono text-[9px] px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent">
                    {ch.receiptIds.length} moments
                  </span>
                </div>
                <p className="font-fraunces text-lg font-medium text-foreground group-hover:text-accent transition-colors mb-1.5 line-clamp-2">
                  {ch.title}
                </p>
                <p className="font-ibm-mono text-xs text-muted">{ch.startDate} – {ch.endDate}</p>
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
