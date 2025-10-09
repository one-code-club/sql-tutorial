import Redis from 'ioredis';
import { NextResponse } from 'next/server';

// RedisクライアントをREDIS_URLから作成
const redis = new Redis(process.env.REDIS_URL!);

export async function GET() {
  try {
    // 全てのスクリーンショットIDを取得
    const screenshotIds = await redis.lrange('screenshots:list', 0, -1);

    if (!screenshotIds || screenshotIds.length === 0) {
      return NextResponse.json({ screenshots: [] });
    }

    // 各IDのデータを取得
    const screenshots = await Promise.all(
      screenshotIds.map(async (id) => {
        const data = await redis.get(id);
        return data ? JSON.parse(data) : null;
      })
    );

    // nullを除外して新しい順に並べる
    const validScreenshots = screenshots
      .filter((s) => s !== null)
      .sort((a: any, b: any) => {
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      });

    return NextResponse.json({ screenshots: validScreenshots });
  } catch (error) {
    console.error('スクリーンショット取得エラー:', error);
    return NextResponse.json(
      { error: 'スクリーンショットの取得に失敗しました' },
      { status: 500 }
    );
  }
}

