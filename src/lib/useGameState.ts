'use client'

import { useState, useEffect, useCallback } from 'react'
import { Difficulty, GameState } from './types'
import { getRandomProblem } from './problems'
import { DIFFICULTIES } from './difficulty'
import { ITEMS } from './items'
import { buyItem } from './shop'
import { toDateKey, nextDailyCount } from './dailyCount'

const STORAGE_KEY = 'wakewake-town-save'
const MILESTONE = 5

interface SaveData {
  coins: number
  items: string[]
  problemsSolved: number
  solvedToday: number
  solvedDate: string
}

const EMPTY_SAVE: SaveData = { coins: 0, items: [], problemsSolved: 0, solvedToday: 0, solvedDate: '' }

function loadSaveData(): SaveData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY_SAVE
    const parsed = JSON.parse(raw)
    return {
      coins: typeof parsed.coins === 'number' ? parsed.coins : 0,
      items: Array.isArray(parsed.items) ? parsed.items : [],
      problemsSolved: typeof parsed.problemsSolved === 'number' ? parsed.problemsSolved : 0,
      // 前のバージョンの保存データには、きょうの数はない（0 から始める）
      solvedToday: typeof parsed.solvedToday === 'number' ? parsed.solvedToday : 0,
      solvedDate: typeof parsed.solvedDate === 'string' ? parsed.solvedDate : '',
    }
  } catch {
    return EMPTY_SAVE
  }
}

function saveSaveData(data: SaveData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // localStorage が使えない環境ではスキップ
  }
}

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>({
    coins: 0,
    items: [],
    problemsSolved: 0,
    solvedToday: 0,
    solvedDate: '',
    screen: 'home',
    currentProblem: null,
    rewardItem: null,
    milestoneAfterReward: false,
    purchasedItem: null,
    divisionSolved: false,
  })
  const [hydrated, setHydrated] = useState(false)

  // マウント時にlocalStorageから読み込む
  useEffect(() => {
    const saved = loadSaveData()
    setGameState(prev => ({ ...prev, ...saved }))
    setHydrated(true)
  }, [])

  // 保存対象の値が変わったらlocalStorageに書き込む
  useEffect(() => {
    if (!hydrated) return
    saveSaveData({
      coins: gameState.coins,
      items: gameState.items,
      problemsSolved: gameState.problemsSolved,
      solvedToday: gameState.solvedToday,
      solvedDate: gameState.solvedDate,
    })
  }, [
    hydrated,
    gameState.coins,
    gameState.items,
    gameState.problemsSolved,
    gameState.solvedToday,
    gameState.solvedDate,
  ])

  const handleOpenDifficulty = useCallback(() => {
    setGameState(prev => ({ ...prev, screen: 'difficulty' }))
  }, [])

  const handleCancelDifficulty = useCallback(() => {
    setGameState(prev => ({ ...prev, screen: 'home' }))
  }, [])

  const handleSelectDifficulty = useCallback((difficulty: Difficulty) => {
    const problem = getRandomProblem(difficulty, gameState.currentProblem?.id)
    setGameState(prev => ({ ...prev, screen: 'request', currentProblem: problem }))
  }, [gameState.currentProblem])

  const handleAccept = useCallback(() => {
    setGameState(prev => ({ ...prev, screen: 'division', divisionSolved: false }))
  }, [])

  // 筆算を解き終わったことを覚える。解き終わったあとに依頼画面へ戻ると、
  // コインをもらわずにやり直せてしまうので、戻れなくする。筆算画面以外での呼び出しは無視する
  const handleSolved = useCallback(() => {
    setGameState(prev =>
      prev.screen === 'division' && !prev.divisionSolved ? { ...prev, divisionSolved: true } : prev,
    )
  }, [])

  // 依頼画面から、難易度選択に戻る。依頼画面以外での呼び出し（連打など）は無視する。
  // currentProblem は残すので、選び直したときに同じ問題が続けて出ることはない
  const handleBackToDifficulty = useCallback(() => {
    setGameState(prev => (prev.screen === 'request' ? { ...prev, screen: 'difficulty' } : prev))
  }, [])

  // 筆算画面から、依頼画面に戻る（解きかけの筆算は捨てる）。
  // 筆算画面以外での呼び出しと、解き終わったあとの呼び出しは無視する
  const handleBackToRequest = useCallback(() => {
    setGameState(prev =>
      prev.screen === 'division' && !prev.divisionSolved ? { ...prev, screen: 'request' } : prev,
    )
  }, [])

  // コインは、挑戦した問題の難易度から決める。筆算画面以外での呼び出し（連打など）は無視する
  const handleComplete = useCallback(() => {
    // 「きょう」は、解き終わったときの日付で決める（アプリを開いたまま日をまたいでも合うように）
    const today = toDateKey(new Date())
    setGameState(prev => {
      if (prev.screen !== 'division' || !prev.currentProblem) return prev
      const coinsEarned = DIFFICULTIES[prev.currentProblem.difficulty].coins
      const solved = prev.problemsSolved + 1
      const solvedToday = nextDailyCount(prev.solvedToday, prev.solvedDate, today)
      const newItems = [...prev.items]
      let rewardItem: string | null = null
      if (Math.random() < 0.3) {
        const remaining = ITEMS.filter(i => !newItems.includes(i))
        if (remaining.length > 0) {
          rewardItem = remaining[Math.floor(Math.random() * remaining.length)]
          newItems.push(rewardItem)
        }
      }
      // 節目は、きょうの数で決める（節目の画面に出る「きょうのお手伝い」と合わせる）
      const isMilestone = solvedToday % MILESTONE === 0
      return {
        ...prev,
        coins: prev.coins + coinsEarned,
        items: newItems,
        problemsSolved: solved,
        solvedToday,
        solvedDate: today,
        // アイテムをもらったときは、先にお祝い画面を見せる（節目画面はそのあと）
        rewardItem,
        milestoneAfterReward: rewardItem !== null && isMilestone,
        divisionSolved: false,
        screen: rewardItem !== null ? 'reward' : isMilestone ? 'milestone' : 'home',
      }
    })
  }, [])

  // お祝い画面以外での呼び出し（連打など）は無視する
  const handleRewardDone = useCallback(() => {
    setGameState(prev => {
      if (prev.screen !== 'reward') return prev
      return {
        ...prev,
        rewardItem: null,
        milestoneAfterReward: false,
        screen: prev.milestoneAfterReward ? 'milestone' : 'home',
      }
    })
  }, [])

  const handleOpenShop = useCallback(() => {
    setGameState(prev => ({ ...prev, screen: 'shop', purchasedItem: null }))
  }, [])

  const handleCloseShop = useCallback(() => {
    setGameState(prev => ({ ...prev, screen: 'home', purchasedItem: null }))
  }, [])

  // 次のものは無視する: お店の画面以外、「かったよ！」を閉じる前（連打で上書きされない）、
  // 買えないアイテム（コイン不足・持っている・お店にない）
  const handleBuy = useCallback((name: string) => {
    setGameState(prev => {
      if (prev.screen !== 'shop' || prev.purchasedItem !== null) return prev
      const result = buyItem(prev.coins, prev.items, name)
      if (!result.ok) return prev
      return { ...prev, coins: result.coins, items: result.items, purchasedItem: name }
    })
  }, [])

  // 「○○をかったよ！」のモーダルを閉じる
  const handleDismissPurchase = useCallback(() => {
    setGameState(prev => (prev.purchasedItem === null ? prev : { ...prev, purchasedItem: null }))
  }, [])

  const handleMilestoneDone = useCallback(() => {
    setGameState(prev => ({ ...prev, screen: 'home' }))
  }, [])

  return {
    gameState,
    hydrated,
    handleOpenDifficulty,
    handleCancelDifficulty,
    handleSelectDifficulty,
    handleAccept,
    handleSolved,
    handleBackToDifficulty,
    handleBackToRequest,
    handleComplete,
    handleRewardDone,
    handleOpenShop,
    handleCloseShop,
    handleBuy,
    handleDismissPurchase,
    handleMilestoneDone,
  }
}
