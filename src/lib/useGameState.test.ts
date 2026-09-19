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
