'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  MAX_NICKNAME_LENGTH,
  RankingEntry,
  fetchRanking,
  getDeviceId,
  getNickname,
  isRankingConfigured,
  setNickname,
  submitScore,
} from '@/lib/ranking'

interface RankingScreenProps {
  /** いまの通算で解いた問題数。ランキングに登録する値 */
  problemsSolved: number
  onBack: () => void
}

type LoadState = 'not-configured' | 'loading' | 'loaded' | 'error'

export default function RankingScreen({ problemsSolved, onBack }: RankingScreenProps) {
  const [nicknameInput, setNicknameInput] = useState(() => getNickname())
  const [hasNickname, setHasNickname] = useState(() => getNickname().length > 0)
  const [ranking, setRanking] = useState<RankingEntry[]>([])
  const [loadState, setLoadState] = useState<LoadState>('loading')

  const load = useCallback(async () => {
    if (!isRankingConfigured()) {
      setLoadState('not-configured')
      return
    }
    setLoadState('loading')
    try {
      const result = await fetchRanking()
      setRanking(result ?? [])
      setLoadState('loaded')
    } catch {
      setLoadState('error')
    }
  }, [])

  useEffect(() => {
    // すでにニックネームを決めている端末は、この画面を開くたびに最新の解いた数を送っておく
    if (getNickname().length > 0) {
      void submitScore(problemsSolved).then(() => load())
    } else {
      void load()
    }
    // 画面を開いたときの1回だけでよい（problemsSolvedの変化のたびに送り直す必要はない）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSaveNickname = useCallback(async () => {
    const trimmed = nicknameInput.trim()
    if (trimmed.length === 0 || trimmed.length > MAX_NICKNAME_LENGTH) return
    setNickname(trimmed)
    setNicknameInput(trimmed)
    setHasNickname(true)
    await submitScore(problemsSolved)
    await load()
  }, [nicknameInput, problemsSolved, load])

  const myDeviceId = hasNickname ? getDeviceId() : null

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-indigo-100 flex flex-col">
      <div className="bg-white/80 backdrop-blur px-4 py-3 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-bold text-indigo-700">🏆 ランキング</h1>
        <span className="bg-indigo-100 border border-indigo-300 rounded-full px-3 py-1 text-sm font-bold text-indigo-700">
          ⭐ {problemsSolved}
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center px-4 pt-6 pb-6 gap-4 max-w-lg mx-auto w-full">
        {loadState === 'not-configured' && (
          <p className="w-full rounded-2xl border-2 border-yellow-300 bg-white p-6 text-center font-bold text-yellow-600">
            ランキングはまだ準備中だよ
          </p>
        )}

        {loadState !== 'not-configured' && (
          <div className="w-full bg-white/80 rounded-2xl p-4 shadow border border-white space-y-2">
            <label htmlFor="ranking-nickname" className="block text-sm font-bold text-gray-600">
              きみの名前
            </label>
            <div className="flex gap-2">
              <input
                id="ranking-nickname"
                type="text"
                value={nicknameInput}
                onChange={event => setNicknameInput(event.target.value)}
                maxLength={MAX_NICKNAME_LENGTH}
                placeholder="なまえをいれてね"
                className="flex-1 rounded-xl border-2 border-gray-200 px-3 py-2 text-lg"
              />
              <button
                type="button"
                onClick={() => void handleSaveNickname()}
                disabled={nicknameInput.trim().length === 0}
                className="rounded-xl bg-indigo-400 px-4 py-2 text-lg font-bold text-white shadow transition-all hover:bg-indigo-500 active:scale-95 disabled:bg-gray-200 disabled:text-gray-400"
              >
                {hasNickname ? 'かえる' : 'とうろく'}
              </button>
            </div>
          </div>
        )}

        {loadState === 'loading' && <p className="text-center font-bold text-indigo-600">よみこみちゅう…</p>}

        {loadState === 'error' && (
          <p className="w-full rounded-2xl border-2 border-red-300 bg-white p-4 text-center font-bold text-red-500">
            つながらなかったよ。もう一度ためしてね
          </p>
        )}

        {loadState === 'loaded' &&
          (ranking.length === 0 ? (
            <p className="w-full rounded-2xl border-2 border-yellow-300 bg-white p-6 text-center font-bold text-yellow-600">
              まだだれも登録していないよ
            </p>
          ) : (
            <ol className="flex w-full flex-col gap-2">
              {ranking.map(entry => (
                <li
                  key={entry.deviceId}
                  className={`flex items-center gap-3 rounded-2xl border p-3 shadow ${
                    entry.deviceId === myDeviceId
                      ? 'border-indigo-400 bg-indigo-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <span className="w-10 text-center text-lg font-bold text-indigo-600">{entry.rank}</span>
                  <span className="flex-1 font-bold text-gray-700">
                    {entry.nickname}
                    {entry.deviceId === myDeviceId && <span className="ml-1 text-sm text-indigo-500">(きみ)</span>}
                  </span>
                  <span className="font-bold text-amber-600">⭐ {entry.problemsSolved}</span>
                </li>
              ))}
            </ol>
          ))}

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
