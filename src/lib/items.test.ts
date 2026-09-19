import { describe, it, expect } from 'vitest'
import { ITEMS, PROBLEMS } from './problems'
import { ITEM_EMOJI, getItemEmoji, getShareItemEmoji } from './items'

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
