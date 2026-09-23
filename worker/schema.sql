-- ランキング用テーブル。1端末につき1行（device_id が主キー）。
-- 同じ端末から送られたスコアは、上書きではなく「これまでの自己ベスト」を残す
-- （problems_solved・total_coins は減らない。ワーカー側の UPSERT で保証する）。
CREATE TABLE IF NOT EXISTS players (
  device_id TEXT PRIMARY KEY,
  nickname TEXT NOT NULL,
  problems_solved INTEGER NOT NULL DEFAULT 0,
  -- これまでにもらったコインの合計。ランキングのポイント
  total_coins INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
);

-- ランキング取得（もらったコインが多い順、同数なら先に到達した順）を速くする
CREATE INDEX IF NOT EXISTS idx_players_coins_ranking
  ON players (total_coins DESC, updated_at ASC);
