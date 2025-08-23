import { NextResponse } from 'next/server';

type Query = { id: string; nickname: string; name: string; text: string };
const inMemoryQueries: Query[] = [];
const MAX_NAME = 60;
const MAX_TEXT = 5000;
const NICK_RE = /^[\w\-]{1,32}$/;
const ID_RE = /^\d{13}_[a-z0-9]{6}$/;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const nickname = String(searchParams.get('nickname') ?? '');
  if (!NICK_RE.test(nickname)) {
    return NextResponse.json({ error: '不正なニックネーム' }, { status: 400 });
  }
  const queries = inMemoryQueries.filter((q) => q.nickname === nickname);
  return NextResponse.json({ queries });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const nickname = String(body.nickname ?? '');
  const name = String(body.name ?? '');
  const text = String(body.text ?? '');
  if (!NICK_RE.test(nickname) || !name.trim() || name.length > MAX_NAME || text.length > MAX_TEXT) {
    return NextResponse.json({ error: '入力が不正です' }, { status: 400 });
  }
  const id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  inMemoryQueries.push({ id, nickname, name, text });
  return NextResponse.json({ ok: true, id });
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = String(searchParams.get('id') ?? '');
  const nickname = String(searchParams.get('nickname') ?? '');
  if (!ID_RE.test(id) || !NICK_RE.test(nickname)) {
    return NextResponse.json({ error: '不正な入力' }, { status: 400 });
  }
  const idx = inMemoryQueries.findIndex((q) => q.id === id && q.nickname === nickname);
  if (idx >= 0) inMemoryQueries.splice(idx, 1);
  return NextResponse.json({ ok: true });
}


