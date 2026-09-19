'use client'

interface MilestoneScreenProps {
  count: number
  onContinue: () => void
  onFinish: () => void
}

export default function MilestoneScreen({ count, onContinue, onFinish }: MilestoneScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-100 to-green-100 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm flex flex-col items-center gap-6">
        <div className="text-7xl animate-bounce">🌟</div>
        <div className="bg-white rounded-3xl shadow-lg p-6 text-center border-2 border-yellow-300">
          <p className="text-2xl font-bold text-yellow-600 mb-2">すごい！</p>
          <p className="text-3xl font-bold text-gray-700">きょうのお手伝い</p>
          <p className="text-5xl font-bold text-green-600 my-3">{count}こ</p>
          <p className="text-2xl font-bold text-gray-700">できた！</p>
        </div>
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={onContinue}
            className="w-full bg-green-400 hover:bg-green-500 text-white font-bold text-xl py-5 rounded-2xl shadow-lg transition-all active:scale-95"
          >
            もっと遊ぶ！ 🏃
          </button>
          <button
            onClick={onFinish}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-600 font-bold text-lg py-4 rounded-2xl shadow transition-all active:scale-95"
          >
            おわる
          </button>
        </div>
      </div>
    </div>
  )
}
