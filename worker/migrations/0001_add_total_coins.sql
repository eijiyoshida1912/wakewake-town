-- ランキングのポイントを「解いた数」から「もらったコインの合計」に変えたときの移行。
-- schema.sql の古い版（total_coins がない）で作ったDBに、1回だけ実行する。
-- すでに登録ずみの端末は 0 から始まり、次にランキング画面を開いたときの送信で埋まる。
ALTER TABLE players ADD COLUMN total_coins INTEGER NOT NULL DEFAULT 0;

DROP INDEX IF EXISTS idx_players_ranking;
CREATE INDEX IF NOT EXISTS idx_players_coins_ranking
  ON players (total_coins DESC, updated_at ASC);
