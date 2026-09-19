import { describe, it, expect } from 'vitest'
import { getShareState } from './share'
import { PROBLEMS } from './problems'

describe('getShareState: 進み具合ごとの「1人分」と「のこり」', () => {
  it('はじめ（0）は、だれにも配っていなくて、のこりが全部（96 ÷ 3）', () => {
    expect(getShareState(96, 3, 0)).toEqual({ each: 0, left: 96 })
  })

  it('半分（0.5）は、1人分が商の半分で、のこりはその分だけ減っている（96 ÷ 3 → 16ずつ、のこり 48）', () => {
    expect(getShareState(96, 3, 0.5)).toEqual({ each: 16, left: 48 })
  })

  it('おわり（1）は、1人分が商で、のこりがあまり', () => {
    expect(getShareState(96, 3, 1)).toEqual({ each: 32, left: 0 })
    expect(getShareState(75, 4, 1)).toEqual({ each: 18, left: 3 })
    expect(getShareState(749, 3, 1)).toEqual({ each: 249, left: 2 })
    expect(getShareState(259, 4, 1)).toEqual({ each: 64, left: 3 })
  })

  it('商が小さい割り算（10 ÷ 9 = 1 あまり 1）は、半分の時点ではまだ 0 個ずつで、おわりで 1 個ずつになる', () => {
    expect(getShareState(10, 9, 1)).toEqual({ each: 1, left: 1 })
    expect(getShareState(10, 9, 0.5)).toEqual({ each: 0, left: 10 })
  })

  it('どの進み具合でも「1人分 × 人数 + のこり = 全部」が成り立つ（全問題）', () => {
    for (const p of PROBLEMS) {
      for (let step = 0; step <= 20; step++) {
        const { each, left } = getShareState(p.dividend, p.divisor, step / 20)
        expect(each * p.divisor + left, `${p.dividend} ÷ ${p.divisor} の ${step}/20`).toBe(p.dividend)
      }
    }
  })

  it('進むほど、1人分は増え（減らない）、のこりは減る（増えない）', () => {
    for (const p of PROBLEMS) {
      let previous = getShareState(p.dividend, p.divisor, 0)
      for (let step = 1; step <= 50; step++) {
        const current = getShareState(p.dividend, p.divisor, step / 50)
        expect(current.each).toBeGreaterThanOrEqual(previous.each)
        expect(current.left).toBeLessThanOrEqual(previous.left)
        previous = current
      }
    }
  })

  it('1人分は商を超えず、のこりはあまりを下回らない', () => {
    for (const p of PROBLEMS) {
      for (let step = 0; step <= 20; step++) {
        const { each, left } = getShareState(p.dividend, p.divisor, step / 20)
        expect(each).toBeLessThanOrEqual(p.quotient)
        expect(left).toBeGreaterThanOrEqual(p.remainder)
      }
    }
  })

  it('0 より小さい進み具合は 0、1 より大きい進み具合は 1 として扱う', () => {
    expect(getShareState(96, 3, -0.5)).toEqual(getShareState(96, 3, 0))
    expect(getShareState(96, 3, 1.5)).toEqual(getShareState(96, 3, 1))
  })

  it('進み具合が数でない（NaN）ときは RangeError', () => {
    expect(() => getShareState(96, 3, NaN)).toThrow(RangeError)
  })

  it('割る数が 0 以下・小数のときは RangeError', () => {
    expect(() => getShareState(96, 0, 0.5)).toThrow(RangeError)
    expect(() => getShareState(96, -3, 0.5)).toThrow(RangeError)
    expect(() => getShareState(96, 2.5, 0.5)).toThrow(RangeError)
  })

  it('割られる数が負・小数のときは RangeError', () => {
    expect(() => getShareState(-96, 3, 0.5)).toThrow(RangeError)
    expect(() => getShareState(96.5, 3, 0.5)).toThrow(RangeError)
  })
})
