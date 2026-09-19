import { describe, it, expect } from 'vitest'
import { buyItem, getShopItems, canAffordAny } from './shop'
import { ITEMS } from './items'

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
  it('何も持っていなければ、8つすべてが、安い順に並ぶ（同じ値段は町のかざりの順）', () => {
    expect(getShopItems([]).map(i => `${i.name}:${i.price}`)).toEqual([
      'ぼうし:30',
      'フラワーポット:30',
      'ぬいぐるみ:40',
      'ランプ:50',
      'クッション:50',
      '観葉植物:60',
      'いす:80',
      'テーブル:100',
    ])
  })

  it('持っているものは、お店に並ばない', () => {
    const names = getShopItems(['ぼうし', 'いす']).map(i => i.name)
    expect(names).not.toContain('ぼうし')
    expect(names).not.toContain('いす')
    expect(names).toHaveLength(6)
  })

  it('お店にない名前（古い保存データ）を持っていても、ほかの並びに影響しない', () => {
    expect(getShopItems(['ないアイテム'])).toHaveLength(ITEMS.length)
  })

  it('全部持っているときは、空になる', () => {
    expect(getShopItems([...ITEMS])).toEqual([])
  })
})

describe('canAffordAny: 何か1つでも買えるか', () => {
  it('いちばん安いもの（30）ちょうどなら true、29 なら false（境界値）', () => {
    expect(canAffordAny(30, [])).toBe(true)
    expect(canAffordAny(29, [])).toBe(false)
  })

  it('安いものを持っていたら、残りでいちばん安いもの（ぬいぐるみ 40）が基準になる', () => {
    expect(canAffordAny(39, ['ぼうし', 'フラワーポット'])).toBe(false)
    expect(canAffordAny(40, ['ぼうし', 'フラワーポット'])).toBe(true)
  })

  it('全部持っているときは、コインがいくらあっても false', () => {
    expect(canAffordAny(9999, [...ITEMS])).toBe(false)
  })
})
