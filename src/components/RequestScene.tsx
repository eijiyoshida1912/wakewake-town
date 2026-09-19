'use client'

import { Problem } from '@/lib/types'

const RESIDENT_EMOJI: Record<string, string> = { cat: '🐱', rabbit: '🐰', bear: '🐻' }
const RESIDENT_NAMES: Record<string, string> = { cat: 'ネコさん', rabbit: 'ウサギさん', bear: 'クマさん' }
const BG_COLORS: Record<string, string> = {
  cat: 'bg-orange-50 border-orange-300',
  rabbit: 'bg-pink-50 border-pink-300',
  bear: 'bg-amber-50 border-amber-300',
}

interface RequestSceneProps {
  problem: Problem
  onAccept: () => void
}

export default function RequestScene({ problem, onAccept }: RequestSceneProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-100 to-blue-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <div className="text-7xl animate-bounce">{RESIDENT_EMOJI[problem.residentId]}</div>
          <p className="text-gray-600 font-bold">{RESIDENT_NAMES[problem.residentId]}</p>
        </div>
        <div className={`w-full rounded-3xl border-2 p-5 shadow-md ${BG_COLORS[problem.residentId]}`}>
          <p className="text-gray-700 text-base md:text-lg leading-relaxed whitespace-pre-line text-center">
            {problem.message}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-md px-8 py-4 border border-gray-100">
          <p className="text-3xl md:text-4xl font-bold text-gray-700 text-center">
            {problem.dividend} ÷ {problem.divisor}
          </p>
        </div>
        <button
          onClick={onAccept}
          className="w-full bg-green-400 hover:bg-green-500 text-white font-bold text-xl py-5 rounded-2xl shadow-lg transition-all active:scale-95"
        >
          お手伝いする！ 🙌
        </button>
      </div>
    </div>
  )
}
