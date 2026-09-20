import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { LandingScreen } from './pages/Landing';
import { OverviewPage } from './pages/Overview';
import { ReceiptsPage } from './pages/Receipts';
import { ReceiptDetailPage } from './pages/ReceiptDetail';
import { ConnectionsPage } from './pages/Connections';
import { StoriesPage } from './pages/Stories';
import { StoryChapterPage } from './pages/StoryChapter';
import { JourneyPage } from './pages/Journey';
import { InsightsPage } from './pages/Insights';

function App() {
  return (
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
  );
}

export default App;