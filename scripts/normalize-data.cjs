const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const csv = require('csv-parser');
const { parse } = require('csv-parse/sync');

const DATA_DIR = path.join(__dirname, '..', 'data', 'raw');
const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'data');
const PUBLIC_DATA_DIR = path.join(__dirname, '..', 'public', 'data');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function generateStableId(prefix, ...parts) {
  const hash = crypto.createHash('sha256').update(parts.filter(Boolean).join('|')).digest('hex').slice(0, 12);
  return `${prefix}-${hash}`;
}

function parseDateFlexible(dateStr) {
  if (!dateStr || !dateStr.trim()) return null;
  const trimmed = dateStr.trim();
  const formats = [
    'YYYY-MM-DD HH:mm:ss',
    'DD/MM/YYYY HH:mm:ss',
    'DD/MM/YYYY',
    'M/D/YYYY H:mm',
    'M/D/YYYY HH:mm',
    'YYYY-MM-DDTHH:mm:ss',
    'YYYY-MM-DDTHH:mm:ss.sssZ',
  ];
  
  for (const fmt of formats) {
    try {
      const moment = require('moment');
      const parsed = moment(trimmed, fmt, true);
      if (parsed.isValid()) return parsed.toISOString();
    } catch (e) {}
  }
  
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) return parsed.toISOString();
  
  return null;
}

function parseDate(dateStr) {
  if (!dateStr) return null;
  return parseDateFlexible(dateStr);
}

async function processSpotifyData() {
  console.log('Processing Spotify data...');
  const filePath = path.join(DATA_DIR, 'archive-1', 'spotify_history.csv');
  
  const results = [];
  let count = 0;
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        count++;
        if (count % 25000 === 0) {
          console.log(`  Processed ${count} Spotify records...`);
        }
        
        const timestamp = parseDate(row.ts);
        const dateStr = timestamp ? new Date(timestamp).toISOString().split('T')[0] : null;
        const timeStr = timestamp ? new Date(timestamp).toTimeString().slice(0, 5) : null;
        
        const msPlayed = parseInt(row.ms_played, 10) || 0;
        const durationMinutes = Math.round((msPlayed / 60000) * 10) / 10;
        
        const id = generateStableId('spotify', row.spotify_track_uri || 'unknown', row.ts || 'nots', String(count));
        
        results.push({
          id,
          category: 'music',
          title: row.track_name || 'Unknown Track',
          description: `By ${row.artist_name || 'Unknown Artist'}${row.album_name ? ` • ${row.album_name}` : ''}`,
          timestamp: timestamp || '',
          date: dateStr || '',
          time: timeStr || '',
          location: null,
          tags: ['music', 'spotify', row.artist_name ? row.artist_name.toLowerCase().replace(/\s+/g, '-') : 'unknown'].filter(Boolean),
          metadata: {
            source: 'spotify',
            sourceDataset: 'archive-1',
            sourceId: row.spotify_track_uri || `track-${count}`,
            artist: row.artist_name || undefined,
            album: row.album_name || undefined,
            durationMinutes,
            platform: row.platform || undefined,
            reasonStart: row.reason_start || undefined,
            reasonEnd: row.reason_end || undefined,
            shuffled: row.shuffle === 'TRUE',
            skipped: row.skipped === 'TRUE',
          },
        });
      })
      .on('end', () => {
        console.log(`  Total Spotify records: ${results.length}`);
        resolve(results);
      })
      .on('error', reject);
  });
}

async function processHouseholdTransactions() {
  console.log('Processing Household Transactions...');
  const filePath = path.join(DATA_DIR, 'archive-2', 'Daily Household Transactions.csv');
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const records = parse(content, { columns: true, skip_empty_lines: true });
  
  const results = [];
  let count = 0;
  
  for (const row of records) {
    count++;
    const timestamp = parseDate(row.Date);
    const dateStr = timestamp ? new Date(timestamp).toISOString().split('T')[0] : null;
    const timeStr = timestamp ? new Date(timestamp).toTimeString().slice(0, 5) : null;
    
    const amount = parseFloat(row.Amount) || 0;
    const isExpense = row['Income/Expense'] === 'Expense';
    
    let category = 'purchase';
    const catLower = (row.Category || '').toLowerCase();
    if (catLower.includes('food') || catLower.includes('snack')) category = 'purchase';
    else if (catLower.includes('transport')) category = 'place';
    else if (catLower.includes('subscription') || catLower.includes('netflix') || catLower.includes('entertainment')) category = 'movie';
    else if (catLower.includes('health') || catLower.includes('beauty') || catLower.includes('grooming')) category = 'note';
    else if (catLower.includes('festival') || catLower.includes('culture')) category = 'event';
    else if (catLower.includes('investment') || catLower.includes('fund') || catLower.includes('share') || catLower.includes('salary') || catLower.includes('income')) category = 'note';
    else if (catLower.includes('gift') || catLower.includes('reward') || catLower.includes('cashback')) category = 'note';
    else if (catLower.includes('education') || catLower.includes('self-development')) category = 'note';
    else if (catLower.includes('travel') || catLower.includes('tourism')) category = 'place';
    
    const id = generateStableId('household', row.Date || 'nodate', row.Category || 'nocat', String(amount), String(count));
    
    results.push({
      id,
      category,
      title: row.Note || row.Subcategory || row.Category || 'Transaction',
      description: `${row.Category || 'General'} • ${row.Subcategory || ''} • ${row.Mode || ''}`.trim(),
      timestamp: timestamp || '',
      date: dateStr || '',
      time: timeStr || '',
      location: {
        name: row.Note?.includes('Place') ? row.Note : undefined,
        city: undefined,
      },
      tags: [
        row.Category ? row.Category.toLowerCase().replace(/\s+/g, '-') : undefined,
        row.Subcategory ? row.Subcategory.toLowerCase().replace(/\s+/g, '-') : undefined,
        row.Mode ? row.Mode.toLowerCase().replace(/\s+/g, '-') : undefined,
        isExpense ? 'expense' : 'income',
      ].filter(Boolean),
      metadata: {
        source: 'household-ledger',
        sourceDataset: 'archive-2',
        sourceId: `${row.Date || 'date'}-${count}`,
        amount,
        currency: row.Currency || 'INR',
        type: isExpense ? 'expense' : 'income',
        mode: row.Mode || undefined,
        category: row.Category || undefined,
        subcategory: row.Subcategory || undefined,
      },
    });
  }
  
  console.log(`  Total Household records: ${results.length}`);
  return results;
}

async function processIndiaTransactions() {
  console.log('Processing India Transactions...');
  const filePath = path.join(DATA_DIR, 'archive-3', 'Augmented_IndiaTransactMultiFacet2024.csv');
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const records = parse(content, { columns: true, skip_empty_lines: true });
  
  const results = [];
  let count = 0;
  
  for (const row of records) {
    count++;
    const timestamp = parseDate(row.trans_date_trans_time);
    const dateStr = timestamp ? new Date(timestamp).toISOString().split('T')[0] : null;
    const timeStr = timestamp ? new Date(timestamp).toTimeString().slice(0, 5) : null;
    
    const amount = parseFloat(row.amt) || 0;
    const category = row.category || 'unknown';
    
    let mappedCategory = 'purchase';
    if (category === 'entertainment') mappedCategory = 'movie';
    else if (category === 'travel') mappedCategory = 'place';
    else if (category === 'fitness_and_medical') mappedCategory = 'note';
    else if (category === 'online_shopping') mappedCategory = 'purchase';
    
    const merchant = row.merchant || 'Unknown Merchant';
    const cleanMerchant = merchant.replace(/^fraud_/, '');
    const city = row.city || row.state || 'Unknown Location';
    
    const id = generateStableId('india', row.trans_id || String(count), row.trans_date_trans_time || 'nodate', String(count));
    
    // Privacy protection: strip cc_num, first, last, street, dob
    results.push({
      id,
      category: mappedCategory,
      title: cleanMerchant,
      description: `${category.replace(/_/g, ' ')} • ${city}`,
      timestamp: timestamp || '',
      date: dateStr || '',
      time: timeStr || '',
      location: {
        name: cleanMerchant,
        city: city,
        latitude: row.lat ? parseFloat(row.lat) : undefined,
        longitude: row.long ? parseFloat(row.long) : undefined,
      },
      tags: [
        category,
        row.city ? row.city.toLowerCase().replace(/\s+/g, '-') : undefined,
        row.state ? row.state.toLowerCase().replace(/\s+/g, '-') : undefined,
        row.is_fraud === '1.0' || row.is_fraud === '1' ? 'flagged' : 'normal',
      ].filter(Boolean),
      metadata: {
        source: 'india-transactions',
        sourceDataset: 'archive-3',
        sourceId: row.trans_id ? String(row.trans_id) : `india-${count}`,
        amount,
        currency: 'INR',
        category: category,
        merchant: cleanMerchant,
        city: row.city || undefined,
        state: row.state || undefined,
        job: row.job || undefined,
        isFraud: row.is_fraud === '1.0' || row.is_fraud === '1',
        customerId: row.customer_id || undefined,
      },
    });
  }
  
  console.log(`  Total India Transaction records: ${results.length}`);
  return results;
}

async function main() {
  ensureDir(OUTPUT_DIR);
  ensureDir(PUBLIC_DATA_DIR);
  
  console.log('=== Starting Data Normalization ===\n');
  
  const [spotify, household, india] = await Promise.all([
    processSpotifyData(),
    processHouseholdTransactions(),
    processIndiaTransactions(),
  ]);
  
  const allReceipts = [...spotify, ...household, ...india];
  
  // Verify unique IDs
  const idSet = new Set();
  let duplicateCount = 0;
  for (const r of allReceipts) {
    if (idSet.has(r.id)) {
      duplicateCount++;
    }
    idSet.add(r.id);
  }
  console.log(`\n=== ID Uniqueness Check ===`);
  console.log(`Total records: ${allReceipts.length}`);
  console.log(`Unique IDs: ${idSet.size}`);
  console.log(`Duplicate IDs: ${duplicateCount}`);
  
  allReceipts.sort((a, b) => {
    if (!a.timestamp) return 1;
    if (!b.timestamp) return -1;
    return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
  });
  
  console.log(`\n=== Total normalized receipts: ${allReceipts.length} ===`);
  
  const byCategory = {};
  for (const r of allReceipts) {
    byCategory[r.category] = (byCategory[r.category] || 0) + 1;
  }
  console.log('By category:', byCategory);
  
  const bySource = {};
  for (const r of allReceipts) {
    bySource[r.metadata.sourceDataset] = (bySource[r.metadata.sourceDataset] || 0) + 1;
  }
  console.log('By source:', bySource);
  
  const dates = allReceipts.map(r => r.timestamp ? new Date(r.timestamp) : null).filter(d => d && !isNaN(d.getTime()));
  console.log('Date range:', dates[0]?.toISOString(), 'to', dates[dates.length - 1]?.toISOString());
  
  const output = {
    receipts: allReceipts,
    metadata: {
      totalReceipts: allReceipts.length,
      categories: Object.keys(byCategory),
      categoryCounts: byCategory,
      sourceCounts: bySource,
      dateRange: {
        start: dates[0]?.toISOString() || '',
        end: dates[dates.length - 1]?.toISOString() || '',
      },
      generatedAt: new Date().toISOString(),
      validation: {
        rawRecords: { spotify: spotify.length, household: household.length, india: india.length },
        duplicateIds: duplicateCount,
        missingTimestamps: allReceipts.filter(r => !r.timestamp).length,
      },
    },
  };
  
  const outputPath = path.join(OUTPUT_DIR, 'lifeReceipts.json');
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\nWritten full dataset to ${outputPath}`);
  
  // Also write validation report
  const validationReportPath = path.join(__dirname, '..', 'data', 'validation-report.json');
  ensureDir(path.dirname(validationReportPath));
  fs.writeFileSync(validationReportPath, JSON.stringify(output.metadata, null, 2));
  console.log(`Written validation report to ${validationReportPath}`);
  
  console.log('\n=== Normalization Complete ===');
}

main().catch(console.error);