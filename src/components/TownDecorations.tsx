'use client'

import { useState } from 'react'
import { ITEM_CATEGORIES, ItemCategory, SHOP_ITEMS } from '@/lib/items'
import { DECORATION_SCENES } from '@/lib/decorationScenes'
import CategoryTabs from './CategoryTabs'

/** 場面の背景（壁・床・窓など）。見た目は globals.css の .deco-scene で描く */
const SCENE_BACKGROUNDS: Record<ItemCategory, { className: string; layers: string[] }> = {
  furniture: { className: 'living', layers: ['wall', 'floor', 'base', 'window', 'shelf', 'rug'] },
  plants: { className: 'garden', layers: ['sky', 'sun', 'fence', 'rail', 'grass', 'path'] },
  toys: { className: 'kids', layers: ['wall', 'floor', 'base', 'window', 'hook', 'mat'] },
  food: { className: 'dining', layers: ['wall', 'floor', 'shelf', 'leg1', 'leg2', 'table', 'cloth'] },
  vehicles: {
    className: 'street',
    layers: ['sky', 'cloud c1', 'cloud c2', 'hill', 'ground', 'rails', 'road', 'lane', 'river'],
  },
}

interface TownDecorationsProps {
  /** 持っているアイテムの名前 */
  items: string[]
}

/**
 * 町のかざり。カテゴリのタブで場面（リビング・にわ など）を切り替える。
 * アイテムごとに場面の中の置き場所が決まっていて、持っているものが自動でそこに飾られる。
 * まだ持っていない場所は、点線の枠の「？」で見せる。押すと名前（持っていなければ案内）の吹き出しが出る。
 */
export default function TownDecorations({ items }: TownDecorationsProps) {
  const [selected, setSelected] = useState<ItemCategory>(ITEM_CATEGORIES[0].id)
  /** 吹き出しを出しているアイテムの名前 */
  const [bubble, setBubble] = useState<string | null>(null)

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
  const scene = DECORATION_SCENES[selected]
  const background = SCENE_BACKGROUNDS[selected]
  const bubbleSpot = bubble === null ? null : scene.spots[bubble]

  const handleSelect = (id: ItemCategory) => {
    setSelected(id)
    setBubble(null)
  }

  return (
    <div className="w-full bg-white/80 rounded-2xl p-4 shadow border border-white">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-bold text-gray-600">🏡 町のかざり</p>
        <p className="text-sm font-bold text-green-600">
          {ownedCount} / {SHOP_ITEMS.length}
        </p>
      </div>
      <CategoryTabs label="町のかざりのカテゴリ" tabs={tabs} selected={selected} onSelect={handleSelect} />
      <p id="deco-scene-title" className="mt-3 mb-1 text-xs font-bold text-gray-500">
        {scene.title}
      </p>
      <div role="tabpanel" aria-labelledby="deco-scene-title" className={`deco-scene ${background.className}`}>
        {background.layers.map(layer => (
          <div key={layer} aria-hidden="true" className={`deco-bg ${layer}`} />
        ))}
        <ul aria-label="町のかざり">
          {visible.map(item => {
            const spot = scene.spots[item.name]
            const owned = isOwned(item.name)
            return (
              <li
                key={item.name}
                className="deco-spot"
                style={{
                  left: `${spot.x}%`,
                  top: `${spot.y}%`,
                  zIndex: Math.round(spot.y),
                  ['--s' as string]: spot.size,
                }}
              >
                <button
                  type="button"
                  aria-label={owned ? item.name : 'まだ持っていないもの'}
                  onClick={() => setBubble(prev => (prev === item.name ? null : item.name))}
                  className={owned ? 'deco-item' : 'deco-empty'}
                >
                  {owned ? (
                    <>
                      <span aria-hidden="true">{item.emoji}</span>
                      <span className="sr-only">{item.name}</span>
                    </>
                  ) : (
                    '？'
                  )}
                </button>
              </li>
            )
          })}
        </ul>
        {bubble !== null && bubbleSpot && (
          <p
            role="status"
            className="deco-bubble"
            style={{
              left: `${Math.min(Math.max(bubbleSpot.x, 16), 84)}%`,
              top: `calc(${bubbleSpot.y}% - ${bubbleSpot.size * 4.6}cqw)`,
            }}
          >
            {isOwned(bubble) ? bubble : 'おみせで かえるよ'}
          </p>
        )}
      </div>
    </div>
  )
}
