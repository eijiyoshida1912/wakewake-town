export const MAX_NICKNAME_LENGTH = 20
export const MAX_PROBLEMS_SOLVED = 1_000_000
export const MIN_DEVICE_ID_LENGTH = 8
export const MAX_DEVICE_ID_LENGTH = 64

// crypto.randomUUID() などで作られる想定（英数字とハイフンのみ）
const DEVICE_ID_PATTERN = /^[a-zA-Z0-9-]+$/
// 改行・タブなどの制御文字は禁止する（絵文字やひらがな・漢字はそのまま許可）
const CONTROL_CHAR_PATTERN = /[\u0000-\u001f\u007f]/

export type ValidationError = 'invalid_device_id' | 'invalid_nickname' | 'invalid_problems_solved'

export interface ScoreSubmission {
  deviceId: string
  nickname: string
  problemsSolved: number
}

export type ValidationResult = { ok: true; value: ScoreSubmission } | { ok: false; error: ValidationError }

/**
 * スコア登録リクエストの中身を確かめる。
 * 問題なければ、ニックネームの前後の空白を取った値を返す。
 * 不正なら、どこが悪いか（デバイスID・ニックネーム・解いた数のどれか）を返す。
 */
export function validateScoreSubmission(body: unknown): ValidationResult {
  if (typeof body !== 'object' || body === null) {
    return { ok: false, error: 'invalid_nickname' }
  }
  const { deviceId, nickname, problemsSolved } = body as Record<string, unknown>

  if (
    typeof deviceId !== 'string' ||
    deviceId.length < MIN_DEVICE_ID_LENGTH ||
    deviceId.length > MAX_DEVICE_ID_LENGTH ||
    !DEVICE_ID_PATTERN.test(deviceId)
  ) {
    return { ok: false, error: 'invalid_device_id' }
  }

  if (typeof nickname !== 'string') {
    return { ok: false, error: 'invalid_nickname' }
  }
  const trimmedNickname = nickname.trim()
  if (
    trimmedNickname.length === 0 ||
    trimmedNickname.length > MAX_NICKNAME_LENGTH ||
    CONTROL_CHAR_PATTERN.test(trimmedNickname)
  ) {
    return { ok: false, error: 'invalid_nickname' }
  }

  if (
    typeof problemsSolved !== 'number' ||
    !Number.isInteger(problemsSolved) ||
    problemsSolved < 0 ||
    problemsSolved > MAX_PROBLEMS_SOLVED
  ) {
    return { ok: false, error: 'invalid_problems_solved' }
  }

  return { ok: true, value: { deviceId, nickname: trimmedNickname, problemsSolved } }
}

/**
 * ランキングの件数指定（?limit=）を、安全な範囲に収める。
 * 指定がない・数として読めない・0以下のときは既定値、大きすぎるときは上限で切る。
 */
export function clampRankingLimit(rawLimit: string | null, defaultLimit = 20, maxLimit = 100): number {
  if (rawLimit === null) return defaultLimit
  const parsed = Number(rawLimit)
  if (!Number.isInteger(parsed) || parsed <= 0) return defaultLimit
  return Math.min(parsed, maxLimit)
}
