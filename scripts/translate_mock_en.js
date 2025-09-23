// Simple CSV translator for data/mock_en.csv
// - Converts Japanese values to English for specific columns
// - Romanizes Japanese names (hiragana/katakana) to romaji (basic Hepburn)

const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');

const DATA_FILE = path.join(process.cwd(), 'data', 'mock_en.csv');
const BACKUP_FILE = path.join(process.cwd(), 'data', 'mock_en.csv.bak');

/**
 * Basic romaji conversion for hiragana/katakana.
 * Covers base syllables, digraphs, and small tsu gemination.
 */
function toRomaji(input) {
  if (!input) return input;
  const kataToHira = (s) => s.replace(/[\u30a1-\u30f6]/g, (m) => String.fromCharCode(m.charCodeAt(0) - 0x60));
  const s = kataToHira(input);

  const digraphs = {
    きゃ: 'kya', きゅ: 'kyu', きょ: 'kyo',
    ぎゃ: 'gya', ぎゅ: 'gyu', ぎょ: 'gyo',
    しゃ: 'sha', しゅ: 'shu', しょ: 'sho',
    じゃ: 'ja', じゅ: 'ju', じょ: 'jo',
    ちゃ: 'cha', ちゅ: 'chu', ちょ: 'cho',
    にゃ: 'nya', にゅ: 'nyu', にょ: 'nyo',
    ひゃ: 'hya', ひゅ: 'hyu', ひょ: 'hyo',
    びゃ: 'bya', びゅ: 'byu', びょ: 'byo',
    ぴゃ: 'pya', ぴゅ: 'pyu', ぴょ: 'pyo',
    みゃ: 'mya', みゅ: 'myu', みょ: 'myo',
    りゃ: 'rya', りゅ: 'ryu', りょ: 'ryo',
    てぃ: 'ti', でぃ: 'di', つぁ: 'tsa', つぃ: 'tsi', つぇ: 'tse', つぉ: 'tso'
  };

  const map = {
    あ: 'a', い: 'i', う: 'u', え: 'e', お: 'o',
    か: 'ka', き: 'ki', く: 'ku', け: 'ke', こ: 'ko',
    さ: 'sa', し: 'shi', す: 'su', せ: 'se', そ: 'so',
    た: 'ta', ち: 'chi', つ: 'tsu', て: 'te', と: 'to',
    な: 'na', に: 'ni', ぬ: 'nu', ね: 'ne', の: 'no',
    は: 'ha', ひ: 'hi', ふ: 'fu', へ: 'he', ほ: 'ho',
    ま: 'ma', み: 'mi', む: 'mu', め: 'me', も: 'mo',
    や: 'ya', ゆ: 'yu', よ: 'yo',
    ら: 'ra', り: 'ri', る: 'ru', れ: 're', ろ: 'ro',
    わ: 'wa', を: 'o', ん: 'n',
    が: 'ga', ぎ: 'gi', ぐ: 'gu', げ: 'ge', ご: 'go',
    ざ: 'za', じ: 'ji', ず: 'zu', ぜ: 'ze', ぞ: 'zo',
    だ: 'da', ぢ: 'ji', づ: 'zu', で: 'de', ど: 'do',
    ば: 'ba', び: 'bi', ぶ: 'bu', べ: 'be', ぼ: 'bo',
    ぱ: 'pa', ぴ: 'pi', ぷ: 'pu', ぺ: 'pe', ぽ: 'po',
    ゃ: 'ya', ゅ: 'yu', ょ: 'yo', ぁ: 'a', ぃ: 'i', ぅ: 'u', ぇ: 'e', ぉ: 'o',
    っ: ''
  };

  // Handle digraphs and small tsu gemination
  let out = '';
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    const next = s[i + 1] || '';
    const pair = ch + next;

    if (digraphs[pair]) {
      out += digraphs[pair];
      i++; // skip next
      continue;
    }

    if (ch === 'っ') {
      // Geminate next consonant
      const nextPair = s[i + 1] ? (digraphs[s[i + 1] + (s[i + 2] || '')] || map[s[i + 1]] || '') : '';
      const cons = nextPair.match(/^[a-z]/i) ? nextPair[0] : '';
      out += cons;
      continue;
    }

    out += map[ch] !== undefined ? map[ch] : ch;
  }

  // Capitalize words (names usually single token). Keep ASCII as-is
  if (/^[a-z]/.test(out)) {
    out = out.charAt(0).toUpperCase() + out.slice(1);
  }
  return out;
}

const maps = {
  grade: {
    '小学1年': 'Elementary 1st', '小学2年': 'Elementary 2nd', '小学3年': 'Elementary 3rd', '小学4年': 'Elementary 4th',
    '小学5年': 'Elementary 5th', '小学6年': 'Elementary 6th',
    '中学1年': 'Middle 1st', '中学2年': 'Middle 2nd', '中学3年': 'Middle 3rd',
  },
  favorite_subject: {
    '図工': 'Arts and Crafts', '体育': 'Physical Education', '音楽': 'Music', 'その他': 'Other', '算数': 'Math', '社会': 'Social Studies', '国語': 'Japanese', '家庭科': 'Home Economics', '理科': 'Science'
  },
  home_device: {
    'タブレット': 'Tablet', 'パソコン': 'PC', 'スマホ': 'Smartphone', 'なし': 'None'
  },
  favorite_fruit: {
    'ぶどう': 'Grape', 'りんご': 'Apple', 'もも': 'Peach', 'みかん': 'Mandarin', 'いちご': 'Strawberry', 'バナナ': 'Banana', 'なし': 'None', 'その他': 'Other'
  },
  favorite_game_genre: {
    'シミュレーション': 'Simulation', 'パズル': 'Puzzle', 'レース': 'Racing', 'アクション': 'Action', '冒険': 'Adventure', 'スポーツ': 'Sports', 'その他': 'Other'
  },
  favorite_animal: {
    'いぬ': 'Dog', 'ねこ': 'Cat', 'うさぎ': 'Rabbit', 'ハムスター': 'Hamster', 'さかな': 'Fish', 'とり': 'Bird', 'その他': 'Other'
  },
  special_skill: {
    'プログラミング': 'Programming', '工作': 'Crafts', '絵': 'Drawing', '音楽': 'Music', 'スポーツ': 'Sports', 'なぞとき': 'Puzzles', 'その他': 'Other'
  },
  future_dream: {
    '料理人': 'Chef', 'アーティスト': 'Artist', '研究者': 'Researcher', 'エンジニア': 'Engineer', '先生': 'Teacher', 'スポーツ選手': 'Athlete', 'まだ決めてない': 'Undecided', 'その他': 'Other'
  }
};

function isJapanese(str) {
  return /[\u3040-\u30ff\u4e00-\u9faf]/.test(str);
}

async function main() {
  if (!fs.existsSync(DATA_FILE)) {
    console.error('File not found:', DATA_FILE);
    process.exit(1);
  }

  const raw = await fsp.readFile(DATA_FILE, 'utf-8');
  const lines = raw.split(/\r?\n/);
  if (lines.length <= 1) {
    console.error('No data lines found.');
    process.exit(1);
  }

  const header = lines[0].split(',');
  const colIndex = Object.fromEntries(header.map((h, i) => [h.trim(), i]));

  const targetCols = {
    grade: 'grade',
    favorite_subject: 'favorite_subject',
    home_device: 'home_device',
    favorite_fruit: 'favorite_fruit',
    favorite_game_genre: 'favorite_game_genre',
    favorite_animal: 'favorite_animal',
    special_skill: 'special_skill',
    future_dream: 'future_dream',
  };

  // Safety backup
  await fsp.writeFile(BACKUP_FILE, raw, 'utf-8');

  const outLines = [lines[0]];
  for (let li = 1; li < lines.length; li++) {
    const line = lines[li];
    if (!line) continue;
    const cells = line.split(',');

    // Name romanization if Japanese present
    const nameIdx = colIndex['name'];
    if (nameIdx !== undefined) {
      const name = cells[nameIdx];
      if (name && isJapanese(name)) {
        cells[nameIdx] = toRomaji(name);
      }
    }

    // Map categorical fields
    for (const key of Object.keys(targetCols)) {
      const idx = colIndex[targetCols[key]];
      if (idx === undefined) continue;
      const val = (cells[idx] || '').trim();
      const m = maps[key] || {};
      if (m[val]) {
        cells[idx] = m[val];
      }
    }

    outLines.push(cells.join(','));
  }

  await fsp.writeFile(DATA_FILE, outLines.join('\n'), 'utf-8');
  console.log('Translation complete. Backup saved to', BACKUP_FILE);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});


