import fs from 'node:fs/promises';
import path from 'node:path';

export function resolveCsvPath(fileName: string, dataDir = path.join(process.cwd(), 'data')): string {
  const safe = path.basename(fileName);
  if (!/^[\w.\- ]+\.csv$/i.test(safe)) {
    throw new Error('不正なファイル名です');
  }
  const base = path.resolve(dataDir);
  const full = path.resolve(dataDir, safe);
  if (!full.startsWith(base + path.sep)) {
    throw new Error('不正なパスです');
  }
  return full;
}

export async function listCsvFiles(dataDir = path.join(process.cwd(), 'data')): Promise<string[]> {
  try {
    const entries = await fs.readdir(dataDir, { withFileTypes: true });
    return entries.filter((e) => e.isFile() && e.name.endsWith('.csv')).map((e) => e.name);
  } catch {
    return [];
  }
}

export async function readCsvColumns(fileName: string, dataDir = path.join(process.cwd(), 'data')): Promise<string[]> {
  try {
    const full = resolveCsvPath(fileName, dataDir);
    const fh = await fs.open(full, 'r');
    try {
      const buf = Buffer.alloc(64 * 1024);
      const { bytesRead } = await fh.read(buf, 0, buf.length, 0);
      const chunk = buf.slice(0, bytesRead).toString('utf-8');
      const firstLine = (chunk.split(/\r?\n/)[0] ?? '').replace(/^\uFEFF/, '');
      return parseCsvLine(firstLine).map((s) => s.trim()).filter(Boolean);
    } finally {
      await fh.close();
    }
  } catch {
    return [];
  }
}

export async function readCsvRows(fileName: string, limit = 100, dataDir = path.join(process.cwd(), 'data')): Promise<Record<string, string>[]> {
  try {
    const full = resolveCsvPath(fileName, dataDir);
    const raw = await fs.readFile(full, 'utf-8');
    const lines = raw.split(/\r?\n/).filter(Boolean);
    const headerLine = (lines.shift() ?? '').replace(/^\uFEFF/, '');
    const headers = parseCsvLine(headerLine).map((s) => s.trim());
    const rows: Record<string, string>[] = [];
    for (const line of lines.slice(0, limit)) {
      const cells = parseCsvLine(line);
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => {
        obj[h] = (cells[i] ?? '').trim();
      });
      rows.push(obj);
    }
    return rows;
  } catch {
    return [];
  }
}


function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
      continue;
    }
    current += ch;
  }
  result.push(current);
  return result;
}


