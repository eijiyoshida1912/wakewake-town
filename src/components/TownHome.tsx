'use client'

import { GameState } from '@/lib/types'

const ITEM_EMOJI: Record<string, string> = {
  'いす': '🪑', 'ランプ': '🪔', 'クッション': '🛋️', '観葉植物': '🌿',
  'ぬいぐるみ': '🧸', 'ぼうし': '🎩', 'テーブル': '🪵', 'フラワーポット': '🌸',
}

interface TownHomeProps {
  gameState: GameState
  onStart: () => void
}

export default function TownHome({ gameState, onStart }: TownHomeProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-200 to-green-200 flex flex-col">
      <div className="bg-white/80 backdrop-blur px-4 py-3 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-bold text-green-700">🏘️ わけわけタウン</h1>
        <span className="bg-amber-100 border border-amber-300 rounded-full px-3 py-1 text-sm font-bold text-amber-700">
          🪙 {gameState.coins}
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center px-4 pt-6 gap-5 max-w-lg mx-auto w-full">
        {/* Town scene */}
        <div className="w-full bg-white/60 rounded-3xl p-4 shadow-md border border-white/80">
          <div className="flex justify-around items-end py-2">
            <div className="flex flex-col items-center">
              <div className="text-5xl">🐱</div>
              <div className="text-3xl mt-1">🏠</div>
              <p className="text-xs text-gray-500 mt-1">ネコさんち</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-4xl">🌳</div>
              <div className="text-2xl">🌼</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-5xl">🐰</div>
              <div className="text-3xl mt-1">🏠</div>
              <p className="text-xs text-gray-500 mt-1">ウサギさんち</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-5xl">🐻</div>
              <div className="text-3xl mt-1">🏠</div>
              <p className="text-xs text-gray-500 mt-1">クマさんち</p>
            </div>
          </div>
          <div className="mt-2 h-2 bg-green-400 rounded-full opacity-60" />
        </div>

        <div className="grid grid-cols-2 gap-3 w-full">
          <div className="bg-white/80 rounded-2xl p-3 text-center shadow border border-white">
            <p className="text-2xl font-bold text-amber-600">🪙 {gameState.coins}</p>
            <p className="text-xs text-gray-500 mt-1">もっているコイン</p>
          </div>
          <div className="bg-white/80 rounded-2xl p-3 text-center shadow border border-white">
            <p className="text-2xl font-bold text-green-600">{gameState.items.length} こ</p>
            <p className="text-xs text-gray-500 mt-1">あつめたアイテム</p>
          </div>
        </div>

        {gameState.items.length > 0 && (
          <div className="w-full bg-white/80 rounded-2xl p-4 shadow border border-white">
            <p className="text-sm font-bold text-gray-600 mb-2">📦 もっているもの</p>
            <div className="flex flex-wrap gap-2">
              {gameState.items.map((item, i) => (
                <div key={i} className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-center">
                  <div className="text-2xl">{ITEM_EMOJI[item] ?? '📦'}</div>
                  <p className="text-xs text-gray-500">{item}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {gameState.problemsSolved > 0 && (
          <div className="w-full bg-green-50 rounded-2xl p-3 border border-green-200 text-center">
            <p className="text-green-700 font-bold">
              ⭐ これまで {gameState.problemsSolved} こおねがいをきいたよ！
            </p>
          </div>
        )}

        <button
          onClick={onStart}
          className="w-full bg-green-400 hover:bg-green-500 text-white font-bold text-2xl py-6 rounded-3xl shadow-xl transition-all active:scale-95 border-b-4 border-green-600"
        >
          おねがいをきく 🏃
        </button>
      </div>
    </div>
  )
}
