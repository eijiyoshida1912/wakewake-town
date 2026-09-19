'use client'

import { useState, useCallback } from 'react'
import { GameState } from '@/lib/types'
import { getRandomProblem, ITEMS } from '@/lib/problems'
import TownHome from '@/components/TownHome'
import RequestScene from '@/components/RequestScene'
import LongDivisionGame from '@/components/LongDivisionGame'
import MilestoneScreen from '@/components/MilestoneScreen'

const MILESTONE = 5

export default function Home() {
  const [gameState, setGameState] = useState<GameState>({
    coins: 0,
    items: [],
    problemsSolved: 0,
    screen: 'home',
    currentProblem: null,
  })

  const handleStart = useCallback(() => {
    const problem = getRandomProblem(gameState.currentProblem?.id)
    setGameState(prev => ({ ...prev, screen: 'request', currentProblem: problem }))
  }, [gameState.currentProblem])

  const handleAccept = useCallback(() => {
    setGameState(prev => ({ ...prev, screen: 'division' }))
  }, [])

  const handleComplete = useCallback((coinsEarned: number) => {
    const solved = gameState.problemsSolved + 1
    const newItems = [...gameState.items]
    if (Math.random() < 0.3) {
      const remaining = ITEMS.filter(i => !newItems.includes(i))
      if (remaining.length > 0) {
        newItems.push(remaining[Math.floor(Math.random() * remaining.length)])
      }
    }
    const isMilestone = solved % MILESTONE === 0
    setGameState(prev => ({
      ...prev,
      coins: prev.coins + coinsEarned,
      items: newItems,
      problemsSolved: solved,
      screen: isMilestone ? 'milestone' : 'home',
    }))
  }, [gameState.problemsSolved, gameState.items])

  switch (gameState.screen) {
    case 'home':
      return <TownHome gameState={gameState} onStart={handleStart} />
    case 'request':
      if (!gameState.currentProblem) return null
      return <RequestScene problem={gameState.currentProblem} onAccept={handleAccept} />
    case 'division':
      if (!gameState.currentProblem) return null
      return <LongDivisionGame problem={gameState.currentProblem} onComplete={handleComplete} />
    case 'milestone':
      return (
        <MilestoneScreen
          count={gameState.problemsSolved}
          onContinue={() => setGameState(prev => ({ ...prev, screen: 'home' }))}
          onFinish={() => setGameState(prev => ({ ...prev, screen: 'home' }))}
        />
      )
    default:
      return null
  }
}
