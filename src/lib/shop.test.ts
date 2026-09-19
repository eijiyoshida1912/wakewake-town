import { describe, it, expect } from 'vitest'
import { buyItem, getShopItems, canAffordAny } from './shop'
import { ITEMS, SHOP_ITEMS, ITEM_CATEGORIES } from './items'

describe('buyItem: 買う', () => {
  it('コインが足りれば、値段ぶんコインが減って、アイテムが増える（いす 80: 100 → 20）', () => {
    expect(buyItem(100, [], 'いす')).toEqual({ ok: true, coins: 20, items: ['いす'] })
  })

  it('持っているアイテムの後ろに、買ったアイテムが加わる', () => {
    expect(buyItem(100, ['ランプ'], 'ぼうし')).toEqual({ ok: true, coins: 70, items: ['ランプ', 'ぼうし'] })
  })

  it('ちょうどのコイン（ぼうし 30 に 30）で買えて、コインは 0 になる（境界値）', () => {
    expect(buyItem(30, [], 'ぼうし')).toEqual({ ok: true, coins: 0, items: ['ぼうし'] })
  })

  it('1コイン足りない（29）と買えない', () => {
    expect(buyItem(29, [], 'ぼうし')).toEqual({ ok: false, reason: 'not-enough-coins' })
  })

  it('コインが 0 のときも買えない', () => {
    expect(buyItem(0, [], 'ぼうし')).toEqual({ ok: false, reason: 'not-enough-coins' })
  })

  it('もう持っているアイテムは、コインが足りていても買えない', () => {
    expect(buyItem(1000, ['いす'], 'いす')).toEqual({ ok: false, reason: 'owned' })
  })

  it('お店にないアイテムは買えない', () => {
    expect(buyItem(1000, [], 'ふしぎなもの')).toEqual({ ok: false, reason: 'unknown' })
  })

  it('持っているアイテムの配列を書き換えない', () => {
    const owned = ['ランプ']
    buyItem(100, owned, 'ぼうし')
    expect(owned).toEqual(['ランプ'])
  })

  it('コインが負・小数のときは RangeError', () => {
    expect(() => buyItem(-1, [], 'ぼうし')).toThrow(RangeError)
    expect(() => buyItem(30.5, [], 'ぼうし')).toThrow(RangeError)
  })
})

describe('getShopItems: お店に並ぶもの', () => {
  it('何も持っていなければ、50個すべてが並ぶ', () => {
    expect(getShopItems([])).toHaveLength(50)
  })

  it('安い順に並び、同じ値段のものは、町のかざりの順（SHOP_ITEMS の順）になる', () => {
    const shown = getShopItems([])
    for (let i = 1; i < shown.length; i++) {
      const before = shown[i - 1]
      const after = shown[i]
      expect(after.price).toBeGreaterThanOrEqual(before.price)
      if (after.price === before.price) {
        expect(SHOP_ITEMS.indexOf(after), `${before.name} → ${after.name}`).toBeGreaterThan(SHOP_ITEMS.indexOf(before))
      }
    }
  })

  it('カテゴリを指定すると、そのカテゴリのものだけが、安い順に並ぶ（10個）', () => {
    for (const category of ITEM_CATEGORIES) {
      const shown = getShopItems([], category.id)
      expect(shown, category.label).toHaveLength(10)
      expect(shown.every(i => i.category === category.id)).toBe(true)
      expect(shown.map(i => i.price)).toEqual([...shown.map(i => i.price)].sort((a, b) => a - b))
    }
  })

  it('持っているものは、お店に並ばない（カテゴリ指定でも同じ）', () => {
    const names = getShopItems(['ぼうし', 'いす']).map(i => i.name)
    expect(names).not.toContain('ぼうし')
    expect(names).not.toContain('いす')
    expect(names).toHaveLength(48)
    expect(getShopItems(['ぼうし'], 'toys')).toHaveLength(9)
    expect(getShopItems(['ぼうし'], 'furniture')).toHaveLength(10)
  })

  it('お店にない名前（古い保存データ）を持っていても、ほかの並びに影響しない', () => {
    expect(getShopItems(['ないアイテム'])).toHaveLength(ITEMS.length)
  })

  it('全部持っているときは、空になる', () => {
    expect(getShopItems([...ITEMS])).toEqual([])
  })

  it('1つのカテゴリだけそろえると、そのカテゴリは空で、ほかは10個のまま', () => {
    const furniture = SHOP_ITEMS.filter(i => i.category === 'furniture').map(i => i.name)
    expect(getShopItems(furniture, 'furniture')).toEqual([])
    expect(getShopItems(furniture, 'plants')).toHaveLength(10)
  })
})

describe('canAffordAny: 何か1つでも買えるか', () => {
  it('いちばん安いもの（30）ちょうどなら true、29 なら false（境界値）', () => {
    expect(canAffordAny(30, [])).toBe(true)
    expect(canAffordAny(29, [])).toBe(false)
  })

  it('30 コインのものを全部持っていたら、残りでいちばん安いもの（40）が基準になる', () => {
    const owned = SHOP_ITEMS.filter(i => i.price === 30).map(i => i.name)
    expect(canAffordAny(39, owned)).toBe(false)
    expect(canAffordAny(40, owned)).toBe(true)
  })

  it('全部持っているときは、コインがいくらあっても false', () => {
    expect(canAffordAny(9999, [...ITEMS])).toBe(false)
  })
})
