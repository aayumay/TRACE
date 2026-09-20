import React, { useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useActivities } from '../hooks/useActivities';
import { generateInsights, groupReceiptsIntoChapters } from '../lib/storyEngine';
import { findConnections } from '../lib/connectionEngine';
import { Sparkles, Layers, ArrowRight } from 'lucide-react';
import { CinematicReveal } from '../components/cinematic/CinematicReveal';

export function InsightsPage() {
  const { receipts, loading, error } = useActivities();
  const [selectedInsightId, setSelectedInsightId] = useState<string | null>(null);

  const { insights } = useMemo(() => {
    if (receipts.length === 0) return { insights: [] };
    const conns = findConnections(receipts.slice(0, 500));
    const chaps = groupReceiptsIntoChapters(receipts, conns);
    const ins = generateInsights(receipts, conns, chaps);
    return { insights: ins };
  }, [receipts]);

  const selectedInsight = insights.find(i => i.id === selectedInsightId) || insights[0];
  const supportingReceipts = useMemo(() => {
    if (!selectedInsight) return [];
    return receipts.filter(r => selectedInsight.receiptIds.includes(r.id)).slice(0, 12);
  }, [selectedInsight, receipts]);

  if (loading) {
    return (
      <div className="container-page py-20 flex items-center justify-center min-h-[60vh]" data-testid="insights-view">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" aria-hidden="true" />
          <p className="font-ibm-mono text-xs uppercase tracking-[0.2em] text-muted">Synthesizing cross-dataset intelligence…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-page py-16" data-testid="insights-view">
        <p className="font-ibm-mono text-sm text-destructive">Failed to load insights: {error}</p>
      </div>
    );
  }

  return (
    <div className="container-page pt-8 pb-20 sm:pt-12 sm:pb-24" data-testid="insights-view">
      {/* Header */}
      <CinematicReveal as="header" className="mb-10 sm:mb-12">
        <div className="font-ibm-mono text-[10px] tracking-[0.24em] uppercase text-accent mb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>CROSS-DATASET INTELLIGENCE</span>
        </div>
        <h1 className="font-fraunces text-4xl sm:text-5xl font-medium tracking-tight text-foreground mb-3">
          Life Insights
        </h1>
        <p className="font-ui text-sm sm:text-base text-muted max-w-2xl leading-relaxed">
          Editorial deductions and behavioral patterns discovered across 11 years of streaming history, household transactions, and bank archives.
        </p>
      </CinematicReveal>

      {/* Grid of Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {insights.map((insight, idx) => {
          const isSelected = selectedInsight?.id === insight.id;
          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 30, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.6, delay: 0.07 * idx, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -4, scale: 1.015, transition: { duration: 0.25 } }}
              onClick={() => setSelectedInsightId(insight.id)}
              className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 flex flex-col justify-between text-left ${
                isSelected
                  ? 'accent-glass shadow-[0_0_30px_rgba(155,107,255,0.35)] border border-accent/60'
                  : 'liquid-glass border border-white/10 hover:border-accent/40'
              }`}
              data-testid="insight-card"
              role="button"
              tabIndex={0}
              onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && setSelectedInsightId(insight.id)}
              aria-pressed={isSelected}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <span className="font-ibm-mono text-[10px] uppercase tracking-wider text-accent px-2.5 py-0.5 rounded-full bg-accent/10 border border-accent/20 font-medium">
                    {insight.category === 'cross-category' ? 'Cross-Dataset' : insight.category}
                  </span>
                  {insight.metric && (
                    <span
                      className="font-ibm-mono text-xs font-semibold text-accent"
                      data-testid="insight-metric"
                    >
                      {insight.metric}
                    </span>
                  )}
                </div>

                <h2 className="font-fraunces text-2xl font-medium text-foreground mb-2.5 leading-snug">
                  {insight.title}
                </h2>

                <p className="font-ui text-xs sm:text-sm text-muted leading-relaxed mb-5">
                  {insight.description}
                </p>
              </div>

              {/* Evidence list */}
              {insight.evidence.length > 0 && (
                <div className="pt-4 border-t border-white/10 mt-auto">
                  <p className="font-ibm-mono text-[10px] uppercase tracking-[0.16em] text-muted mb-2 flex items-center gap-1">
                    <Layers className="h-3 w-3 text-accent" aria-hidden="true" />
                    Verified Evidence
                  </p>
                  <ul className="space-y-1.5" data-testid="insight-evidence">
                    {insight.evidence.map((ev, i) => (
                      <li key={i} className="font-ui text-xs text-muted/80 flex items-start gap-1.5">
                        <span className="text-accent shrink-0 font-ibm-mono">—</span>
                        <span>{ev}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Supporting Receipts Dossier */}
      {selectedInsight && supportingReceipts.length > 0 && (
        <section className="p-6 sm:p-8 rounded-2xl liquid-glass border border-white/10" aria-labelledby="evidence-dossier-heading">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <p className="font-ibm-mono text-[10px] uppercase tracking-[0.2em] text-accent mb-1">
                SUPPORTING EVIDENCE DOSSIER
              </p>
              <h2 id="evidence-dossier-heading" className="font-fraunces text-2xl sm:text-3xl font-medium text-foreground">
                Moments Supporting: <span className="accent-text">{selectedInsight.title}</span>
              </h2>
            </div>
            <p className="font-ibm-mono text-xs text-muted">
              Showing {supportingReceipts.length} verified records
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {supportingReceipts.map((r) => (
              <NavLink
                key={r.id}
                to={`/receipts/${r.id}`}
                className="p-4 rounded-xl liquid-glass border border-white/10 hover:border-accent/40 transition-all group flex flex-col justify-between block text-left"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-ibm-mono text-[9px] uppercase tracking-wider text-accent">{r.category}</span>
                    <span className="font-ibm-mono text-[10px] text-muted">{r.time || r.date}</span>
                  </div>
                  <p className="font-fraunces text-base font-medium text-foreground group-hover:text-accent transition-colors line-clamp-2">
                    {r.title}
                  </p>
                  {r.description && (
                    <p className="font-ui text-xs text-muted line-clamp-1 mt-1">{r.description}</p>
                  )}
                </div>
                <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px] text-muted font-ibm-mono">
                  <span>{r.date || 'Date unavailable'}</span>
                  <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform text-accent">
                    Inspect <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </NavLink>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
