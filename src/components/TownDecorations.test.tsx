import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import TownDecorations from './TownDecorations'

afterEach(() => {
  cleanup()
})

const slots = () => screen.getAllByRole('listitem')

describe('TownDecorations: 町のかざり', () => {
  it('8つの場所があり、何も持っていなければ、すべて「？」で「0 / 8」', () => {
    render(<TownDecorations items={[]} />)
    expect(slots()).toHaveLength(8)
    expect(slots().every(s => s.textContent === '？')).toBe(true)
    expect(screen.getByText('0 / 8')).toBeDefined()
  })

  it('持っているアイテムは、絵文字と名前で表示され、ほかは「？」のまま（ぼうし・いす）', () => {
    render(<TownDecorations items={['ぼうし', 'いす']} />)
    const texts = slots().map(s => s.textContent)
    expect(texts).toContain('🎩ぼうし')
    expect(texts).toContain('🪑いす')
    expect(texts.filter(t => t === '？')).toHaveLength(6)
    expect(screen.getByText('2 / 8')).toBeDefined()
  })

  it('持っていないアイテムの名前は表示されない', () => {
    render(<TownDecorations items={['ぼうし']} />)
    expect(screen.queryByText('いす')).toBeNull()
    expect(screen.queryByText('テーブル')).toBeNull()
  })

  it('買った順番に関係なく、アイテムは決まった場所に並ぶ', () => {
    const { container: a } = render(<TownDecorations items={['ぼうし', 'いす']} />)
    const first = a.textContent
    cleanup()
    const { container: b } = render(<TownDecorations items={['いす', 'ぼうし']} />)
    expect(b.textContent).toBe(first)
  })

  it('いすはぼうしより前の場所（アイテム一覧の順）', () => {
    render(<TownDecorations items={['ぼうし', 'いす']} />)
    const texts = slots().map(s => s.textContent)
    expect(texts.indexOf('🪑いす')).toBeLessThan(texts.indexOf('🎩ぼうし'))
  })

  it('8つすべて持っていると「8 / 8」で、「？」はなくなる', () => {
    render(
      <TownDecorations
        items={['いす', 'ランプ', 'クッション', '観葉植物', 'ぬいぐるみ', 'ぼうし', 'テーブル', 'フラワーポット']}
      />,
    )
    expect(screen.getByText('8 / 8')).toBeDefined()
    expect(slots().some(s => s.textContent === '？')).toBe(false)
  })

  it('お店にない名前（古い保存データ）は、場所にも数にも入らない', () => {
    render(<TownDecorations items={['ないアイテム', 'いす']} />)
    expect(screen.getByText('1 / 8')).toBeDefined()
    expect(screen.queryByText('ないアイテム')).toBeNull()
  })
})
