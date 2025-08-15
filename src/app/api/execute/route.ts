export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { executeSql } from '@/lib/sqlExecutor';

function convertBigIntToString(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (typeof obj === 'bigint') {
    return obj.toString();
  }
  if (Array.isArray(obj)) {
    return obj.map(convertBigIntToString);
  }
  if (typeof obj === 'object') {
    const converted: any = {};
    for (const [key, value] of Object.entries(obj)) {
      converted[key] = convertBigIntToString(value);
    }
    return converted;
  }
  return obj;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const sql = String(body.sql ?? '');
  const dbName = String(body.dbName ?? '');

  if (!dbName) {
    return NextResponse.json({ error: 'DBを選択してください。左の「DBを選択」からCSVを選んでください。' }, { status: 400 });
  }
  if (!sql.trim()) {
    return NextResponse.json({ error: 'SQLを入力してください。例: SELECT * FROM ...' }, { status: 400 });
  }

  try {
    const rows = await executeSql(sql, dbName);
    const serializedRows = convertBigIntToString(rows);
    return NextResponse.json({ rows: serializedRows });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'SQLの実行中にエラーが発生しました。入力内容を確認してください。';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}