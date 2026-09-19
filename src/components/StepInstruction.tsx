'use client'

import { DivisionStep } from '@/lib/types'

interface StepInstructionProps {
  step: DivisionStep
  stepIndex: number
  totalSteps: number
  status: 'idle' | 'correct' | 'wrong'
  showHint: boolean
}

const STEP_LABELS: Record<string, string> = {
  tateru: '✏️ たてる',
  kakeru: '✖️ かける',
  hiku: '➖ ひく',
  orosu: '⬇️ おろす',
  complete: '🎉 かんせい',
}

const STEP_COLORS: Record<string, string> = {
  tateru: 'bg-blue-100 border-blue-400 text-blue-800',
  kakeru: 'bg-green-100 border-green-400 text-green-800',
  hiku: 'bg-orange-100 border-orange-400 text-orange-800',
  orosu: 'bg-purple-100 border-purple-400 text-purple-800',
  complete: 'bg-yellow-100 border-yellow-400 text-yellow-800',
}

export default function StepInstruction({ step, stepIndex, totalSteps, status, showHint }: StepInstructionProps) {
  const colorClass = STEP_COLORS[step.type] ?? 'bg-gray-100 border-gray-400 text-gray-800'
  const label = STEP_LABELS[step.type] ?? ''
  const progressSteps = totalSteps - 1

  return (
    <div className="w-full max-w-sm">
      <div className="flex items-center gap-2 mb-2">
        <span className={`px-3 py-1 rounded-full text-sm font-bold border-2 ${colorClass}`}>
          {label}
        </span>
        <span className="text-xs text-gray-400">
          {Math.min(stepIndex + 1, progressSteps)} / {progressSteps} ステップ
        </span>
      </div>
      <div className={`border-2 rounded-2xl p-4 mb-3 shadow-sm ${colorClass}`}>
        <p className="text-lg md:text-xl font-bold text-center">{step.question}</p>
      </div>
      {status === 'wrong' && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-3 mb-2 text-center">
          <p className="text-red-600 font-bold">おしい！もういちど考えてみよう 🤔</p>
          {showHint && step.hint && (
            <p className="text-red-500 text-sm mt-1">💡 {step.hint}</p>
          )}
        </div>
      )}
      {status === 'correct' && (
        <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-3 mb-2 text-center">
          <p className="text-green-600 font-bold text-lg">✨ いいね！その調子！</p>
        </div>
      )}
    </div>
  )
}
