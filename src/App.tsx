import { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LandingScreen } from './pages/Landing';
import { OverviewPage } from './pages/Overview';
import { ReceiptsPage } from './pages/Receipts';
import { ReceiptDetailPage } from './pages/ReceiptDetail';
import { ConnectionsPage } from './pages/Connections';
import { StoriesPage } from './pages/Stories';
import { StoryChapterPage } from './pages/StoryChapter';
import { JourneyPage } from './pages/Journey';
import { InsightsPage } from './pages/Insights';

function RouteLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" aria-hidden="true" />
        <p className="font-ibm-mono text-xs uppercase tracking-[0.2em] text-muted">Accessing digital archive…</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          {/* Landing — full-screen, no shared layout */}
          <Route path="/" element={<LandingScreen />} />

          {/* All other routes use Layout (sticky header + footer) */}
          <Route
            path="/overview"
            element={<Layout><OverviewPage /></Layout>}
          />
          <Route
            path="/receipts"
            element={<Layout><ReceiptsPage /></Layout>}
          />
          <Route
            path="/receipts/:id"
            element={<Layout><ReceiptDetailPage /></Layout>}
          />
          <Route
            path="/connections"
            element={<Layout><ConnectionsPage /></Layout>}
          />
          <Route
            path="/stories"
            element={<Layout><StoriesPage /></Layout>}
          />
          <Route
            path="/stories/:id"
            element={<Layout><StoryChapterPage /></Layout>}
          />
          <Route
            path="/journey"
            element={<Layout><JourneyPage /></Layout>}
          />
          <Route
            path="/insights"
            element={<Layout><InsightsPage /></Layout>}
          />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;