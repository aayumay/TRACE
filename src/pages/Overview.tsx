import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useActivities } from '../hooks/useActivities';
import { 
  calculateLifeStats, 
  getCategoryDistribution, 
  getTimeOfDayPattern, 
  getTopLocations, 
  getActivityByDate,
  getKeyMoments,
  formatNumber,
  formatDate 
} from '../lib/analytics';
import { findConnections } from '../lib/connectionEngine';
import { MapPin, Zap, Activity, Calendar, Sparkles } from 'lucide-react';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 28, filter: 'blur(8px)', scale: 0.99 },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    scale: 1,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

export function OverviewPage() {
  const { receipts, loading, error } = useActivities();

  const stats = useMemo(() => calculateLifeStats(receipts), [receipts]);
  const connections = useMemo(() => findConnections(receipts.slice(0, 500)), [receipts]);
  const connectionCount = connections.length;
  const connectionMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of connections) {
      map.set(c.sourceReceiptId, (map.get(c.sourceReceiptId) || 0) + 1);
      map.set(c.targetReceiptId, (map.get(c.targetReceiptId) || 0) + 1);
    }
    return map;
  }, [connections]);
  
  const categoryDist = useMemo(() => getCategoryDistribution(receipts), [receipts]);
  const timePattern = useMemo(() => getTimeOfDayPattern(receipts), [receipts]);
  const topLocations = useMemo(() => getTopLocations(receipts, 8), [receipts]);
  const activityByDate = useMemo(() => getActivityByDate(receipts), [receipts]);
  const keyMoments = useMemo(() => getKeyMoments(receipts, connectionMap, 3), [receipts, connectionMap]);

  const activeDaysCount = stats.activeDays || 1;
  const totalReceipts = stats.totalReceipts;
  const avgPerDay = Math.round(totalReceipts / activeDaysCount);

  if (loading) {
    return (
      <div className="container-page py-20 flex items-center justify-center min-h-[60vh]" data-testid="overview-page">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" aria-hidden="true" />
          <p className="font-ibm-mono text-xs uppercase tracking-[0.2em] text-muted">Analyzing digital life archive…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-page py-16" data-testid="overview-page">
        <p className="font-ibm-mono text-sm text-destructive">Failed to load data: {error}</p>
      </div>
    );
  }

  return (
    <div className="container-page pt-8 pb-20 sm:pt-12 sm:pb-24" data-testid="overview-page">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Dossier Header */}
        <motion.div variants={itemVariants} className="mb-10 lg:mb-14">
          <header className="max-w-3xl">
            <div className="inline-flex items-center gap-2 font-ibm-mono text-[10px] tracking-[0.24em] uppercase text-accent mb-3">
              <span>ARCHIVE DOSSIER · TELEMETRY</span>
            </div>
            <h1 className="font-fraunces text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-foreground mb-4 leading-[1.05]">
              Life Overview
            </h1>
            <p className="font-ui text-base sm:text-lg text-muted leading-relaxed max-w-2xl text-balance">
              A curated snapshot of your digital archive. 
              <span className="text-foreground font-medium"> {formatNumber(totalReceipts)} moments</span> across <span className="text-foreground font-medium">{activeDaysCount} days</span>, 
              spanning from <span className="font-ibm-mono text-sm text-foreground">{formatDate(stats.dateRange.start)}</span> to <span className="font-ibm-mono text-sm text-foreground">{formatDate(stats.dateRange.end)}</span>.
            </p>
          </header>
        </motion.div>

        {/* Hero Stat Cards */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6 mb-10 lg:mb-14"
          data-testid="life-stats"
        >
          <StatCard
            icon={<Activity className="h-5 w-5" />}
            label="TOTAL MOMENTS"
            value={formatNumber(totalReceipts)}
            description={`${activeDaysCount} active days · ~${avgPerDay}/day average`}
          />
          <StatCard
            icon={<Calendar className="h-5 w-5" />}
            label="TIME SPAN"
            value={stats.dateRange.start && stats.dateRange.end ? `${Math.max(1, Math.round((new Date(stats.dateRange.end).getTime() - new Date(stats.dateRange.start).getTime()) / (1000 * 60 * 60 * 24 * 365.25)))} years` : '11 years'}
            description={stats.dateRange.start && stats.dateRange.end ? `${formatDate(stats.dateRange.start)} – ${formatDate(stats.dateRange.end)}` : 'July 7, 2013 – December 15, 2024'}
          />
          <StatCard
            icon={<Zap className="h-5 w-5" />}
            label="CONNECTIONS FOUND"
            value={formatNumber(connectionCount)}
            description={totalReceipts > 0 ? `${Math.round(connectionCount / totalReceipts * 10) / 10} connections per moment` : '0 connections per moment'}
          />
        </motion.div>

        {/* Main Telemetry Visualizations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-10 lg:mb-14">
          {/* Activity Pulse Chart */}
          <motion.section
            variants={itemVariants}
            className="lg:col-span-2 p-6 sm:p-8 rounded-2xl liquid-glass border border-white/10 relative overflow-hidden group hover:border-accent/30 transition-all duration-300"
            data-testid="activity-pulse"
            aria-labelledby="activity-pulse-title"
          >
            <header className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 id="activity-pulse-title" className="font-fraunces text-2xl font-medium text-foreground">
                  Activity Pulse
                </h2>
                <p className="font-ui text-xs sm:text-sm text-muted mt-0.5">
                  Daily moment density across the entire timeline
                </p>
              </div>
              <span className="font-ibm-mono text-[10px] text-accent tracking-widest uppercase px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20 self-start sm:self-auto">
                130 MONTH TIMELINE
              </span>
            </header>
            <ActivityPulseChart data={activityByDate} />
          </motion.section>

          {/* Category Distribution */}
          <motion.section
            variants={itemVariants}
            className="p-6 sm:p-7 rounded-2xl liquid-glass border border-white/10 hover:border-accent/30 transition-all duration-300"
            data-testid="category-distribution"
            aria-labelledby="category-dist-title"
          >
            <header className="mb-6">
              <h2 id="category-dist-title" className="font-fraunces text-2xl font-medium text-foreground">
                Category Distribution
              </h2>
              <p className="font-ui text-xs sm:text-sm text-muted mt-0.5">
                Breakdown of moment types in your archive
              </p>
            </header>
            <CategoryDistributionChart data={categoryDist} />
          </motion.section>

          {/* Time of Day Pattern */}
          <motion.section
            variants={itemVariants}
            className="p-6 sm:p-7 rounded-2xl liquid-glass border border-white/10 hover:border-accent/30 transition-all duration-300"
            data-testid="time-of-day-pattern"
            aria-labelledby="time-pattern-title"
          >
            <header className="mb-6">
              <h2 id="time-pattern-title" className="font-fraunces text-2xl font-medium text-foreground">
                Time of Day Pattern
              </h2>
              <p className="font-ui text-xs sm:text-sm text-muted mt-0.5">
                When your digital life is most active
              </p>
            </header>
            <TimeOfDayChart data={timePattern} />
          </motion.section>

          {/* Top Locations */}
          <motion.section
            variants={itemVariants}
            className="lg:col-span-2 p-6 sm:p-7 rounded-2xl liquid-glass border border-white/10 hover:border-accent/30 transition-all duration-300"
            data-testid="top-locations"
            aria-labelledby="top-locations-title"
          >
            <header className="mb-6">
              <h2 id="top-locations-title" className="font-fraunces text-2xl font-medium text-foreground">
                Top Locations
              </h2>
              <p className="font-ui text-xs sm:text-sm text-muted mt-0.5">
                Places and regions that appear most frequently
              </p>
            </header>
            <TopLocationsChart data={topLocations} />
          </motion.section>
        </div>

        {/* Key Moments Section */}
        <motion.section
          variants={itemVariants}
          className="mb-10 lg:mb-14"
          data-testid="key-moments"
          aria-labelledby="key-moments-title"
        >
          <header className="mb-6">
            <div className="font-ibm-mono text-[10px] tracking-[0.24em] uppercase text-accent mb-1">
              HIGHEST DEGREE CENTRALITY
            </div>
            <h2 id="key-moments-title" className="font-fraunces text-2xl sm:text-3xl font-medium text-foreground">
              Key Moments
            </h2>
            <p className="font-ui text-sm text-muted">
              Moments with the most connections to other receipts in the archive
            </p>
          </header>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {keyMoments.map(({ receipt, connectionCount }) => (
              <motion.article
                key={receipt.id}
                whileHover={{ y: -4, scale: 1.015, transition: { duration: 0.25, ease: 'easeOut' } }}
                className="p-5 rounded-2xl liquid-glass border border-white/10 hover:border-accent/50 hover:shadow-[0_0_24px_rgba(155,107,255,0.2)] transition-all group"
                data-testid={`key-moment-${receipt.id}`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent group-hover:bg-accent/20 group-hover:scale-105 transition-all">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="font-ibm-mono text-[10px] text-accent font-medium capitalize">
                        {receipt.category}
                      </span>
                      <span className="text-white/20 text-xs">•</span>
                      <span className="font-ibm-mono text-[10px] text-muted">{formatDate(receipt.date)}</span>
                    </div>
                    <h3 className="font-fraunces text-base font-medium text-foreground truncate group-hover:text-white transition-colors">{receipt.title}</h3>
                    <p className="font-ui text-xs text-muted mt-1 line-clamp-2 leading-relaxed">{receipt.description}</p>
                    {receipt.location?.city && (
                      <p className="font-ibm-mono text-[10px] text-muted/70 mt-2 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-accent" /> {receipt.location.city}
                      </p>
                    )}
                  </div>
                  <div className="text-right pl-2 shrink-0">
                    <p className="font-ibm-mono text-xl font-medium text-accent">{connectionCount}</p>
                    <p className="font-ibm-mono text-[9px] text-muted uppercase tracking-wider">EDGES</p>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </motion.section>

        {/* Opening Insight Card */}
        <motion.section
          variants={itemVariants}
          whileHover={{ scale: 1.005, transition: { duration: 0.3 } }}
          className="p-6 lg:p-8 rounded-2xl accent-glass border border-accent/30 relative overflow-hidden"
          data-testid="opening-insight"
        >
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center text-accent shadow-[0_0_16px_rgba(155,107,255,0.3)]">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <div className="font-ibm-mono text-[10px] tracking-[0.24em] uppercase text-accent mb-1.5 font-medium">
                AUTOMATED SYNTHESIS
              </div>
              <h2 className="font-fraunces text-2xl sm:text-3xl font-medium text-foreground mb-2.5">Opening Insight</h2>
              <p className="font-ui text-sm sm:text-base text-muted leading-relaxed">
                Your digital life centers around <strong className="text-foreground font-medium">{getCategoryLabel(stats.dominantCategory).toLowerCase()}</strong> 
                ({stats.categoryCounts[stats.dominantCategory]} moments{totalReceipts > 0 ? `, ${Math.round(stats.categoryCounts[stats.dominantCategory] / totalReceipts * 100)}% of all activity` : ''}). 
                The most connected location is <strong className="text-foreground font-medium">{stats.topLocation}</strong>. 
                Activity peaks during the <strong className="text-foreground font-medium">{stats.busiestPeriod.toLowerCase()}</strong>.
              </p>
            </div>
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
}

function StatCard({ icon, label, value, description }: { icon: React.ReactNode; label: string; value: string | number; description: string }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.015, transition: { duration: 0.25, ease: 'easeOut' } }}
      className="p-6 rounded-2xl liquid-glass border border-white/10 hover:border-accent/40 hover:shadow-[0_0_24px_rgba(155,107,255,0.18)] transition-all group"
    >
      <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-4 group-hover:scale-110 group-hover:bg-accent/20 transition-all">
        {icon}
      </div>
      <p className="font-fraunces text-3xl sm:text-4xl font-medium text-foreground tracking-tight">{value}</p>
      <p className="font-ibm-mono text-[10px] text-muted mt-1 uppercase tracking-[0.18em]">{label}</p>
      <p className="font-ui text-xs text-muted/70 mt-2.5">{description}</p>
    </motion.div>
  );
}

function ActivityPulseChart({ data }: { data: { date: string; count: number }[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const maxCount = Math.max(...data.map(d => d.count), 1);
  
  const pathD = useMemo(() => {
    if (data.length === 0) return '';
    return data
      .map((d, i) => {
        const x = data.length > 1 ? (i / (data.length - 1)) * 1000 : 500;
        const y = 115 - (d.count / maxCount) * 95;
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  }, [data, maxCount]);

  const areaD = useMemo(() => {
    if (!pathD) return '';
    return `${pathD} L 1000 120 L 0 120 Z`;
  }, [pathD]);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const idx = Math.min(data.length - 1, Math.floor(xRatio * data.length));
    setHoveredIdx(idx);
  };

  const handleMouseLeave = () => {
    setHoveredIdx(null);
  };

  return (
    <div className="relative h-44 sm:h-52" role="img" aria-label="Activity pulse chart showing daily moment density">
      <svg
        viewBox="0 0 1000 125"
        preserveAspectRatio="none"
        className="w-full h-full cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          <linearGradient id="pulseGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9b6bff" stopOpacity="0.45" />
            <stop offset="60%" stopColor="#9b6bff" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#9b6bff" stopOpacity="0" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {/* Animated Area Fill */}
        <motion.path
          d={areaD}
          fill="url(#pulseGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
        />

        {/* Animated Stroke Line */}
        <motion.path
          d={pathD}
          stroke="#9b6bff"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Timeline month grid lines */}
        {data.filter((_, i) => i % Math.ceil(data.length / 7) === 0).map((d, i) => {
          const x = data.length > 1 ? (data.indexOf(d) / (data.length - 1)) * 1000 : 500;
          return (
            <g key={i}>
              <line x1={x} y1={0} x2={x} y2={110} stroke="rgba(255, 255, 255, 0.08)" strokeWidth="0.5" strokeDasharray="2,4" />
              <text x={x} y={122} textAnchor="middle" fontSize="7.5" fill="#9d98b3" fontFamily="IBM Plex Mono">
                {new Date(d.date).toLocaleDateString('en-US', { month: 'short', year: i === 0 || i === 6 ? 'numeric' : undefined })}
              </text>
            </g>
          );
        })}

        {/* Hover Laser Line & Highlight Dot */}
        {hoveredIdx !== null && data[hoveredIdx] && (
          <g>
            <line
              x1={(hoveredIdx / (data.length - 1)) * 1000}
              y1={0}
              x2={(hoveredIdx / (data.length - 1)) * 1000}
              y2={120}
              stroke="#ffffff"
              strokeWidth="1"
              strokeDasharray="2,2"
              opacity={0.8}
            />
            <circle
              cx={(hoveredIdx / (data.length - 1)) * 1000}
              cy={115 - (data[hoveredIdx].count / maxCount) * 95}
              r="4"
              fill="#9b6bff"
              stroke="#ffffff"
              strokeWidth="1.5"
            />
          </g>
        )}
      </svg>

      {/* Hover Floating Tooltip */}
      <AnimatePresence>
        {hoveredIdx !== null && data[hoveredIdx] && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="absolute top-2 right-4 px-3 py-1.5 rounded-lg bg-[#140f26]/90 border border-accent/40 backdrop-blur-md text-xs font-ibm-mono pointer-events-none shadow-lg z-20 flex items-center gap-2"
          >
            <span className="text-white font-medium">{formatDate(data[hoveredIdx].date)}</span>
            <span className="text-accent font-bold">{data[hoveredIdx].count} moments</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CategoryDistributionChart({ data }: { data: { category: string; count: number; percentage: number }[] }) {
  const dotColors: Record<string, string> = {
    music: '#9b6bff',
    purchase: '#a78bfa',
    place: '#818cf8',
    note: '#6366f1',
    movie: '#4f46e5',
    event: '#c084fc',
    photo: '#e879f9',
    message: '#f472b6',
    search: '#a855f7',
  };
  
  return (
    <div className="space-y-4" role="img" aria-label="Category distribution chart">
      {data.map((item, i) => (
        <div key={item.category} className="group">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2.5">
              <span 
                className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]" 
                style={{ backgroundColor: dotColors[item.category] || '#9b6bff', color: dotColors[item.category] || '#9b6bff' }}
                aria-hidden="true"
              />
              <span className="font-ui text-xs sm:text-sm font-medium text-foreground capitalize group-hover:text-white transition-colors">
                {item.category}
              </span>
            </div>
            <span className="font-ibm-mono text-xs text-muted group-hover:text-foreground transition-colors">
              {item.count} <span className="text-muted/60">({item.percentage}%)</span>
            </span>
          </div>
          <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${item.percentage}%` }}
              transition={{ duration: 1.0, delay: 0.15 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="h-full rounded-full bg-gradient-to-r from-accent/60 to-accent"
              style={{
                background: `linear-gradient(90deg, ${dotColors[item.category] || '#9b6bff'}88 0%, ${dotColors[item.category] || '#9b6bff'} 100%)`
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function TimeOfDayChart({ data }: { data: { hour: number; count: number }[] }) {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  const [hoveredHour, setHoveredHour] = useState<{ hour: number; count: number } | null>(null);
  
  return (
    <div className="h-48 relative" role="img" aria-label="Time of day activity pattern">
      <svg viewBox="0 0 240 160" preserveAspectRatio="none" className="w-full h-full">
        <rect x="0" y="0" width="240" height="160" fill="transparent" />
        
        {/* Horizontal reference lines */}
        <g stroke="rgba(255, 255, 255, 0.08)" strokeWidth="0.5">
          {[0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = 140 - ratio * 120;
            return <line key={i} x1="0" y1={y} x2="240" y2={y} strokeDasharray="2,3" />;
          })}
        </g>
        
        {/* Animated Bar Columns */}
        <g>
          {data.map((d, i) => {
            const x = i * 10;
            const barHeight = Math.max(2, (d.count / maxCount) * 116);
            const y = 140 - barHeight;
            const isPeak = d.count === maxCount;
            const isLateNight = d.hour >= 22 || d.hour <= 5;
            
            return (
              <g 
                key={i}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredHour(d)}
                onMouseLeave={() => setHoveredHour(null)}
              >
                <motion.rect
                  x={x + 1}
                  y={y}
                  width={8}
                  height={barHeight}
                  fill={isPeak ? '#b894ff' : isLateNight ? '#9b6bff' : 'rgba(155, 107, 255, 0.45)'}
                  rx={2}
                  initial={{ height: 0, y: 140 }}
                  animate={{ height: barHeight, y }}
                  transition={{ duration: 0.8, delay: 0.1 + i * 0.02, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ fill: '#ffffff', opacity: 1 }}
                />
                {i % 4 === 0 && (
                  <text 
                    x={x + 5} 
                    y={154} 
                    textAnchor="middle" 
                    fontSize="7" 
                    fill="#9d98b3" 
                    fontFamily="IBM Plex Mono"
                  >
                    {d.hour === 0 ? '12a' : d.hour < 12 ? `${d.hour}a` : d.hour === 12 ? '12p' : `${d.hour - 12}p`}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Hover tooltip for hour */}
      <AnimatePresence>
        {hoveredHour && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-1 right-2 px-2.5 py-1 rounded bg-[#140f26]/90 border border-accent/40 text-[10px] font-ibm-mono text-foreground pointer-events-none"
          >
            {hoveredHour.hour === 0 ? '12 AM' : hoveredHour.hour < 12 ? `${hoveredHour.hour} AM` : hoveredHour.hour === 12 ? '12 PM' : `${hoveredHour.hour - 12} PM`}: <span className="text-accent font-bold">{hoveredHour.count} moments</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TopLocationsChart({ data }: { data: { city: string; count: number; category: string }[] }) {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4" role="list" aria-label="Top locations list">
      {data.map((item, i) => (
        <motion.div
          key={item.city}
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15 + i * 0.04, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ scale: 1.015, x: 3, transition: { duration: 0.2 } }}
          className="p-3.5 rounded-xl bg-surface/60 border border-white/5 hover:border-accent/30 hover:bg-surface/80 flex items-center gap-3 group transition-all"
          role="listitem"
        >
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center text-accent group-hover:scale-110 group-hover:bg-accent/20 transition-all">
            <MapPin className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-ui text-xs sm:text-sm font-medium text-foreground truncate group-hover:text-white transition-colors">{item.city}</p>
            <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden mt-1.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(item.count / maxCount) * 100}%` }}
                transition={{ duration: 0.8, delay: 0.25 + i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full bg-gradient-to-r from-accent/50 to-accent"
              />
            </div>
          </div>
          <span className="font-ibm-mono text-xs text-muted group-hover:text-accent font-medium transition-colors whitespace-nowrap">{item.count}</span>
        </motion.div>
      ))}
    </div>
  );
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
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