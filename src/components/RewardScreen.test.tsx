import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import RewardScreen from './RewardScreen'

afterEach(() => {
  cleanup()
})

describe('RewardScreen', () => {
  it('「○○をもらったよ！」と、アイテムの絵文字を大きく表示する', () => {
    render(<RewardScreen item="いす" residentId="cat" onDone={() => {}} />)
    expect(screen.getByText('いすをもらったよ！')).toBeDefined()
    expect(screen.getByText('🪑')).toBeDefined()
  })

  it('だれがくれたのか（問題を出した住人）が分かる', () => {
    render(<RewardScreen item="ランプ" residentId="bear" onDone={() => {}} />)
    expect(screen.getByText(/クマさん/)).toBeDefined()
    expect(screen.queryByText(/ネコさん/)).toBeNull()
  })

  it('知らないアイテム名でも、📦 で表示されて壊れない', () => {
    render(<RewardScreen item="ふしぎなもの" residentId="rabbit" onDone={() => {}} />)
    expect(screen.getByText('ふしぎなものをもらったよ！')).toBeDefined()
    expect(screen.getByText('📦')).toBeDefined()
  })

  it('「やったー！」を押すと onDone が1回呼ばれる', () => {
    const onDone = vi.fn()
    render(<RewardScreen item="いす" residentId="cat" onDone={onDone} />)
    expect(onDone).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: /やったー/ }))
    expect(onDone).toHaveBeenCalledTimes(1)
  })
})
