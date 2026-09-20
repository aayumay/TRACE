import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { Atmosphere } from '../cinematic/Atmosphere';

const NAV_ITEMS = [
  { path: '/overview',    label: 'OVERVIEW' },
  { path: '/receipts',    label: 'RECEIPTS' },
  { path: '/connections', label: 'CONNECTIONS' },
  { path: '/stories',     label: 'STORIES' },
  { path: '/journey',     label: 'JOURNEY' },
  { path: '/insights',    label: 'INSIGHTS' },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.08]"
      style={{
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        backgroundColor: 'rgba(8, 6, 17, 0.85)',
      }}
      data-testid="header"
      role="banner"
    >
      <div className="container-page">
        <div className="flex h-16 items-center justify-between">
          {/* Brand Wordmark */}
          <NavLink
            to="/"
            className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
            aria-label="TRACE – Return to Home"
          >
            <span className="font-fraunces text-xl tracking-[0.06em] font-medium text-foreground group-hover:text-accent transition-colors">
              TRACE
            </span>
            <span className="hidden sm:inline-block w-px h-3.5 bg-border/60" aria-hidden="true" />
            <span className="hidden sm:inline-block font-ibm-mono text-[9px] tracking-[0.3em] uppercase text-muted">
              LIFE ARCHIVE
            </span>
          </NavLink>

          {/* Desktop Navigation - Floating Pill */}
          <nav
            className="hidden md:flex items-center gap-1 p-1 rounded-full liquid-glass border border-white/10 bg-[#0c0919]/60"
            role="navigation"
            aria-label="Main navigation"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`relative px-3.5 py-1.5 rounded-full text-[11px] font-ibm-mono tracking-[0.14em] uppercase transition-colors duration-200 z-10 ${
                    isActive ? 'text-white font-medium' : 'text-muted hover:text-foreground'
                  }`}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="header-active-pill"
                      className="absolute inset-0 rounded-full bg-white/[0.12] border border-white/20 shadow-[0_0_12px_rgba(155,107,255,0.25)] -z-10"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          {/* Right Action & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <NavLink
                to="/overview"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full accent-glass px-4 py-1.5 text-xs font-ibm-mono uppercase tracking-[0.14em] text-foreground hover:text-white transition-all border border-accent/30 hover:border-accent/60 hover:shadow-[0_0_16px_rgba(155,107,255,0.4)]"
              >
                <span>EXPLORE</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
              </NavLink>
            </motion.div>

            <button
              className="md:hidden w-9 h-9 rounded-full liquid-glass flex items-center justify-center text-foreground hover:text-accent transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              data-testid="mobile-menu-button"
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0, filter: 'blur(8px)' }}
            animate={{ opacity: 1, height: 'auto', filter: 'blur(0px)' }}
            exit={{ opacity: 0, height: 0, filter: 'blur(8px)' }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden border-t border-border bg-[#080611]/98 backdrop-blur-xl overflow-hidden"
            data-testid="mobile-navigation"
            role="navigation"
            aria-label="Mobile navigation"
          >
            <div className="container-page py-4 space-y-1.5">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `block px-4 py-2.5 rounded-lg text-xs font-ibm-mono tracking-[0.12em] uppercase transition-colors ${
                      isActive
                        ? 'text-white bg-accent/20 border border-accent/30'
                        : 'text-muted hover:text-foreground hover:bg-surface-elevated'
                    }`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}
              <div className="pt-2">
                <NavLink
                  to="/overview"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-accent text-accent-foreground py-2.5 text-xs font-ibm-mono uppercase tracking-[0.15em] font-medium"
                >
                  Explore Archive
                  <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                </NavLink>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-surface/30 mt-auto" role="contentinfo">
      <div className="container-page py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <span className="font-fraunces text-base font-medium text-foreground">TRACE</span>
            <span className="hidden sm:inline text-border" aria-hidden="true">•</span>
            <p className="text-xs text-muted font-ui">
              Your Life, In Receipts — An Archival Time Experience
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-ibm-mono text-muted/70 tracking-[0.08em]">
            <span>WEBRUSH 2026</span>
            <span aria-hidden="true">/</span>
            <span>DATA PROVENANCE PRESERVED</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-accent/30 selection:text-white">
      <Atmosphere />
      <Header />
      <main className="relative z-10 flex-1 pt-16 pb-12" id="main-content" role="main">
        {children}
      </main>
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}