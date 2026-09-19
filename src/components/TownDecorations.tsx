'use client'

import { SHOP_ITEMS } from '@/lib/items'

interface TownDecorationsProps {
  /** 持っているアイテムの名前 */
  items: string[]
}

/**
 * 町のかざり。アイテムごとに決まった場所があり、持っているものが自動でそこに並ぶ。
 * まだ持っていない場所は「？」で見せる。
 */
export default function TownDecorations({ items }: TownDecorationsProps) {
  const ownedCount = SHOP_ITEMS.filter(item => items.includes(item.name)).length
  return (
    <div className="w-full bg-white/80 rounded-2xl p-4 shadow border border-white">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-bold text-gray-600">🏡 町のかざり</p>
        <p className="text-sm font-bold text-green-600">
          {ownedCount} / {SHOP_ITEMS.length}
        </p>
      </div>
      <ul aria-label="町のかざり" className="grid grid-cols-4 gap-2">
        {SHOP_ITEMS.map(item =>
          items.includes(item.name) ? (
            <li
              key={item.name}
              className="flex flex-col items-center rounded-xl border border-amber-200 bg-amber-50 py-2 text-center"
            >
              <span className="text-3xl">{item.emoji}</span>
              <span className="text-xs text-gray-600">{item.name}</span>
            </li>
          ) : (
            <li
              key={item.name}
              className="flex items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white/60 py-2 text-2xl font-bold text-gray-300"
            >
              ？
            </li>
          ),
        )}
      </ul>
    </div>
  )
}
