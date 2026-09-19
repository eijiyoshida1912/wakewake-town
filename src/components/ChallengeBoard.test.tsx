import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup, act, within } from '@testing-library/react'
import ChallengeBoard from './ChallengeBoard'
import { getChallengeCells, getCellLabel } from '@/lib/challengeBoard'
import { makeProblem } from '@/test/fixtures'

const problem259 = makeProblem(259, 4, 64, 3)
const problem604 = makeProblem(604, 3, 201, 1)

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

function cell(label: string) {
  return screen.getByRole('button', { name: label })
}

function enter(label: string, digit: number) {
  fireEvent.click(cell(label))
  fireEvent.click(screen.getByRole('button', { name: String(digit) }))
}

/** 正解のマスを、上から順にすべて入力する */
function solveAll(problem: ReturnType<typeof makeProblem>) {
  for (const c of getChallengeCells(problem)) {
    if (c.expected !== null) enter(getCellLabel(c), c.expected)
  }
}

describe('ChallengeBoard: 表示', () => {
  it('割る数と被除数の各桁が表示される（259 ÷ 4）', () => {
    render(<ChallengeBoard problem={problem259} onSolved={() => {}} />)
    // 数字ボタン（0〜9）にも同じ文字があるので、ひっ算の盤面の中だけを探す
    const board = within(screen.getByRole('group', { name: 'ひっ算' }))
    expect(board.getByText('4')).toBeDefined()
    expect(board.getByText('2')).toBeDefined()
    expect(board.getByText('5')).toBeDefined()
    expect(board.getByText('9')).toBeDefined()
  })

  it('入力マスは21個（商3 + かけ算・ひき算 各3マス × 3周）で、最初はすべて空', () => {
    render(<ChallengeBoard problem={problem259} onSolved={() => {}} />)
    const cells = getChallengeCells(problem259)
    expect(cells).toHaveLength(21)
    for (const c of cells) {
      expect(cell(getCellLabel(c)).textContent).toBe('')
    }
  })

  it('手順の質問文やヒントは表示されない（補助なし）', () => {
    render(<ChallengeBoard problem={problem259} onSolved={() => {}} />)
    expect(screen.queryByText(/はいくつ入るかな/)).toBeNull()
    expect(screen.queryByText(/ヒント|💡/)).toBeNull()
  })

  it('マスを選ぶまでは、数字ボタンは押せない', () => {
    render(<ChallengeBoard problem={problem259} onSolved={() => {}} />)
    for (let d = 0; d <= 9; d++) {
      expect((screen.getByRole('button', { name: String(d) }) as HTMLButtonElement).disabled).toBe(true)
    }
  })
})

describe('ChallengeBoard: 入力と判定', () => {
  it('正しい数字を入れるとマスに入り、そのマスは変更できなくなる', () => {
    render(<ChallengeBoard problem={problem259} onSolved={() => {}} />)
    enter('しょう 2れつめ', 6)
    const filled = cell('しょう 2れつめ') as HTMLButtonElement
    expect(filled.textContent).toBe('6')
    expect(filled.disabled).toBe(true)
    expect(filled.getAttribute('data-wrong')).not.toBe('true')
  })

  it('まちがった数字を入れると、マスは空のまま「まちがい」の状態になる', () => {
    render(<ChallengeBoard problem={problem259} onSolved={() => {}} />)
    enter('しょう 2れつめ', 5)
    const wrong = cell('しょう 2れつめ') as HTMLButtonElement
    expect(wrong.textContent).toBe('')
    expect(wrong.getAttribute('data-wrong')).toBe('true')
    expect(wrong.disabled).toBe(false)
    // 読み上げ用に、まちがいのメッセージは alert として伝える
    expect(screen.getByRole('alert').textContent).toContain('おしい')
  })

  it('まちがえたあと、同じマスに正しい数字を入れ直せる', () => {
    render(<ChallengeBoard problem={problem259} onSolved={() => {}} />)
    enter('しょう 2れつめ', 5)
    enter('しょう 2れつめ', 6)
    const fixed = cell('しょう 2れつめ') as HTMLButtonElement
    expect(fixed.textContent).toBe('6')
    expect(fixed.getAttribute('data-wrong')).not.toBe('true')
    expect(screen.queryByText(/おしい/)).toBeNull()
  })

  it('空欄が正解のマス（商の百の位）に数字を入れると、0 でもまちがいになる', () => {
    render(<ChallengeBoard problem={problem259} onSolved={() => {}} />)
    enter('しょう 1れつめ', 0)
    const empty = cell('しょう 1れつめ') as HTMLButtonElement
    expect(empty.textContent).toBe('')
    expect(empty.getAttribute('data-wrong')).toBe('true')
  })

  it('正解が 0 のマスに 0 を入れると正解になる（604 ÷ 3 の商の十の位）', () => {
    render(<ChallengeBoard problem={problem604} onSolved={() => {}} />)
    enter('しょう 2れつめ', 0)
    expect(cell('しょう 2れつめ').textContent).toBe('0')
  })

  it('マスの選択は、正解すると解除される（続けて数字を押しても何も起きない）', () => {
    render(<ChallengeBoard problem={problem259} onSolved={() => {}} />)
    enter('しょう 2れつめ', 6)
    expect((screen.getByRole('button', { name: '4' }) as HTMLButtonElement).disabled).toBe(true)
  })
})

describe('ChallengeBoard: 完成', () => {
  it('正解のマスをすべて埋めると、少し待ってから onSolved が1回だけ呼ばれる', () => {
    vi.useFakeTimers()
    const onSolved = vi.fn()
    render(<ChallengeBoard problem={problem259} onSolved={onSolved} />)
    solveAll(problem259)
    expect(onSolved).not.toHaveBeenCalled()
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(onSolved).toHaveBeenCalledTimes(1)
  })

  it('1マスでも足りなければ、時間が経っても onSolved は呼ばれない（あまりのマスだけ未入力）', () => {
    vi.useFakeTimers()
    const onSolved = vi.fn()
    render(<ChallengeBoard problem={problem259} onSolved={onSolved} />)
    for (const c of getChallengeCells(problem259)) {
      if (c.expected !== null && c.key !== 'r-1-2') enter(getCellLabel(c), c.expected)
    }
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(onSolved).not.toHaveBeenCalled()
  })

  it('まちがいを含んでいても、最終的にすべて正解なら完成する（3桁 749 ÷ 3）', () => {
    vi.useFakeTimers()
    const onSolved = vi.fn()
    const problem749 = makeProblem(749, 3, 249, 2)
    render(<ChallengeBoard problem={problem749} onSolved={onSolved} />)
    enter('しょう 1れつめ', 3)
    solveAll(problem749)
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(onSolved).toHaveBeenCalledTimes(1)
  })

  it('完成の待ち時間中にアンマウントされたら、onSolved は呼ばれない', () => {
    vi.useFakeTimers()
    const onSolved = vi.fn()
    const { unmount } = render(<ChallengeBoard problem={problem259} onSolved={onSolved} />)
    solveAll(problem259)
    unmount()
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(onSolved).not.toHaveBeenCalled()
  })
})
