'use client'

import { getShopItems } from '@/lib/shop'

interface ShopScreenProps {
  coins: number
  /** 持っているアイテムの名前（お店には並ばない） */
  items: string[]
  /** いま買ったアイテム（「○○をかったよ！」を出す） */
  purchasedItem: string | null
  onBuy: (name: string) => void
  onBack: () => void
}

export default function ShopScreen({ coins, items, purchasedItem, onBuy, onBack }: ShopScreenProps) {
  const shopItems = getShopItems(items)
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-100 to-orange-100 flex flex-col">
      <div className="bg-white/80 backdrop-blur px-4 py-3 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-bold text-amber-700">🛒 おみせ</h1>
        <span className="bg-amber-100 border border-amber-300 rounded-full px-3 py-1 text-sm font-bold text-amber-700">
          🪙 {coins}
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center px-4 pt-4 pb-6 gap-4 max-w-lg mx-auto w-full">
        {purchasedItem !== null && (
          <p
            role="status"
            className="w-full rounded-2xl border-2 border-green-300 bg-green-50 p-3 text-center font-bold text-green-700"
          >
            🎉 {purchasedItem}をかったよ！町にかざったよ
          </p>
        )}

        {shopItems.length === 0 ? (
          <p className="w-full rounded-2xl border-2 border-yellow-300 bg-white p-6 text-center text-lg font-bold text-yellow-600">
            🎉 ぜんぶそろったよ！町がにぎやかになったね
          </p>
        ) : (
          <ul className="flex w-full flex-col gap-3">
            {shopItems.map(item => {
              const shortage = item.price - coins
              return (
                <li
                  key={item.name}
                  className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-white p-3 shadow"
                >
                  <span className="text-4xl">{item.emoji}</span>
                  <div className="flex-1">
                    <p className="font-bold text-gray-700">{item.name}</p>
                    <p className="text-sm font-bold text-amber-600">🪙 {item.price}</p>
                  </div>
                  <button
                    type="button"
                    aria-label={`${item.name}をかう`}
                    disabled={shortage > 0}
                    onClick={() => onBuy(item.name)}
                    className="min-w-24 rounded-xl bg-green-400 px-4 py-3 text-lg font-bold text-white shadow transition-all hover:bg-green-500 active:scale-95 disabled:bg-gray-200 disabled:text-gray-400"
                  >
                    {shortage > 0 ? `あと ${shortage}` : 'かう'}
                  </button>
                </li>
              )
            })}
          </ul>
        )}

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
