import { useParams, NavLink } from 'react-router-dom';
import { useActivities } from '../hooks/useActivities';
import { ArrowLeft, MapPin, Clock, Calendar, Tag } from 'lucide-react';
import { CinematicReveal } from '../components/cinematic/CinematicReveal';

const SOURCE_LABELS: Record<string, string> = {
  'archive-1': 'Spotify',
  'archive-2': 'Household',
  'archive-3': 'India Transactions',
};

export function ReceiptDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { receipts, loading, error } = useActivities();

  if (loading) {
    return (
      <div className="container-page py-20 flex items-center justify-center min-h-[60vh]" data-testid="receipt-detail">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" aria-hidden="true" />
          <p className="font-ibm-mono text-xs uppercase tracking-[0.2em] text-muted">Retrieving receipt dossier…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-page py-16" data-testid="receipt-detail">
        <p className="font-ibm-mono text-sm text-destructive">Failed to load data: {error}</p>
      </div>
    );
  }

  const receipt = receipts.find(r => r.id === id);

  if (!receipt) {
    return (
      <div className="container-narrow py-20 text-center" data-testid="receipt-detail">
        <p className="font-fraunces text-2xl text-foreground mb-4">Receipt record not found.</p>
        <NavLink to="/receipts" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full liquid-glass border border-white/10 text-xs font-ibm-mono uppercase tracking-wider text-foreground hover:bg-white/10 transition-colors">
          <ArrowLeft className="h-4 w-4 text-accent" aria-hidden="true" />
          Back to Explorer
        </NavLink>
      </div>
    );
  }

  // Find related receipts: same date or same category (exclude self)
  const related = receipts
    .filter(r => r.id !== receipt.id && (r.date === receipt.date || r.category === receipt.category))
    .slice(0, 6);

  const sourceLabel = SOURCE_LABELS[receipt.metadata.sourceDataset] || receipt.metadata.sourceDataset;

  return (
    <article className="container-narrow pt-8 pb-20 sm:pt-12 sm:pb-24" data-testid="receipt-detail">
      {/* Back */}
      <NavLink
        to="/receipts"
        className="inline-flex items-center gap-2 font-ibm-mono text-xs uppercase tracking-[0.16em] text-muted hover:text-foreground transition-colors mb-8"
        aria-label="Back to Receipt Explorer"
      >
        <ArrowLeft className="h-4 w-4 text-accent" aria-hidden="true" />
        Receipt Explorer
      </NavLink>

      {/* Main Card */}
      <div className="p-6 sm:p-8 mb-10 rounded-2xl liquid-glass border border-white/10" data-testid="receipt-metadata">
        <div className="flex items-start justify-between gap-4 mb-6">
          <CinematicReveal>
            <div>
              <span className="font-ibm-mono text-[10px] uppercase tracking-[0.2em] text-accent px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20 inline-block mb-3">
                {receipt.category}
              </span>
              <h1 className="font-fraunces text-3xl sm:text-4xl font-medium text-foreground leading-tight">
                {receipt.title}
              </h1>
              {receipt.description && (
                <p className="font-ui text-sm sm:text-base text-muted mt-2.5 leading-relaxed">{receipt.description}</p>
              )}
            </div>
          </CinematicReveal>
        </div>

        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-5 pt-6 border-t border-white/10">
          <div>
            <dt className="font-ibm-mono text-[10px] uppercase tracking-[0.16em] text-muted flex items-center gap-1.5 mb-1">
              <Calendar className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
              Date
            </dt>
            <dd className="font-ibm-mono text-sm text-foreground">{receipt.date || 'Date unavailable'}</dd>
          </div>

          <div>
            <dt className="font-ibm-mono text-[10px] uppercase tracking-[0.16em] text-muted flex items-center gap-1.5 mb-1">
              <Clock className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
              Time
            </dt>
            <dd className="font-ibm-mono text-sm text-foreground">{receipt.time || 'Time unavailable'}</dd>
          </div>

          {receipt.location && (
            <div>
              <dt className="font-ibm-mono text-[10px] uppercase tracking-[0.16em] text-muted flex items-center gap-1.5 mb-1">
                <MapPin className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                Location
              </dt>
              <dd className="font-ui text-sm text-foreground">
                {[receipt.location.city, receipt.location.name].filter(Boolean).join(', ') || 'Location unavailable'}
              </dd>
            </div>
          )}

          <div>
            <dt className="font-ibm-mono text-[10px] uppercase tracking-[0.16em] text-muted mb-1">Source</dt>
            <dd className="font-ibm-mono text-sm text-foreground">{sourceLabel}</dd>
          </div>

          {receipt.metadata.amount !== undefined && (
            <div>
              <dt className="font-ibm-mono text-[10px] uppercase tracking-[0.16em] text-muted mb-1">Amount</dt>
              <dd className="font-ibm-mono text-sm text-foreground">
                {receipt.metadata.currency || '$'}{Number(receipt.metadata.amount).toFixed(2)}
              </dd>
            </div>
          )}

          {receipt.metadata.artist && (
            <div>
              <dt className="font-ibm-mono text-[10px] uppercase tracking-[0.16em] text-muted mb-1">Artist</dt>
              <dd className="font-ui text-sm text-foreground">{receipt.metadata.artist}</dd>
            </div>
          )}

          {receipt.metadata.merchant && (
            <div>
              <dt className="font-ibm-mono text-[10px] uppercase tracking-[0.16em] text-muted mb-1">Merchant</dt>
              <dd className="font-ui text-sm text-foreground">{receipt.metadata.merchant}</dd>
            </div>
          )}

          {receipt.metadata.durationMinutes !== undefined && (
            <div>
              <dt className="font-ibm-mono text-[10px] uppercase tracking-[0.16em] text-muted mb-1">Duration</dt>
              <dd className="font-ibm-mono text-sm text-foreground">{receipt.metadata.durationMinutes.toFixed(1)} min</dd>
            </div>
          )}
        </dl>

        {receipt.tags.length > 0 && (
          <div className="mt-5 pt-5 border-t border-white/10">
            <p className="font-ibm-mono text-[10px] uppercase tracking-[0.16em] text-muted flex items-center gap-1.5 mb-2.5">
              <Tag className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
              Tags
            </p>
            <div className="flex flex-wrap gap-2">
              {receipt.tags.map(tag => (
                <span key={tag} className="font-ibm-mono text-xs px-2.5 py-1 rounded-md bg-surface text-muted border border-white/5">{tag}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Related Receipts */}
      <section aria-labelledby="related-heading" data-testid="related-receipts">
        <div className="font-ibm-mono text-[10px] tracking-[0.2em] uppercase text-accent mb-1">
          ASSOCIATED TIMESTAMPS
        </div>
        <h2 id="related-heading" className="font-fraunces text-2xl font-medium text-foreground mb-4">
          Related Receipts
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" data-testid="connected-receipts">
          {related.length > 0 ? (
            related.map(r => (
              <NavLink
                key={r.id}
                to={`/receipts/${r.id}`}
                className="p-3.5 rounded-xl liquid-glass border border-white/10 flex items-center gap-3 hover:border-accent/40 transition-all group"
              >
                <span className="font-ibm-mono text-[9px] uppercase tracking-wider text-accent shrink-0">{r.category}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-fraunces text-sm font-medium text-foreground truncate group-hover:text-accent transition-colors">
                    {r.title}
                  </p>
                  <p className="font-ibm-mono text-[10px] text-muted">{r.date}</p>
                </div>
              </NavLink>
            ))
          ) : (
            <p className="font-ui text-xs text-muted col-span-2 py-4">No direct co-occurring receipts discovered.</p>
          )}
        </div>
      </section>
    </article>
  );
}
