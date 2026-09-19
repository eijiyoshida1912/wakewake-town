import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react'
import Home from './page'

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.useRealTimers()
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

describe('アイテムをもらったときのお祝い（ページ全体）', () => {
  const advance = (ms: number) => act(() => { vi.advanceTimersByTime(ms) })
  const submit = (answer: string) => {
    for (const ch of answer) fireEvent.click(screen.getByRole('button', { name: ch }))
    fireEvent.click(screen.getByRole('button', { name: 'こたえる！' }))
    advance(800)
  }

  it('かんたん（96 ÷ 3）を解いてアイテムをもらうと、お祝い画面 → 「やったー！」でホーム。持ち物に増えている', () => {
    vi.useFakeTimers()
    render(<Home />)
    // 乱数 0: 最初のかんたん（96 ÷ 3）が出て、アイテム（いす）がもらえる
    vi.spyOn(Math, 'random').mockReturnValue(0)
    fireEvent.click(screen.getByRole('button', { name: /おねがいをきく/ }))
    fireEvent.click(screen.getByRole('button', { name: /かんたん/ }))
    fireEvent.click(screen.getByRole('button', { name: /お手伝いする/ }))
    expect(screen.getByText(/96 ÷ 3 を計算しよう/)).toBeDefined()

    submit('3')
    submit('9')
    submit('0')
    fireEvent.click(screen.getByRole('button', { name: /6 をおろす/ }))
    advance(700)
    submit('2')
    submit('6')
    submit('0')

    fireEvent.click(screen.getByRole('button', { name: /つぎのおねがいへ/ }))
    expect(screen.getByText('いすをもらったよ！')).toBeDefined()
    expect(screen.queryByRole('button', { name: /おねがいをきく/ })).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: /やったー/ }))
    expect(screen.getByRole('button', { name: /おねがいをきく/ })).toBeDefined()
    expect(screen.getByText('いす')).toBeDefined()
    expect(screen.getByText('1 こ')).toBeDefined()
  })
})

describe('お店と町のかざり（ページ全体）', () => {
  const seed = (coins: number, items: string[] = []) =>
    localStorage.setItem('wakewake-town-save', JSON.stringify({ coins, items, problemsSolved: 0 }))

  it('ホームの町のかざりは、最初はすべて「？」で「0 / 50」（かぐのタブ: 10個）', () => {
    render(<Home />)
    expect(screen.getByText('0 / 50')).toBeDefined()
    expect(screen.getAllByText('？')).toHaveLength(10)
  })

  it('コインで買えるものがあるときだけ、ホームの「おみせ」に「かえるものがあるよ！」が出る', () => {
    seed(29)
    render(<Home />)
    expect(screen.queryByText(/かえるものがあるよ/)).toBeNull()
    cleanup()
    seed(30)
    render(<Home />)
    expect(screen.getByText(/かえるものがあるよ/)).toBeDefined()
  })

  it('おみせでぼうしを買う → コインが減る → もどると、町のかざり（おもちゃ）にぼうしが並ぶ', () => {
    seed(100)
    render(<Home />)
    fireEvent.click(screen.getByRole('button', { name: /おみせ/ }))
    expect(screen.getByRole('heading', { name: /おみせ/ })).toBeDefined()

    fireEvent.click(screen.getByRole('tab', { name: /^おもちゃ / }))
    fireEvent.click(screen.getByRole('button', { name: 'ぼうしをかう' }))
    // 買った直後は、「かったよ！」のモーダルが出て、うしろでコインが減り、買ったものは並ばなくなる
    expect(screen.getByRole('dialog', { name: /ぼうしをかったよ！/ })).toBeDefined()
    expect(screen.queryByRole('button', { name: 'ぼうしをかう' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: /やったー/ }))
    expect(screen.queryByRole('dialog')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: /もどる/ }))
    expect(screen.getByRole('button', { name: /おねがいをきく/ })).toBeDefined()
    fireEvent.click(screen.getByRole('tab', { name: /^おもちゃ / }))
    expect(screen.getAllByRole('listitem').map(li => li.textContent)).toContain('🎩ぼうし')
    expect(screen.getByText('1 / 50')).toBeDefined()
    // コインは、ヘッダーと「もっているコイン」の2か所に出る
    expect(screen.getAllByText(/🪙\s*70/)).toHaveLength(2)
    expect(JSON.parse(localStorage.getItem('wakewake-town-save') ?? 'null')).toMatchObject({ coins: 70, items: ['ぼうし'] })
  })

  it('今までの保存データ（8つのアイテム）は、そのまま使える（いす・ぼうしを持っている）', () => {
    seed(0, ['いす', 'ぼうし'])
    render(<Home />)
    expect(screen.getByText('2 / 50')).toBeDefined()
    expect(screen.getAllByRole('listitem').map(li => li.textContent)).toContain('🪑いす')
  })
})
