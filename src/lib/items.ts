export const ITEM_EMOJI: Record<string, string> = {
  'いす': '🪑',
  'ランプ': '🪔',
  'クッション': '🛋️',
  '観葉植物': '🌿',
  'ぬいぐるみ': '🧸',
  'ぼうし': '🎩',
  'テーブル': '🪵',
  'フラワーポット': '🌸',
}

const UNKNOWN_ITEM_EMOJI = '📦'

/** アイテム名から絵文字を返す。知らない名前（古い保存データなど）は 📦 */
export function getItemEmoji(item: string): string {
  return ITEM_EMOJI[item] ?? UNKNOWN_ITEM_EMOJI
}

/** 問題に出てくる「わけるもの」の絵文字（わけわけのアニメーションで使う） */
export const SHARE_ITEM_EMOJI: Record<string, string> = {
  'キャンディ': '🍬',
  'クッキー': '🍪',
  'どんぐり': '🌰',
  'おだんご': '🍡',
  'どんぐりパン': '🍞',
  'ハチミツ': '🍯',
  'おかし袋': '🍭',
  'にんじん': '🥕',
  'くり': '🌰',
  'ポップコーン': '🍿',
  'おさかな': '🐟',
  'ビーズ': '🔵',
  'おかし': '🍩',
  'キャベツ': '🥬',
}

const UNKNOWN_SHARE_ITEM_EMOJI = '🎁'

/** わけるものの名前から絵文字を返す。知らない名前は 🎁 */
export function getShareItemEmoji(item: string): string {
  return SHARE_ITEM_EMOJI[item] ?? UNKNOWN_SHARE_ITEM_EMOJI
}
