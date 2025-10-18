// ここから
// import duckdb from 'duckdb';
import path from 'node:path';
import fs from 'node:fs/promises';
import { resolveCsvPath } from '@/lib/csvLoader';

type Duck = typeof import('duckdb');

let duckMod: Duck | null = null;

async function createConnection(): Promise<import('duckdb').Connection> {
  if (!duckMod) {
    const mod = await import('duckdb');
    // CJS/ESM どちらでも動くように default を優先
    duckMod = (mod as any).default ?? (mod as any);
  }
  // @ts-expect-error duckMod は実行時に解決
  const db = new duckMod.Database(':memory:');
  const conn = db.connect();
  try {
    await new Promise<void>((resolve, reject) => {
      conn.run(`PRAGMA threads=2`, (err: Error | null) => (err ? reject(err) : resolve()));
    });
    await new Promise<void>((resolve, reject) => {
      conn.run(`PRAGMA memory_limit='512MB'`, (err: Error | null) => (err ? reject(err) : resolve()));
    });
  } catch {}
  return conn;
}

async function loadCsvAsTable(conn: import('duckdb').Connection, fileName: string): Promise<string> {
  const dataDir = path.join(process.cwd(), 'data');
  const fullPath = resolveCsvPath(fileName, dataDir);
  try {
    await fs.access(fullPath);
  } catch {
    throw new Error(`CSVファイルが見つかりません: ${fileName}`);
  }

  const base = path.basename(fileName, path.extname(fileName));
  const table = `tbl_${base.replace(/[^a-zA-Z0-9_]/g, '_')}`;
  const schema = base.replace(/[^a-zA-Z0-9_]/g, '_');
  const escapedFullPath = fullPath.replace(/\\/g, '/').replace(/'/g, "''");

  await new Promise<void>((resolve, reject) => {
    conn.run(`DROP TABLE IF EXISTS ${table}`, (err: Error | null) => (err ? reject(err) : resolve()));
  });
  await new Promise<void>((resolve, reject) => {
    conn.run(
      `CREATE TABLE ${table} AS SELECT * FROM read_csv_auto('${escapedFullPath}', HEADER=TRUE, DELIM=',', QUOTE='"')`,
      (err: Error | null) => (err ? reject(err) : resolve())
    );
  });

  await new Promise<void>((resolve, reject) => {
    conn.run(`CREATE SCHEMA IF NOT EXISTS ${schema}`, (err: Error | null) => (err ? reject(err) : resolve()));
  });
  await new Promise<void>((resolve, reject) => {
    conn.run(`DROP VIEW IF EXISTS ${schema}.csv`, (err: Error | null) => (err ? reject(err) : resolve()));
  });
  await new Promise<void>((resolve, reject) => {
    conn.run(`CREATE VIEW ${schema}.csv AS SELECT * FROM ${table}`, (err: Error | null) => (err ? reject(err) : resolve()));
  });
  await new Promise<void>((resolve, reject) => {
    conn.run(`DROP VIEW IF EXISTS ${schema}`, (err: Error | null) => (err ? reject(err) : resolve()));
  });
  await new Promise<void>((resolve, reject) => {
    conn.run(`CREATE VIEW ${schema} AS SELECT * FROM ${table}`, (err: Error | null) => (err ? reject(err) : resolve()));
  });
  return table;
}

function sanitizeSql(input: string): string {
  const stripped = input.replace(/--.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
  const parts = stripped.split(';').map((s) => s.trim()).filter(Boolean);
  if (parts.length !== 1) throw new Error('SQLは1文のみ実行できます');
  const stmt = parts[0];
  if (!/^(select|with)\b/i.test(stmt)) {
    throw new Error('SELECT系のクエリのみ実行可能です');
  }
  const banned = /\b(copy|attach|pragma|install|load|export|create\s+secret|delete|update|insert|alter|drop)\b/i;
  if (banned.test(stmt)) {
    throw new Error('許可されていないSQLが含まれています');
  }
  return stmt;
}

function enforceLimit(sql: string, maxRows = 1000): string {
  if (/\blimit\b/i.test(sql)) return sql;
  return `SELECT * FROM (${sql}) t LIMIT ${maxRows}`;
}

export async function executeSql(sql: string, dbName: string): Promise<any[]> {
  const text = sql.trim();
  if (!text) throw new Error('SQLを入力してください。');

  const conn = await createConnection();
  try {
    const table = await loadCsvAsTable(conn, dbName);
    const safeSql = enforceLimit(sanitizeSql(text));
    const rows: any[] = await new Promise((resolve, reject) => {
      conn.all(safeSql, (err: Error | null, res: any[]) => (err ? reject(err) : resolve(res)));
    });
    return rows;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/Parser Error/i.test(msg)) {
      const base = path.basename(dbName, path.extname(dbName)).replace(/[^a-zA-Z0-9_]/g, '_');
      const hint = `（ヒント: 選択したCSVはテーブル名 "tbl_${base}" として読み込まれています。例: SELECT * FROM tbl_${base}）`;
      throw new Error(`SQL構文エラー: ${msg.replace(/\s+/g, ' ').trim()} ${hint}`);
    }
    throw new Error(msg);
  } finally {
    try { (conn as any).close?.(); } catch {}
  }
}
// ここまで