import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import RequestScene from './RequestScene'
import { makeProblem } from '@/test/fixtures'

const problem = makeProblem(75, 4, 18, 3)

afterEach(() => {
  cleanup()
})

describe('RequestScene', () => {
  it('おねがいの式（75 ÷ 4）と、「お手伝いする！」「もどる」のボタンが表示される', () => {
    render(<RequestScene problem={problem} onAccept={() => {}} onBack={() => {}} />)
    expect(screen.getByText('75 ÷ 4')).toBeDefined()
    expect(screen.getByRole('button', { name: /お手伝いする/ })).toBeDefined()
    expect(screen.getByRole('button', { name: /もどる/ })).toBeDefined()
  })

  it('「もどる」を押すと onBack が1回呼ばれ、onAccept は呼ばれない', () => {
    const onAccept = vi.fn()
    const onBack = vi.fn()
    render(<RequestScene problem={problem} onAccept={onAccept} onBack={onBack} />)
    fireEvent.click(screen.getByRole('button', { name: /もどる/ }))
    expect(onBack).toHaveBeenCalledTimes(1)
    expect(onAccept).not.toHaveBeenCalled()
  })

  it('「お手伝いする！」を押すと onAccept が1回呼ばれ、onBack は呼ばれない', () => {
    const onAccept = vi.fn()
    const onBack = vi.fn()
    render(<RequestScene problem={problem} onAccept={onAccept} onBack={onBack} />)
    fireEvent.click(screen.getByRole('button', { name: /お手伝いする/ }))
    expect(onAccept).toHaveBeenCalledTimes(1)
    expect(onBack).not.toHaveBeenCalled()
  })
})
