'use client'

import { useState, useCallback } from 'react'
import { Problem } from '@/lib/types'
import { generateSteps, getBoardSnapshot } from '@/lib/divisionLogic'
import LongDivisionBoard from './LongDivisionBoard'
import NumberPad from './NumberPad'
import StepInstruction from './StepInstruction'

interface LongDivisionGameProps {
  problem: Problem
  onComplete: (coinsEarned: number) => void
}

const RESIDENT_EMOJI: Record<string, string> = {
  cat: '🐱',
  rabbit: '🐰',
  bear: '🐻',
}
const RESIDENT_NAMES: Record<string, string> = {
  cat: 'ネコさん',
  rabbit: 'ウサギさん',
  bear: 'クマさん',
}

export default function LongDivisionGame({ problem, onComplete }: LongDivisionGameProps) {
  const steps = generateSteps(problem)
  const [stepIndex, setStepIndex] = useState(0)
  const [input, setInput] = useState('')
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle')
  const [wrongCount, setWrongCount] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [isDropping, setIsDropping] = useState(false)

  const currentStep = steps[stepIndex]
  const snapshot = getBoardSnapshot(problem, stepIndex, steps)
  const isComplete = currentStep.type === 'complete'

  const handleInput = useCallback((digit: number) => {
    if (status === 'correct' || isComplete) return
    setInput(prev => prev.length >= 2 ? prev : prev + digit.toString())
    setStatus('idle')
  }, [status, isComplete])

  const handleDelete = useCallback(() => {
    setInput(prev => prev.slice(0, -1))
    setStatus('idle')
  }, [])

  const handleSubmit = useCallback(() => {
    if (!input || status === 'correct' || isComplete) return
    const num = parseInt(input, 10)
    if (num === currentStep.answer) {
      setStatus('correct')
      setShowHint(false)
      setWrongCount(0)
      setTimeout(() => {
        setStepIndex(prev => prev + 1)
        setInput('')
        setStatus('idle')
      }, 800)
    } else {
      setStatus('wrong')
      setInput('')
      const newCount = wrongCount + 1
      setWrongCount(newCount)
      if (newCount >= 2) setShowHint(true)
    }
  }, [input, currentStep, status, isComplete, wrongCount])

  const handleOrosu = useCallback(() => {
    setIsDropping(true)
    setTimeout(() => {
      setIsDropping(false)
      setStepIndex(prev => prev + 1)
    }, 700)
  }, [])

  // Complete snapshot for the finished board
  const completeSnapshot = getBoardSnapshot(problem, 7, steps)

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-amber-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-3 flex items-center gap-3">
        <span className="text-2xl">{RESIDENT_EMOJI[problem.residentId]}</span>
        <div>
          <p className="text-xs text-gray-500">{RESIDENT_NAMES[problem.residentId]}のおねがい</p>
          <p className="text-sm font-bold text-gray-700">{problem.dividend} ÷ {problem.divisor} を計算しよう！</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center pt-4 px-4 gap-4 max-w-lg mx-auto w-full">
        {isComplete ? (
          /* Completion screen */
          <div className="flex flex-col items-center gap-4 py-6 w-full">
            <div className="text-6xl animate-bounce">{RESIDENT_EMOJI[problem.residentId]}</div>
            <div className="bg-white rounded-3xl shadow-lg p-6 text-center border-2 border-yellow-300 w-full">
              <p className="text-2xl font-bold text-yellow-600 mb-2">🎉 できた！</p>
              <p className="text-lg text-gray-700">
                {problem.dividend} ÷ {problem.divisor} ={' '}
                <span className="text-blue-600 font-bold text-2xl">{problem.quotient}</span>
              </p>
              <p className="text-gray-500 mt-2">ありがとう！大助かりだよ！</p>
            </div>
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-3 text-center w-full">
              <p className="text-amber-600 font-bold text-lg">＋10コイン！🪙</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow">
              <LongDivisionBoard
                dividend={problem.dividend}
                divisor={problem.divisor}
                snapshot={completeSnapshot}
                stepType="complete"
              />
            </div>
            <button
              onClick={() => onComplete(10)}
              className="w-full max-w-xs bg-green-400 hover:bg-green-500 text-white font-bold text-xl py-4 rounded-2xl shadow-lg transition-all active:scale-95"
            >
              つぎのおねがいへ →
            </button>
          </div>
        ) : (
          <>
            {/* Division board */}
            <div className="bg-white rounded-2xl p-4 md:p-6 shadow-md border border-gray-100 w-full flex justify-center">
              <LongDivisionBoard
                dividend={problem.dividend}
                divisor={problem.divisor}
                snapshot={snapshot}
                stepType={currentStep.type}
              />
            </div>

            {/* Step instruction */}
            <StepInstruction
              step={currentStep}
              stepIndex={stepIndex}
              totalSteps={steps.length}
              status={status}
              showHint={showHint}
            />

            {/* Orosu button or NumberPad */}
            {currentStep.type === 'orosu' ? (
              <button
                onClick={handleOrosu}
                disabled={isDropping}
                className={`w-full max-w-xs py-5 rounded-2xl font-bold text-xl shadow-lg transition-all
                  ${isDropping ? 'bg-purple-200 text-purple-400' : 'bg-purple-400 hover:bg-purple-500 text-white active:scale-95'}
                `}
              >
                {isDropping ? '⬇️ おろしてる...' : `⬇️ ${problem.dividend % 10} をおろす！`}
              </button>
            ) : (
              <div className="flex flex-col items-center gap-3 w-full">
                <NumberPad
                  onInput={handleInput}
                  onDelete={handleDelete}
                  currentInput={input}
                  disabled={status === 'correct'}
                />
                <button
                  onClick={handleSubmit}
                  disabled={!input || status === 'correct'}
                  className="w-full max-w-xs bg-blue-400 hover:bg-blue-500 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold text-xl py-4 rounded-2xl shadow-lg transition-all active:scale-95"
                >
                  こたえる！
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
