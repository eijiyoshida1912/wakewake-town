import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import Home from './page'

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('ページ全体の画面遷移', () => {
  it('ホームの「おねがいをきく」を押すと、難易度選択画面が出る（すぐには依頼画面に進まない）', () => {
    render(<Home />)
    fireEvent.click(screen.getByRole('button', { name: /おねがいをきく/ }))
    expect(screen.getByText('どのおねがいにする？')).toBeDefined()
    expect(screen.queryByRole('button', { name: /お手伝いする/ })).toBeNull()
  })

  it('難易度選択画面の「もどる」でホームに戻る', () => {
    render(<Home />)
    fireEvent.click(screen.getByRole('button', { name: /おねがいをきく/ }))
    fireEvent.click(screen.getByRole('button', { name: /もどる/ }))
    expect(screen.getByRole('button', { name: /おねがいをきく/ })).toBeDefined()
  })

  it.each([
    ['かんたん', 'かんたん', false],
    ['まあまあ', 'まあまあ', false],
    ['チャレンジ', 'チャレンジ', true],
  ] as const)('「%s」を選ぶ → 依頼画面 → 筆算画面（%s）に進む', (label, badge, isChallenge) => {
    render(<Home />)
    fireEvent.click(screen.getByRole('button', { name: /おねがいをきく/ }))
    fireEvent.click(screen.getByRole('button', { name: new RegExp(label) }))

    fireEvent.click(screen.getByRole('button', { name: /お手伝いする/ }))
    expect(screen.getByText(badge)).toBeDefined()
    expect(screen.getByText(/を計算しよう/)).toBeDefined()
    expect(screen.queryByRole('group', { name: 'ひっ算' }) !== null).toBe(isChallenge)
  })

  it('選んだ難易度の問題が出る（チャレンジなら3桁の割り算）', () => {
    render(<Home />)
    fireEvent.click(screen.getByRole('button', { name: /おねがいをきく/ }))
    fireEvent.click(screen.getByRole('button', { name: /チャレンジ/ }))
    fireEvent.click(screen.getByRole('button', { name: /お手伝いする/ }))
    expect(screen.getByText(/\d{3} ÷ \d を計算しよう/)).toBeDefined()
  })
})
