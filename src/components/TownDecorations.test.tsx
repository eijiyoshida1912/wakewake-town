import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import TownDecorations from './TownDecorations'
import { ITEMS, ITEM_CATEGORIES, SHOP_ITEMS } from '@/lib/items'

afterEach(() => {
  cleanup()
})

const slots = () => screen.getAllByRole('listitem').map(s => s.textContent)
const openTab = (label: string) => fireEvent.click(screen.getByRole('tab', { name: new RegExp(`^${label} `) }))

describe('TownDecorations: 町のかざり（カテゴリ別のタブ）', () => {
  it('はじめは、全体が「0 / 50」で、5つのタブが並び、最初のタブ（かぐ）が選ばれている', () => {
    render(<TownDecorations items={[]} />)
    expect(screen.getByText('0 / 50')).toBeDefined()
    const tabs = screen.getAllByRole('tab')
    expect(tabs).toHaveLength(5)
    expect(tabs[0].getAttribute('aria-selected')).toBe('true')
    expect(tabs.slice(1).every(t => t.getAttribute('aria-selected') === 'false')).toBe(true)
  })

  it('タブには、カテゴリ名と、そのカテゴリで集めた数が出る（かぐ 0 / 10）', () => {
    render(<TownDecorations items={['いす']} />)
    for (const category of ITEM_CATEGORIES) {
      const collected = category.label === 'かぐ' ? 1 : 0
      expect(screen.getByRole('tab', { name: `${category.label} ${collected} / 10` })).toBeDefined()
    }
  })

  it('選ばれているタブの10個の場所だけが出て、持っていなければ、すべて「？」', () => {
    render(<TownDecorations items={[]} />)
    expect(slots()).toHaveLength(10)
    expect(slots().every(t => t === '？')).toBe(true)
  })

  it('持っているアイテムは、絵文字と名前で表示され、ほかは「？」のまま（かぐ: いす）', () => {
    render(<TownDecorations items={['いす']} />)
    expect(slots()).toContain('🪑いす')
    expect(slots().filter(t => t === '？')).toHaveLength(9)
    expect(screen.getByText('1 / 50')).toBeDefined()
  })

  it('タブを切り替えると、そのカテゴリの場所が出る（おもちゃ: ぼうし）', () => {
    render(<TownDecorations items={['いす', 'ぼうし']} />)
    expect(slots()).not.toContain('🎩ぼうし')
    openTab('おもちゃ')
    expect(slots()).toContain('🎩ぼうし')
    expect(slots()).not.toContain('🪑いす')
    expect(screen.getByRole('tab', { name: /^おもちゃ / }).getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('tab', { name: /^かぐ / }).getAttribute('aria-selected')).toBe('false')
  })

  it('持っていないアイテムの名前は表示されない', () => {
    render(<TownDecorations items={['いす']} />)
    expect(screen.queryByText('テーブル')).toBeNull()
  })

  it('買った順番に関係なく、アイテムは決まった場所に並ぶ', () => {
    const { container: a } = render(<TownDecorations items={['ベッド', 'いす']} />)
    const first = a.textContent
    cleanup()
    const { container: b } = render(<TownDecorations items={['いす', 'ベッド']} />)
    expect(b.textContent).toBe(first)
  })

  it('いすはベッドより前の場所（アイテム一覧の順）', () => {
    render(<TownDecorations items={['ベッド', 'いす']} />)
    expect(slots().indexOf('🪑いす')).toBeLessThan(slots().indexOf('🛏️ベッド'))
  })

  it('50個すべて持っていると「50 / 50」で、どのタブにも「？」はない', () => {
    render(<TownDecorations items={[...ITEMS]} />)
    expect(screen.getByText('50 / 50')).toBeDefined()
    for (const category of ITEM_CATEGORIES) {
      openTab(category.label)
      expect(slots(), category.label).toHaveLength(10)
      expect(slots().includes('？'), category.label).toBe(false)
    }
  })

  it('お店にない名前（古い保存データ）は、場所にも数にも入らない', () => {
    render(<TownDecorations items={['ないアイテム', 'いす']} />)
    expect(screen.getByText('1 / 50')).toBeDefined()
    expect(screen.queryByText('ないアイテム')).toBeNull()
  })

  it('どのカテゴリの場所も、アイテムの定義（SHOP_ITEMS）の順に並ぶ', () => {
    render(<TownDecorations items={[...ITEMS]} />)
    for (const category of ITEM_CATEGORIES) {
      openTab(category.label)
      const expected = SHOP_ITEMS.filter(i => i.category === category.id).map(i => `${i.emoji}${i.name}`)
      expect(slots(), category.label).toEqual(expected)
    }
  })
})
