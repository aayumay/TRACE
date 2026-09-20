const fs = require('fs');
const path = require('path');

const requiredTestIds = [
  'landing-screen',
  'hero-title',
  'explore-story-button',
  'browse-receipts-button',
  'overview-page',
  'life-stats',
  'activity-pulse',
  'category-distribution',
  'time-of-day-pattern',
  'top-locations',
  'key-moments',
  'opening-insight',
  'receipt-explorer',
  'receipt-search',
  'category-filter',
  'date-filter',
  'sort-control',
  'view-toggle',
  'active-filter-chips',
  'result-count',
  'receipt-grid',
  'receipt-list',
  'receipt-card',
  'receipt-detail',
  'receipt-metadata',
  'related-receipts',
  'connected-receipts',
  'connection-explorer',
  'connection-constellation',
  'connection-node',
  'connection-edge',
  'connection-reset',
  'connection-legend',
  'connection-inspector',
  'connection-reason',
  'story-chapters',
  'chapter-card',
  'story-chapter',
  'chapter-hero',
  'chapter-timeline',
  'chapter-insight',
  'chapter-navigation',
  'chapter-receipt',
  'digital-journey',
  'journey-timeline',
  'journey-month',
  'journey-chapter-marker',
  'journey-chapter',
  'insights-view',
  'insight-card',
  'insight-metric',
  'insight-evidence',
  'header',
  'mobile-navigation',
  'mobile-menu-button'
];

function getAllFiles(dir, exts = ['.tsx', '.ts']) {
  let files = [];
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      files = files.concat(getAllFiles(full, exts));
    } else if (exts.some(ext => full.endsWith(ext))) {
      files.push(full);
    }
  }
  return files;
}

const allFiles = getAllFiles(path.join(__dirname, '..', 'src'));
const testIdMap = {};
for (const file of allFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const regex = /data-testid=["']([^"']+)["']/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const id = match[1];
    if (!testIdMap[id]) testIdMap[id] = [];
    testIdMap[id].push(path.basename(file));
  }
}

console.log('--- TEST ID AUDIT ---');
let foundCount = 0;
let missing = [];
for (const req of requiredTestIds) {
  if (testIdMap[req]) {
    foundCount++;
    console.log(`[FOUND] ${req} -> ${testIdMap[req].join(', ')}`);
  } else {
    missing.push(req);
    console.log(`[MISSING] ${req}`);
  }
}
console.log(`\nTotal required: ${requiredTestIds.length} | Found: ${foundCount} | Missing: ${missing.length}`);
