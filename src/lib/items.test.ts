import { describe, it, expect } from 'vitest'
import { PROBLEMS } from './problems'
import { ITEMS, SHOP_ITEMS, ITEM_CATEGORIES, ITEM_EMOJI, getItemEmoji, getItemPrice, getShareItemEmoji } from './items'

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
  it('50種類のアイテムがあり、名前は重ならない', () => {
    expect(SHOP_ITEMS).toHaveLength(50)
    expect(new Set(SHOP_ITEMS.map(i => i.name)).size).toBe(50)
  })

  it('カテゴリは、かぐ・しょくぶつ・おもちゃ・たべもの・のりもの の5つ（この順）', () => {
    expect(ITEM_CATEGORIES.map(c => c.label)).toEqual(['かぐ', 'しょくぶつ', 'おもちゃ', 'たべもの', 'のりもの'])
    expect(new Set(ITEM_CATEGORIES.map(c => c.id)).size).toBe(5)
  })

  it('どのカテゴリにも、ちょうど10個ずつ入っている', () => {
    for (const category of ITEM_CATEGORIES) {
      expect(SHOP_ITEMS.filter(i => i.category === category.id), category.label).toHaveLength(10)
    }
  })

  it('すべてのアイテムが、存在するカテゴリに入っている', () => {
    const ids = ITEM_CATEGORIES.map(c => c.id)
    for (const item of SHOP_ITEMS) expect(ids, item.name).toContain(item.category)
  })

  it('SHOP_ITEMS は、カテゴリごとにまとまって並んでいる（カテゴリ順）', () => {
    const order = SHOP_ITEMS.map(i => ITEM_CATEGORIES.findIndex(c => c.id === i.category))
    expect(order).toEqual([...order].sort((a, b) => a - b))
  })

  it('今までの8つのアイテムは、名前・絵文字・値段・カテゴリを変えていない（保存データを守るため）', () => {
    const existing = Object.fromEntries(
      ['いす', 'ランプ', 'クッション', 'テーブル', '観葉植物', 'フラワーポット', 'ぬいぐるみ', 'ぼうし'].map(name => {
        const item = SHOP_ITEMS.find(i => i.name === name)!
        return [name, [item.emoji, item.price, item.category]]
      }),
    )
    expect(existing).toEqual({
      'いす': ['🪑', 80, 'furniture'],
      'ランプ': ['🪔', 50, 'furniture'],
      'クッション': ['🛋️', 50, 'furniture'],
      'テーブル': ['🪵', 100, 'furniture'],
      '観葉植物': ['🌿', 60, 'plants'],
      'フラワーポット': ['🌸', 30, 'plants'],
      'ぬいぐるみ': ['🧸', 40, 'toys'],
      'ぼうし': ['🎩', 30, 'toys'],
    })
  })

  it('値段は、30・40・50・60・80・100・120・150・200 のどれか（きまった段階）', () => {
    const allowed = new Set([30, 40, 50, 60, 80, 100, 120, 150, 200])
    for (const item of SHOP_ITEMS) expect(allowed.has(item.price), `${item.name}: ${item.price}`).toBe(true)
  })

  it('いちばん安いのは 30、いちばん高いのは 200', () => {
    const prices = SHOP_ITEMS.map(i => i.price)
    expect(Math.min(...prices)).toBe(30)
    expect(Math.max(...prices)).toBe(200)
  })

  it('どのカテゴリにも、すぐ買える安いもの（50以下）と、目標になる高いもの（80以上）がある', () => {
    for (const category of ITEM_CATEGORIES) {
      const prices = SHOP_ITEMS.filter(i => i.category === category.id).map(i => i.price)
      expect(Math.min(...prices), `${category.label} の安いもの`).toBeLessThanOrEqual(50)
      expect(Math.max(...prices), `${category.label} の高いもの`).toBeGreaterThanOrEqual(80)
    }
  })

  it('全部そろえるのに必要なコインは、3,000〜3,500（じっくり遊べる量）', () => {
    const total = SHOP_ITEMS.reduce((sum, i) => sum + i.price, 0)
    expect(total).toBeGreaterThanOrEqual(3000)
    expect(total).toBeLessThanOrEqual(3500)
  })

  it('ITEMS は、SHOP_ITEMS の順の名前一覧で、先頭は「いす」', () => {
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
