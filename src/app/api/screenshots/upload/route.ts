import { put } from '@vercel/blob';
import Redis from 'ioredis';
import { NextRequest, NextResponse } from 'next/server';

// RedisクライアントをREDIS_URLから作成
const redis = new Redis(process.env.REDIS_URL!);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const nickname = formData.get('nickname') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが提供されていません' },
        { status: 400 }
      );
    }

    if (!nickname) {
      return NextResponse.json(
        { error: 'ニックネームが提供されていません' },
        { status: 400 }
      );
    }

    // Blobストレージにアップロード
    const blob = await put(file.name, file, {
      access: 'public',
    });

    // メタデータを作成
    const screenshotId = `screenshot:${Date.now()}`;
    const screenshotData = {
      id: screenshotId,
      nickname,
      url: blob.url,
      uploadedAt: new Date().toISOString(),
      fileName: file.name,
    };

    // Redisに保存（IDをキーに、JSON文字列として）
    await redis.set(screenshotId, JSON.stringify(screenshotData));

    // 全てのスクリーンショットIDのリストに追加
    await redis.lpush('screenshots:list', screenshotId);

    return NextResponse.json({
      success: true,
      screenshot: screenshotData,
    });
  } catch (error) {
    console.error('アップロードエラー:', error);
    return NextResponse.json(
      { error: 'アップロードに失敗しました' },
      { status: 500 }
    );
  }
}

