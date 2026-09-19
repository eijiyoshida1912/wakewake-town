'use client'

import { useEffect, useState } from 'react'
import { Problem } from '@/lib/types'
import { getShareState } from '@/lib/share'
import { getShareItemEmoji } from '@/lib/items'
import { FRIEND_EMOJIS } from '@/lib/residents'

const DEFAULT_DURATION_MS = 2800
const TICK_MS = 50

// Tailwind は動的に作ったクラス名を拾えないので、列の数は固定の表から選ぶ
const GRID_COLS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

interface ShareAnimationProps {
  problem: Problem
  durationMs?: number
}

/** 「わけわけ」: 問題のものを、割る数の人数に同じ数ずつ配る様子を、数の変化で見せる */
export default function ShareAnimation({ problem, durationMs = DEFAULT_DURATION_MS }: ShareAnimationProps) {
  const [elapsed, setElapsed] = useState(() => (prefersReducedMotion() ? durationMs : 0))
  const finished = elapsed >= durationMs

  useEffect(() => {
    if (finished) return
    const timer = setInterval(() => setElapsed(e => Math.min(durationMs, e + TICK_MS)), TICK_MS)
    return () => clearInterval(timer)
  }, [finished, durationMs])

  // はじめは勢いよく、おわりはゆっくり配る
  const t = elapsed / durationMs
  const { each, left } = getShareState(problem.dividend, problem.divisor, 1 - (1 - t) ** 2)
  const emoji = getShareItemEmoji(problem.item)

  return (
    <section aria-label="わけわけ" className="w-full rounded-2xl border-2 border-pink-200 bg-white p-4 shadow">
      <p className="text-center font-bold text-pink-500">🎁 わけわけタイム！</p>
      <p className="mb-3 text-center text-sm text-gray-600">
        {emoji} {problem.dividend} を {problem.divisor} つに 同じ数ずつわけるよ
      </p>

      <div className={`grid gap-2 ${GRID_COLS[problem.divisor] ?? 'grid-cols-3'}`}>
        {Array.from({ length: problem.divisor }, (_, i) => (
          <div
            key={i}
            role="group"
            aria-label={`なかま ${i + 1}`}
            className="flex flex-col items-center rounded-xl border border-pink-200 bg-pink-50 py-2"
          >
            <span className="text-3xl">{FRIEND_EMOJIS[i] ?? '🙂'}</span>
            <span className="font-mono font-bold text-gray-700">
              {emoji} {each}
            </span>
          </div>
        ))}
      </div>

      <div
        role="group"
        aria-label="のこり"
        className={`mt-3 rounded-xl border-2 px-3 py-2 text-center font-bold ${
          finished && left > 0
            ? 'border-green-300 bg-green-50 text-green-700'
            : 'border-amber-200 bg-amber-50 text-amber-700'
        }`}
      >
        {finished
          ? left > 0
            ? `あまり ${emoji} ${left}`
            : `のこり ${emoji} 0 ✨ ぴったり！`
          : `のこり ${emoji} ${left}`}
      </div>

      <div className="mt-3 flex justify-center">
        {finished ? (
          <button
            type="button"
            onClick={() => setElapsed(0)}
            className="rounded-full bg-pink-100 px-4 py-1 text-sm font-bold text-pink-600 hover:bg-pink-200 active:scale-95"
          >
            もういちどみる 🔁
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setElapsed(durationMs)}
            className="rounded-full bg-gray-100 px-4 py-1 text-sm font-bold text-gray-500 hover:bg-gray-200 active:scale-95"
          >
            スキップ ⏭
          </button>
        )}
      </div>
    </section>
  )
}
