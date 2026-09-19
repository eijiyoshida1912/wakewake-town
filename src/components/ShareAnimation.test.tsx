import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react'
import ShareAnimation from './ShareAnimation'
import { makeProblem } from '@/test/fixtures'

const p96 = { ...makeProblem(96, 3, 32, 0), difficulty: 'easy' as const, item: 'キャンディ' }
const p75 = makeProblem(75, 4, 18, 3)

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

const advance = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms)
  })

const numberIn = (el: Element) => Number((el.textContent ?? '').replace(/\D/g, ''))
const friends = () => screen.getAllByRole('group', { name: /なかま/ })
const eachCounts = () => friends().map(numberIn)
const left = () => numberIn(screen.getByRole('group', { name: 'のこり' }))

describe('ShareAnimation: 表示', () => {
  it('割る数と同じ人数のなかまが出る（3, 4, 9）', () => {
    for (const [dividend, divisor, quotient, remainder] of [[96, 3, 32, 0], [75, 4, 18, 3], [100, 9, 11, 1]] as const) {
      render(<ShareAnimation problem={makeProblem(dividend, divisor, quotient, remainder)} />)
      expect(friends()).toHaveLength(divisor)
      cleanup()
    }
  })

  it('はじめは、みんな 0 で、のこりが全部（96）', () => {
    render(<ShareAnimation problem={p96} />)
    expect(eachCounts()).toEqual([0, 0, 0])
    expect(left()).toBe(96)
  })

  it('何を何人にわけるかが分かる（キャンディの絵文字と、96 を 3 つに）', () => {
    render(<ShareAnimation problem={p96} />)
    const region = screen.getByRole('region', { name: 'わけわけ' })
    expect(region.textContent).toContain('🍬')
    expect(region.textContent).toMatch(/96 を 3 つに/)
  })

  it('知らないアイテム名でも、🎁 で表示されて壊れない', () => {
    render(<ShareAnimation problem={{ ...p96, item: 'ふしぎなもの' }} />)
    expect(screen.getByRole('region', { name: 'わけわけ' }).textContent).toContain('🎁')
  })
})

describe('ShareAnimation: 動き', () => {
  it('時間がたつと、みんなの数が増えて、のこりが減る', () => {
    render(<ShareAnimation problem={p96} />)
    advance(1000)
    expect(eachCounts()[0]).toBeGreaterThan(0)
    expect(left()).toBeLessThan(96)
  })

  it('動いている間、いつでも「みんなの数 × 人数 + のこり = 全部」が成り立つ（75 ÷ 4）', () => {
    render(<ShareAnimation problem={p75} />)
    let previousEach = -1
    for (let t = 0; t <= 3200; t += 100) {
      const counts = eachCounts()
      // みんな同じ数ずつ
      expect(new Set(counts).size).toBe(1)
      expect(counts[0] * 4 + left(), `${t}ms`).toBe(75)
      expect(counts[0]).toBeGreaterThanOrEqual(previousEach)
      previousEach = counts[0]
      advance(100)
    }
  })

  it('おわると、みんな商（18）で、のこりがあまり（3）。「あまり」と表示される', () => {
    render(<ShareAnimation problem={p75} />)
    advance(5000)
    expect(eachCounts()).toEqual([18, 18, 18, 18])
    expect(left()).toBe(3)
    expect(screen.getByRole('group', { name: 'のこり' }).textContent).toMatch(/あまり/)
  })

  it('わりきれるとき（96 ÷ 3）は、おわりが 32 ずつ・のこり 0 で、「ぴったり」と出て、「あまり」は出ない', () => {
    render(<ShareAnimation problem={p96} />)
    advance(5000)
    expect(eachCounts()).toEqual([32, 32, 32])
    expect(left()).toBe(0)
    const pile = screen.getByRole('group', { name: 'のこり' }).textContent ?? ''
    expect(pile).toMatch(/ぴったり/)
    expect(pile).not.toMatch(/あまり/)
  })

  it('動いている間は「のこり」と表示され、おわるまで「あまり」とは出ない', () => {
    render(<ShareAnimation problem={p75} />)
    advance(500)
    expect(screen.getByRole('group', { name: 'のこり' }).textContent).toMatch(/のこり/)
    expect(screen.getByRole('group', { name: 'のこり' }).textContent).not.toMatch(/あまり/)
  })

  it('3桁の大きな数でも動く（749 ÷ 3 = 249 あまり 2）', () => {
    render(<ShareAnimation problem={makeProblem(749, 3, 249, 2)} />)
    advance(5000)
    expect(eachCounts()).toEqual([249, 249, 249])
    expect(left()).toBe(2)
  })
})

describe('ShareAnimation: ボタン', () => {
  it('「スキップ」を押すと、すぐおわりの状態になる', () => {
    render(<ShareAnimation problem={p75} />)
    fireEvent.click(screen.getByRole('button', { name: /スキップ/ }))
    expect(eachCounts()).toEqual([18, 18, 18, 18])
    expect(left()).toBe(3)
  })

  it('おわったあとは、「スキップ」の代わりに「もういちどみる」が出る', () => {
    render(<ShareAnimation problem={p75} />)
    expect(screen.queryByRole('button', { name: /もういちど/ })).toBeNull()
    advance(5000)
    expect(screen.queryByRole('button', { name: /スキップ/ })).toBeNull()
    expect(screen.getByRole('button', { name: /もういちどみる/ })).toBeDefined()
  })

  it('「もういちどみる」を押すと、はじめ（0・のこり全部）に戻って、また最後まで動く', () => {
    render(<ShareAnimation problem={p75} />)
    advance(5000)
    fireEvent.click(screen.getByRole('button', { name: /もういちどみる/ }))
    expect(eachCounts()).toEqual([0, 0, 0, 0])
    expect(left()).toBe(75)
    advance(5000)
    expect(eachCounts()).toEqual([18, 18, 18, 18])
    expect(left()).toBe(3)
  })

  it('スキップしたあとも、「もういちどみる」で見られる', () => {
    render(<ShareAnimation problem={p75} />)
    fireEvent.click(screen.getByRole('button', { name: /スキップ/ }))
    fireEvent.click(screen.getByRole('button', { name: /もういちどみる/ }))
    expect(eachCounts()).toEqual([0, 0, 0, 0])
  })
})

describe('ShareAnimation: 動きを減らす設定', () => {
  it('「動きを減らす」設定のときは、最初からおわりの状態で、「もういちどみる」が出る', () => {
    vi.stubGlobal('matchMedia', (query: string) => ({ matches: query.includes('reduce'), media: query }))
    render(<ShareAnimation problem={p75} />)
    expect(eachCounts()).toEqual([18, 18, 18, 18])
    expect(left()).toBe(3)
    expect(screen.getByRole('button', { name: /もういちどみる/ })).toBeDefined()
  })

  it('設定がないとき・matchMedia が使えないときは、ふつうに動く', () => {
    render(<ShareAnimation problem={p75} />)
    expect(eachCounts()).toEqual([0, 0, 0, 0])
  })
})
