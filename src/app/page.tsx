'use client'

import { useGameState } from '@/lib/useGameState'
import { useBrowserBack } from '@/lib/useBrowserBack'
import TownHome from '@/components/TownHome'
import DifficultySelect from '@/components/DifficultySelect'
import RequestScene from '@/components/RequestScene'
import LongDivisionGame from '@/components/LongDivisionGame'
import RewardScreen from '@/components/RewardScreen'
import ShopScreen from '@/components/ShopScreen'
import MilestoneScreen from '@/components/MilestoneScreen'
import RankingScreen from '@/components/RankingScreen'

export default function Home() {
  const {
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
    handleOpenRanking,
    handleCloseRanking,
  } = useGameState()

  // ブラウザの「戻る」は、画面の「もどる」と同じ動きにする。
  // 完成画面・お祝い画面・節目画面は、コインをもらったあとなので戻れない（null）
  const backAction = (() => {
    switch (gameState.screen) {
      case 'difficulty':
        return handleCancelDifficulty
      case 'request':
        return handleBackToDifficulty
      case 'division':
        return gameState.divisionSolved ? null : handleBackToRequest
      case 'shop':
        return handleCloseShop
      case 'ranking':
        return handleCloseRanking
      default:
        return null
    }
  })()
  useBrowserBack(gameState.screen !== 'home', backAction)

  // localStorageの読み込みが終わるまでは何も表示しない（ちらつき防止）
  if (!hydrated) return null

  switch (gameState.screen) {
    case 'home':
      return (
        <TownHome
          gameState={gameState}
          onStart={handleOpenDifficulty}
          onOpenShop={handleOpenShop}
          onOpenRanking={handleOpenRanking}
        />
      )
    case 'difficulty':
      return <DifficultySelect onSelect={handleSelectDifficulty} onBack={handleCancelDifficulty} />
    case 'request':
      if (!gameState.currentProblem) return null
      return <RequestScene problem={gameState.currentProblem} onAccept={handleAccept} onBack={handleBackToDifficulty} />
    case 'division':
      if (!gameState.currentProblem) return null
      return (
        <LongDivisionGame
          problem={gameState.currentProblem}
          onComplete={handleComplete}
          onBack={handleBackToRequest}
          onSolved={handleSolved}
        />
      )
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
          count={gameState.solvedToday}
          onContinue={handleMilestoneDone}
          onFinish={handleMilestoneDone}
        />
      )
    case 'ranking':
      return <RankingScreen problemsSolved={gameState.problemsSolved} onBack={handleCloseRanking} />
    default:
      return null
  }
}
