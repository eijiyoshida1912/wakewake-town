'use client'

import { Difficulty } from '@/lib/types'
import { DIFFICULTIES, DIFFICULTY_ORDER } from '@/lib/difficulty'

const ICONS: Record<Difficulty, string> = { easy: '🌱', normal: '🌼', challenge: '🔥' }
const STYLES: Record<Difficulty, string> = {
  easy: 'bg-green-100 border-green-400 hover:bg-green-200',
  normal: 'bg-amber-100 border-amber-400 hover:bg-amber-200',
  challenge: 'bg-red-100 border-red-400 hover:bg-red-200',
}

interface DifficultySelectProps {
  onSelect: (difficulty: Difficulty) => void
  onBack: () => void
}

export default function DifficultySelect({ onSelect, onBack }: DifficultySelectProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 to-green-200 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm flex flex-col items-center gap-5">
        <h1 className="text-2xl font-bold text-green-700">どのおねがいにする？</h1>

        <div className="flex flex-col gap-3 w-full">
          {DIFFICULTY_ORDER.map(id => {
            const config = DIFFICULTIES[id]
            const description = [
              `${config.digits}けた ÷ 1けた`,
              `あまり${config.hasRemainder ? 'あり' : 'なし'}`,
              `ヒント${config.assisted ? 'あり' : 'なし'}`,
            ].join(' ・ ')
            return (
              <button
                key={id}
                onClick={() => onSelect(id)}
                className={`w-full rounded-3xl border-2 border-b-4 p-4 text-left shadow-lg transition-all active:scale-95 ${STYLES[id]}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-700">
                    {ICONS[id]} {config.label}
                  </span>
                  <span className="rounded-full border border-amber-300 bg-amber-100 px-3 py-1 text-sm font-bold text-amber-700">
                    🪙 {config.coins}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600">{description}</p>
              </button>
            )
          })}
        </div>

        <button
          onClick={onBack}
          className="w-full rounded-2xl bg-gray-200 py-3 text-lg font-bold text-gray-600 shadow transition-all hover:bg-gray-300 active:scale-95"
        >
          ← もどる
        </button>
      </div>
    </div>
  )
}
