import { describe, it, expect } from 'vitest'
import { PROBLEMS } from './problems'
import { ITEMS, SHOP_ITEMS, ITEM_EMOJI, getItemEmoji, getItemPrice, getShareItemEmoji } from './items'

describe('アイテムの絵文字', () => {
  it('ITEMS のすべてのアイテムに絵文字がある', () => {
    for (const item of ITEMS) {
      expect(ITEM_EMOJI[item], `${item} の絵文字`).toBeDefined()
    }
  })

  it('アイテムの絵文字は、ほかのアイテムと重ならない', () => {
    const emojis = ITEMS.map(item => ITEM_EMOJI[item])
    expect(new Set(emojis).size).toBe(ITEMS.length)
  })

  it('getItemEmoji は、アイテム名から絵文字を返す（いす → 🪑）', () => {
    expect(getItemEmoji('いす')).toBe('🪑')
    expect(getItemEmoji('ぬいぐるみ')).toBe('🧸')
  })

  it('知らないアイテム名（保存データが古いときなど）は 📦 になる', () => {
    expect(getItemEmoji('ないアイテム')).toBe('📦')
    expect(getItemEmoji('')).toBe('📦')
  })
})

describe('わけるものの絵文字（問題に出てくるもの）', () => {
  it('問題に出てくるすべてのものに、専用の絵文字がある（🎁 にならない）', () => {
    for (const problem of PROBLEMS) {
      expect(getShareItemEmoji(problem.item), `問題 ${problem.id} の「${problem.item}」`).not.toBe('🎁')
    }
  })

  it('キャンディは 🍬、にんじんは 🥕', () => {
    expect(getShareItemEmoji('キャンディ')).toBe('🍬')
    expect(getShareItemEmoji('にんじん')).toBe('🥕')
  })

  it('知らないものは 🎁 になる', () => {
    expect(getShareItemEmoji('ふしぎなもの')).toBe('🎁')
    expect(getShareItemEmoji('')).toBe('🎁')
  })
})

describe('お店のアイテムと値段', () => {
  it('8種類のアイテムがあり、名前は重ならない', () => {
    expect(SHOP_ITEMS).toHaveLength(8)
    expect(new Set(SHOP_ITEMS.map(i => i.name)).size).toBe(8)
  })

  it('値段は品物ごとに決まっている（小物は安く、大きな家具は高い）', () => {
    expect(Object.fromEntries(SHOP_ITEMS.map(i => [i.name, i.price]))).toEqual({
      'いす': 80,
      'ランプ': 50,
      'クッション': 50,
      '観葉植物': 60,
      'ぬいぐるみ': 40,
      'ぼうし': 30,
      'テーブル': 100,
      'フラワーポット': 30,
    })
  })

  it('値段はどれも 1 以上の整数で、すべて同じではない', () => {
    for (const item of SHOP_ITEMS) {
      expect(Number.isInteger(item.price) && item.price >= 1, item.name).toBe(true)
    }
    expect(new Set(SHOP_ITEMS.map(i => i.price)).size).toBeGreaterThan(1)
  })

  it('ITEMS は、町のかざりの並び順（SHOP_ITEMS の順）の名前一覧', () => {
    expect(ITEMS).toEqual(SHOP_ITEMS.map(i => i.name))
    expect(ITEMS[0]).toBe('いす')
  })

  it('getItemPrice は、名前から値段を返す（いす → 80）', () => {
    expect(getItemPrice('いす')).toBe(80)
    expect(getItemPrice('ぼうし')).toBe(30)
  })

  it('getItemPrice は、お店にない名前では RangeError', () => {
    expect(() => getItemPrice('ふしぎなもの')).toThrow(RangeError)
  })
})
