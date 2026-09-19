'use client'

import { ResidentId } from '@/lib/types'
import { getItemEmoji } from '@/lib/items'
import { RESIDENTS } from '@/lib/residents'

interface RewardScreenProps {
  /** いまもらったアイテムの名前 */
  item: string
  /** 問題を出した住人（おれいをくれた人） */
  residentId: ResidentId
  onDone: () => void
}

export default function RewardScreen({ item, residentId, onDone }: RewardScreenProps) {
  const resident = RESIDENTS[residentId]
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 to-yellow-100 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm flex flex-col items-center gap-6">
        <div className="text-8xl animate-bounce">{getItemEmoji(item)}</div>
        <div className="bg-white rounded-3xl shadow-lg p-6 text-center border-2 border-pink-300 w-full">
          <p className="text-xl font-bold text-pink-500 mb-2">🎁 おれいのプレゼント！</p>
          <p className="text-3xl font-bold text-gray-700">{item}をもらったよ！</p>
          <p className="text-gray-500 mt-3">
            {resident.emoji} {resident.name}が「ありがとう！」ってくれたよ
          </p>
        </div>
        <button
          onClick={onDone}
          className="w-full bg-pink-400 hover:bg-pink-500 text-white font-bold text-xl py-5 rounded-2xl shadow-lg transition-all active:scale-95"
        >
          やったー！ 🎉
        </button>
      </div>
    </div>
  )
}
