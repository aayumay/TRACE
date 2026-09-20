import { useParams, NavLink } from 'react-router-dom';
import { useMemo } from 'react';
import { useActivities } from '../hooks/useActivities';
import { groupReceiptsIntoChapters, getChapterEvidence } from '../lib/storyEngine';
import { findConnections } from '../lib/connectionEngine';
import { ArrowLeft, Calendar, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import { CinematicReveal } from '../components/cinematic/CinematicReveal';

export function StoryChapterPage() {
  const { id } = useParams<{ id: string }>();
  const { receipts, loading, error } = useActivities();

  const chapters = useMemo(() => {
    if (receipts.length === 0) return [];
    const conns = findConnections(receipts.slice(0, 500));
    return groupReceiptsIntoChapters(receipts, conns);
  }, [receipts]);

  const chapter = chapters.find(c => c.id === id);
  const chapterIndex = chapters.findIndex(c => c.id === id);

  if (loading) {
    return (
      <div className="container-page py-20 flex items-center justify-center min-h-[60vh]" data-testid="story-chapter">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" aria-hidden="true" />
          <p className="font-ibm-mono text-xs uppercase tracking-[0.2em] text-muted">Reconstructing chapter timeline…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-page py-16" data-testid="story-chapter">
        <p className="font-ibm-mono text-sm text-destructive">Failed to load data: {error}</p>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="container-narrow py-20 text-center" data-testid="story-chapter">
        <p className="font-fraunces text-2xl text-foreground mb-4">Chapter not found.</p>
        <NavLink to="/stories" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full liquid-glass border border-white/10 text-xs font-ibm-mono uppercase tracking-wider text-foreground hover:bg-white/10 transition-colors">
          <ArrowLeft className="h-4 w-4 text-accent" aria-hidden="true" />
          Back to Stories
        </NavLink>
      </div>
    );
  }

  const chapterReceipts = receipts.filter(r => chapter.receiptIds.includes(r.id)).slice(0, 30);
  const evidence = getChapterEvidence(chapter, receipts);
  const prevChapter = chapterIndex > 0 ? chapters[chapterIndex - 1] : null;
  const nextChapter = chapterIndex < chapters.length - 1 ? chapters[chapterIndex + 1] : null;

  return (
    <article className="container-narrow pt-8 pb-20 sm:pt-12 sm:pb-24" data-testid="story-chapter">
      {/* Back */}
      <NavLink
        to="/stories"
        className="inline-flex items-center gap-2 font-ibm-mono text-xs uppercase tracking-[0.16em] text-muted hover:text-foreground transition-colors mb-8"
        aria-label="Back to Story Chapters"
      >
        <ArrowLeft className="h-4 w-4 text-accent" aria-hidden="true" />
        Story Chapters
      </NavLink>

      {/* Hero */}
      <CinematicReveal>
        <header className="mb-10" data-testid="chapter-hero">
          <p className="font-ibm-mono text-xs text-accent uppercase tracking-widest mb-3">
            CHAPTER {String(chapterIndex + 1).padStart(2, '0')}
          </p>
        <h1 className="font-fraunces text-4xl sm:text-5xl font-medium text-foreground mb-4 leading-tight">
          {chapter.title}
        </h1>

        <div className="flex flex-wrap gap-4 text-xs font-ibm-mono text-muted mb-6">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            {chapter.startDate} – {chapter.endDate}
          </span>
          <span className="flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            {chapter.receiptIds.length} moments
          </span>
          {chapter.connectionCount > 0 && (
            <span className="text-accent">{chapter.connectionCount} connections</span>
          )}
        </div>

        <p className="font-ui text-sm sm:text-base text-muted leading-relaxed max-w-2xl">
          {chapter.summary}
        </p>

        {chapter.dominantCategories.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {chapter.dominantCategories.map(cat => (
              <span key={cat} className="font-ibm-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded bg-surface border border-white/5 text-muted">
                {cat}
              </span>
            ))}
          </div>
        )}
        </header>
      </CinematicReveal>

      {/* Evidence */}
      {evidence.length > 0 && (
        <section className="mb-10 p-6 rounded-2xl liquid-glass border border-white/10" data-testid="chapter-insight">
          <div className="font-ibm-mono text-[10px] uppercase tracking-[0.2em] text-accent mb-2">
            CORROBORATING DATA
          </div>
          <h2 className="font-fraunces text-xl font-medium text-foreground mb-3">Evidence</h2>
          <ul className="space-y-2">
            {evidence.map((ev, i) => (
              <li key={i} className="font-ui text-xs sm:text-sm text-muted flex items-start gap-2.5">
                <span className="text-accent shrink-0 font-ibm-mono">—</span>
                {ev}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Timeline */}
      {chapterReceipts.length > 0 && (
        <section className="mb-12" aria-labelledby="timeline-heading">
          <h2 id="timeline-heading" className="font-fraunces text-2xl font-medium text-foreground mb-6" data-testid="chapter-timeline">
            Moments ({chapter.receiptIds.length} total, showing {chapterReceipts.length})
          </h2>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-white/10" aria-hidden="true" />
            <ol className="space-y-4 pl-12">
              {chapterReceipts.map(r => (
                <li key={r.id} className="relative" data-testid="chapter-receipt">
                  <div className="absolute -left-[2.35rem] top-3.5 w-3 h-3 rounded-full bg-background border-2 border-accent" aria-hidden="true" />
                  <NavLink
                    to={`/receipts/${r.id}`}
                    className="p-4 rounded-xl liquid-glass border border-white/10 block hover:border-accent/40 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-ibm-mono text-[9px] uppercase tracking-wider text-accent">{r.category}</span>
                      <span className="font-ibm-mono text-[10px] text-muted">{r.date}</span>
                    </div>
                    <p className="font-fraunces text-base font-medium text-foreground group-hover:text-accent transition-colors">
                      {r.title}
                    </p>
                    {r.description && (
                      <p className="font-ui text-xs text-muted mt-1 line-clamp-2 leading-relaxed">{r.description}</p>
                    )}
                  </NavLink>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* Navigation */}
      <nav className="flex gap-4 pt-8 border-t border-white/10" aria-label="Chapter navigation" data-testid="chapter-navigation">
        {prevChapter ? (
          <NavLink
            to={`/stories/${prevChapter.id}`}
            className="flex-1 p-4 rounded-xl liquid-glass border border-white/10 hover:border-accent/40 transition-all group text-left"
          >
            <p className="font-ibm-mono text-[10px] text-muted uppercase tracking-wider mb-1 flex items-center gap-1">
              <ChevronLeft className="w-3 h-3 text-accent" /> Previous Chapter
            </p>
            <p className="font-fraunces text-base font-medium text-foreground group-hover:text-accent transition-colors line-clamp-1">
              {prevChapter.title}
            </p>
          </NavLink>
        ) : <div className="flex-1" />}

        {nextChapter ? (
          <NavLink
            to={`/stories/${nextChapter.id}`}
            className="flex-1 p-4 rounded-xl liquid-glass border border-white/10 hover:border-accent/40 transition-all group text-right"
          >
            <p className="font-ibm-mono text-[10px] text-muted uppercase tracking-wider mb-1 flex items-center justify-end gap-1">
              Next Chapter <ChevronRight className="w-3 h-3 text-accent" />
            </p>
            <p className="font-fraunces text-base font-medium text-foreground group-hover:text-accent transition-colors line-clamp-1">
              {nextChapter.title}
            </p>
          </NavLink>
        ) : <div className="flex-1" />}
      </nav>
    </article>
  );
}
