import { NextResponse } from 'next/server';

// 超簡易モック: メモリに存在すると重複扱い
const usedNicknames = new Set<string>();
const NICK_RE = /^[\w\-]{1,32}$/;

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const nickname = String(body.nickname ?? '').trim();
  if (!NICK_RE.test(nickname)) {
    return NextResponse.json({ exists: false, error: '不正なニックネーム' }, { status: 400 });
  }
  const exists = usedNicknames.has(nickname);
  if (!exists) usedNicknames.add(nickname);
  return NextResponse.json({ exists });
}


