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

describe('ひとつ前の画面に戻る（ページ全体）', () => {
  const toRequest = (label: RegExp) => {
    fireEvent.click(screen.getByRole('button', { name: /おねがいをきく/ }))
    fireEvent.click(screen.getByRole('button', { name: label }))
  }

  it('依頼画面の「もどる」で、難易度選択画面に戻る。そこからホームにも戻れる', () => {
    render(<Home />)
    toRequest(/かんたん/)
    expect(screen.getByRole('button', { name: /お手伝いする/ })).toBeDefined()

    fireEvent.click(screen.getByRole('button', { name: /もどる/ }))
    expect(screen.getByText('どのおねがいにする？')).toBeDefined()
    expect(screen.queryByRole('button', { name: /お手伝いする/ })).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: /もどる/ }))
    expect(screen.getByRole('button', { name: /おねがいをきく/ })).toBeDefined()
  })

  it('依頼画面から戻って、別の難易度（チャレンジ）を選び直せる', () => {
    render(<Home />)
    toRequest(/かんたん/)
    fireEvent.click(screen.getByRole('button', { name: /もどる/ }))
    fireEvent.click(screen.getByRole('button', { name: /チャレンジ/ }))
    fireEvent.click(screen.getByRole('button', { name: /お手伝いする/ }))
    expect(screen.getByText(/\d{3} ÷ \d を計算しよう/)).toBeDefined()
    expect(screen.getByText('チャレンジ')).toBeDefined()
  })

  it('筆算画面の「もどる」で、同じ問題の依頼画面に戻る。もう一度「お手伝いする！」で筆算画面に進める', () => {
    render(<Home />)
    toRequest(/まあまあ/)
    const equation = screen.getByText(/^\d+ ÷ \d+$/).textContent
    fireEvent.click(screen.getByRole('button', { name: /お手伝いする/ }))
    expect(screen.getByText(`${equation} を計算しよう！`)).toBeDefined()

    fireEvent.click(screen.getByRole('button', { name: /もどる/ }))
    expect(screen.getByText(/^\d+ ÷ \d+$/).textContent).toBe(equation)
    expect(screen.queryByText(/を計算しよう/)).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: /お手伝いする/ }))
    expect(screen.getByText(`${equation} を計算しよう！`)).toBeDefined()
  })

  it('筆算画面で途中まで解いて戻ると、コインは増えず、やり直しは最初のステップから始まる', () => {
    vi.useFakeTimers()
    render(<Home />)
    // 乱数 0: 最初のかんたん（96 ÷ 3）が出る
    vi.spyOn(Math, 'random').mockReturnValue(0)
    toRequest(/かんたん/)
    fireEvent.click(screen.getByRole('button', { name: /お手伝いする/ }))
    expect(screen.getByText('9 の中に 3 はいくつ入るかな？')).toBeDefined()
    for (const ch of '3') fireEvent.click(screen.getByRole('button', { name: ch }))
    fireEvent.click(screen.getByRole('button', { name: 'こたえる！' }))
    act(() => { vi.advanceTimersByTime(800) })
    expect(screen.queryByText('9 の中に 3 はいくつ入るかな？')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: /もどる/ }))
    fireEvent.click(screen.getByRole('button', { name: /お手伝いする/ }))
    expect(screen.getByText('9 の中に 3 はいくつ入るかな？')).toBeDefined()
    expect(JSON.parse(localStorage.getItem('wakewake-town-save') ?? 'null')).toMatchObject({ coins: 0, problemsSolved: 0 })
  })
})

describe('ブラウザの「戻る」（ページ全体）', () => {
  /** ブラウザの「戻る」を押した（戻った先の履歴には、こちらの目印はない） */
  const pressBrowserBack = () =>
    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate', { state: { __NA: true } }))
    })
  const start = (label: RegExp) => {
    fireEvent.click(screen.getByRole('button', { name: /おねがいをきく/ }))
    fireEvent.click(screen.getByRole('button', { name: label }))
  }
  // 96 ÷ 3 を、最後まで解く（乱数 0 のとき、最初のかんたんの問題）
  const solveEasy = () => {
    const submit = (answer: string) => {
      for (const ch of answer) fireEvent.click(screen.getByRole('button', { name: ch }))
      fireEvent.click(screen.getByRole('button', { name: 'こたえる！' }))
      act(() => { vi.advanceTimersByTime(800) })
    }
    submit('3')
    submit('9')
    submit('0')
    fireEvent.click(screen.getByRole('button', { name: /6 をおろす/ }))
    act(() => { vi.advanceTimersByTime(700) })
    submit('2')
    submit('6')
    submit('0')
  }
  let pushState: ReturnType<typeof vi.spyOn>
  let back: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    pushState = vi.spyOn(window.history, 'pushState')
    // jsdom の history.back() は、あとから popstate を起こすので、呼ばれたことだけ確認する
    back = vi.spyOn(window.history, 'back').mockImplementation(() => {})
  })

  it('ホームのままなら、履歴は積まない。ホームで戻るを押しても、何も起きない', () => {
    render(<Home />)
    expect(pushState).not.toHaveBeenCalled()
    pressBrowserBack()
    expect(screen.getByRole('button', { name: /おねがいをきく/ })).toBeDefined()
    expect(pushState).not.toHaveBeenCalled()
  })

  it('「おねがいをきく」で履歴が1つ積まれ、依頼画面・筆算画面に進んでも増えない', () => {
    render(<Home />)
    fireEvent.click(screen.getByRole('button', { name: /おねがいをきく/ }))
    expect(pushState).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByRole('button', { name: /かんたん/ }))
    fireEvent.click(screen.getByRole('button', { name: /お手伝いする/ }))
    expect(screen.getByText(/を計算しよう/)).toBeDefined()
    expect(pushState).toHaveBeenCalledTimes(1)
  })

  it('筆算画面 → 依頼画面 → 難易度選択 → ホーム と、ブラウザの戻るで1つずつ戻れる', () => {
    render(<Home />)
    start(/かんたん/)
    fireEvent.click(screen.getByRole('button', { name: /お手伝いする/ }))
    expect(screen.getByText(/を計算しよう/)).toBeDefined()

    pressBrowserBack()
    expect(screen.getByRole('button', { name: /お手伝いする/ })).toBeDefined()
    expect(screen.queryByText(/を計算しよう/)).toBeNull()

    pressBrowserBack()
    expect(screen.getByText('どのおねがいにする？')).toBeDefined()

    pressBrowserBack()
    expect(screen.getByRole('button', { name: /おねがいをきく/ })).toBeDefined()

    // ホームまで戻ったら、それ以上は履歴を積み直さない（次に戻るとアプリを離れられる）
    expect(pushState).toHaveBeenCalledTimes(3)
    expect(back).not.toHaveBeenCalled()
  })

  it('画面の「もどる」ボタンでホームに戻ると、積んでいた履歴を1つ戻す（ブラウザの戻るが空振りしない）', () => {
    render(<Home />)
    start(/かんたん/)
    fireEvent.click(screen.getByRole('button', { name: /もどる/ }))
    expect(back).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: /もどる/ }))
    expect(screen.getByRole('button', { name: /おねがいをきく/ })).toBeDefined()
    expect(back).toHaveBeenCalledTimes(1)
    // 戻した履歴で起きる popstate では、画面は動かない
    pressBrowserBack()
    expect(screen.getByRole('button', { name: /おねがいをきく/ })).toBeDefined()
  })

  it('おみせでブラウザの戻るを押すと、ホームに戻る', () => {
    render(<Home />)
    fireEvent.click(screen.getByRole('button', { name: /おみせ/ }))
    expect(screen.getByRole('heading', { name: /おみせ/ })).toBeDefined()
    expect(pushState).toHaveBeenCalledTimes(1)
    pressBrowserBack()
    expect(screen.getByRole('button', { name: /おねがいをきく/ })).toBeDefined()
  })

  it('筆算を解き終わった完成画面では、ブラウザの戻るを押しても、その場にとどまる', () => {
    vi.useFakeTimers()
    render(<Home />)
    vi.spyOn(Math, 'random').mockReturnValue(0)
    start(/かんたん/)
    fireEvent.click(screen.getByRole('button', { name: /お手伝いする/ }))
    solveEasy()
    expect(screen.getByText(/できた！/)).toBeDefined()

    pushState.mockClear()
    pressBrowserBack()
    pressBrowserBack()
    expect(screen.getByText(/できた！/)).toBeDefined()
    expect(screen.getByRole('button', { name: /つぎのおねがいへ/ })).toBeDefined()
    // 押されるたびに履歴を積み直して、次の戻るも受け止める
    expect(pushState).toHaveBeenCalledTimes(2)
    // コインは、まだ入っていない
    expect(JSON.parse(localStorage.getItem('wakewake-town-save') ?? 'null')).toMatchObject({ coins: 0, problemsSolved: 0 })

    fireEvent.click(screen.getByRole('button', { name: /つぎのおねがいへ/ }))
    expect(screen.getByText('いすをもらったよ！')).toBeDefined()
  })

  it('お祝い画面・節目画面でも、ブラウザの戻るを押してもその場にとどまる。ボタンで進めばホームに戻る', () => {
    vi.useFakeTimers()
    localStorage.setItem('wakewake-town-save', JSON.stringify({ coins: 0, items: [], problemsSolved: 4 }))
    render(<Home />)
    vi.spyOn(Math, 'random').mockReturnValue(0)
    start(/かんたん/)
    fireEvent.click(screen.getByRole('button', { name: /お手伝いする/ }))
    solveEasy()
    fireEvent.click(screen.getByRole('button', { name: /つぎのおねがいへ/ }))
    expect(screen.getByText('いすをもらったよ！')).toBeDefined()

    pressBrowserBack()
    expect(screen.getByText('いすをもらったよ！')).toBeDefined()

    fireEvent.click(screen.getByRole('button', { name: /やったー/ }))
    expect(screen.getByRole('button', { name: /もっと遊ぶ/ })).toBeDefined()
    pressBrowserBack()
    expect(screen.getByRole('button', { name: /もっと遊ぶ/ })).toBeDefined()

    expect(back).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: /おわる/ }))
    expect(screen.getByRole('button', { name: /おねがいをきく/ })).toBeDefined()
    expect(back).toHaveBeenCalledTimes(1)
  })

  it('解き終わって完了したあとは、次の筆算でまたブラウザの戻るで戻れる', () => {
    vi.useFakeTimers()
    render(<Home />)
    vi.spyOn(Math, 'random').mockReturnValue(0)
    start(/かんたん/)
    fireEvent.click(screen.getByRole('button', { name: /お手伝いする/ }))
    solveEasy()
    fireEvent.click(screen.getByRole('button', { name: /つぎのおねがいへ/ }))
    fireEvent.click(screen.getByRole('button', { name: /やったー/ }))
    expect(screen.getByRole('button', { name: /おねがいをきく/ })).toBeDefined()

    start(/かんたん/)
    fireEvent.click(screen.getByRole('button', { name: /お手伝いする/ }))
    pressBrowserBack()
    expect(screen.getByRole('button', { name: /お手伝いする/ })).toBeDefined()
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
