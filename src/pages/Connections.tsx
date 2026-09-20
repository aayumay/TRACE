import { useState, useMemo, useRef, useCallback } from 'react';
import { useActivities } from '../hooks/useActivities';
import { findConnections } from '../lib/connectionEngine';
import type { LifeReceipt } from '../types/receipt';
import { Info, RefreshCw, GitMerge } from 'lucide-react';
import { CinematicReveal } from '../components/cinematic/CinematicReveal';

interface Node {
  id: string;
  receipt: LifeReceipt;
  x: number;
  y: number;
  connections: number;
}

export function ConnectionsPage() {
  const { receipts, loading, error } = useActivities();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const connections = useMemo(() => {
    if (receipts.length === 0) return [];
    return findConnections(receipts.slice(0, 500));
  }, [receipts]);

  // Build node set from connected receipts only (max 120 nodes for performance)
  const { nodes, edges } = useMemo(() => {
    if (connections.length === 0) return { nodes: [], edges: [] };

    const connectedIds = new Set<string>();
    const usedConnections = connections.slice(0, 200);
    for (const c of usedConnections) {
      connectedIds.add(c.sourceReceiptId);
      connectedIds.add(c.targetReceiptId);
    }

    const connectedReceipts = receipts.filter(r => connectedIds.has(r.id)).slice(0, 120);
    const connectionCount = new Map<string, number>();
    for (const c of usedConnections) {
      connectionCount.set(c.sourceReceiptId, (connectionCount.get(c.sourceReceiptId) || 0) + 1);
      connectionCount.set(c.targetReceiptId, (connectionCount.get(c.targetReceiptId) || 0) + 1);
    }

    // Deterministic positioning — spiral layout based on connection strength
    const W = 800, H = 600;
    const nodeList: Node[] = connectedReceipts.map((r, i) => {
      const angle = (i / connectedReceipts.length) * Math.PI * 2 * 3;
      const radiusFactor = 1 - (i / connectedReceipts.length) * 0.6;
      const radius = Math.min(W, H) * 0.4 * radiusFactor;
      return {
        id: r.id,
        receipt: r,
        x: W / 2 + Math.cos(angle) * radius,
        y: H / 2 + Math.sin(angle) * radius * 0.7,
        connections: connectionCount.get(r.id) || 0,
      };
    });

    return { nodes: nodeList, edges: usedConnections };
  }, [connections, receipts]);

  const selectedReceipt = selectedId ? receipts.find(r => r.id === selectedId) : null;
  const selectedConnections = selectedId
    ? edges.filter(e => e.sourceReceiptId === selectedId || e.targetReceiptId === selectedId)
    : [];

  const connectedToSelected = new Set(
    selectedConnections.flatMap(c => [c.sourceReceiptId, c.targetReceiptId])
  );

  const handleReset = useCallback(() => {
    setSelectedId(null);
    setHoveredId(null);
  }, []);

  if (loading) {
    return (
      <div className="container-page py-20 flex items-center justify-center min-h-[60vh]" data-testid="connection-explorer">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" aria-hidden="true" />
          <p className="font-ibm-mono text-xs uppercase tracking-[0.2em] text-muted">Calculating moment graph synapses…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-page py-16" data-testid="connection-explorer">
        <p className="font-ibm-mono text-sm text-destructive">Failed to load data: {error}</p>
      </div>
    );
  }

  return (
    <div className="container-page pt-8 pb-20 sm:pt-12 sm:pb-24" data-testid="connection-explorer">
      <CinematicReveal as="header" className="mb-8">
        <div className="font-ibm-mono text-[10px] tracking-[0.24em] uppercase text-accent mb-2 flex items-center gap-1.5">
          <GitMerge className="w-3.5 h-3.5" />
          <span>SYNTACTIC GRAPH & TOPOLOGY</span>
        </div>
        <h1 className="font-fraunces text-4xl sm:text-5xl font-medium tracking-tight text-foreground mb-3">
          Connection Constellation
        </h1>
        <p className="font-ui text-sm sm:text-base text-muted max-w-2xl leading-relaxed">
          Deterministic relationships between life events derived from temporal proximity, co-occurring geography, and habit signatures.
        </p>
      </CinematicReveal>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* SVG Constellation */}
        <div className="flex-1 relative">
          <div className="p-4 rounded-2xl liquid-glass border border-white/10 overflow-hidden aspect-[4/3] relative">
            <svg
              ref={svgRef}
              viewBox="0 0 800 600"
              className="w-full h-full"
              aria-label="Connection constellation graph"
              role="img"
              data-testid="connection-constellation"
            >
              <defs>
                <filter id="nodeGlow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Edges */}
              {edges.slice(0, 200).map(edge => {
                const src = nodes.find(n => n.id === edge.sourceReceiptId);
                const tgt = nodes.find(n => n.id === edge.targetReceiptId);
                if (!src || !tgt) return null;
                const isHighlighted = selectedId && connectedToSelected.has(src.id) && connectedToSelected.has(tgt.id);
                return (
                  <line
                    key={edge.id}
                    x1={src.x} y1={src.y}
                    x2={tgt.x} y2={tgt.y}
                    stroke={isHighlighted ? 'hsl(var(--accent))' : 'rgba(255, 255, 255, 0.12)'}
                    strokeWidth={isHighlighted ? 2 : 0.6}
                    opacity={selectedId ? (isHighlighted ? 0.9 : 0.1) : 0.35}
                    strokeDasharray={isHighlighted ? undefined : '2, 3'}
                    data-testid="connection-edge"
                  />
                );
              })}

              {/* Nodes */}
              {nodes.map(node => {
                const isSelected = node.id === selectedId;
                const isConnected = selectedId ? connectedToSelected.has(node.id) : false;
                const isDimmed = selectedId && !isSelected && !isConnected;
                const r = Math.min(2.5 + node.connections * 0.5, 7.5);

                return (
                  <g key={node.id}>
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={r + 6}
                      fill="transparent"
                      className="cursor-pointer"
                      onClick={() => setSelectedId(node.id === selectedId ? null : node.id)}
                      onMouseEnter={() => setHoveredId(node.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      role="button"
                      aria-label={`Receipt: ${node.receipt.title}`}
                      tabIndex={0}
                      onKeyDown={e => e.key === 'Enter' && setSelectedId(node.id === selectedId ? null : node.id)}
                      data-testid="connection-node"
                    />
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={r}
                      fill={isSelected ? 'hsl(var(--accent))' : isConnected ? 'hsl(var(--accent) / 0.7)' : 'hsl(var(--foreground))'}
                      opacity={isDimmed ? 0.12 : isSelected ? 1 : 0.7}
                      filter={isSelected ? 'url(#nodeGlow)' : undefined}
                      className="transition-all pointer-events-none"
                    />
                    {(isSelected || node.id === hoveredId) && (
                      <text
                        x={node.x}
                        y={node.y - r - 5}
                        textAnchor="middle"
                        fontSize="9"
                        fill="hsl(var(--foreground))"
                        fontFamily="IBM Plex Mono"
                        opacity={0.95}
                        className="pointer-events-none"
                      >
                        {node.receipt.title.slice(0, 22)}{node.receipt.title.length > 22 ? '…' : ''}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Controls */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={handleReset}
                className="p-2 rounded-full liquid-glass border border-white/10 text-muted hover:text-foreground transition-colors"
                aria-label="Reset constellation view"
                data-testid="connection-reset"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-5 text-xs font-ibm-mono text-muted tracking-wider" data-testid="connection-legend">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-accent" aria-hidden="true" /> Selected node
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-foreground opacity-60" aria-hidden="true" /> Connected node
            </span>
            <span className="flex items-center gap-2">
              <span className="w-4 h-0.5 bg-accent" aria-hidden="true" /> Active edge
            </span>
            <span className="flex items-center gap-2">
              <span className="w-4 h-0.5 bg-white/20" aria-hidden="true" /> Latent edge
            </span>
          </div>
        </div>

        {/* Inspector Panel */}
        <div className="xl:w-88 shrink-0" data-testid="connection-inspector">
          {selectedReceipt ? (
            <div className="p-6 rounded-2xl liquid-glass border border-white/10 space-y-4">
              <div>
                <span className="font-ibm-mono text-[9px] uppercase tracking-widest text-accent px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 mb-2 inline-block">
                  {selectedReceipt.category}
                </span>
                <h2 className="font-fraunces text-xl font-medium text-foreground leading-snug">
                  {selectedReceipt.title}
                </h2>
                {selectedReceipt.description && (
                  <p className="font-ui text-xs text-muted mt-1.5 line-clamp-2 leading-relaxed">{selectedReceipt.description}</p>
                )}
                <p className="font-ibm-mono text-[10px] text-muted/70 mt-2">{selectedReceipt.date} · {selectedReceipt.time}</p>
              </div>

              {selectedConnections.length > 0 && (
                <div className="pt-3 border-t border-white/10">
                  <h3 className="font-ibm-mono text-[10px] uppercase tracking-[0.16em] text-muted mb-2.5">
                    Connected Synapses ({selectedConnections.length})
                  </h3>
                  <ul className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {selectedConnections.slice(0, 6).map(conn => {
                      const otherId = conn.sourceReceiptId === selectedId ? conn.targetReceiptId : conn.sourceReceiptId;
                      const other = receipts.find(r => r.id === otherId);
                      return (
                        <li key={conn.id} className="p-3 bg-surface/80 border border-white/5 rounded-xl">
                          <p className="font-fraunces text-sm font-medium text-foreground mb-0.5">
                            {other?.title || 'Unknown'}
                          </p>
                          <p className="font-ui text-xs text-accent" data-testid="connection-reason">
                            {conn.reason}
                          </p>
                          {conn.evidence.map((ev, i) => (
                            <p key={i} className="font-ibm-mono text-[9px] text-muted/80 mt-0.5">{ev}</p>
                          ))}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 rounded-2xl liquid-glass border border-white/10 flex flex-col items-center justify-center min-h-56 text-center">
              <Info className="h-8 w-8 text-muted/40 mb-3" aria-hidden="true" />
              <p className="font-fraunces text-lg text-foreground mb-1">Select A Node</p>
              <p className="font-ui text-xs text-muted max-w-[200px] leading-relaxed">
                Click any constellation node to inspect its multi-layer connections and algorithmic evidence.
              </p>
            </div>
          )}

          <div className="mt-4 p-4 rounded-xl bg-surface/50 border border-white/5">
            <p className="font-ibm-mono text-[10px] uppercase tracking-[0.16em] text-muted mb-1">Graph Metrics</p>
            <p className="font-fraunces text-base text-foreground font-medium">{nodes.length} nodes · {edges.slice(0, 200).length} connections</p>
            <p className="font-ui text-xs text-muted/70 mt-1">Rendered with deterministic force positioning.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
