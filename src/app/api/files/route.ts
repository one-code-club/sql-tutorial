import { NextResponse } from 'next/server';
import { listCsvFiles, readCsvColumns, resolveCsvPath } from '@/lib/csvLoader';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const db = searchParams.get('db');
  if (db) {
    try {
      resolveCsvPath(db);
      const columns = await readCsvColumns(db);
      return NextResponse.json({ columns });
    } catch {
      return NextResponse.json({ error: '不正なファイル名です' }, { status: 400 });
    }
  }
  const files = await listCsvFiles();
  return NextResponse.json({ files });
}


