// ここから
// import duckdb from 'duckdb';
import path from 'node:path';
import fs from 'node:fs/promises';

type Duck = typeof import('duckdb');

let duckMod: Duck | null = null;
let db: import('duckdb').Database | null = null;
let conn: import('duckdb').Connection | null = null;

async function ensureDb(): Promise<import('duckdb').Connection> {
  if (!duckMod) {
    const mod = await import('duckdb');
    // CJS/ESM どちらでも動くように default を優先
    duckMod = (mod as any).default ?? (mod as any);
  }
  if (!db) {
    // @ts-expect-error duckMod は実行時に解決
    db = new duckMod.Database(':memory:');
  }
  if (!conn) {
    conn = db.connect();
  }
  return conn!;
}

async function loadCsvAsTable(conn: import('duckdb').Connection, fileName: string): Promise<string> {
  const dataDir = path.join(process.cwd(), 'data');
  const fullPath = path.join(dataDir, fileName);
  try {
    await fs.access(fullPath);
  } catch {
    throw new Error(`CSVファイルが見つかりません: ${fileName}`);
  }

  const base = path.basename(fileName, path.extname(fileName));
  const table = `tbl_${base.replace(/[^a-zA-Z0-9_]/g, '_')}`;

  await new Promise<void>((resolve, reject) => {
    conn!.run(`DROP TABLE IF EXISTS ${table}`, (err: Error | null) => (err ? reject(err) : resolve()));
  });
  await new Promise<void>((resolve, reject) => {
    conn!.run(
      `CREATE TABLE ${table} AS SELECT * FROM read_csv_auto('${fullPath.replace(/\\/g, '/')}')`,
      (err: Error | null) => (err ? reject(err) : resolve())
    );
  });

  const schema = base.replace(/[^a-zA-Z0-9_]/g, '_');
  await new Promise<void>((resolve, reject) => {
    conn!.run(`CREATE SCHEMA IF NOT EXISTS ${schema}`, (err: Error | null) => (err ? reject(err) : resolve()));
  });
  await new Promise<void>((resolve, reject) => {
    conn!.run(`DROP VIEW IF EXISTS ${schema}.csv`, (err: Error | null) => (err ? reject(err) : resolve()));
  });
  await new Promise<void>((resolve, reject) => {
    conn!.run(`CREATE VIEW ${schema}.csv AS SELECT * FROM ${table}`, (err: Error | null) => (err ? reject(err) : resolve()));
  });
  await new Promise<void>((resolve, reject) => {
    conn!.run(`DROP VIEW IF EXISTS ${schema}`, (err: Error | null) => (err ? reject(err) : resolve()));
  });
  await new Promise<void>((resolve, reject) => {
    conn!.run(`CREATE VIEW ${schema} AS SELECT * FROM ${table}`, (err: Error | null) => (err ? reject(err) : resolve()));
  });
  return table;
}

export async function executeSql(sql: string, dbName: string): Promise<any[]> {
  const text = sql.trim();
  if (!text) throw new Error('SQLを入力してください。');

  const conn = await ensureDb();
  const table = await loadCsvAsTable(conn, dbName);

  const finalSql = text;

  try {
    const rows: any[] = await new Promise((resolve, reject) => {
      conn.all(finalSql, (err: Error | null, res: any[]) => (err ? reject(err) : resolve(res)));
    });
    return rows;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/Parser Error/i.test(msg)) {
      const hint = `（ヒント: 選択したCSVはテーブル名 "${table}" として読み込まれています。例: SELECT * FROM ${table}）`;
      throw new Error(`SQL構文エラー: ${msg.replace(/\s+/g, ' ').trim()} ${hint}`);
    }
    throw new Error(msg);
  }
}
// ここまで