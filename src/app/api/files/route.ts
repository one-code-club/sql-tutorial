import { NextResponse } from 'next/server';
import { listCsvFiles, readCsvColumns } from '@/lib/csvLoader';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const db = searchParams.get('db');
  if (db) {
    const columns = await readCsvColumns(db);
    return NextResponse.json({ columns });
  }
  const files = await listCsvFiles();
  return NextResponse.json({ files });
}


