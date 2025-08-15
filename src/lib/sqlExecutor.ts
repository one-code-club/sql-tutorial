import duckdb from 'duckdb';
import path from 'node:path';
import fs from 'node:fs/promises';

let db: duckdb.Database | null = null;
let conn: duckdb.Connection | null = null;

async function ensureDb(): Promise<duckdb.Connection> {
  if (!db) {
    db = new duckdb.Database(':memory:');
  }
  if (!conn) {
    conn = db.connect();
  }
  return conn;
}

async function loadCsvAsTable(conn: duckdb.Connection, fileName: string): Promise<string> {
  const dataDir = path.join(process.cwd(), 'data');
  const fullPath = path.join(dataDir, fileName);
  try {
    await fs.access(fullPath);
  } catch {
    throw new Error(`CSVファイルが見つかりません: ${fileName}`);
  }

  // テーブル名は拡張子を除いたファイル名をベースに生成
  const base = path.basename(fileName, path.extname(fileName));
  const table = `tbl_${base.replace(/[^a-zA-Z0-9_]/g, '_')}`;

  // 既存なら一旦DROPして再作成（常にCSVの内容に同期させる）
  await new Promise<void>((resolve, reject) => {
    conn!.run(`DROP TABLE IF EXISTS ${table}`, (err: Error | null) => (err ? reject(err) : resolve()));
  });
  await new Promise<void>((resolve, reject) => {
    conn!.run(
      `CREATE TABLE ${table} AS SELECT * FROM read_csv_auto('${fullPath.replace(/\\/g, '/')}')`,
      (err: Error | null) => (err ? reject(err) : resolve())
    );
  });

  // 互換エイリアスを作成:
  // 1) schema.table 形式: <base>.csv でアクセスできるようにする（FROM sample1.csv を許容）
  // 2) 単純エイリアス: <base> でもアクセスできるようにする
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

  // 実運用に近づけるため、自動補完は行わない（FROM必須などはDuckDBの構文チェックに委ねる）
  const finalSql = text;

  try {
    const rows: any[] = await new Promise((resolve, reject) => {
      conn.all(finalSql, (err: Error | null, res: any[]) => (err ? reject(err) : resolve(res)));
    });
    return rows;
  } catch (e: unknown) {
    // DuckDBのエラーをわかりやすく整形
    const msg = e instanceof Error ? e.message : String(e);
    // 代表的な文法エラーの整形（過度に詳細にしない）
    if (/Parser Error/i.test(msg)) {
      const hint = `（ヒント: 選択したCSVはテーブル名 \"${table}\" として読み込まれています。例: SELECT * FROM ${table}）`;
      throw new Error(`SQL構文エラー: ${msg.replace(/\s+/g, ' ').trim()} ${hint}`);
    }
    throw new Error(msg);
  }
}


