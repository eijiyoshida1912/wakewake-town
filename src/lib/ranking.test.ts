import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getDeviceId,
  getNickname,
  setNickname,
  isRankingConfigured,
  submitScore,
  fetchRanking,
} from './ranking'

const API_URL = 'https://ranking.example.workers.dev'

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('isRankingConfigured', () => {
  it('環境変数が設定されていなければ false', () => {
    vi.stubEnv('NEXT_PUBLIC_RANKING_API_URL', '')
    expect(isRankingConfigured()).toBe(false)
  })

  it('環境変数が設定されていれば true', () => {
    vi.stubEnv('NEXT_PUBLIC_RANKING_API_URL', API_URL)
    expect(isRankingConfigured()).toBe(true)
  })
})

describe('getDeviceId: 端末ごとのID', () => {
  it('初回はIDを作って保存する', () => {
    const id = getDeviceId()
    expect(id.length).toBeGreaterThan(0)
    expect(localStorage.getItem('wakewake-town-device-id')).toBe(id)
  })

  it('2回目以降は同じIDを返す（保存したものを使い続ける）', () => {
    const first = getDeviceId()
    const second = getDeviceId()
    expect(second).toBe(first)
  })

  it('localStorageが使えなくても、例外を投げずにIDを返す', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(() => getDeviceId()).not.toThrow()
    expect(getDeviceId().length).toBeGreaterThan(0)
  })
})

describe('getNickname / setNickname', () => {
  it('未設定なら空文字を返す', () => {
    expect(getNickname()).toBe('')
  })

  it('設定した値を読み戻せる', () => {
    setNickname('たろう')
    expect(getNickname()).toBe('たろう')
  })

  it('前後の空白は取り除いて保存する', () => {
    setNickname('  はなこ  ')
    expect(getNickname()).toBe('はなこ')
  })
})

describe('submitScore', () => {
  it('バックエンドが未設定なら、通信せずに false を返す', async () => {
    vi.stubEnv('NEXT_PUBLIC_RANKING_API_URL', '')
    setNickname('たろう')
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    expect(await submitScore({ problemsSolved: 5, totalCoins: 80 })).toBe(false)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('ニックネーム未設定なら、通信せずに false を返す', async () => {
    vi.stubEnv('NEXT_PUBLIC_RANKING_API_URL', API_URL)
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    expect(await submitScore({ problemsSolved: 5, totalCoins: 80 })).toBe(false)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('設定がそろっていれば、/score にデバイスID・ニックネーム・解いた数・もらったコインの合計を送る', async () => {
    vi.stubEnv('NEXT_PUBLIC_RANKING_API_URL', API_URL)
    setNickname('たろう')
    const deviceId = getDeviceId()
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)

    expect(await submitScore({ problemsSolved: 7, totalCoins: 150 })).toBe(true)
    expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId, nickname: 'たろう', problemsSolved: 7, totalCoins: 150 }),
    })
  })

  it('サーバーがエラーを返したら false（例外は投げない）', async () => {
    vi.stubEnv('NEXT_PUBLIC_RANKING_API_URL', API_URL)
    setNickname('たろう')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))

    expect(await submitScore({ problemsSolved: 7, totalCoins: 150 })).toBe(false)
  })

  it('通信自体が失敗しても false（例外は投げない）', async () => {
    vi.stubEnv('NEXT_PUBLIC_RANKING_API_URL', API_URL)
    setNickname('たろう')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('network error')),
    )

    await expect(submitScore({ problemsSolved: 7, totalCoins: 150 })).resolves.toBe(false)
  })
})

describe('fetchRanking', () => {
  it('バックエンドが未設定なら null を返す（通信しない）', async () => {
    vi.stubEnv('NEXT_PUBLIC_RANKING_API_URL', '')
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    expect(await fetchRanking()).toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('ランキングの配列を返す', async () => {
    vi.stubEnv('NEXT_PUBLIC_RANKING_API_URL', API_URL)
    const ranking = [
      { rank: 1, deviceId: 'device-1', nickname: 'たろう', problemsSolved: 30, totalCoins: 600 },
      { rank: 2, deviceId: 'device-2', nickname: 'はなこ', problemsSolved: 20, totalCoins: 450 },
    ]
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ ranking }) }),
    )

    expect(await fetchRanking()).toEqual(ranking)
  })

  it('件数を指定すると、URLのクエリに反映される', async () => {
    vi.stubEnv('NEXT_PUBLIC_RANKING_API_URL', API_URL)
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ ranking: [] }) })
    vi.stubGlobal('fetch', fetchMock)

    await fetchRanking(5)
    expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/ranking?limit=5`)
  })

  it('応答が失敗したら例外を投げる', async () => {
    vi.stubEnv('NEXT_PUBLIC_RANKING_API_URL', API_URL)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }))

    await expect(fetchRanking()).rejects.toThrow()
  })
})
