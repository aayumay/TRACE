import { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useActivities } from '../hooks/useActivities';
import { groupReceiptsIntoChapters } from '../lib/storyEngine';
import { findConnections } from '../lib/connectionEngine';
import { BookOpen, Calendar, Tag } from 'lucide-react';
import { CinematicReveal } from '../components/cinematic/CinematicReveal';

export function StoriesPage() {
  const { receipts, loading, error } = useActivities();

  const chapters = useMemo(() => {
    if (receipts.length === 0) return [];
    const connections = findConnections(receipts.slice(0, 500));
    return groupReceiptsIntoChapters(receipts, connections);
  }, [receipts]);

  if (loading) {
    return (
      <div className="container-page py-20 flex items-center justify-center min-h-[60vh]" data-testid="story-chapters">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" aria-hidden="true" />
          <p className="font-ibm-mono text-xs uppercase tracking-[0.2em] text-muted">Synthesizing narrative chapters…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-page py-16" data-testid="story-chapters">
        <p className="font-ibm-mono text-sm text-destructive">Failed to load data: {error}</p>
      </div>
    );
  }

  return (
    <div className="container-page pt-8 pb-20 sm:pt-12 sm:pb-24" data-testid="story-chapters">
      <CinematicReveal as="header" className="mb-10 sm:mb-12">
        <div className="font-ibm-mono text-[10px] tracking-[0.24em] uppercase text-accent mb-2 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5" />
          <span>CURATED ARCHIVE EPISODES</span>
        </div>
        <h1 className="font-fraunces text-4xl sm:text-5xl font-medium tracking-tight text-foreground mb-3">
          Story Chapters
        </h1>
        <p className="font-ui text-sm sm:text-base text-muted max-w-2xl leading-relaxed">
          Algorithmic narratives discovered from temporal density clusters, location shifts, and multi-source correlation.
        </p>
      </CinematicReveal>

      {chapters.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <BookOpen className="h-10 w-10 text-muted/30 mb-4" aria-hidden="true" />
          <p className="font-fraunces text-2xl text-foreground mb-1">No chapters discovered yet.</p>
          <p className="font-ui text-xs text-muted">Load dataset to discover story chapters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {chapters.map((chapter, i) => (
            <motion.div
              key={chapter.id}
              initial={{ opacity: 0, y: 30, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.6, delay: 0.08 * i, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4, scale: 1.015, transition: { duration: 0.25 } }}
            >
              <NavLink
                to={`/stories/${chapter.id}`}
                className="p-6 rounded-2xl liquid-glass border border-white/10 hover:border-accent/50 hover:shadow-[0_0_24px_rgba(155,107,255,0.2)] transition-all group block text-left h-full"
                data-testid="chapter-card"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="font-ibm-mono text-[11px] text-accent tracking-widest uppercase">
                    CHAPTER {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="font-ibm-mono text-[10px] px-2.5 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent">
                    {chapter.receiptIds.length} moments
                  </span>
                </div>

                <h2 className="font-fraunces text-2xl font-medium text-foreground mb-2.5 leading-snug group-hover:text-accent transition-colors">
                  {chapter.title}
                </h2>

                <p className="font-ui text-xs sm:text-sm text-muted mb-5 leading-relaxed line-clamp-3">
                  {chapter.summary}
                </p>

                <dl className="space-y-2.5 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-accent shrink-0" aria-hidden="true" />
                    <dd className="font-ibm-mono text-xs text-muted">
                      {chapter.startDate} – {chapter.endDate}
                    </dd>
                  </div>

                  {chapter.dominantCategories.length > 0 && (
                    <div className="flex items-start gap-2">
                      <Tag className="h-3.5 w-3.5 text-accent shrink-0 mt-0.5" aria-hidden="true" />
                      <dd className="flex flex-wrap gap-1.5">
                        {chapter.dominantCategories.slice(0, 3).map(cat => (
                          <span key={cat} className="font-ibm-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded bg-surface border border-white/5 text-muted">
                            {cat}
                          </span>
                        ))}
                      </dd>
                    </div>
                  )}
                </dl>
              </NavLink>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
