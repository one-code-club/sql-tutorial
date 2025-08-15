import { NextResponse } from 'next/server';

// 超簡易モック: メモリに存在すると重複扱い
const usedNicknames = new Set<string>();

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const nickname = String(body.nickname ?? '').trim();
  if (!nickname) return NextResponse.json({ exists: false });
  const exists = usedNicknames.has(nickname);
  if (!exists) usedNicknames.add(nickname);
  return NextResponse.json({ exists });
}


