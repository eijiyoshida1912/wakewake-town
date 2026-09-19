export type ItemCategory = 'furniture' | 'plants' | 'toys' | 'food' | 'vehicles'

/** アイテムのカテゴリ。町のかざりとお店の、タブの順になる */
export const ITEM_CATEGORIES: { id: ItemCategory; label: string; emoji: string }[] = [
  { id: 'furniture', label: 'かぐ', emoji: '🛋️' },
  { id: 'plants', label: 'しょくぶつ', emoji: '🌿' },
  { id: 'toys', label: 'おもちゃ', emoji: '🧸' },
  { id: 'food', label: 'たべもの', emoji: '🍰' },
  { id: 'vehicles', label: 'のりもの', emoji: '🚗' },
]

export interface ShopItem {
  name: string
  emoji: string
  /** お店で買うときの値段（コイン） */
  price: number
  category: ItemCategory
}

/**
 * 町にかざれるアイテム（5カテゴリ × 10個）。カテゴリごとにまとめて並べ、
 * その順番が、ホームの「町のかざり」の場所の順になる。
 * 値段は 30〜200。1問で 10〜30 コインもらえるので、安いものはすぐ、高いものは長く遊んで手に入る。
 * 先頭の8つは最初からあったアイテム。保存データに名前が残っているので、名前は変えないこと。
 */
export const SHOP_ITEMS: ShopItem[] = [
  // かぐ
  { name: 'いす', emoji: '🪑', price: 80, category: 'furniture' },
  { name: 'ランプ', emoji: '🪔', price: 50, category: 'furniture' },
  { name: 'クッション', emoji: '🛋️', price: 50, category: 'furniture' },
  { name: 'テーブル', emoji: '🪵', price: 100, category: 'furniture' },
  { name: 'ベッド', emoji: '🛏️', price: 100, category: 'furniture' },
  { name: 'とけい', emoji: '🕰️', price: 50, category: 'furniture' },
  { name: 'でんわ', emoji: '☎️', price: 40, category: 'furniture' },
  { name: 'テレビ', emoji: '📺', price: 150, category: 'furniture' },
  { name: 'ラジオ', emoji: '📻', price: 60, category: 'furniture' },
  { name: 'ほんだな', emoji: '📚', price: 80, category: 'furniture' },
  // しょくぶつ
  { name: '観葉植物', emoji: '🌿', price: 60, category: 'plants' },
  { name: 'フラワーポット', emoji: '🌸', price: 30, category: 'plants' },
  { name: 'ひまわり', emoji: '🌻', price: 30, category: 'plants' },
  { name: 'チューリップ', emoji: '🌷', price: 30, category: 'plants' },
  { name: 'バラ', emoji: '🌹', price: 40, category: 'plants' },
  { name: 'ハイビスカス', emoji: '🌺', price: 50, category: 'plants' },
  { name: 'サボテン', emoji: '🌵', price: 30, category: 'plants' },
  { name: 'やしのき', emoji: '🌴', price: 80, category: 'plants' },
  { name: 'もみのき', emoji: '🌲', price: 60, category: 'plants' },
  { name: 'クローバー', emoji: '🍀', price: 30, category: 'plants' },
  // おもちゃ
  { name: 'ぬいぐるみ', emoji: '🧸', price: 40, category: 'toys' },
  { name: 'ぼうし', emoji: '🎩', price: 30, category: 'toys' },
  { name: 'ボール', emoji: '⚽', price: 30, category: 'toys' },
  { name: 'ふうせん', emoji: '🎈', price: 30, category: 'toys' },
  { name: 'ロボット', emoji: '🤖', price: 80, category: 'toys' },
  { name: 'ゲーム', emoji: '🎮', price: 100, category: 'toys' },
  { name: 'ピアノ', emoji: '🎹', price: 150, category: 'toys' },
  { name: 'ギター', emoji: '🎸', price: 80, category: 'toys' },
  { name: 'パズル', emoji: '🧩', price: 50, category: 'toys' },
  { name: 'ぼうえんきょう', emoji: '🔭', price: 60, category: 'toys' },
  // たべもの
  { name: 'ケーキ', emoji: '🎂', price: 100, category: 'food' },
  { name: 'アイス', emoji: '🍦', price: 40, category: 'food' },
  { name: 'ドーナツ', emoji: '🍩', price: 30, category: 'food' },
  { name: 'ピザ', emoji: '🍕', price: 50, category: 'food' },
  { name: 'おにぎり', emoji: '🍙', price: 30, category: 'food' },
  { name: 'ハンバーガー', emoji: '🍔', price: 60, category: 'food' },
  { name: 'スイカ', emoji: '🍉', price: 60, category: 'food' },
  { name: 'いちご', emoji: '🍓', price: 30, category: 'food' },
  { name: 'りんご', emoji: '🍎', price: 30, category: 'food' },
  { name: 'プリン', emoji: '🍮', price: 40, category: 'food' },
  // のりもの
  { name: 'くるま', emoji: '🚗', price: 60, category: 'vehicles' },
  { name: 'バス', emoji: '🚌', price: 80, category: 'vehicles' },
  { name: 'でんしゃ', emoji: '🚃', price: 100, category: 'vehicles' },
  { name: 'ひこうき', emoji: '✈️', price: 150, category: 'vehicles' },
  { name: 'ふね', emoji: '⛵', price: 80, category: 'vehicles' },
  { name: 'ロケット', emoji: '🚀', price: 200, category: 'vehicles' },
  { name: 'じてんしゃ', emoji: '🚲', price: 30, category: 'vehicles' },
  { name: 'ヘリコプター', emoji: '🚁', price: 120, category: 'vehicles' },
  { name: 'きゅうきゅうしゃ', emoji: '🚑', price: 50, category: 'vehicles' },
  { name: 'しょうぼうしゃ', emoji: '🚒', price: 50, category: 'vehicles' },
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
