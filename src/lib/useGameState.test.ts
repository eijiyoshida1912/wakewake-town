import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGameState } from './useGameState'
import { getProblemsByDifficulty } from './problems'
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
  // 0.99 なら、問題は各難易度の末尾が選ばれ、アイテムは（30%未満ではないので）もらえない
  vi.spyOn(Math, 'random').mockReturnValue(0.99)
})

afterEach(() => {
  vi.restoreAllMocks()
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
  it('クリアするとコイン・アイテム・解いた数が保存される', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const { result } = renderHook(() => useGameState())
    playRound(result, 'normal')
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')).toEqual({
      coins: 15,
      items: ['いす'],
      problemsSolved: 1,
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
