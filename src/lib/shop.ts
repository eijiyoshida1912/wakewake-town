import { SHOP_ITEMS, ShopItem, ItemCategory } from './items'

export type BuyResult =
  | { ok: true; coins: number; items: string[] }
  | { ok: false; reason: 'unknown' | 'owned' | 'not-enough-coins' }

/**
 * アイテムを買う。買えるなら、値段ぶん減ったコインと、増えたアイテム一覧を返す。
 * 買えないときは、理由を返す（お店にない / もう持っている / コインが足りない）。
 * 渡した items は書き換えない。
 */
export function buyItem(coins: number, items: string[], name: string): BuyResult {
  if (!Number.isInteger(coins) || coins < 0) {
    throw new RangeError(`コインは 0 以上の整数にしてください: ${coins}`)
  }
  const item = SHOP_ITEMS.find(shopItem => shopItem.name === name)
  if (!item) return { ok: false, reason: 'unknown' }
  if (items.includes(name)) return { ok: false, reason: 'owned' }
  if (coins < item.price) return { ok: false, reason: 'not-enough-coins' }
  return { ok: true, coins: coins - item.price, items: [...items, name] }
}

/**
 * お店に並ぶもの: まだ持っていないアイテムを、安い順に（同じ値段は町のかざりの順）。
 * category を渡すと、そのカテゴリのものだけになる。
 */
export function getShopItems(items: string[], category?: ItemCategory): ShopItem[] {
  return SHOP_ITEMS.filter(item => !items.includes(item.name) && (category === undefined || item.category === category)).sort(
    (a, b) => a.price - b.price,
  )
}

/** 持っているコインで、お店のアイテムを何か1つでも買えるか */
export function canAffordAny(coins: number, items: string[]): boolean {
  return getShopItems(items).some(item => item.price <= coins)
}
