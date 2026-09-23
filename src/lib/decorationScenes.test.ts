import { describe, it, expect } from 'vitest'
import { DECORATION_SCENES } from './decorationScenes'
import { ITEM_CATEGORIES, SHOP_ITEMS } from './items'

describe('町のかざりの場面', () => {
  it('どのカテゴリにも場面がある（かぐ＝リビング、しょくぶつ＝にわ、おもちゃ＝こどもべや、たべもの＝ダイニング、のりもの＝まちとそら）', () => {
    expect(Object.fromEntries(ITEM_CATEGORIES.map(c => [c.id, DECORATION_SCENES[c.id].title]))).toEqual({
      furniture: 'リビング',
      plants: 'にわ',
      toys: 'こどもべや',
      food: 'ダイニング',
      vehicles: 'まちとそら',
    })
  })

  it('お店のアイテムはすべて、自分のカテゴリの場面に、ちょうど1つの置き場所がある', () => {
    for (const category of ITEM_CATEGORIES) {
      const expected = SHOP_ITEMS.filter(i => i.category === category.id).map(i => i.name).sort()
      expect(Object.keys(DECORATION_SCENES[category.id].spots).sort(), category.label).toEqual(expected)
    }
  })

  it('置き場所は場面の中（0〜100%）にあり、大きさは 0 より大きい', () => {
    for (const category of ITEM_CATEGORIES) {
      for (const [name, spot] of Object.entries(DECORATION_SCENES[category.id].spots)) {
        expect(spot.x, `${name} の x`).toBeGreaterThanOrEqual(0)
        expect(spot.x, `${name} の x`).toBeLessThanOrEqual(100)
        expect(spot.y, `${name} の y`).toBeGreaterThanOrEqual(0)
        expect(spot.y, `${name} の y`).toBeLessThanOrEqual(100)
        expect(spot.size, `${name} の大きさ`).toBeGreaterThan(0)
      }
    }
  })

  it('同じ場面で、2つのアイテムがまったく同じ場所に重なっていない', () => {
    for (const category of ITEM_CATEGORIES) {
      const positions = Object.values(DECORATION_SCENES[category.id].spots).map(s => `${s.x},${s.y}`)
      expect(new Set(positions).size, category.label).toBe(positions.length)
    }
  })
})
