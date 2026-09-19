'use client'

interface NumberPadProps {
  onInput: (digit: number) => void
  onDelete: () => void
  currentInput: string
  disabled?: boolean
}

export default function NumberPad({ onInput, onDelete, currentInput, disabled }: NumberPadProps) {
  const digits = [7, 8, 9, 4, 5, 6, 1, 2, 3]

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-28 h-14 bg-white border-4 border-amber-400 rounded-2xl flex items-center justify-center text-3xl font-bold text-gray-700 shadow-inner">
        {currentInput || <span className="text-gray-300">?</span>}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {digits.map(d => (
          <button
            key={d}
            onClick={() => onInput(d)}
            disabled={disabled}
            className="w-16 h-16 md:w-20 md:h-20 bg-amber-100 hover:bg-amber-200 active:bg-amber-300 border-2 border-amber-300 rounded-2xl text-2xl md:text-3xl font-bold text-gray-700 shadow-md transition-all active:scale-95 disabled:opacity-40"
          >
            {d}
          </button>
        ))}
        <button
          onClick={onDelete}
          disabled={disabled}
          className="w-16 h-16 md:w-20 md:h-20 bg-red-100 hover:bg-red-200 border-2 border-red-300 rounded-2xl text-base font-bold text-red-600 shadow-md transition-all active:scale-95 disabled:opacity-40"
        >
          けす
        </button>
        <button
          onClick={() => onInput(0)}
          disabled={disabled}
          className="w-16 h-16 md:w-20 md:h-20 bg-amber-100 hover:bg-amber-200 active:bg-amber-300 border-2 border-amber-300 rounded-2xl text-2xl md:text-3xl font-bold text-gray-700 shadow-md transition-all active:scale-95 disabled:opacity-40"
        >
          0
        </button>
        <div className="w-16 h-16 md:w-20 md:h-20" />
      </div>
    </div>
  )
}
