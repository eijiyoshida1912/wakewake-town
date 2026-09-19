'use client'

import { useEffect, useId } from 'react'
import { getItemCategoryLabel, getItemEmoji } from '@/lib/items'

interface PurchaseModalProps {
  /** いま買ったアイテムの名前 */
  name: string
  onClose: () => void
}

/**
 * 「○○をかったよ！」のモーダル。「やったー！」か Escape で閉じる。
 * 子どもが連続でタップしても見逃さないよう、うしろの暗い部分を押しても閉じない。
 */
export default function PurchaseModal({ name, onClose }: PurchaseModalProps) {
  const titleId = useId()
  const category = getItemCategoryLabel(name)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-sm rounded-3xl border-4 border-green-300 bg-white p-6 pt-10 text-center shadow-2xl"
      >
        <div className="text-8xl animate-bounce">{getItemEmoji(name)}</div>
        <h2 id={titleId} className="mt-2 text-3xl font-bold text-gray-700">
          {name}をかったよ！
        </h2>
        {category !== null && <p className="mt-2 text-gray-500">🏡 町の「{category}」にかざったよ</p>}
        <button
          type="button"
          autoFocus
          onClick={onClose}
          className="mt-5 w-full rounded-2xl bg-green-400 py-4 text-xl font-bold text-white shadow-lg transition-all hover:bg-green-500 active:scale-95"
        >
          やったー！ 🎉
        </button>
      </div>
    </div>
  )
}
