export interface ShopItem {
  name: string
  emoji: string
  /** お店で買うときの値段（コイン） */
  price: number
}

/**
 * 町にかざれるアイテム。並び順が、ホームの「町のかざり」の場所の順になる。
 * 値段は、小物は安く、大きな家具は高くしてある（1問で10〜30コインもらえる）。
 */
export const SHOP_ITEMS: ShopItem[] = [
  { name: 'いす', emoji: '🪑', price: 80 },
  { name: 'ランプ', emoji: '🪔', price: 50 },
  { name: 'クッション', emoji: '🛋️', price: 50 },
  { name: '観葉植物', emoji: '🌿', price: 60 },
  { name: 'ぬいぐるみ', emoji: '🧸', price: 40 },
  { name: 'ぼうし', emoji: '🎩', price: 30 },
  { name: 'テーブル', emoji: '🪵', price: 100 },
  { name: 'フラワーポット', emoji: '🌸', price: 30 },
]

export const ITEMS = SHOP_ITEMS.map(item => item.name)

export const ITEM_EMOJI: Record<string, string> = Object.fromEntries(SHOP_ITEMS.map(item => [item.name, item.emoji]))

const UNKNOWN_ITEM_EMOJI = '📦'

/** アイテム名から絵文字を返す。知らない名前（古い保存データなど）は 📦 */
export function getItemEmoji(item: string): string {
  return ITEM_EMOJI[item] ?? UNKNOWN_ITEM_EMOJI
}

/** アイテム名から値段を返す。お店にない名前は RangeError */
export function getItemPrice(item: string): number {
  const found = SHOP_ITEMS.find(shopItem => shopItem.name === item)
  if (!found) throw new RangeError(`お店にないアイテムです: ${item}`)
  return found.price
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
