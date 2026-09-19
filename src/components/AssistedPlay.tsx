'use client'

import { useState, useEffect } from 'react'
import { Problem } from '@/lib/types'
import { generateSteps, getBoardSnapshot } from '@/lib/divisionLogic'
import LongDivisionBoard from './LongDivisionBoard'
import NumberPad from './NumberPad'
import StepInstruction from './StepInstruction'

interface AssistedPlayProps {
  problem: Problem
  /** 最後のステップ（かんせい）まで進んだときに呼ばれる */
  onSolved: () => void
}

/** 手順の質問とヒントに沿って、1ステップずつ答えていく遊び方（かんたん・まあまあ） */
export default function AssistedPlay({ problem, onSolved }: AssistedPlayProps) {
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

  useEffect(() => {
    if (isComplete) onSolved()
  }, [isComplete, onSolved])

  const handleInput = (digit: number) => {
    if (status === 'correct' || isComplete) return
    setInput(prev => prev.length >= 2 ? prev : prev + digit.toString())
    setStatus('idle')
  }

  const handleDelete = () => {
    setInput(prev => prev.slice(0, -1))
    setStatus('idle')
  }

  const handleSubmit = () => {
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
  }

  const handleOrosu = () => {
    setIsDropping(true)
    setTimeout(() => {
      setIsDropping(false)
      setStepIndex(prev => prev + 1)
    }, 700)
  }

  return (
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
          {isDropping ? '⬇️ おろしてる...' : `⬇️ ${currentStep.answer} をおろす！`}
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
  )
}
