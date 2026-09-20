import { useRef, useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  ArrowRight,
  Search,
  Sparkles,
  Clock,
  Zap,
  ChevronRight,
  Menu,
  X,
  Activity,
  Layers,
  Compass,
  ChevronDown,
} from 'lucide-react';
import { BrandNewDayCanvas } from '../components/brandNewDay/BrandNewDayCanvas';
import { useActivities } from '../hooks/useActivities';
import { calculateLifeStats, formatNumber } from '../lib/analytics';

const NAV_ITEMS = [
  { to: '/overview', label: 'OVERVIEW' },
  { to: '/receipts', label: 'RECEIPTS' },
  { to: '/connections', label: 'CONNECTIONS' },
  { to: '/stories', label: 'STORIES' },
  { to: '/journey', label: 'JOURNEY' },
  { to: '/insights', label: 'INSIGHTS' },
];

export function LandingScreen() {
  const { receipts } = useActivities();
  const stats = calculateLifeStats(receipts);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Mutable refs for high-performance 60fps WebGL rendering without React re-renders
  const scrollProgressRef = useRef<number>(0);
  const mouseXRef = useRef<number>(0);
  const mouseYRef = useRef<number>(0);

  // HUD active act tracking
  const [currentAct, setCurrentAct] = useState<number>(1);
  const [actLabel, setActLabel] = useState<string>('ACT 01 / THE SOVEREIGN WEB');

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          const p = maxScroll > 0 ? Math.max(0, Math.min(1, window.scrollY / maxScroll)) : 0;
          scrollProgressRef.current = p;

          // Compute active act index & label
          let act = 1;
          let label = 'ACT 01 / THE SOVEREIGN WEB';

          if (p < 0.17) {
            act = 1;
            label = 'ACT 01 / THE SOVEREIGN WEB';
          } else if (p < 0.34) {
            act = 2;
            label = 'ACT 02 / 11 YEARS OF SILK';
          } else if (p < 0.52) {
            act = 3;
            label = 'ACT 03 / ENTERING THE WEB';
          } else if (p < 0.69) {
            act = 4;
            label = 'ACT 04 / TIME TRAJECTORY';
          } else if (p < 0.85) {
            act = 5;
            label = 'ACT 05 / REVERENCE OF CHAPTERS';
          } else {
            act = 6;
            label = 'ACT 06 / THE ANCIENT ARCHIVE';
          }

          setCurrentAct(act);
          setActLabel(label);

          // Smooth 60fps DOM text window cross-fades per Act
          const actEls = document.querySelectorAll<HTMLElement>('[data-act-window]');
          actEls.forEach((el) => {
            const center = parseFloat(el.getAttribute('data-act-center') || '0');
            const span = parseFloat(el.getAttribute('data-act-span') || '0.15');
            const dist = Math.abs(p - center);
            const alpha = Math.max(0, Math.min(1, 1 - dist / span));
            el.style.opacity = String(alpha);
            el.style.pointerEvents = alpha > 0.4 ? 'auto' : 'none';
            el.style.transform = `translateY(${(1 - alpha) * 24}px) scale(${0.96 + alpha * 0.04})`;
          });

          ticking = false;
        });
        ticking = true;
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      mouseXRef.current = (e.clientX / window.innerWidth) * 2 - 1;
      mouseYRef.current = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches.length > 0) {
        mouseXRef.current = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
        mouseYRef.current = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });

    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative bg-[#080611] text-white select-none"
      data-testid="landing-screen"
      role="main"
      style={{ height: '1400vh' }}
    >
      {/* ─────────────────────────────────────────────────────────────
          0. 3D BLENDER SPIDER & ZOOM-IN SPIDERWEB WEBGL CANVAS (z-0)
         ───────────────────────────────────────────────────────────── */}
      <BrandNewDayCanvas
        scrollProgress={scrollProgressRef}
        mouseX={mouseXRef}
        mouseY={mouseYRef}
      />

      {/* ─────────────────────────────────────────────────────────────
          1. FIXED VIEWPORT CONTAINER (Sticky 100vh stage)
         ───────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 h-screen h-[100dvh] w-full overflow-hidden pointer-events-none flex flex-col justify-between">
        {/* Bottom optical blur scrim */}
        <div
          className="fixed inset-0 z-[1] pointer-events-none backdrop-blur-xl"
          style={{
            WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 45%)',
            maskImage: 'linear-gradient(to top, black 0%, transparent 45%)',
          }}
        />

        {/* Violet floor glow */}
        <div
          className="fixed inset-0 z-[1] pointer-events-none"
          style={{
            background:
              'radial-gradient(130% 75% at 50% 100%, rgba(155, 107, 255, 0.14), transparent 55%)',
          }}
        />

        {/* Grain overlay */}
        <div
          className="fixed inset-0 z-[2] pointer-events-none opacity-5 mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* ─────────────────────────────────────────────────────────────
            2. TOP PILL NAVBAR (Matching exact uploaded design)
           ───────────────────────────────────────────────────────────── */}
        <header
          className="relative z-50 flex items-center justify-between px-4 sm:px-6 md:px-12 py-4 md:py-6 pointer-events-auto"
          aria-label="Main Navigation"
        >
          {/* Brand Wordmark */}
          <NavLink
            to="/"
            className="flex items-center gap-3 animate-blur-fade-up group"
            style={{ animationDelay: '0ms' }}
            aria-label="TRACE – Home"
          >
            <span className="font-serif text-2xl tracking-[0.04em] text-white font-medium group-hover:text-white/90 transition-colors">
              TRACE
            </span>
            <span className="w-px h-3 bg-white/20 hidden sm:inline-block" aria-hidden="true" />
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/45 hidden sm:inline-block">
              11-YEAR WEB
            </span>
          </NavLink>

          {/* Center Floating Pill Navbar (Matches uploaded UI screenshot) */}
          <nav
            className="hidden lg:flex items-center gap-1 px-1.5 py-1 rounded-full liquid-glass border border-white/10 shadow-2xl animate-blur-fade-up"
            style={{ animationDelay: '150ms' }}
            role="navigation"
            aria-label="Primary navigation bar"
          >
            {NAV_ITEMS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-[0.14em] transition-all duration-200 ${
                    isActive
                      ? 'bg-white/10 text-white shadow-inner font-medium'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Right Action: ARCHIVE badge + Explore button */}
          <div
            className="flex items-center gap-3 animate-blur-fade-up"
            style={{ animationDelay: '350ms' }}
          >
            <span className="rounded-full bg-[#9b6bff] text-white text-[11px] font-medium tracking-[0.14em] px-3.5 py-1 font-mono uppercase shadow-lg shadow-[#9b6bff]/20">
              ARCHIVE
            </span>

            <NavLink
              to="/overview"
              className="hidden sm:inline-flex items-center gap-2 rounded-full accent-glass px-5 md:px-6 py-2 text-sm text-white hover:text-white/90 transition-all group font-sans"
            >
              <span>Explore</span>
              <ChevronRight className="w-4 h-4 text-white/70 group-hover:translate-x-0.5 transition-transform" />
            </NavLink>

            {/* Mobile Hamburger toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-10 h-10 rounded-full liquid-glass flex items-center justify-center text-white relative transition-transform duration-300 active:scale-95"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              <div
                className={`transition-all duration-500 ${
                  mobileMenuOpen ? 'rotate-180 scale-100 opacity-100' : 'rotate-0 scale-100 opacity-100'
                }`}
              >
                {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </div>
            </button>
          </div>
        </header>

        {/* Mobile Drawer Dropdown */}
        {mobileMenuOpen && (
          <div
            className="lg:hidden fixed top-[72px] left-0 right-0 z-40 bg-[#080611]/95 backdrop-blur-2xl border-y border-white/10 shadow-2xl p-6 space-y-1 pointer-events-auto animate-slide-down"
            role="navigation"
          >
            {NAV_ITEMS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 rounded-lg text-xs font-mono uppercase tracking-widest text-white/70 hover:text-white hover:bg-white/5 transition-all"
              >
                {label}
              </NavLink>
            ))}
            <div className="pt-4 mt-4 border-t border-white/10 flex items-center justify-between">
              <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-white/50">
                11 YEARS WOVEN
              </span>
              <NavLink
                to="/overview"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex items-center gap-1.5 rounded-full accent-glass px-4 py-1.5 text-xs text-white"
              >
                <span>Explore Archive</span>
                <ChevronRight size={14} />
              </NavLink>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            3. SCROLLYTELLING EDITORIAL ACTS (Transitioning during zoom)
           ───────────────────────────────────────────────────────────── */}
        <div className="relative flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 md:px-12 flex items-center justify-center pointer-events-none">
          {/* ACT 01 — THE SOVEREIGN WEB */}
          <div
            data-act-window="1"
            data-act-center="0.08"
            data-act-span="0.12"
            className="absolute inset-0 flex flex-col justify-center max-w-2xl transition-transform duration-100 ease-out"
          >
            <div className="font-mono text-[11px] tracking-[0.3em] uppercase text-white/50 mb-4 animate-blur-fade-up flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#d6c4ff]" />
              <span>11 YEARS WOVEN · {stats.totalReceipts ? formatNumber(stats.totalReceipts) : '162,588'} RECEIPTS · 130 MONTHS</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:gap-6 mb-6 font-mono text-[11px] sm:text-xs tracking-[0.2em] uppercase text-white/55">
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-[#d6c4ff]" />
                <span>SILK OF MEMORY</span>
              </div>
              <span className="text-white/20 hidden sm:inline" aria-hidden="true">•</span>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#d6c4ff]" />
                <span>130 MONTHS WOVEN</span>
              </div>
              <span className="text-white/20 hidden sm:inline" aria-hidden="true">•</span>
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-[#d6c4ff]" />
                <span>UNBROKEN TAPESTRY</span>
              </div>
            </div>

            <h1
              data-testid="hero-title"
              className="font-serif text-5xl sm:text-7xl lg:text-[5.5rem] leading-[0.95] tracking-[-0.02em] text-white mb-6 font-normal"
            >
              Your life, <br />
              <span className="italic accent-text">in receipts.</span>
            </h1>

            <p className="font-sans text-base sm:text-lg text-white/60 max-w-xl mb-8 leading-relaxed">
              An ancient arachnid presiding over eleven years of digital footprints.
              Scroll down to penetrate deep into the spider's web corridor.
            </p>

            <div className="flex flex-wrap gap-4 pointer-events-auto">
              <NavLink
                to="/overview"
                data-testid="explore-story-button"
                className="inline-flex items-center gap-2.5 rounded-full bg-[#9b6bff] text-neutral-950 font-sans font-medium px-8 py-3.5 text-sm hover:bg-[#b18fff] transition-all shadow-xl shadow-[#9b6bff]/20 animate-accent-pulse"
              >
                <span>Enter The Archive</span>
                <ArrowRight className="w-4 h-4" />
              </NavLink>
              <NavLink
                to="/receipts"
                data-testid="browse-receipts-button"
                className="inline-flex items-center gap-2 rounded-full liquid-glass px-7 py-3.5 text-sm text-white font-sans hover:bg-white/10 transition-all"
              >
                <Search className="w-3.5 h-3.5 text-white/70" />
                <span>Browse Receipts</span>
              </NavLink>
            </div>
          </div>

          {/* ACT 02 — 11 YEARS OF SILK */}
          <div
            data-act-window="2"
            data-act-center="0.25"
            data-act-span="0.14"
            className="absolute inset-0 flex flex-col justify-center items-end text-right max-w-2xl ml-auto transition-transform duration-100 ease-out opacity-0"
          >
            <span className="font-mono text-xs tracking-[0.3em] uppercase text-[#d6c4ff] mb-4 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-white" /> ACT 02 — 130 MONTHS WOVEN
            </span>
            <h2 className="font-serif text-4xl sm:text-6xl leading-[1.02] tracking-tight text-white mb-5 font-medium">
              Eleven years, <br />
              <span className="italic silver-text">spun in concentric silk.</span>
            </h2>
            <p className="font-sans text-sm sm:text-base text-white/60 leading-relaxed max-w-lg mb-6">
              The camera plunges closer toward the arachnid. Every concentric ring expands as you prepare to cross the threshold into the silk strands.
            </p>
            <div className="flex gap-4 font-mono text-xs text-white/70">
              <span className="p-3 rounded-xl liquid-glass">{stats.totalReceipts ? formatNumber(stats.totalReceipts) : '162,588'} Moments</span>
              <span className="p-3 rounded-xl liquid-glass">130 Months</span>
            </div>
          </div>

          {/* ACT 03 — ENTERING THE WEB */}
          <div
            data-act-window="3"
            data-act-center="0.43"
            data-act-span="0.14"
            className="absolute inset-0 flex flex-col justify-center max-w-2xl transition-transform duration-100 ease-out opacity-0"
          >
            <span className="font-mono text-xs tracking-[0.3em] uppercase text-[#d6c4ff] mb-4 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-white" /> ACT 03 — ENTERING THE WEB
            </span>
            <h2 className="font-serif text-4xl sm:text-6xl leading-[1.02] tracking-tight text-white mb-5 font-medium">
              Inside the <br />
              <span className="italic accent-text">silk labyrinth.</span>
            </h2>
            <p className="font-sans text-sm sm:text-base text-white/60 leading-relaxed max-w-lg mb-6">
              You are now inside the web. Thousands of glistening dew droplets rush past the lens, illuminating memories across songs, cities, and receipts.
            </p>
          </div>

          {/* ACT 04 — TIME TRAJECTORY */}
          <div
            data-act-window="4"
            data-act-center="0.61"
            data-act-span="0.14"
            className="absolute inset-0 flex flex-col justify-center items-end text-right max-w-2xl ml-auto transition-transform duration-100 ease-out opacity-0"
          >
            <span className="font-mono text-xs tracking-[0.3em] uppercase text-[#d6c4ff] mb-4 flex items-center gap-2">
              <Compass className="w-3.5 h-3.5 text-white" /> ACT 04 — TIME TRAJECTORY
            </span>
            <h2 className="font-serif text-4xl sm:text-6xl leading-[1.02] tracking-tight text-white mb-5 font-medium">
              A journey through <br />
              <span className="italic silver-text">the deep corridors.</span>
            </h2>
            <p className="font-sans text-sm sm:text-base text-white/60 leading-relaxed max-w-lg mb-6">
              Passing through secondary silk vortices spanning from 2013 to 2024. Longitudinal threads connecting every chapter of your life.
            </p>
          </div>

          {/* ACT 05 — REVERENCE OF CHAPTERS */}
          <div
            data-act-window="5"
            data-act-center="0.77"
            data-act-span="0.14"
            className="absolute inset-0 flex flex-col justify-center max-w-2xl transition-transform duration-100 ease-out opacity-0"
          >
            <span className="font-mono text-xs tracking-[0.3em] uppercase text-[#d6c4ff] mb-4 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-white" /> ACT 05 — STORY CHAPTERS
            </span>
            <h2 className="font-serif text-4xl sm:text-6xl leading-[1.02] tracking-tight text-white mb-5 font-medium">
              Unspoken chapters <br />
              <span className="italic accent-text">in starlight.</span>
            </h2>
            <p className="font-sans text-sm sm:text-base text-white/60 leading-relaxed max-w-lg mb-6">
              Emerging at the innermost nexus where algorithmic stories coalesce from the digital footprint.
            </p>
          </div>

          {/* ACT 06 — THE ANCIENT ARCHIVE */}
          <div
            data-act-window="6"
            data-act-center="0.94"
            data-act-span="0.12"
            className="absolute inset-0 flex flex-col items-center justify-center text-center max-w-3xl mx-auto transition-transform duration-100 ease-out opacity-0"
          >
            <div className="w-14 h-14 rounded-full accent-glass flex items-center justify-center mb-6 shadow-2xl">
              <span className="font-serif text-2xl font-medium text-white">T</span>
            </div>
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#d6c4ff] mb-3">
              TRACE · COMPLETE 11-YEAR COLLECTION
            </span>
            <h2 className="font-serif text-5xl sm:text-7xl leading-[0.98] tracking-tight text-white mb-6 font-medium">
              Your life, <br />
              <span className="italic accent-text">in receipts.</span>
            </h2>
            <p className="font-sans text-base text-white/60 leading-relaxed max-w-lg mb-8">
              The journey through the web is complete. Step inside the interactive dossiers and explore every moment.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pointer-events-auto">
              <NavLink
                to="/overview"
                className="inline-flex items-center gap-2 rounded-full bg-[#9b6bff] text-neutral-950 font-sans font-medium px-8 py-3.5 text-sm hover:bg-[#b18fff] transition-all shadow-xl shadow-[#9b6bff]/20 animate-accent-pulse"
              >
                <span>Enter Archive</span>
                <ArrowRight className="w-4 h-4" />
              </NavLink>
              <NavLink
                to="/receipts"
                className="inline-flex items-center gap-2 rounded-full liquid-glass text-white font-sans text-sm px-7 py-3.5 hover:bg-white/10 transition-all"
              >
                <span>Browse Receipts</span>
              </NavLink>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            4. BOTTOM TELEMETRY & PROGRESS FOOTER
           ───────────────────────────────────────────────────────────── */}
        <footer
          className="px-6 sm:px-12 py-5 flex items-center justify-between pointer-events-auto"
          style={{
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            background: 'linear-gradient(to top, rgba(8, 6, 17, 0.85) 0%, rgba(8, 6, 17, 0.2) 80%, transparent 100%)',
          }}
        >
          <div className="flex items-center gap-3 font-mono text-xs text-white/60">
            <span className="text-white font-medium">{actLabel}</span>
            <span className="text-white/20">•</span>
            <span className="hidden sm:inline">ACT {currentAct} OF 6</span>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-mono text-white/60 tracking-widest uppercase">
            <span>Scroll to penetrate the web</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#9b6bff] animate-bounce" />
          </div>
        </footer>
      </div>
    </div>
  );
}