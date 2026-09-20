import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { render, screen, fireEvent, cleanup, act, within } from '@testing-library/react'
import LongDivisionGame from './LongDivisionGame'
import { getChallengeCells, getCellLabel } from '@/lib/challengeBoard'
import { makeProblem } from '@/test/fixtures'

const easyProblem = { ...makeProblem(96, 3, 32, 0), difficulty: 'easy' as const }
const normalProblem = makeProblem(75, 4, 18, 3)
const challengeProblem = { ...makeProblem(259, 4, 64, 3), difficulty: 'challenge' as const }

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

function advance(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms)
  })
}

/** 数字を入力して「こたえる！」を押し、次のステップに進むまで待つ */
function submit(answer: string) {
  for (const ch of answer) fireEvent.click(screen.getByRole('button', { name: ch }))
  fireEvent.click(screen.getByRole('button', { name: 'こたえる！' }))
  advance(800)
}

/** 「おろす」ボタンを押して、おろし終わるまで待つ */
function drop(digit: number) {
  fireEvent.click(screen.getByRole('button', { name: new RegExp(`${digit} をおろす`) }))
  advance(700)
}

describe('LongDivisionGame: ヘッダー', () => {
  it('問題の式と、難易度の名前が表示される', () => {
    render(<LongDivisionGame problem={normalProblem} onComplete={() => {}} onBack={() => {}} />)
    expect(screen.getByText(/75 ÷ 4 を計算しよう/)).toBeDefined()
    expect(screen.getByText('まあまあ')).toBeDefined()
  })
})

describe('LongDivisionGame: ひとつ前に戻る', () => {
  it.each([
    ['かんたん', easyProblem],
    ['まあまあ', normalProblem],
    ['チャレンジ', challengeProblem],
  ])('%s: 「もどる」を押すと onBack が1回呼ばれ、onComplete は呼ばれない', (_label, problem) => {
    const onBack = vi.fn()
    const onComplete = vi.fn()
    render(<LongDivisionGame problem={problem} onComplete={onComplete} onBack={onBack} />)
    fireEvent.click(screen.getByRole('button', { name: /もどる/ }))
    expect(onBack).toHaveBeenCalledTimes(1)
    expect(onComplete).not.toHaveBeenCalled()
  })

  it('途中まで解いたあとでも「もどる」を押せる', () => {
    const onBack = vi.fn()
    render(<LongDivisionGame problem={easyProblem} onComplete={() => {}} onBack={onBack} />)
    submit('3')
    submit('9')
    fireEvent.click(screen.getByRole('button', { name: /もどる/ }))
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('完成画面では「もどる」は出ない（コインをもらう前に戻って、やり直せてしまわないように）', () => {
    render(<LongDivisionGame problem={easyProblem} onComplete={() => {}} onBack={() => {}} />)
    expect(screen.getByRole('button', { name: /もどる/ })).toBeDefined()
    submit('3')
    submit('9')
    submit('0')
    drop(6)
    submit('2')
    submit('6')
    submit('0')

    expect(screen.getByText(/できた！/)).toBeDefined()
    expect(screen.queryByRole('button', { name: /もどる/ })).toBeNull()
  })
})

describe('LongDivisionGame: 補助あり（かんたん・まあまあ）', () => {
  it('最初のステップの質問文が表示され、数字ボタンと「こたえる！」がある', () => {
    render(<LongDivisionGame problem={normalProblem} onComplete={() => {}} onBack={() => {}} />)
    expect(screen.getByText('7 の中に 4 はいくつ入るかな？')).toBeDefined()
    expect(screen.getByRole('button', { name: 'こたえる！' })).toBeDefined()
    expect(screen.queryByRole('group', { name: 'ひっ算' })).toBeNull()
  })

  it('まちがえると「おしい」、2回まちがえるとヒントが出る。正解するとヒントは消える', () => {
    render(<LongDivisionGame problem={normalProblem} onComplete={() => {}} onBack={() => {}} />)

    submit('9')
    expect(screen.getByText(/おしい/)).toBeDefined()
    expect(screen.queryByText(/4 のだんの九九/)).toBeNull()
    expect(screen.getByText('7 の中に 4 はいくつ入るかな？')).toBeDefined()

    submit('8')
    expect(screen.getByText(/4 のだんの九九を思い出してみよう/)).toBeDefined()

    submit('1')
    expect(screen.getByText('1 × 4 は？')).toBeDefined()
    expect(screen.queryByText(/4 のだんの九九/)).toBeNull()
  })

  it('まあまあ（75 ÷ 4）を最後まで解くと、「18 あまり 3」と ＋15コイン が表示される', () => {
    render(<LongDivisionGame problem={normalProblem} onComplete={() => {}} onBack={() => {}} />)
    submit('1')
    submit('4')
    submit('3')
    drop(5)
    expect(screen.getByText('35 の中に 4 はいくつ入るかな？')).toBeDefined()
    submit('8')
    submit('32')
    submit('3')

    expect(screen.getByText(/できた！/)).toBeDefined()
    expect(screen.getByText(/75 ÷ 4 =/).textContent).toBe('75 ÷ 4 = 18 あまり 3')
    expect(screen.getByText('＋15コイン！🪙')).toBeDefined()
  })

  it('完成画面に、わけわけのアニメーションが出る（75 ÷ 4 なら4人のなかま）', () => {
    render(<LongDivisionGame problem={normalProblem} onComplete={() => {}} onBack={() => {}} />)
    expect(screen.queryByRole('region', { name: 'わけわけ' })).toBeNull()
    submit('1')
    submit('4')
    submit('3')
    drop(5)
    submit('8')
    submit('32')
    submit('3')

    expect(screen.getByRole('region', { name: 'わけわけ' })).toBeDefined()
    expect(screen.getAllByRole('group', { name: /なかま/ })).toHaveLength(4)
    advance(5000)
    expect(screen.getByRole('group', { name: 'のこり' }).textContent).toMatch(/あまり.*3/)
  })

  it('かんたん（96 ÷ 3）を最後まで解くと、あまりなしで「32」と ＋10コイン が表示される', () => {
    render(<LongDivisionGame problem={easyProblem} onComplete={() => {}} onBack={() => {}} />)
    submit('3')
    submit('9')
    submit('0')
    drop(6)
    submit('2')
    submit('6')
    submit('0')

    expect(screen.getByText(/96 ÷ 3 =/).textContent).toBe('96 ÷ 3 = 32')
    expect(screen.queryByText(/あまり/)).toBeNull()
    expect(screen.getByText('＋10コイン！🪙')).toBeDefined()
  })

  it('完成画面では「つぎのおねがいへ」が、完成した筆算の盤面より上にある（画面の下に隠れない）', () => {
    render(<LongDivisionGame problem={easyProblem} onComplete={() => {}} onBack={() => {}} />)
    submit('3')
    submit('9')
    submit('0')
    drop(6)
    submit('2')
    submit('6')
    submit('0')

    const button = screen.getByRole('button', { name: /つぎのおねがいへ/ })
    const share = screen.getByRole('region', { name: 'わけわけ' })
    const answerBoard = screen.getByRole('group', { name: 'ひっ算のこたえ' })
    // わけわけ → ボタン → 完成した筆算 の順
    expect(share.compareDocumentPosition(button) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(button.compareDocumentPosition(answerBoard) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('完成後に「つぎのおねがいへ」を押すと、onComplete が1回呼ばれる', () => {
    const onComplete = vi.fn()
    render(<LongDivisionGame problem={easyProblem} onComplete={onComplete} onBack={() => {}} />)
    submit('3')
    submit('9')
    submit('0')
    drop(6)
    submit('2')
    submit('6')
    submit('0')

    expect(onComplete).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: /つぎのおねがいへ/ }))
    expect(onComplete).toHaveBeenCalledTimes(1)
  })
})

describe('LongDivisionGame: 補助なし（チャレンジ）', () => {
  it('ひっ算の盤面に直接入力する形式で、質問文・ヒント・「こたえる！」は出ない', () => {
    render(<LongDivisionGame problem={challengeProblem} onComplete={() => {}} onBack={() => {}} />)
    expect(screen.getByRole('group', { name: 'ひっ算' })).toBeDefined()
    expect(screen.getByText('チャレンジ')).toBeDefined()
    expect(screen.queryByRole('button', { name: 'こたえる！' })).toBeNull()
    expect(screen.queryByText(/はいくつ入るかな/)).toBeNull()
  })

  it('すべてのマスを正しく埋めると、「64 あまり 3」と ＋30コイン が表示される', () => {
    const onComplete = vi.fn()
    render(<LongDivisionGame problem={challengeProblem} onComplete={onComplete} onBack={() => {}} />)

    for (const cell of getChallengeCells(challengeProblem)) {
      if (cell.expected === null) continue
      fireEvent.click(screen.getByLabelText(getCellLabel(cell)))
      fireEvent.click(within(screen.getByLabelText('すうじ')).getByText(String(cell.expected)))
    }
    expect(screen.queryByText('＋30コイン！🪙')).toBeNull()
    advance(1000)

    expect(screen.getByText(/できた！/)).toBeDefined()
    expect(screen.getByText(/259 ÷ 4 =/).textContent).toBe('259 ÷ 4 = 64 あまり 3')
    expect(screen.getByText('＋30コイン！🪙')).toBeDefined()
    expect(screen.getAllByRole('group', { name: /なかま/ })).toHaveLength(4)

    fireEvent.click(screen.getByRole('button', { name: /つぎのおねがいへ/ }))
    expect(onComplete).toHaveBeenCalledTimes(1)
  })
})
