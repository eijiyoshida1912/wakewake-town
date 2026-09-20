'use client'

import { useState, useCallback } from 'react'
import { Problem } from '@/lib/types'
import { DIFFICULTIES } from '@/lib/difficulty'
import { RESIDENTS } from '@/lib/residents'
import { generateSteps, getBoardSnapshot } from '@/lib/divisionLogic'
import LongDivisionBoard from './LongDivisionBoard'
import AssistedPlay from './AssistedPlay'
import ChallengeBoard from './ChallengeBoard'
import ShareAnimation from './ShareAnimation'

interface LongDivisionGameProps {
  problem: Problem
  onComplete: () => void
  onBack: () => void
}

export default function LongDivisionGame({ problem, onComplete, onBack }: LongDivisionGameProps) {
  const config = DIFFICULTIES[problem.difficulty]
  const [solved, setSolved] = useState(false)
  const handleSolved = useCallback(() => setSolved(true), [])

  // 完成した盤面（最後のステップの状態）
  const steps = generateSteps(problem)
  const completeSnapshot = getBoardSnapshot(problem, steps.length - 1, steps)

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-3 flex items-center gap-3">
        {/* 完成後に戻ると、コインをもらわずにやり直せてしまうので、完成画面では出さない */}
        {!solved && (
          <button
            onClick={onBack}
            className="rounded-xl bg-gray-200 px-3 py-2 text-sm font-bold text-gray-600 shadow transition-all hover:bg-gray-300 active:scale-95"
          >
            ← もどる
          </button>
        )}
        <span className="text-2xl">{RESIDENTS[problem.residentId].emoji}</span>
        <div className="flex-1">
          <p className="text-xs text-gray-500">{RESIDENTS[problem.residentId].name}のおねがい</p>
          <p className="text-sm font-bold text-gray-700">{problem.dividend} ÷ {problem.divisor} を計算しよう！</p>
        </div>
        <span className="rounded-full border border-amber-300 bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
          {config.label}
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center pt-4 px-4 gap-4 max-w-lg mx-auto w-full">
        {solved ? (
          /* Completion screen */
          <div className="flex flex-col items-center gap-4 py-6 w-full">
            <div className="text-6xl animate-bounce">{RESIDENTS[problem.residentId].emoji}</div>
            <div className="bg-white rounded-3xl shadow-lg p-6 text-center border-2 border-yellow-300 w-full">
              <p className="text-2xl font-bold text-yellow-600 mb-2">🎉 できた！</p>
              <p className="text-lg text-gray-700">
                {problem.dividend} ÷ {problem.divisor} ={' '}
                <span className="text-blue-600 font-bold text-2xl">{problem.quotient}</span>
                {problem.remainder > 0 && (
                  <>
                    {' '}あまり{' '}
                    <span className="text-green-600 font-bold text-2xl">{problem.remainder}</span>
                  </>
                )}
              </p>
              <p className="text-gray-500 mt-2">ありがとう！大助かりだよ！</p>
            </div>
            <ShareAnimation problem={problem} />
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-3 text-center w-full">
              <p className="text-amber-600 font-bold text-lg">＋{config.coins}コイン！🪙</p>
            </div>
            {/* 次へ進むボタンは、画面の下に隠れないよう、見返し用の筆算より上に置く */}
            <button
              onClick={onComplete}
              className="w-full max-w-xs bg-green-400 hover:bg-green-500 text-white font-bold text-xl py-4 rounded-2xl shadow-lg transition-all active:scale-95"
            >
              つぎのおねがいへ →
            </button>
            <div role="group" aria-label="ひっ算のこたえ" className="bg-white rounded-2xl p-4 shadow">
              <LongDivisionBoard
                dividend={problem.dividend}
                divisor={problem.divisor}
                snapshot={completeSnapshot}
                stepType="complete"
              />
            </div>
          </div>
        ) : config.assisted ? (
          <AssistedPlay problem={problem} onSolved={handleSolved} />
        ) : (
          <ChallengeBoard problem={problem} onSolved={handleSolved} />
        )}
      </div>
    </div>
  )
}
