import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import DifficultySelect from './DifficultySelect'

afterEach(() => {
  cleanup()
})

describe('DifficultySelect', () => {
  it('かんたん・まあまあ・チャレンジの3つを、この順番で表示する', () => {
    render(<DifficultySelect onSelect={() => {}} onBack={() => {}} />)
    const names = screen
      .getAllByRole('button')
      .map(b => b.textContent ?? '')
      .filter(t => /かんたん|まあまあ|チャレンジ/.test(t))
    expect(names).toHaveLength(3)
    expect(names[0]).toContain('かんたん')
    expect(names[1]).toContain('まあまあ')
    expect(names[2]).toContain('チャレンジ')
  })

  it('それぞれ、もらえるコインが表示される（10 / 15 / 30）', () => {
    render(<DifficultySelect onSelect={() => {}} onBack={() => {}} />)
    expect(screen.getByRole('button', { name: /かんたん/ }).textContent).toContain('10')
    expect(screen.getByRole('button', { name: /まあまあ/ }).textContent).toContain('15')
    expect(screen.getByRole('button', { name: /チャレンジ/ }).textContent).toContain('30')
  })

  it('それぞれ、けた数・あまり・ヒントの有無が表示される', () => {
    render(<DifficultySelect onSelect={() => {}} onBack={() => {}} />)
    const easy = screen.getByRole('button', { name: /かんたん/ }).textContent
    expect(easy).toContain('2けた')
    expect(easy).toContain('あまりなし')
    expect(easy).toContain('ヒントあり')

    const normal = screen.getByRole('button', { name: /まあまあ/ }).textContent
    expect(normal).toContain('2けた')
    expect(normal).toContain('あまりあり')
    expect(normal).toContain('ヒントあり')

    const challenge = screen.getByRole('button', { name: /チャレンジ/ }).textContent
    expect(challenge).toContain('3けた')
    expect(challenge).toContain('あまりあり')
    expect(challenge).toContain('ヒントなし')
  })

  it.each([
    ['かんたん', 'easy'],
    ['まあまあ', 'normal'],
    ['チャレンジ', 'challenge'],
  ] as const)('「%s」を押すと onSelect(%s) が1回呼ばれる', (label, difficulty) => {
    const onSelect = vi.fn()
    render(<DifficultySelect onSelect={onSelect} onBack={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: new RegExp(label) }))
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect).toHaveBeenCalledWith(difficulty)
  })

  it('「もどる」を押すと onBack が呼ばれ、onSelect は呼ばれない', () => {
    const onSelect = vi.fn()
    const onBack = vi.fn()
    render(<DifficultySelect onSelect={onSelect} onBack={onBack} />)
    fireEvent.click(screen.getByRole('button', { name: /もどる/ }))
    expect(onBack).toHaveBeenCalledTimes(1)
    expect(onSelect).not.toHaveBeenCalled()
  })
})
