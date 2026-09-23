const DEVICE_ID_KEY = 'wakewake-town-device-id'
const NICKNAME_KEY = 'wakewake-town-nickname'

export const MAX_NICKNAME_LENGTH = 20

export interface RankingEntry {
  rank: number
  deviceId: string
  nickname: string
  problemsSolved: number
}

/** ランキングAPIのURL。設定されていなければ null（バックエンドがまだ用意されていない状態） */
function getApiUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_RANKING_API_URL
  if (!url || url.length === 0) return null
  return url.replace(/\/+$/, '')
}

/** ランキングのバックエンドが設定されているか（.env.local に URL が書かれているか） */
export function isRankingConfigured(): boolean {
  return getApiUrl() !== null
}

function randomId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  // crypto.randomUUID が使えない環境向けの簡易フォールバック
  return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
}

/**
 * 端末ごとのID。初回に作って保存し、以後はずっと同じものを使う
 * （ランキングで「これは自分のスコア」と分かるようにするための、個人情報を含まない印）
 */
export function getDeviceId(): string {
  try {
    const saved = localStorage.getItem(DEVICE_ID_KEY)
    if (saved) return saved
    const id = randomId()
    localStorage.setItem(DEVICE_ID_KEY, id)
    return id
  } catch {
    return randomId()
  }
}

/** 保存されているニックネーム。まだ決めていなければ空文字 */
export function getNickname(): string {
  try {
    return localStorage.getItem(NICKNAME_KEY) ?? ''
  } catch {
    return ''
  }
}

/** ニックネームを保存する。前後の空白は取る */
export function setNickname(nickname: string): void {
  try {
    localStorage.setItem(NICKNAME_KEY, nickname.trim())
  } catch {
    // localStorage が使えない環境ではスキップ
  }
}

/**
 * いまの解いた数を、ランキングのバックエンドに登録する。
 * バックエンドが未設定・ニックネーム未設定・通信に失敗、のどれでも例外は投げない
 * （ランキング登録の失敗でゲームが止まってはいけないため）。成功したかを真偽値で返す。
 */
export async function submitScore(problemsSolved: number): Promise<boolean> {
  const apiUrl = getApiUrl()
  const nickname = getNickname()
  if (!apiUrl || nickname.length === 0) return false
  try {
    const response = await fetch(`${apiUrl}/score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId: getDeviceId(), nickname, problemsSolved }),
    })
    return response.ok
  } catch {
    return false
  }
}

/**
 * ランキングを取得する。
 * バックエンドが未設定のときは null（呼び出し側は「未設定」の表示にする）。
 * 通信・応答が失敗したときは例外を投げる（呼び出し側は「読み込みに失敗した」の表示にする）。
 */
export async function fetchRanking(limit = 20): Promise<RankingEntry[] | null> {
  const apiUrl = getApiUrl()
  if (!apiUrl) return null
  const response = await fetch(`${apiUrl}/ranking?limit=${limit}`)
  if (!response.ok) {
    throw new Error(`ランキングの取得に失敗しました（status: ${response.status}）`)
  }
  const data = (await response.json()) as { ranking: RankingEntry[] }
  return data.ranking
}
