import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGameState } from './useGameState'
import { getProblemsByDifficulty } from './problems'
import { ITEMS } from './items'
import { Difficulty } from './types'

const STORAGE_KEY = 'wakewake-town-save'

type HookResult = { current: ReturnType<typeof useGameState> }

function playRound(result: HookResult, difficulty: Difficulty) {
  act(() => result.current.handleOpenDifficulty())
  act(() => result.current.handleSelectDifficulty(difficulty))
  act(() => result.current.handleAccept())
  act(() => result.current.handleComplete())
}

beforeEach(() => {
  localStorage.clear()
  // 「きょう」を固定する（日付が変わるテストは、setSystemTime で進める）
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 8, 20, 10, 0))
  // 0.99 なら、問題は各難易度の末尾が選ばれ、アイテムは（30%未満ではないので）もらえない
  vi.spyOn(Math, 'random').mockReturnValue(0.99)
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe('useGameState: 画面遷移', () => {
  it('最初はホーム画面で、コイン 0・アイテムなし・解いた数 0', () => {
    const { result } = renderHook(() => useGameState())
    expect(result.current.hydrated).toBe(true)
    expect(result.current.gameState).toMatchObject({
      screen: 'home',
      coins: 0,
      items: [],
      problemsSolved: 0,
      currentProblem: null,
    })
  })

  it('「おねがいをきく」で難易度選択画面に進み、もどるとホームに戻る', () => {
    const { result } = renderHook(() => useGameState())
    act(() => result.current.handleOpenDifficulty())
    expect(result.current.gameState.screen).toBe('difficulty')
    act(() => result.current.handleCancelDifficulty())
    expect(result.current.gameState.screen).toBe('home')
  })

  it.each(['easy', 'normal', 'challenge'] as const)(
    '難易度 %s を選ぶと、その難易度の問題で依頼画面に進む',
    difficulty => {
      const { result } = renderHook(() => useGameState())
      act(() => result.current.handleOpenDifficulty())
      act(() => result.current.handleSelectDifficulty(difficulty))
      expect(result.current.gameState.screen).toBe('request')
      expect(result.current.gameState.currentProblem?.difficulty).toBe(difficulty)
    },
  )

  it('依頼を受けると筆算画面に進む', () => {
    const { result } = renderHook(() => useGameState())
    act(() => result.current.handleOpenDifficulty())
    act(() => result.current.handleSelectDifficulty('easy'))
    act(() => result.current.handleAccept())
    expect(result.current.gameState.screen).toBe('division')
  })

  it('同じ難易度を続けて選んでも、前の問題とは違う問題が出る', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const { result } = renderHook(() => useGameState())
    const easy = getProblemsByDifficulty('easy')

    act(() => result.current.handleOpenDifficulty())
    act(() => result.current.handleSelectDifficulty('easy'))
    expect(result.current.gameState.currentProblem?.id).toBe(easy[0].id)

    act(() => result.current.handleAccept())
    act(() => result.current.handleComplete())
    act(() => result.current.handleOpenDifficulty())
    act(() => result.current.handleSelectDifficulty('easy'))
    expect(result.current.gameState.currentProblem?.id).toBe(easy[1].id)
  })
})

describe('useGameState: ひとつ前の画面に戻る', () => {
  it('依頼画面から戻ると難易度選択画面になる。コインも解いた数も変わらない', () => {
    const { result } = renderHook(() => useGameState())
    act(() => result.current.handleOpenDifficulty())
    act(() => result.current.handleSelectDifficulty('easy'))
    expect(result.current.gameState.screen).toBe('request')

    act(() => result.current.handleBackToDifficulty())
    expect(result.current.gameState.screen).toBe('difficulty')
    expect(result.current.gameState.coins).toBe(0)
    expect(result.current.gameState.problemsSolved).toBe(0)
  })

  it('依頼画面から戻って選び直すと、選んだ難易度の問題で依頼画面に進む（別の難易度も選べる）', () => {
    const { result } = renderHook(() => useGameState())
    act(() => result.current.handleOpenDifficulty())
    act(() => result.current.handleSelectDifficulty('easy'))
    act(() => result.current.handleBackToDifficulty())
    act(() => result.current.handleSelectDifficulty('challenge'))
    expect(result.current.gameState.screen).toBe('request')
    expect(result.current.gameState.currentProblem?.difficulty).toBe('challenge')
  })

  it('依頼画面から戻って同じ難易度を選び直しても、直前の問題とは違う問題が出る', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const { result } = renderHook(() => useGameState())
    const easy = getProblemsByDifficulty('easy')
    act(() => result.current.handleOpenDifficulty())
    act(() => result.current.handleSelectDifficulty('easy'))
    expect(result.current.gameState.currentProblem?.id).toBe(easy[0].id)

    act(() => result.current.handleBackToDifficulty())
    act(() => result.current.handleSelectDifficulty('easy'))
    expect(result.current.gameState.currentProblem?.id).toBe(easy[1].id)
  })

  it('筆算画面から戻ると、同じ問題の依頼画面になる。コインも解いた数も増えない', () => {
    const { result } = renderHook(() => useGameState())
    act(() => result.current.handleOpenDifficulty())
    act(() => result.current.handleSelectDifficulty('normal'))
    const problem = result.current.gameState.currentProblem
    act(() => result.current.handleAccept())
    expect(result.current.gameState.screen).toBe('division')

    act(() => result.current.handleBackToRequest())
    expect(result.current.gameState.screen).toBe('request')
    expect(result.current.gameState.currentProblem).toEqual(problem)
    expect(result.current.gameState.coins).toBe(0)
    expect(result.current.gameState.problemsSolved).toBe(0)
  })

  it('筆算画面から戻ったあと、もう一度受けて最後まで進めると、コインは1回分だけ入る', () => {
    const { result } = renderHook(() => useGameState())
    act(() => result.current.handleOpenDifficulty())
    act(() => result.current.handleSelectDifficulty('normal'))
    act(() => result.current.handleAccept())
    act(() => result.current.handleBackToRequest())
    act(() => result.current.handleAccept())
    act(() => result.current.handleComplete())
    expect(result.current.gameState.coins).toBe(15)
    expect(result.current.gameState.problemsSolved).toBe(1)
  })

  it('依頼画面から戻る操作は、依頼画面以外（ホーム・筆算画面）では何もしない', () => {
    const { result } = renderHook(() => useGameState())
    act(() => result.current.handleBackToDifficulty())
    expect(result.current.gameState.screen).toBe('home')

    act(() => result.current.handleOpenDifficulty())
    act(() => result.current.handleSelectDifficulty('easy'))
    act(() => result.current.handleAccept())
    act(() => result.current.handleBackToDifficulty())
    expect(result.current.gameState.screen).toBe('division')
  })

  it('筆算画面から戻る操作は、筆算画面以外（ホーム・依頼画面）では何もしない', () => {
    const { result } = renderHook(() => useGameState())
    act(() => result.current.handleBackToRequest())
    expect(result.current.gameState.screen).toBe('home')

    act(() => result.current.handleOpenDifficulty())
    act(() => result.current.handleSelectDifficulty('easy'))
    act(() => result.current.handleBackToRequest())
    expect(result.current.gameState.screen).toBe('request')
  })
})

describe('useGameState: 筆算を解き終わったら、前の画面には戻れない', () => {
  const toDivision = (result: HookResult) => {
    act(() => result.current.handleOpenDifficulty())
    act(() => result.current.handleSelectDifficulty('normal'))
    act(() => result.current.handleAccept())
  }

  it('筆算を始めたときは、まだ解き終わっていない', () => {
    const { result } = renderHook(() => useGameState())
    toDivision(result)
    expect(result.current.gameState.divisionSolved).toBe(false)
  })

  it('解き終わると、筆算画面から依頼画面には戻れなくなる（コインをもらわずにやり直せてしまうため）', () => {
    const { result } = renderHook(() => useGameState())
    toDivision(result)
    act(() => result.current.handleSolved())
    expect(result.current.gameState.divisionSolved).toBe(true)

    act(() => result.current.handleBackToRequest())
    expect(result.current.gameState.screen).toBe('division')
  })

  it('解き終わったあとで完了すると、コインが入り、次の筆算はまた戻れる', () => {
    const { result } = renderHook(() => useGameState())
    toDivision(result)
    act(() => result.current.handleSolved())
    act(() => result.current.handleComplete())
    expect(result.current.gameState.coins).toBe(15)
    expect(result.current.gameState.divisionSolved).toBe(false)

    toDivision(result)
    expect(result.current.gameState.divisionSolved).toBe(false)
    act(() => result.current.handleBackToRequest())
    expect(result.current.gameState.screen).toBe('request')
  })

  it('筆算画面以外で解き終わりを伝えても、何も変わらない', () => {
    const { result } = renderHook(() => useGameState())
    act(() => result.current.handleSolved())
    expect(result.current.gameState.divisionSolved).toBe(false)

    act(() => result.current.handleOpenDifficulty())
    act(() => result.current.handleSelectDifficulty('normal'))
    act(() => result.current.handleSolved())
    expect(result.current.gameState.divisionSolved).toBe(false)
  })
})

describe('useGameState: きょうのお手伝い（日ごとの数）', () => {
  const STORAGE_KEY = 'wakewake-town-save'
  const day = (dayOfMonth: number, hour = 10, minute = 0) =>
    vi.setSystemTime(new Date(2026, 8, dayOfMonth, hour, minute))
  const saved = () => JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')

  it('最初は、きょうの数も通算も 0', () => {
    const { result } = renderHook(() => useGameState())
    expect(result.current.gameState.solvedToday).toBe(0)
    expect(result.current.gameState.problemsSolved).toBe(0)
  })

  it('1つ解くと、きょうの数も通算も 1 になる。3つ解くと、どちらも 3', () => {
    const { result } = renderHook(() => useGameState())
    playRound(result, 'easy')
    expect(result.current.gameState).toMatchObject({ solvedToday: 1, problemsSolved: 1 })
    playRound(result, 'easy')
    playRound(result, 'easy')
    expect(result.current.gameState).toMatchObject({ solvedToday: 3, problemsSolved: 3 })
  })

  it('同じ日に5つ解くと節目画面になり、きょうの数は 5', () => {
    const { result } = renderHook(() => useGameState())
    for (let i = 1; i <= 4; i++) playRound(result, 'easy')
    expect(result.current.gameState.screen).toBe('home')
    playRound(result, 'easy')
    expect(result.current.gameState.screen).toBe('milestone')
    expect(result.current.gameState.solvedToday).toBe(5)
  })

  it('日付が変わると、きょうの数は 1 から数え直す。通算は続く', () => {
    const { result } = renderHook(() => useGameState())
    playRound(result, 'easy')
    playRound(result, 'easy')
    expect(result.current.gameState.solvedToday).toBe(2)

    day(21, 9)
    playRound(result, 'easy')
    expect(result.current.gameState).toMatchObject({ solvedToday: 1, problemsSolved: 3 })
  })

  it('夜の11時59分と、次の日の0時0分で、数え直しになる（アプリを開いたままでも）', () => {
    const { result } = renderHook(() => useGameState())
    day(20, 23, 59)
    playRound(result, 'easy')
    playRound(result, 'easy')
    expect(result.current.gameState.solvedToday).toBe(2)

    day(21, 0, 0)
    playRound(result, 'easy')
    expect(result.current.gameState.solvedToday).toBe(1)
  })

  it('通算が5の倍数でも、その日の5つ目でなければ節目にならない（前の日 3 + 今日 2 = 通算 5）', () => {
    const { result } = renderHook(() => useGameState())
    for (let i = 1; i <= 3; i++) playRound(result, 'easy')
    day(21)
    playRound(result, 'easy')
    playRound(result, 'easy')
    expect(result.current.gameState).toMatchObject({ problemsSolved: 5, solvedToday: 2, screen: 'home' })
  })

  it('前の日に 4 つ解いていても、次の日の1つ目は節目にならない。その日の5つ目で節目になる', () => {
    const { result } = renderHook(() => useGameState())
    for (let i = 1; i <= 4; i++) playRound(result, 'easy')
    day(21)
    playRound(result, 'easy')
    expect(result.current.gameState).toMatchObject({ solvedToday: 1, screen: 'home' })
    for (let i = 2; i <= 4; i++) playRound(result, 'easy')
    expect(result.current.gameState.screen).toBe('home')
    playRound(result, 'easy')
    expect(result.current.gameState).toMatchObject({ solvedToday: 5, problemsSolved: 9, screen: 'milestone' })
  })

  it('きょうの数と日付は保存され、同じ日にアプリを開き直しても続きから数える', () => {
    const first = renderHook(() => useGameState())
    playRound(first.result, 'easy')
    playRound(first.result, 'easy')
    playRound(first.result, 'easy')
    expect(saved()).toMatchObject({ solvedToday: 3, solvedDate: '2026-09-20' })
    first.unmount()

    day(20, 18)
    const second = renderHook(() => useGameState())
    expect(second.result.current.gameState.solvedToday).toBe(3)
    playRound(second.result, 'easy')
    playRound(second.result, 'easy')
    expect(second.result.current.gameState).toMatchObject({ solvedToday: 5, screen: 'milestone' })
  })

  it('次の日にアプリを開き直したら、最初の1つは 1 と数える（前の日の分は引き継がない）', () => {
    const first = renderHook(() => useGameState())
    for (let i = 1; i <= 3; i++) playRound(first.result, 'easy')
    first.unmount()

    day(21, 8)
    const second = renderHook(() => useGameState())
    expect(second.result.current.gameState.problemsSolved).toBe(3)
    playRound(second.result, 'easy')
    expect(second.result.current.gameState).toMatchObject({ solvedToday: 1, problemsSolved: 4 })
    expect(saved()).toMatchObject({ solvedToday: 1, solvedDate: '2026-09-21', problemsSolved: 4 })
  })

  it('今までの保存データ（通算だけ・通算 4）でも動く。1つ解いても、通算 5 で節目にはならない', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ coins: 50, items: ['いす'], problemsSolved: 4 }))
    const { result } = renderHook(() => useGameState())
    expect(result.current.gameState).toMatchObject({ coins: 50, problemsSolved: 4, solvedToday: 0 })
    playRound(result, 'easy')
    expect(result.current.gameState).toMatchObject({ problemsSolved: 5, solvedToday: 1, screen: 'home' })
  })

  it('保存データのきょうの数・日付が壊れていても（文字列・なし）、0 から始まる', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ coins: 0, items: [], problemsSolved: 2, solvedToday: 'たくさん', solvedDate: 20260920 }),
    )
    const { result } = renderHook(() => useGameState())
    expect(result.current.gameState).toMatchObject({ problemsSolved: 2, solvedToday: 0, solvedDate: '' })
    playRound(result, 'easy')
    expect(result.current.gameState).toMatchObject({ solvedToday: 1, problemsSolved: 3 })
  })

  it('筆算画面以外で完了を呼んでも、きょうの数は増えない', () => {
    const { result } = renderHook(() => useGameState())
    act(() => result.current.handleComplete())
    expect(result.current.gameState).toMatchObject({ solvedToday: 0, problemsSolved: 0 })
  })
})

describe('useGameState: 難易度ごとのコイン', () => {
  it.each([
    ['easy', 10],
    ['normal', 15],
    ['challenge', 30],
  ] as const)('%s をクリアすると %i コインもらえる', (difficulty, coins) => {
    const { result } = renderHook(() => useGameState())
    playRound(result, difficulty)
    expect(result.current.gameState.coins).toBe(coins)
    expect(result.current.gameState.problemsSolved).toBe(1)
  })

  it('違う難易度をクリアしたコインは足し算される（10 + 15 + 30 = 55）', () => {
    const { result } = renderHook(() => useGameState())
    playRound(result, 'easy')
    playRound(result, 'normal')
    playRound(result, 'challenge')
    expect(result.current.gameState.coins).toBe(55)
    expect(result.current.gameState.problemsSolved).toBe(3)
  })

  it('依頼を受けていない状態で完了を呼んでも、コインも解いた数も増えない', () => {
    const { result } = renderHook(() => useGameState())
    act(() => result.current.handleComplete())
    expect(result.current.gameState.coins).toBe(0)
    expect(result.current.gameState.problemsSolved).toBe(0)
    expect(result.current.gameState.screen).toBe('home')
  })

  it('完了を続けて2回呼んでも、コインと解いた数は1回分だけ（連打対策）', () => {
    const { result } = renderHook(() => useGameState())
    act(() => result.current.handleOpenDifficulty())
    act(() => result.current.handleSelectDifficulty('normal'))
    act(() => result.current.handleAccept())
    act(() => {
      result.current.handleComplete()
      result.current.handleComplete()
    })
    expect(result.current.gameState.coins).toBe(15)
    expect(result.current.gameState.problemsSolved).toBe(1)
  })

  it('5問目をクリアすると節目画面、それまではホームに戻る', () => {
    const { result } = renderHook(() => useGameState())
    for (let i = 1; i <= 4; i++) {
      playRound(result, 'easy')
      expect(result.current.gameState.screen).toBe('home')
    }
    playRound(result, 'easy')
    expect(result.current.gameState.problemsSolved).toBe(5)
    expect(result.current.gameState.screen).toBe('milestone')
    act(() => result.current.handleMilestoneDone())
    expect(result.current.gameState.screen).toBe('home')
  })
})

describe('useGameState: アイテム', () => {
  it('乱数が 0.3 未満ならアイテムがもらえる（0 → 先頭の「いす」）', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const { result } = renderHook(() => useGameState())
    playRound(result, 'easy')
    expect(result.current.gameState.items).toEqual(['いす'])
  })

  it('乱数がちょうど 0.3 のときはアイテムはもらえない（境界値）', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.3)
    const { result } = renderHook(() => useGameState())
    playRound(result, 'easy')
    expect(result.current.gameState.items).toEqual([])
  })
})

describe('useGameState: localStorage への保存と復元', () => {
  it('クリアするとコイン・アイテム・解いた数（通算・きょう）が保存される', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const { result } = renderHook(() => useGameState())
    playRound(result, 'normal')
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')).toEqual({
      coins: 15,
      items: ['いす'],
      problemsSolved: 1,
      solvedToday: 1,
      solvedDate: '2026-09-20',
      totalCoinsEarned: 15,
    })
  })

  it('保存した内容が次回の起動で復元され、画面はホームから始まる', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ coins: 45, items: ['ランプ'], problemsSolved: 3 }))
    const { result } = renderHook(() => useGameState())
    expect(result.current.gameState).toMatchObject({
      screen: 'home',
      coins: 45,
      items: ['ランプ'],
      problemsSolved: 3,
    })
  })

  it('保存データが壊れたJSONのときは初期値で始まる', () => {
    localStorage.setItem(STORAGE_KEY, '{not json')
    const { result } = renderHook(() => useGameState())
    expect(result.current.gameState).toMatchObject({ coins: 0, items: [], problemsSolved: 0 })
  })

  it('保存データの型が違う項目は、その項目だけ初期値になる', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ coins: '100', items: 'いす', problemsSolved: 2 }))
    const { result } = renderHook(() => useGameState())
    expect(result.current.gameState).toMatchObject({ coins: 0, items: [], problemsSolved: 2 })
  })
})

describe('useGameState: アイテムをもらったときのお祝い', () => {
  it('アイテムをもらうと、お祝い画面（reward）に進み、何をもらったかが分かる', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const { result } = renderHook(() => useGameState())
    playRound(result, 'easy')
    expect(result.current.gameState).toMatchObject({
      screen: 'reward',
      rewardItem: 'いす',
      items: ['いす'],
      coins: 10,
    })
  })

  it('お祝いでも、コインは難易度どおりに増える（まあまあなら 15）', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const { result } = renderHook(() => useGameState())
    playRound(result, 'normal')
    expect(result.current.gameState.screen).toBe('reward')
    expect(result.current.gameState.coins).toBe(15)
  })

  it('お祝いの「やったー」でホームに戻り、お祝いの内容は消える', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const { result } = renderHook(() => useGameState())
    playRound(result, 'easy')
    act(() => result.current.handleRewardDone())
    expect(result.current.gameState.screen).toBe('home')
    expect(result.current.gameState.rewardItem).toBeNull()
    expect(result.current.gameState.items).toEqual(['いす'])
  })

  it('アイテムをもらえなかったときは、お祝いを挟まずホームに戻る', () => {
    const { result } = renderHook(() => useGameState())
    playRound(result, 'easy')
    expect(result.current.gameState.screen).toBe('home')
    expect(result.current.gameState.rewardItem).toBeNull()
  })

  it('5問目でアイテムをもらうと、お祝いのあとに節目画面が出る', () => {
    const { result } = renderHook(() => useGameState())
    for (let i = 1; i <= 4; i++) playRound(result, 'easy')
    vi.spyOn(Math, 'random').mockReturnValue(0)
    playRound(result, 'easy')
    expect(result.current.gameState.screen).toBe('reward')
    expect(result.current.gameState.problemsSolved).toBe(5)

    act(() => result.current.handleRewardDone())
    expect(result.current.gameState.screen).toBe('milestone')
    act(() => result.current.handleMilestoneDone())
    expect(result.current.gameState.screen).toBe('home')
  })

  it('すべてのアイテムを持っているときは、乱数が当たってもお祝いは出ない', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ coins: 0, items: [...ITEMS], problemsSolved: 0 }))
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const { result } = renderHook(() => useGameState())
    playRound(result, 'easy')
    expect(result.current.gameState.screen).toBe('home')
    expect(result.current.gameState.rewardItem).toBeNull()
    expect(result.current.gameState.items).toHaveLength(ITEMS.length)
  })

  it('お祝い画面以外で「やったー」を呼んでも、何も起きない（連打対策）', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const { result } = renderHook(() => useGameState())
    act(() => result.current.handleRewardDone())
    expect(result.current.gameState.screen).toBe('home')

    playRound(result, 'easy')
    act(() => {
      result.current.handleRewardDone()
      result.current.handleRewardDone()
    })
    expect(result.current.gameState.screen).toBe('home')
  })

  it('連打しても、節目画面を飛ばさない（5問目のお祝いで2回呼んでも節目が出る）', () => {
    const { result } = renderHook(() => useGameState())
    for (let i = 1; i <= 4; i++) playRound(result, 'easy')
    vi.spyOn(Math, 'random').mockReturnValue(0)
    playRound(result, 'easy')
    act(() => {
      result.current.handleRewardDone()
      result.current.handleRewardDone()
    })
    expect(result.current.gameState.screen).toBe('milestone')
  })
})

describe('useGameState: お店', () => {
  function withCoins(coins: number, items: string[] = []) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ coins, items, problemsSolved: 0 }))
  }

  it('ホームから「おみせ」に行き、もどるとホームに戻る', () => {
    const { result } = renderHook(() => useGameState())
    act(() => result.current.handleOpenShop())
    expect(result.current.gameState.screen).toBe('shop')
    act(() => result.current.handleCloseShop())
    expect(result.current.gameState.screen).toBe('home')
  })

  it('買うと、値段ぶんコインが減り、アイテムが増え、「買ったもの」が分かる（いす 80: 100 → 20）', () => {
    withCoins(100)
    const { result } = renderHook(() => useGameState())
    act(() => result.current.handleOpenShop())
    act(() => result.current.handleBuy('いす'))
    expect(result.current.gameState).toMatchObject({
      coins: 20,
      items: ['いす'],
      purchasedItem: 'いす',
      screen: 'shop',
    })
  })

  it('ちょうどのコイン（ぼうし 30 に 30）で買えて、コインは 0 になる（境界値）', () => {
    withCoins(30)
    const { result } = renderHook(() => useGameState())
    act(() => result.current.handleOpenShop())
    act(() => result.current.handleBuy('ぼうし'))
    expect(result.current.gameState).toMatchObject({ coins: 0, items: ['ぼうし'] })
  })

  it('コインが1つ足りない（29）と、何も変わらない', () => {
    withCoins(29)
    const { result } = renderHook(() => useGameState())
    act(() => result.current.handleOpenShop())
    act(() => result.current.handleBuy('ぼうし'))
    expect(result.current.gameState).toMatchObject({ coins: 29, items: [], purchasedItem: null })
  })

  it('もう持っているアイテムを買おうとしても、何も変わらない', () => {
    withCoins(100, ['ぼうし'])
    const { result } = renderHook(() => useGameState())
    act(() => result.current.handleOpenShop())
    act(() => result.current.handleBuy('ぼうし'))
    expect(result.current.gameState).toMatchObject({ coins: 100, items: ['ぼうし'], purchasedItem: null })
  })

  it('お店にないアイテムを買おうとしても、何も変わらない', () => {
    withCoins(100)
    const { result } = renderHook(() => useGameState())
    act(() => result.current.handleOpenShop())
    act(() => result.current.handleBuy('ふしぎなもの'))
    expect(result.current.gameState).toMatchObject({ coins: 100, items: [], purchasedItem: null })
  })

  it('お店の画面以外で買おうとしても、何も変わらない', () => {
    withCoins(100)
    const { result } = renderHook(() => useGameState())
    act(() => result.current.handleBuy('ぼうし'))
    expect(result.current.gameState).toMatchObject({ coins: 100, items: [] })
  })

  it('同じアイテムを続けて2回買おうとしても、コインは1回分だけ（連打対策）', () => {
    withCoins(100)
    const { result } = renderHook(() => useGameState())
    act(() => result.current.handleOpenShop())
    act(() => {
      result.current.handleBuy('ぼうし')
      result.current.handleBuy('ぼうし')
    })
    expect(result.current.gameState).toMatchObject({ coins: 70, items: ['ぼうし'] })
  })

  it('「かったよ！」を閉じる前は、別のアイテムを買えない（買ったばかりのものが上書きされない）', () => {
    withCoins(100)
    const { result } = renderHook(() => useGameState())
    act(() => result.current.handleOpenShop())
    act(() => result.current.handleBuy('ぼうし'))
    act(() => result.current.handleBuy('ぬいぐるみ'))
    expect(result.current.gameState).toMatchObject({ coins: 70, items: ['ぼうし'], purchasedItem: 'ぼうし' })
  })

  it('「かったよ！」を閉じると、「買ったもの」が消えるだけで、コインとアイテムはそのまま（お店に残る）', () => {
    withCoins(100)
    const { result } = renderHook(() => useGameState())
    act(() => result.current.handleOpenShop())
    act(() => result.current.handleBuy('ぼうし'))
    act(() => result.current.handleDismissPurchase())
    expect(result.current.gameState).toMatchObject({ screen: 'shop', coins: 70, items: ['ぼうし'], purchasedItem: null })
  })

  it('閉じたあとなら、続けて別のアイテムを買える（ぼうし → ぬいぐるみ）', () => {
    withCoins(100)
    const { result } = renderHook(() => useGameState())
    act(() => result.current.handleOpenShop())
    act(() => result.current.handleBuy('ぼうし'))
    act(() => result.current.handleDismissPurchase())
    act(() => result.current.handleBuy('ぬいぐるみ'))
    expect(result.current.gameState).toMatchObject({ coins: 30, items: ['ぼうし', 'ぬいぐるみ'], purchasedItem: 'ぬいぐるみ' })
  })

  it('買っていないときに「閉じる」を呼んでも、何も起きない', () => {
    withCoins(100)
    const { result } = renderHook(() => useGameState())
    act(() => result.current.handleOpenShop())
    act(() => result.current.handleDismissPurchase())
    expect(result.current.gameState).toMatchObject({ screen: 'shop', coins: 100, items: [], purchasedItem: null })
  })

  it('お店に入り直すと、「買ったもの」は消える', () => {
    withCoins(100)
    const { result } = renderHook(() => useGameState())
    act(() => result.current.handleOpenShop())
    act(() => result.current.handleBuy('ぼうし'))
    act(() => result.current.handleCloseShop())
    expect(result.current.gameState.purchasedItem).toBeNull()
    act(() => result.current.handleOpenShop())
    expect(result.current.gameState.purchasedItem).toBeNull()
  })

  it('買った結果（コインとアイテム）が保存され、次回の起動でも残っている', () => {
    withCoins(100)
    const first = renderHook(() => useGameState())
    act(() => first.result.current.handleOpenShop())
    act(() => first.result.current.handleBuy('ぼうし'))
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')).toEqual({
      coins: 70,
      items: ['ぼうし'],
      problemsSolved: 0,
      solvedToday: 0,
      solvedDate: '',
      // 前の形式の保存データ（コイン 100）から見積もった合計。買い物をしても減らない
      totalCoinsEarned: 100,
    })
    first.unmount()
    const second = renderHook(() => useGameState())
    expect(second.result.current.gameState).toMatchObject({ coins: 70, items: ['ぼうし'] })
  })

  it('買ったアイテムは、ランダムにもらえるアイテムから外れる（残り1つの「いす」だけがもらえる）', () => {
    const owned = ITEMS.filter(name => name !== 'いす')
    withCoins(0, owned)
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const { result } = renderHook(() => useGameState())
    playRound(result, 'easy')
    expect(result.current.gameState).toMatchObject({ screen: 'reward', rewardItem: 'いす' })
  })
})

describe('useGameState: これまでにもらったコイン（ランキングのポイント）', () => {
  it('最初は 0', () => {
    const { result } = renderHook(() => useGameState())
    expect(result.current.gameState.totalCoinsEarned).toBe(0)
  })

  it('難易度どおりのコインが足されていく（10 + 15 + 30 = 55）', () => {
    const { result } = renderHook(() => useGameState())
    playRound(result, 'easy')
    expect(result.current.gameState.totalCoinsEarned).toBe(10)
    playRound(result, 'normal')
    expect(result.current.gameState.totalCoinsEarned).toBe(25)
    playRound(result, 'challenge')
    expect(result.current.gameState.totalCoinsEarned).toBe(55)
  })

  it('お店で買い物をすると持っているコインは減るが、もらったコインの合計は減らない', () => {
    const { result } = renderHook(() => useGameState())
    for (let i = 0; i < 3; i++) playRound(result, 'challenge')
    act(() => result.current.handleOpenShop())
    act(() => result.current.handleBuy('いす'))
    expect(result.current.gameState).toMatchObject({ coins: 10, totalCoinsEarned: 90 })
  })

  it('筆算画面以外で完了を呼んでも、もらったコインの合計は増えない', () => {
    const { result } = renderHook(() => useGameState())
    act(() => result.current.handleComplete())
    expect(result.current.gameState.totalCoinsEarned).toBe(0)
  })

  it('保存したもらったコインの合計が、次回の起動で復元される', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ coins: 5, items: [], problemsSolved: 3, totalCoinsEarned: 75 }),
    )
    const { result } = renderHook(() => useGameState())
    expect(result.current.gameState.totalCoinsEarned).toBe(75)
    playRound(result, 'challenge')
    expect(result.current.gameState.totalCoinsEarned).toBe(105)
  })

  describe('前のバージョンの保存データ（もらったコインの合計がない）は、少なめに見積もって始める', () => {
    it('持っているコインのほうが多ければ、持っているコインから（コイン 50・解いた数 3 → 50）', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ coins: 50, items: [], problemsSolved: 3 }))
      const { result } = renderHook(() => useGameState())
      expect(result.current.gameState.totalCoinsEarned).toBe(50)
    })

    it('買い物でコインが減っていれば、解いた数 × いちばん少ないコイン（10）から（コイン 20・解いた数 4 → 40）', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ coins: 20, items: ['いす'], problemsSolved: 4 }))
      const { result } = renderHook(() => useGameState())
      expect(result.current.gameState.totalCoinsEarned).toBe(40)
    })

    it('どちらも同じなら、その数（コイン 30・解いた数 3 → 30）', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ coins: 30, items: [], problemsSolved: 3 }))
      const { result } = renderHook(() => useGameState())
      expect(result.current.gameState.totalCoinsEarned).toBe(30)
    })

    it('もらったコインの合計が数でなければ（壊れていれば）、同じように見積もる', () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ coins: 20, items: [], problemsSolved: 4, totalCoinsEarned: '999' }),
      )
      const { result } = renderHook(() => useGameState())
      expect(result.current.gameState.totalCoinsEarned).toBe(40)
    })
  })
})
