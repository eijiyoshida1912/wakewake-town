import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import RankingScreen from './RankingScreen'
import { getDeviceId, getNickname, setNickname } from '@/lib/ranking'

const API_URL = 'https://ranking.example.workers.dev'

function mockFetch(ranking: Array<{ rank: number; deviceId: string; nickname: string; problemsSolved: number; totalCoins: number }>) {
  return vi.fn(async (url: string) => {
    if (url.includes('/score')) return { ok: true }
    if (url.includes('/ranking')) return { ok: true, json: async () => ({ ranking }) }
    throw new Error(`unexpected url: ${url}`)
  })
}

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  cleanup()
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('RankingScreen: バックエンド未設定', () => {
  it('準備中の案内が出て、ニックネーム入力や通信は行わない', () => {
    vi.stubEnv('NEXT_PUBLIC_RANKING_API_URL', '')
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    render(<RankingScreen problemsSolved={3} totalCoins={45} onBack={() => {}} />)
    expect(screen.getByText('ランキングはまだ準備中だよ')).toBeDefined()
    expect(screen.queryByLabelText('きみの名前')).toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe('RankingScreen: ニックネーム未登録', () => {
  it('ランキングは読み込むが、スコアはまだ送らない（ニックネームがないため）', async () => {
    vi.stubEnv('NEXT_PUBLIC_RANKING_API_URL', API_URL)
    const fetchMock = mockFetch([{ rank: 1, deviceId: 'other-device', nickname: 'はなこ', problemsSolved: 20, totalCoins: 450 }])
    vi.stubGlobal('fetch', fetchMock)

    render(<RankingScreen problemsSolved={3} totalCoins={45} onBack={() => {}} />)
    expect(await screen.findByText('はなこ')).toBeDefined()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/ranking?limit=20`)
    expect(screen.getByRole('button', { name: 'とうろく' })).toBeDefined()
  })

  it('名前を入れて登録すると、スコアを送ってからランキングを取り直す', async () => {
    vi.stubEnv('NEXT_PUBLIC_RANKING_API_URL', API_URL)
    // 登録前のランキング取得は空。登録（/scoreへのPOST）のあとだけ、自分の行が返ってくる
    let registered = false
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (url.includes('/score')) {
        registered = true
        return { ok: true }
      }
      if (url.includes('/ranking')) {
        const ranking = registered
          ? [{ rank: 1, deviceId: getDeviceId(), nickname: 'たろう', problemsSolved: 8, totalCoins: 120 }]
          : []
        return { ok: true, json: async () => ({ ranking }) }
      }
      throw new Error(`unexpected url: ${url} ${JSON.stringify(init)}`)
    })
    vi.stubGlobal('fetch', fetchMock)

    render(<RankingScreen problemsSolved={8} totalCoins={120} onBack={() => {}} />)
    await screen.findByText('まだだれも登録していないよ')

    fireEvent.change(screen.getByLabelText('きみの名前'), { target: { value: 'たろう' } })
    fireEvent.click(screen.getByRole('button', { name: 'とうろく' }))

    expect(await screen.findByText('たろう')).toBeDefined()
    expect(getNickname()).toBe('たろう')
    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/score`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ deviceId: getDeviceId(), nickname: 'たろう', problemsSolved: 8, totalCoins: 120 }),
      }),
    )
    // 自分の行には「(きみ)」の印が付く
    expect(screen.getByText('(きみ)')).toBeDefined()
  })

  it('空文字のままでは登録できない（ボタンが無効）', () => {
    vi.stubEnv('NEXT_PUBLIC_RANKING_API_URL', API_URL)
    vi.stubGlobal('fetch', mockFetch([]))

    render(<RankingScreen problemsSolved={3} totalCoins={45} onBack={() => {}} />)
    expect(screen.getByRole('button', { name: 'とうろく' })).toHaveProperty('disabled', true)
  })
})

describe('RankingScreen: ニックネーム登録ずみ', () => {
  it('画面を開くと、まず今の解いた数ともらったコインの合計を送ってからランキングを表示する', async () => {
    setNickname('たろう')
    const myId = getDeviceId()
    vi.stubEnv('NEXT_PUBLIC_RANKING_API_URL', API_URL)
    const fetchMock = mockFetch([{ rank: 1, deviceId: myId, nickname: 'たろう', problemsSolved: 12, totalCoins: 200 }])
    vi.stubGlobal('fetch', fetchMock)

    render(<RankingScreen problemsSolved={12} totalCoins={200} onBack={() => {}} />)

    expect(await screen.findByText('たろう')).toBeDefined()
    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL}/score`,
      expect.objectContaining({
        body: JSON.stringify({ deviceId: myId, nickname: 'たろう', problemsSolved: 12, totalCoins: 200 }),
      }),
    )
    expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/ranking?limit=20`)
    expect(screen.getByText('(きみ)')).toBeDefined()
    expect(screen.getByRole('button', { name: 'かえる' })).toBeDefined()
  })
})

describe('RankingScreen: ポイントの表示', () => {
  it('ランキングの各行には、解いた数ではなく、もらったコインの合計が出る', async () => {
    vi.stubEnv('NEXT_PUBLIC_RANKING_API_URL', API_URL)
    vi.stubGlobal(
      'fetch',
      mockFetch([
        { rank: 1, deviceId: 'device-1', nickname: 'はなこ', problemsSolved: 15, totalCoins: 450 },
        { rank: 2, deviceId: 'device-2', nickname: 'じろう', problemsSolved: 30, totalCoins: 300 },
      ]),
    )

    render(<RankingScreen problemsSolved={3} totalCoins={45} onBack={() => {}} />)

    const rows = await screen.findAllByRole('listitem')
    expect(rows[0].textContent).toContain('はなこ')
    expect(rows[0].textContent).toContain('🪙 450')
    expect(rows[1].textContent).toContain('じろう')
    expect(rows[1].textContent).toContain('🪙 300')
    expect(rows[1].textContent).not.toContain('⭐')
  })

  it('画面の上には、自分のもらったコインの合計が出る', () => {
    vi.stubEnv('NEXT_PUBLIC_RANKING_API_URL', '')
    render(<RankingScreen problemsSolved={3} totalCoins={45} onBack={() => {}} />)
    expect(screen.getByText('🪙 45')).toBeDefined()
  })
})

describe('RankingScreen: 通信エラー', () => {
  it('取得に失敗したら、エラーの案内を出す', async () => {
    vi.stubEnv('NEXT_PUBLIC_RANKING_API_URL', API_URL)
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network error')))

    render(<RankingScreen problemsSolved={3} totalCoins={45} onBack={() => {}} />)
    expect(await screen.findByText('つながらなかったよ。もう一度ためしてね')).toBeDefined()
  })
})

describe('RankingScreen: もどる', () => {
  it('「もどる」ボタンで onBack が呼ばれる', async () => {
    vi.stubEnv('NEXT_PUBLIC_RANKING_API_URL', API_URL)
    vi.stubGlobal('fetch', mockFetch([]))
    const onBack = vi.fn()

    render(<RankingScreen problemsSolved={3} totalCoins={45} onBack={onBack} />)
    await screen.findByText('まだだれも登録していないよ')
    fireEvent.click(screen.getByRole('button', { name: '← もどる' }))
    expect(onBack).toHaveBeenCalledOnce()
  })
})
