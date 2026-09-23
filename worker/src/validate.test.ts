import { describe, it, expect } from 'vitest'
import { validateScoreSubmission, clampRankingLimit, MAX_NICKNAME_LENGTH, MAX_PROBLEMS_SOLVED } from './validate'

const VALID_DEVICE_ID = 'a'.repeat(36) // UUID相当の長さ
const validBody = (overrides: Record<string, unknown> = {}) => ({
  deviceId: VALID_DEVICE_ID,
  nickname: 'たろう',
  problemsSolved: 10,
  ...overrides,
})

describe('validateScoreSubmission: 正常な入力', () => {
  it('デバイスID・ニックネーム・解いた数がそろっていれば通る', () => {
    const result = validateScoreSubmission(validBody())
    expect(result).toEqual({ ok: true, value: { deviceId: VALID_DEVICE_ID, nickname: 'たろう', problemsSolved: 10 } })
  })

  it('ニックネームの前後の空白は取り除かれる', () => {
    const result = validateScoreSubmission(validBody({ nickname: '  はなこ  ' }))
    expect(result).toEqual({ ok: true, value: { deviceId: VALID_DEVICE_ID, nickname: 'はなこ', problemsSolved: 10 } })
  })

  it('解いた数が0でも通る（まだ1問も解いていない端末の初回登録）', () => {
    const result = validateScoreSubmission(validBody({ problemsSolved: 0 }))
    expect(result.ok).toBe(true)
  })

  it(`ニックネームがちょうど${MAX_NICKNAME_LENGTH}文字なら通る（境界値）`, () => {
    const result = validateScoreSubmission(validBody({ nickname: 'あ'.repeat(MAX_NICKNAME_LENGTH) }))
    expect(result.ok).toBe(true)
  })

  it(`解いた数がちょうど上限（${MAX_PROBLEMS_SOLVED}）なら通る（境界値）`, () => {
    const result = validateScoreSubmission(validBody({ problemsSolved: MAX_PROBLEMS_SOLVED }))
    expect(result.ok).toBe(true)
  })
})

describe('validateScoreSubmission: デバイスIDが不正', () => {
  it('文字列でない', () => {
    expect(validateScoreSubmission(validBody({ deviceId: 12345 }))).toEqual({ ok: false, error: 'invalid_device_id' })
  })

  it('短すぎる（7文字）', () => {
    expect(validateScoreSubmission(validBody({ deviceId: 'a'.repeat(7) }))).toEqual({
      ok: false,
      error: 'invalid_device_id',
    })
  })

  it('長すぎる（65文字）', () => {
    expect(validateScoreSubmission(validBody({ deviceId: 'a'.repeat(65) }))).toEqual({
      ok: false,
      error: 'invalid_device_id',
    })
  })

  it('英数字とハイフン以外の文字を含む', () => {
    expect(validateScoreSubmission(validBody({ deviceId: 'a'.repeat(35) + '!' }))).toEqual({
      ok: false,
      error: 'invalid_device_id',
    })
  })

  it('欠けている', () => {
    const body = validBody()
    delete (body as Record<string, unknown>).deviceId
    expect(validateScoreSubmission(body)).toEqual({ ok: false, error: 'invalid_device_id' })
  })
})

describe('validateScoreSubmission: ニックネームが不正', () => {
  it('文字列でない', () => {
    expect(validateScoreSubmission(validBody({ nickname: 123 }))).toEqual({ ok: false, error: 'invalid_nickname' })
  })

  it('空文字', () => {
    expect(validateScoreSubmission(validBody({ nickname: '' }))).toEqual({ ok: false, error: 'invalid_nickname' })
  })

  it('空白だけ（前後の空白を取ると空文字になる）', () => {
    expect(validateScoreSubmission(validBody({ nickname: '   ' }))).toEqual({ ok: false, error: 'invalid_nickname' })
  })

  it(`上限より1文字長い（${MAX_NICKNAME_LENGTH + 1}文字）`, () => {
    expect(validateScoreSubmission(validBody({ nickname: 'あ'.repeat(MAX_NICKNAME_LENGTH + 1) }))).toEqual({
      ok: false,
      error: 'invalid_nickname',
    })
  })

  it('前後の空白ではなく、名前の途中に制御文字（改行）を含む', () => {
    expect(validateScoreSubmission(validBody({ nickname: 'た\nろう' }))).toEqual({
      ok: false,
      error: 'invalid_nickname',
    })
  })
})

describe('validateScoreSubmission: 解いた数が不正', () => {
  it('数値でない', () => {
    expect(validateScoreSubmission(validBody({ problemsSolved: '10' }))).toEqual({
      ok: false,
      error: 'invalid_problems_solved',
    })
  })

  it('整数でない', () => {
    expect(validateScoreSubmission(validBody({ problemsSolved: 1.5 }))).toEqual({
      ok: false,
      error: 'invalid_problems_solved',
    })
  })

  it('負の数', () => {
    expect(validateScoreSubmission(validBody({ problemsSolved: -1 }))).toEqual({
      ok: false,
      error: 'invalid_problems_solved',
    })
  })

  it(`上限より1大きい（${MAX_PROBLEMS_SOLVED + 1}）`, () => {
    expect(validateScoreSubmission(validBody({ problemsSolved: MAX_PROBLEMS_SOLVED + 1 }))).toEqual({
      ok: false,
      error: 'invalid_problems_solved',
    })
  })
})

describe('validateScoreSubmission: 本体そのものが不正', () => {
  it('nullは弾く', () => {
    expect(validateScoreSubmission(null)).toEqual({ ok: false, error: 'invalid_nickname' })
  })

  it('オブジェクトでない（文字列）は弾く', () => {
    expect(validateScoreSubmission('not an object')).toEqual({ ok: false, error: 'invalid_nickname' })
  })

  it('配列は弾く（typeofはobjectだが中身がない）', () => {
    expect(validateScoreSubmission([])).toEqual({ ok: false, error: 'invalid_device_id' })
  })
})

describe('clampRankingLimit', () => {
  it('指定がなければ既定値の20', () => {
    expect(clampRankingLimit(null)).toBe(20)
  })

  it('数字の文字列はその数になる', () => {
    expect(clampRankingLimit('10')).toBe(10)
  })

  it('数として読めない文字列は既定値になる', () => {
    expect(clampRankingLimit('たくさん')).toBe(20)
  })

  it('0は既定値になる（0件を指定する用途はないため）', () => {
    expect(clampRankingLimit('0')).toBe(20)
  })

  it('負の数は既定値になる', () => {
    expect(clampRankingLimit('-5')).toBe(20)
  })

  it('上限（100）ちょうどはそのまま', () => {
    expect(clampRankingLimit('100')).toBe(100)
  })

  it('上限を超えると100に切り詰められる', () => {
    expect(clampRankingLimit('1000')).toBe(100)
  })

  it('小数は既定値になる（整数でないため）', () => {
    expect(clampRankingLimit('1.5')).toBe(20)
  })
})
