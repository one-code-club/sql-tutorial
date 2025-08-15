# SQL Tutorial - アーキテクチャ設計書

## 1. システム概要
「SQL Tutorial」は、小中学生向けの SQL 学習 Web アプリケーションです。  
ユーザーは DB やカラム名、SQLキーワードをドラッグ＆ドロップして SQL 文を組み立て、ローカル CSV データを用いて実行結果をリアルタイムで確認できます。  
クエリは Supabase に保存し、ニックネームごとに管理します。

---

## 2. アーキテクチャ構成図

```

┌─────────────────────────────┐
│         フロントエンド (Next.js + TS)        │
│─────────────────────────────│
│  ページ層（App Router）                    │
│    - ログインページ (/login)               │
│    - メインページ (/editor)                │
│                                             │
│  コンポーネント層                          │
│    - Header                                │
│    - LeftPane (DB選択, バッジ, 保存クエリ)  │
│    - SQLEditor (ドラッグ＆ドロップ対応)     │
│    - ResultGrid (実行結果表示)             │
│                                             │
│  状態管理                                  │
│    - Zustand または React Context           │
│    - 現在のDB選択, カラム一覧, クエリ一覧    │
│                                             │
│  API呼び出し層                              │
│    - /api/nickname (重複確認)               │
│    - /api/queries (保存・取得・削除)        │
│    - /api/execute (SQL実行)                 │
└─────────────────────────────┘
│
▼
┌─────────────────────────────┐
│       バックエンド (Next.js API Routes)      │
│─────────────────────────────│
│  - CSV読み込み処理（/data ディレクトリ）     │
│  - Supabase連携（ニックネーム・クエリ保存） │
│  - SQL実行処理（Prisma + PostgreSQL）        │
└─────────────────────────────┘
│
▼
┌─────────────────────────────┐
│      データストレージ構成                  │
│─────────────────────────────│
│  - ローカルCSV (/data/\*.csv)                │
│  - Supabase PostgreSQL (nickname, queries) │
│  - Prisma ORM                               │
└─────────────────────────────┘

```

---

## 3. 技術スタック

| レイヤー           | 技術                         | 用途 |
|--------------------|------------------------------|------|
| フロントエンド     | Next.js (TypeScript)         | ページ・UI構築 |
| UIコンポーネント   | Tailwind CSS + ShadCN UI     | スタイリング |
| 状態管理           | Zustand または React Context | グローバル状態 |
| バックエンド       | Next.js API Routes           | API実装 |
| DBアクセス         | Prisma ORM                   | Supabase連携 |
| データベース       | Supabase PostgreSQL          | ニックネーム・クエリ保存 |
| ファイル管理       | CSVファイル                  | 実行対象データ |
| SQL実行            | PostgreSQL (Supabase)        | クエリ処理 |

---

## 4. ディレクトリ構成（案）

```

/src
/app
/login
page.tsx              # ニックネーム入力画面
/editor
page.tsx              # メイン画面
/components
Header.tsx
LeftPane.tsx
SQLEditor.tsx
ResultGrid.tsx
QuerySaveModal.tsx
/lib
csvLoader.ts            # CSV読み込みロジック
supabaseClient.ts       # Supabaseクライアント
sqlExecutor.ts          # SQL実行ロジック
/store
useAppStore.ts          # Zustandストア
/pages/api
nickname.ts             # ニックネーム重複確認
queries.ts              # クエリ保存・取得・削除
execute.ts              # SQL実行
/data
sample1.csv
sample2.csv
/prisma
schema.prisma             # Prismaスキーマ

````

---

## 5. データフロー

1. **ログイン**
   - `/login` でニックネーム入力
   - API `/api/nickname` にて Supabase で重複チェック
   - OKなら `/editor` に遷移

2. **DB選択**
   - `/data` ディレクトリ内の CSV ファイル一覧を読み込み
   - 選択した DB のカラム名を左ペインに表示

3. **クエリ作成**
   - 左ペインのバッジ（SQLキーワード／カラム名）をエディタにドラッグ＆ドロップ
   - エディタ内で直接編集可能

4. **クエリ保存**
   - 「保存」クリックでモーダル表示 → 名前入力
   - API `/api/queries` 経由で Supabase に保存（`nickname`, `query_name`, `query_text`）

5. **クエリ実行**
   - 「実行」クリックで API `/api/execute` を呼び出し
   - Supabase/PostgreSQL 上で実行 → 結果を返却
   - 右ペインのグリッドに表示

---

## 6. API仕様

### `/api/nickname`
- **POST**: ニックネーム重複チェック
- 入力: `{ nickname: string }`
- 出力: `{ exists: boolean }`

### `/api/queries`
- **GET**: 保存済みクエリ取得（ニックネーム別）
- **POST**: クエリ保存
- **DELETE**: クエリ削除

### `/api/execute`
- **POST**: SQL実行
- 入力: `{ sql: string, dbName: string }`
- 出力: 実行結果（配列）

---

## 7. 状態管理構造（Zustand例）

```ts
type AppState = {
  nickname: string;
  selectedDB: string;
  columns: string[];
  queries: { name: string; text: string }[];
  setNickname: (name: string) => void;
  setSelectedDB: (db: string) => void;
  setColumns: (cols: string[]) => void;
  setQueries: (queries: Query[]) => void;
};
````

---

## 8. セキュリティと制限

* ユーザー認証は実装しない（教育用）
* ニックネームはユニーク
* SQL実行は SELECT 系のみに制限（UPDATE/DELETE禁止）
* CSVデータは読み取り専用

---

## 9. 将来的な拡張

* 管理者ダッシュボード追加
* 課題モード（SQL問題の正解判定）
* ユーザー認証と進捗管理
* JOIN・集計関数など高度な SQL 対応
