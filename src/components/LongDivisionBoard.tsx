'use client'

import { BoardSnapshot } from '@/lib/types'

interface LongDivisionBoardProps {
  dividend: number
  divisor: number
  snapshot: BoardSnapshot
  stepType: string
}

export default function LongDivisionBoard({ dividend, divisor, snapshot, stepType }: LongDivisionBoardProps) {
  const { quotientDigits, rows, activeCol } = snapshot
  const isComplete = stepType === 'complete'

  return (
    <div className="flex items-start gap-1 font-mono select-none">
      {/* Divisor */}
      <div className="flex flex-col items-end pt-10 md:pt-12 pr-1">
        <span className="text-3xl md:text-4xl font-bold text-gray-700">{divisor}</span>
      </div>

      {/* Main area */}
      <div className="flex flex-col">
        {/* Quotient row */}
        <div className="flex mb-1">
          {quotientDigits.map((d, col) => (
            <div
              key={col}
              className={`w-10 h-10 md:w-14 md:h-12 flex items-end justify-center pb-1 text-2xl md:text-3xl font-bold
                ${d !== null ? 'text-blue-600' : 'text-transparent'}
                ${!isComplete && col === activeCol && d === null ? 'border-b-2 border-blue-300' : ''}
              `}
            >
              {d ?? ''}
            </div>
          ))}
        </div>

        {/* Bracket + dividend row */}
        <div className="flex">
          <div className="w-3 border-t-4 border-l-4 border-gray-700 h-6 md:h-8 rounded-tl" />
          {rows[0]?.digits.map((digit, col) => {
            const isActiveDigit = !isComplete && col === activeCol && stepType !== 'orosu' && (stepType === 'tateru' || stepType === 'kakeru' || stepType === 'hiku')
            return (
              <div
                key={col}
                className={`w-10 h-8 md:w-14 md:h-10 flex items-center justify-center text-2xl md:text-3xl font-bold border-t-4 border-gray-700 transition-all
                  ${isActiveDigit && col === 0 && stepType === 'tateru' ? 'text-orange-500 scale-110' : 'text-gray-700'}
                `}
              >
                {digit}
              </div>
            )
          })}
        </div>

        {/* Working rows */}
        <div className="flex flex-col gap-0">
          {rows.slice(1).map((row, rowIdx) => (
            <div key={rowIdx}>
              {row.showLine && (
                <div className="flex">
                  <div className="w-3" />
                  <div className={`w-10 md:w-14 ${row.digits[0] !== null ? 'border-t-2 border-gray-500' : ''}`} />
                  <div className={`w-10 md:w-14 ${row.digits[1] !== null ? 'border-t-2 border-gray-500' : ''}`} />
                </div>
              )}
              <div className="flex items-center">
                <div className="w-3" />
                {row.digits.map((d, col) => {
                  const isHighlighted = !isComplete && d !== null && (
                    (row.label === 'product' && stepType === 'hiku' && col === activeCol) ||
                    (row.label === 'remainder' && (stepType === 'tateru' || stepType === 'orosu') && col === activeCol)
                  )
                  return (
                    <div
                      key={col}
                      className={`w-10 h-8 md:w-14 md:h-10 flex items-center justify-center text-xl md:text-2xl font-bold transition-all
                        ${d !== null ? '' : 'invisible'}
                        ${row.label === 'product' ? 'text-red-500' : ''}
                        ${row.label === 'remainder' ? 'text-green-600' : ''}
                        ${isHighlighted ? 'bg-yellow-100 rounded-lg scale-110' : ''}
                      `}
                    >
                      {d ?? ''}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
