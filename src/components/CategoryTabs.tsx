'use client'

import { ItemCategory } from '@/lib/items'

export interface CategoryTab {
  id: ItemCategory
  emoji: string
  label: string
  /** タブの下に小さく出す数（例: 3/10） */
  badge: string
  /** 読み上げ・テスト用の名前（例: 「かぐ 3 / 10」） */
  ariaLabel: string
}

interface CategoryTabsProps {
  /** タブ全体の名前 */
  label: string
  tabs: CategoryTab[]
  selected: ItemCategory
  onSelect: (id: ItemCategory) => void
}

/** アイテムのカテゴリを切り替えるタブ（町のかざりとお店で共通） */
export default function CategoryTabs({ label, tabs, selected, onSelect }: CategoryTabsProps) {
  return (
    <div role="tablist" aria-label={label} className="grid grid-cols-5 gap-1">
      {tabs.map(tab => {
        const active = tab.id === selected
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={tab.ariaLabel}
            onClick={() => onSelect(tab.id)}
            className={`flex flex-col items-center rounded-xl border-2 py-1 transition-all active:scale-95 ${
              active ? 'border-green-400 bg-green-100 text-green-800' : 'border-transparent bg-white/70 text-gray-500'
            }`}
          >
            <span className="text-xl">{tab.emoji}</span>
            <span className="text-[10px] font-bold leading-tight">{tab.label}</span>
            <span className="text-[10px] leading-tight">{tab.badge}</span>
          </button>
        )
      })}
    </div>
  )
}
