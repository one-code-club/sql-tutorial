import fs from 'node:fs/promises';
import path from 'node:path';

export async function listCsvFiles(dataDir = path.join(process.cwd(), 'data')): Promise<string[]> {
  try {
    const entries = await fs.readdir(dataDir, { withFileTypes: true });
    return entries.filter((e) => e.isFile() && e.name.endsWith('.csv')).map((e) => e.name);
  } catch {
    return [];
  }
}

export async function readCsvColumns(fileName: string, dataDir = path.join(process.cwd(), 'data')): Promise<string[]> {
  const full = path.join(dataDir, fileName);
  try {
    const raw = await fs.readFile(full, 'utf-8');
    const firstLine = raw.split(/\r?\n/)[0] ?? '';
    return firstLine.split(',').map((s) => s.trim()).filter(Boolean);
  } catch {
    return [];
  }
}

export async function readCsvRows(fileName: string, limit = 100, dataDir = path.join(process.cwd(), 'data')): Promise<Record<string, string>[]> {
  const full = path.join(dataDir, fileName);
  try {
    const raw = await fs.readFile(full, 'utf-8');
    const lines = raw.split(/\r?\n/).filter(Boolean);
    const headers = (lines.shift() ?? '').split(',').map((s) => s.trim());
    const rows: Record<string, string>[] = [];
    for (const line of lines.slice(0, limit)) {
      const cells = line.split(',');
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


