'use client'

import { useState } from 'react'
import { ITEM_CATEGORIES, ItemCategory, SHOP_ITEMS } from '@/lib/items'
import CategoryTabs from './CategoryTabs'

interface TownDecorationsProps {
  /** 持っているアイテムの名前 */
  items: string[]
}

/**
 * 町のかざり。カテゴリのタブで切り替える。アイテムごとに決まった場所があり、
 * 持っているものが自動でそこに並ぶ。まだ持っていない場所は「？」で見せる。
 */
export default function TownDecorations({ items }: TownDecorationsProps) {
  const [selected, setSelected] = useState<ItemCategory>(ITEM_CATEGORIES[0].id)

  const isOwned = (name: string) => items.includes(name)
  const ownedCount = SHOP_ITEMS.filter(item => isOwned(item.name)).length
  const tabs = ITEM_CATEGORIES.map(category => {
    const inCategory = SHOP_ITEMS.filter(item => item.category === category.id)
    const owned = inCategory.filter(item => isOwned(item.name)).length
    return {
      id: category.id,
      emoji: category.emoji,
      label: category.label,
      badge: `${owned}/${inCategory.length}`,
      ariaLabel: `${category.label} ${owned} / ${inCategory.length}`,
    }
  })
  const visible = SHOP_ITEMS.filter(item => item.category === selected)

  return (
    <div className="w-full bg-white/80 rounded-2xl p-4 shadow border border-white">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-bold text-gray-600">🏡 町のかざり</p>
        <p className="text-sm font-bold text-green-600">
          {ownedCount} / {SHOP_ITEMS.length}
        </p>
      </div>
      <CategoryTabs label="町のかざりのカテゴリ" tabs={tabs} selected={selected} onSelect={setSelected} />
      <div role="tabpanel" className="mt-3">
        <ul aria-label="町のかざり" className="grid grid-cols-5 gap-2">
          {visible.map(item =>
            isOwned(item.name) ? (
              <li
                key={item.name}
                className="flex flex-col items-center rounded-xl border border-amber-200 bg-amber-50 py-2 text-center"
              >
                <span className="text-2xl">{item.emoji}</span>
                <span className="text-[10px] leading-tight text-gray-600">{item.name}</span>
              </li>
            ) : (
              <li
                key={item.name}
                className="flex items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white/60 py-3 text-xl font-bold text-gray-300"
              >
                ？
              </li>
            ),
          )}
        </ul>
      </div>
    </div>
  )
}
