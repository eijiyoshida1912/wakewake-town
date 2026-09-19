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
