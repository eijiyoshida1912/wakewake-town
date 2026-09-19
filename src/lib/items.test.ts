import { describe, it, expect } from 'vitest'
import { ITEMS } from './problems'
import { ITEM_EMOJI, getItemEmoji } from './items'

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
