# わけわけタウン ランキングAPI（Cloudflare Worker）

アプリ本体（Next.js）とは別に、ランキングだけを受け持つ小さなAPIです。
Cloudflare Workers 上で動き、データは Cloudflare D1（SQLite互換のDB）に保存します。

## エンドポイント

- `GET /ranking?limit=20` — これまでにもらったコインの合計（ポイント）が多い順のランキングを返す
- `POST /score` — 端末のスコア（ニックネーム・解いた数・もらったコインの合計）を登録する

どちらも JSON。詳しい形は `src/index.ts` を参照。

## できること・できないこと

- ニックネームだけで参加でき、個人情報は扱いません（メールアドレスなどは持ちません）
- ポイントは「これまでにもらったコインの合計」です（かんたん10・まあまあ15・チャレンジ30）。お店で使っても減りません
- スコアは自己ベストのみを保存します（あとから減ることはありません）
- **スコアはアプリ（ブラウザ）側から送られる値をそのまま信じます。** 悪意のある人が開発者ツールなどで
  送信内容を書き換えれば、実際より多い数を登録できてしまいます。家族・友だち内で気軽に楽しむ用途を
  想定した作りで、大会の賞品がかかるような厳密な不正対策はしていません。将来的に必要になったら、
  「筆算を解いた証拠をサーバー側でも検証する」といった仕組みの追加を検討してください。

## 初回セットアップ

```bash
cd worker
npm install --legacy-peer-deps   # npm 10.9.7 の依存解決バグを避けるため
npx wrangler login                # ブラウザでCloudflareにログイン
```

### 1. D1データベースを作る

```bash
npx wrangler d1 create wakewake-town-ranking
```

表示された `database_id` を `wrangler.toml` の `database_id = "REPLACE_WITH_YOUR_DATABASE_ID"` に書き写す。

### 2. テーブルを作る

```bash
npm run db:init:remote   # 本番（Cloudflare上）のDBにテーブルを作る
npm run db:init:local    # 手元で `wrangler dev` するときのローカルDBにも作っておく
```

### 3. 許可するオリジンを設定する

`wrangler.toml` の `[vars] ALLOWED_ORIGIN` に、フロントを配信するURLを設定する（カンマ区切りで複数可）。
例: `http://localhost:3000,https://wakewake-town.pages.dev`

### 4. デプロイする

```bash
npm run deploy
```

成功すると `https://wakewake-town-ranking.<あなたのサブドメイン>.workers.dev` のようなURLが表示される。
このURLを、アプリ側（リポジトリ直下）の `.env.local` の `NEXT_PUBLIC_RANKING_API_URL` に設定する
（詳しくはリポジトリ直下の `.env.example` を参照）。

## ポイントを「もらったコインの合計」に変えたときの移行（1回だけ）

`total_coins` の列がない、古い `schema.sql` で作ったDBには、次を1回だけ実行する。
2回目以降は「列がすでにある」エラーになるだけで、データは壊れない。

```bash
npm run db:migrate:total-coins:remote
```

すでに登録ずみの端末のポイントは 0 から始まり、その端末で次にランキング画面を開いたときに埋まる。

## 開発中の動かし方

```bash
npm run dev     # http://localhost:8787 でローカル起動（--local のD1を使う）
npm test        # バリデーション処理のテスト
```

アプリ側の `.env.local` で `NEXT_PUBLIC_RANKING_API_URL=http://localhost:8787` にすると、
ローカルのワーカーに向けて動作確認できる。
