# TRACE — Your Life, In Receipts

> **WebRush 2026 Hackathon Submission**  
> *A cinematic, editorial data journalism experience reconstructing 11 years of digital life through music, transactions, places, and connections.*

---

## 🌟 Overview

**TRACE** transforms raw, disparate digital breadcrumbs—Spotify listening history, daily household expenses, and card transactions—into an interactive, editorial memoir. Rather than dry dashboards or cold transaction tables, TRACE approaches personal data as an archeological artifact: every song played late at night, every coffee bought across cities, and every recurring routine forms a constellation of human experience.

---

## 🚀 Key Features

### 1. **Cinematic Hero & Landing** (`/`)
- Ambient constellation canvas with glowing nodes and animated moment pulse.
- Real-time archive statistics calculated live from normalized records.
- Seamless, fast call-to-actions to explore stories or browse raw receipts.

### 2. **Life Overview & Pulse** (`/overview`)
- **Life Stats:** Total moments, active days, time span (2013–2024), and derived connection density.
- **Activity Pulse:** Interactive density visualization of moment frequency over 11 years.
- **Category Distribution & Time-of-Day Pattern:** Morning vs. evening behavioral breakdowns.
- **Top Locations & Key Moments:** Highlighted life milestones with connected evidence.
- **Opening Editorial Insight:** Natural language summary synthesized from multi-source data.

### 3. **Receipt Explorer** (`/receipts`)
- Fast search across titles, descriptions, categories, artists, merchants, and locations.
- **Multi-dimensional Filtering:** Category chips, custom date range pickers, and sorting (date, category, title, location).
- **Dual View Modes:** Grid card layout and dense list view with smooth pagination.
- **Zero-loss Data Access:** Full access to 20,000+ curated and categorized moments.

### 4. **Receipt Detail & Evidence Dossier** (`/receipts/:id`)
- Deep dive into individual moments with verified timestamps, durations, and financial metadata.
- **Privacy-Safe Presentation:** Sensitive fields (`cc_num`, `dob`, `street`, `first/last name`) stripped at source; only safe analytical dimensions displayed.
- **Related Moments:** Cross-category and temporal adjacency recommendations.

### 5. **Connection Constellation** (`/connections`)
- Custom SVG graph visualizer rendering genuine, non-random connection edges.
- **Multi-rule Relationship Engine:**
  - *Same-Day Adjacency*
  - *Temporal Proximity (<2h and <6h)*
  - *Geographic Clustering & City Resonance*
  - *Cross-Category Bridges (Music ↔ Purchases ↔ Places)*
  - *Shared Tag Correlations*
- Interactive Node Selection with Inspector Panel detailing exact mathematical reasons and evidence.

### 6. **Story Chapters** (`/stories` & `/stories/:id`)
- Algorithmic chapter discovery clustering connected moments into cohesive life narratives.
- Evidence dossier per chapter explaining dominant categories, locations, and time-of-day concentration.
- Sequential chapter timeline with fluid previous/next chapter navigation.

### 7. **Digital Journey Timeline** (`/journey`)
- Spatial horizontal timeline grouping 130+ months of digital history into density bars.
- Visual chapter markers pinned along the timeline for intuitive temporal exploration.

### 8. **Life Insights** (`/insights`)
- Algorithmic deductions discovering behavioral and cross-dataset patterns.
- High-level metric badges, verified evidence trails, and interactive supporting evidence dossiers.

---

## 📊 Dataset Architecture & Integrity

TRACE unifies three official hackathon datasets:

| Dataset | Raw Source | Records | Integration & Normalization Strategy |
| :--- | :--- | :--- | :--- |
| **Spotify Listening History** | `spotify_history.csv` | 149,860 | Extracted timestamps, artist/album/track metadata, playback duration, shuffle/skipped states. Sampled top daily tracks for instant client-side rendering. |
| **Daily Household Ledger** | `Daily Household Transactions.csv` | 2,461 | Categorized into purchases, places, notes, and events with amount, currency (INR), and payment mode. |
| **India Card Transactions** | `Augmented_IndiaTransactMultiFacet2024.csv` | 10,267 | Cleaned fraud prefixes, extracted merchants, categories, coordinates, and city/state patterns. **100% of records preserved**, including un-timestamped rows. |

### 🔒 Data Integrity & Privacy Standards
- **Deterministic ID Generation:** Generated with SHA-256 composite hashes (`source + identifier + counter`), guaranteeing **0 duplicate IDs** across all 162,588 normalized records.
- **Privacy First:** Personally identifiable information (`cc_num`, `first`, `last`, `street`, `dob`) is stripped during normalization and never enters the browser.
- **Static Asset Streaming:** Clean JSON datasets served from `public/data/` via asynchronous runtime loaders to avoid large JS bundles and memory bottlenecks.

---

## 🛠️ Tech Stack

- **Framework:** React 19 + TypeScript 6
- **Build Tool:** Vite 8 (Rolldown engine)
- **Styling:** Tailwind CSS v4 with custom `@theme` tokens and dark editorial palette
- **Icons:** Lucide React
- **Motion:** Framer Motion (GPU-accelerated micro-interactions & view transitions)
- **Routing:** React Router v7 (`BrowserRouter`, flat routes, responsive shell)
- **Architecture:** 100% Client-Side & Frontend-Only (Zero backend required, fully deployable to Vercel/Netlify/GitHub Pages)

---

## 🚦 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm (v9+)

### Installation & Run
```bash
# 1. Clone or navigate to the project directory
cd trace

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Build for production
npm run build

# 5. Preview production build
npm run preview
```

---

## 🧪 Verification & QA

- **TypeScript Verification:** `npx tsc --noEmit` exits with **0 errors**.
- **Production Build:** `npm run build` completes in <4 seconds with optimal chunk splitting (`react-vendor`, `motion`, `ui`).
- **Accessibility:** Semantic HTML5 (`header`, `nav`, `main`, `article`, `section`, `dl`, `dt`, `dd`), ARIA landmarks, keyboard focus rings, and `prefers-reduced-motion` compliance.
- **Test Automation Hook:** Comprehensive `data-testid` attributes on all critical paths and interactive controls.

---

*TRACE — Your Life, In Receipts • WebRush 2026*
