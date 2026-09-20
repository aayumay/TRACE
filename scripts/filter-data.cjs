const fs = require('fs');
const path = require('path');

const INPUT_PATH = path.join(__dirname, '..', 'src', 'data', 'lifeReceipts.json');
const OUTPUT_SRC_PATH = path.join(__dirname, '..', 'src', 'data', 'lifeReceipts.filtered.json');
const OUTPUT_PUBLIC_PATH = path.join(__dirname, '..', 'public', 'data', 'lifeReceipts.filtered.json');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function main() {
  console.log('Loading full dataset...');
  const data = JSON.parse(fs.readFileSync(INPUT_PATH, 'utf-8'));
  const receipts = data.receipts;
  
  console.log(`Total raw receipts in JSON: ${receipts.length}`);
  
  const nonMusic = receipts.filter(r => r.category !== 'music');
  const music = receipts.filter(r => r.category === 'music');
  
  console.log(`Non-music receipts (preserved 100%): ${nonMusic.length}`);
  console.log(`Music receipts: ${music.length}`);
  
  const musicByDate = {};
  for (const r of music) {
    const date = r.date || 'unknown-date';
    if (!musicByDate[date]) musicByDate[date] = [];
    musicByDate[date].push(r);
  }
  
  const sampledMusic = [];
  for (const [date, tracks] of Object.entries(musicByDate)) {
    if (tracks.length <= 3) {
      sampledMusic.push(...tracks);
    } else {
      const sorted = tracks.sort((a, b) => 
        (b.metadata.durationMinutes || 0) - (a.metadata.durationMinutes || 0)
      );
      sampledMusic.push(...sorted.slice(0, 3));
    }
  }
  
  console.log(`Sampled music receipts: ${sampledMusic.length} (from ${Object.keys(musicByDate).length} dates)`);
  
  const filtered = [...nonMusic, ...sampledMusic];
  filtered.sort((a, b) => {
    if (!a.timestamp) return 1;
    if (!b.timestamp) return -1;
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
  });
  
  // Verify ID uniqueness in filtered dataset
  const idSet = new Set();
  let duplicateCount = 0;
  for (const r of filtered) {
    if (idSet.has(r.id)) {
      duplicateCount++;
    }
    idSet.add(r.id);
  }
  console.log(`Total filtered receipts: ${filtered.length}`);
  console.log(`Unique IDs in filtered dataset: ${idSet.size}`);
  console.log(`Duplicate IDs in filtered dataset: ${duplicateCount}`);
  
  const byCategory = {};
  for (const r of filtered) {
    byCategory[r.category] = (byCategory[r.category] || 0) + 1;
  }
  console.log('By category:', byCategory);
  
  const bySource = {};
  for (const r of filtered) {
    bySource[r.metadata.sourceDataset] = (bySource[r.metadata.sourceDataset] || 0) + 1;
  }
  console.log('By source:', bySource);
  
  const dates = filtered.map(r => r.timestamp ? new Date(r.timestamp) : null).filter(d => d && !isNaN(d.getTime()));
  console.log('Date range:', dates[0]?.toISOString(), 'to', dates[dates.length - 1]?.toISOString());
  
  const output = {
    receipts: filtered,
    metadata: {
      totalReceipts: filtered.length,
      categories: Object.keys(byCategory),
      categoryCounts: byCategory,
      sourceCounts: bySource,
      dateRange: {
        start: dates[0]?.toISOString() || '',
        end: dates[dates.length - 1]?.toISOString() || '',
      },
      generatedAt: new Date().toISOString(),
      note: 'Filtered dataset: non-music receipts preserved entirely; music sampled to top 3 tracks per day by duration',
      validation: {
        totalRecords: filtered.length,
        uniqueIds: idSet.size,
        duplicateIds: duplicateCount,
      },
    },
  };
  
  ensureDir(path.dirname(OUTPUT_SRC_PATH));
  ensureDir(path.dirname(OUTPUT_PUBLIC_PATH));
  
  const jsonStr = JSON.stringify(output, null, 2);
  fs.writeFileSync(OUTPUT_SRC_PATH, jsonStr);
  console.log(`Written to ${OUTPUT_SRC_PATH}`);
  fs.writeFileSync(OUTPUT_PUBLIC_PATH, jsonStr);
  console.log(`Written to ${OUTPUT_PUBLIC_PATH}`);
  
  console.log('=== Filter Complete ===');
}

main();