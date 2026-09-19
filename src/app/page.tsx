'use client'

import { useGameState } from '@/lib/useGameState'
import TownHome from '@/components/TownHome'
import DifficultySelect from '@/components/DifficultySelect'
import RequestScene from '@/components/RequestScene'
import LongDivisionGame from '@/components/LongDivisionGame'
import RewardScreen from '@/components/RewardScreen'
import ShopScreen from '@/components/ShopScreen'
import MilestoneScreen from '@/components/MilestoneScreen'

export default function Home() {
  const {
    gameState,
    hydrated,
    handleOpenDifficulty,
    handleCancelDifficulty,
    handleSelectDifficulty,
    handleAccept,
    handleComplete,
    handleRewardDone,
    handleOpenShop,
    handleCloseShop,
    handleBuy,
    handleDismissPurchase,
    handleMilestoneDone,
  } = useGameState()

  // localStorageの読み込みが終わるまでは何も表示しない（ちらつき防止）
  if (!hydrated) return null

  switch (gameState.screen) {
    case 'home':
      return <TownHome gameState={gameState} onStart={handleOpenDifficulty} onOpenShop={handleOpenShop} />
    case 'difficulty':
      return <DifficultySelect onSelect={handleSelectDifficulty} onBack={handleCancelDifficulty} />
    case 'request':
      if (!gameState.currentProblem) return null
      return <RequestScene problem={gameState.currentProblem} onAccept={handleAccept} />
    case 'division':
      if (!gameState.currentProblem) return null
      return <LongDivisionGame problem={gameState.currentProblem} onComplete={handleComplete} />
    case 'reward':
      if (!gameState.rewardItem || !gameState.currentProblem) return null
      return (
        <RewardScreen
          item={gameState.rewardItem}
          residentId={gameState.currentProblem.residentId}
          onDone={handleRewardDone}
        />
      )
    case 'shop':
      return (
        <ShopScreen
          coins={gameState.coins}
          items={gameState.items}
          purchasedItem={gameState.purchasedItem}
          onBuy={handleBuy}
          onDismissPurchase={handleDismissPurchase}
          onBack={handleCloseShop}
        />
      )
    case 'milestone':
      return (
        <MilestoneScreen
          count={gameState.problemsSolved}
          onContinue={handleMilestoneDone}
          onFinish={handleMilestoneDone}
        />
      )
    default:
      return null
  }
}
