'use client'

import { useEffect, useRef, useState } from 'react'
import { Problem } from '@/lib/types'
import { ChallengeCell, getChallengeCells, getCellLabel, isChallengeSolved, judgeCell } from '@/lib/challengeBoard'

/** 最後のマスが正解してから、完成画面に切り替わるまでの待ち時間 */
const SOLVED_DELAY_MS = 800

const PAD_ROWS = [[7, 8, 9], [4, 5, 6], [1, 2, 3], [0]]

const FILLED_COLOR: Record<ChallengeCell['kind'], string> = {
  quotient: 'text-blue-600',
  product: 'text-red-500',
  remainder: 'text-green-600',
}

interface ChallengeBoardProps {
  problem: Problem
  /** すべてのマスを正しく埋めたときに呼ばれる */
  onSolved: () => void
}

export default function ChallengeBoard({ problem, onSolved }: ChallengeBoardProps) {
  const [filled, setFilled] = useState<Record<string, number>>({})
  const [selected, setSelected] = useState<string | null>(null)
  const [wrongKey, setWrongKey] = useState<string | null>(null)

  const cells = getChallengeCells(problem)
  const width = String(problem.dividend).length
  const solved = isChallengeSolved(problem, filled)

  // 親の再描画で onSolved の参照が変わっても、待ち時間のタイマーを作り直さないようにする
  const onSolvedRef = useRef(onSolved)
  useEffect(() => {
    onSolvedRef.current = onSolved
  })

  useEffect(() => {
    if (!solved) return
    const timer = setTimeout(() => onSolvedRef.current(), SOLVED_DELAY_MS)
    return () => clearTimeout(timer)
  }, [solved])

  const handleDigit = (digit: number) => {
    if (selected === null) return
    if (judgeCell(problem, selected, digit)) {
      setFilled(prev => ({ ...prev, [selected]: digit }))
      setSelected(null)
      setWrongKey(null)
    } else {
      setWrongKey(selected)
    }
  }

  const renderCell = (cell: ChallengeCell, extraClass = '') => {
    const isFilled = cell.key in filled
    const isSelected = selected === cell.key
    const isWrong = wrongKey === cell.key
    const stateClass = isFilled
      ? `border-transparent ${FILLED_COLOR[cell.kind]}`
      : isWrong
        ? 'border-red-400 bg-red-50'
        : isSelected
          ? 'border-orange-400 bg-yellow-50'
          : 'border-dashed border-gray-300 bg-white'
    return (
      <button
        key={cell.key}
        type="button"
        aria-label={getCellLabel(cell)}
        data-wrong={isWrong}
        aria-pressed={isSelected}
        disabled={isFilled}
        onClick={() => {
          setSelected(cell.key)
          setWrongKey(null)
        }}
        className={`w-10 h-10 md:w-14 md:h-12 flex items-center justify-center rounded-lg border-2 text-xl md:text-2xl font-bold font-mono transition-all ${stateClass} ${extraClass}`}
      >
        {isFilled ? filled[cell.key] : ''}
      </button>
    )
  }

  const rowCells = (kind: ChallengeCell['kind'], round: number) =>
    cells.filter(c => c.kind === kind && c.round === round)

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div role="group" aria-label="ひっ算" className="flex items-start gap-1 font-mono select-none">
        {/* Divisor */}
        <div className="flex flex-col items-end pt-14 md:pt-16 pr-1">
          <span className="text-3xl md:text-4xl font-bold text-gray-700">{problem.divisor}</span>
        </div>

        <div className="flex flex-col gap-1">
          {/* Quotient row */}
          <div className="flex gap-1 pl-3">{cells.filter(c => c.kind === 'quotient').map(c => renderCell(c))}</div>

          {/* Bracket + dividend row */}
          <div className="flex">
            <div className="w-3 border-t-4 border-l-4 border-gray-700 h-6 md:h-8 rounded-tl" />
            {String(problem.dividend)
              .split('')
              .map((digit, col) => (
                <div
                  key={col}
                  className="w-10 md:w-14 h-8 md:h-10 flex items-center justify-center text-2xl md:text-3xl font-bold text-gray-700 border-t-4 border-gray-700"
                >
                  {digit}
                </div>
              ))}
          </div>

          {/* Working rows: 周の数は被除数の桁数と同じ（使わない周は空のまま） */}
          {Array.from({ length: width }, (_, round) => (
            <div key={round} className="flex flex-col gap-1">
              <div className="flex gap-1 pl-3 border-b-2 border-gray-300 pb-1">
                {rowCells('product', round).map(c => renderCell(c))}
              </div>
              <div className="flex gap-1 pl-3">{rowCells('remainder', round).map(c => renderCell(c))}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="min-h-12 w-full max-w-sm text-center">
        {wrongKey !== null ? (
          <p role="alert" className="rounded-2xl border-2 border-red-200 bg-red-50 p-3 font-bold text-red-600">
            おしい！もういちど考えてみよう 🤔
          </p>
        ) : solved ? (
          <p className="rounded-2xl border-2 border-green-300 bg-green-50 p-3 text-lg font-bold text-green-600">
            ✨ ぜんぶできた！
          </p>
        ) : (
          <p className="text-gray-500">マスをえらんでから、数字をおしてね</p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {PAD_ROWS.flat().map(digit => (
          <button
            key={digit}
            type="button"
            onClick={() => handleDigit(digit)}
            disabled={selected === null}
            className={`w-16 h-16 md:w-20 md:h-20 bg-amber-100 hover:bg-amber-200 active:bg-amber-300 border-2 border-amber-300 rounded-2xl text-2xl md:text-3xl font-bold text-gray-700 shadow-md transition-all active:scale-95 disabled:opacity-40 ${digit === 0 ? 'col-start-2' : ''}`}
          >
            {digit}
          </button>
        ))}
      </div>
    </div>
  )
}
