const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'assets');
const shortFile = path.join(assetsDir, 'shortThidis.json');

// Accept an optional target JSON path as the first argument. Examples:
//   node scripts/populateShortThidi.js                -> uses assets/te_festivals2025.json
//   node scripts/populateShortThidi.js assets/foo.json -> resolves relative to cwd (or assets/ if not found)
//   node scripts/populateShortThidi.js ./data/foo.json  -> resolves relative to cwd
const arg = process.argv[2];
let festivalsFile;
if (arg) {
  // Try resolving as absolute or relative to cwd first
  const candidateCwd = path.isAbsolute(arg) ? arg : path.resolve(process.cwd(), arg);
  if (fs.existsSync(candidateCwd)) {
    festivalsFile = candidateCwd;
  } else {
    // Try relative to the assets directory (useful when passing just a filename)
    const candidateAssets = path.join(assetsDir, arg);
    if (fs.existsSync(candidateAssets)) {
      festivalsFile = candidateAssets;
    } else {
      console.error('Could not find target file:', arg);
      console.error('Tried:', candidateCwd, 'and', candidateAssets);
      process.exit(2);
    }
  }
} else {
  festivalsFile = path.join(assetsDir, 'te_festivals2025.json');
}

function loadJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function saveJson(file, obj) {
  fs.writeFileSync(file, JSON.stringify(obj, null, 4) + '\n', 'utf8');
}

function computeShortThidi(thidiStr, shortNames) {
  if (!thidiStr || typeof thidiStr !== 'string') return '';
  const matches = [];
  const lower = thidiStr; // Telugu script; use direct search
  for (const name of shortNames) {
    const idx = lower.indexOf(name);
    if (idx >= 0) matches.push({ name, idx });
  }
  // sort by index of first occurrence
  matches.sort((a, b) => a.idx - b.idx);
  // unique by name preserving order
  const unique = [];
  for (const m of matches) {
    if (!unique.includes(m.name)) unique.push(m.name);
  }
  return unique.join('/');
}

function main() {
  const shortData = loadJson(shortFile);
  const shortNames = (shortData.shortThidis || []).map(s => s.name).filter(Boolean);

  const festivals = loadJson(festivalsFile);
  if (!Array.isArray(festivals)) {
    console.error('Expected an array in', festivalsFile);
    process.exit(1);
  }

  const updated = festivals.map(item => {
    const thidi = item.Thidi || '';
    const short = computeShortThidi(thidi, shortNames);
    // Preserve ordering: Thidi, shortThidi, then the rest of keys
    const newItem = {};
    // add date if present first for readability
    if (item.date !== undefined) newItem.date = item.date;
    if (item.Thidi !== undefined) newItem.Thidi = item.Thidi;
    newItem.shortThidi = short;
    // copy other keys except date/Thidi/shortThidi
    for (const k of Object.keys(item)) {
      if (['date', 'Thidi', 'shortThidi'].includes(k)) continue;
      newItem[k] = item[k];
    }
    return newItem;
  });

  saveJson(festivalsFile, updated);
  console.log('Updated', festivalsFile, 'with shortThidi values.');
}

main();
