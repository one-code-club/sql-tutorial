import { NextResponse } from 'next/server';

type Query = { id: string; nickname: string; name: string; text: string };
const inMemoryQueries: Query[] = [];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const nickname = String(searchParams.get('nickname') ?? '');
  const queries = inMemoryQueries.filter((q) => q.nickname === nickname);
  return NextResponse.json({ queries });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const nickname = String(body.nickname ?? '');
  const name = String(body.name ?? '');
  const text = String(body.text ?? '');
  const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  inMemoryQueries.push({ id, nickname, name, text });
  return NextResponse.json({ ok: true, id });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = String(searchParams.get('id') ?? '');
  const nickname = String(searchParams.get('nickname') ?? '');
  const idx = inMemoryQueries.findIndex((q) => q.id === id && q.nickname === nickname);
  if (idx >= 0) inMemoryQueries.splice(idx, 1);
  return NextResponse.json({ ok: true });
}


