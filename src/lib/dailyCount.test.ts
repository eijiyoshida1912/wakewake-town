import { describe, it, expect } from 'vitest'
import { toDateKey, nextDailyCount } from './dailyCount'

describe('toDateKey: 日付を「年-月-日」にする（その端末の時刻で数える）', () => {
  it('2026年9月20日 → 2026-09-20', () => {
    expect(toDateKey(new Date(2026, 8, 20, 10, 30))).toBe('2026-09-20')
  })

  it('月と日が1けたのときは、0を付けて2けたにする（2026年1月5日 → 2026-01-05）', () => {
    expect(toDateKey(new Date(2026, 0, 5, 12, 0))).toBe('2026-01-05')
  })

  it('夜の11時59分と、次の日の0時0分で、日付が変わる', () => {
    expect(toDateKey(new Date(2026, 8, 20, 23, 59, 59))).toBe('2026-09-20')
    expect(toDateKey(new Date(2026, 8, 21, 0, 0, 0))).toBe('2026-09-21')
  })

  it('月末・年末をまたぐ（9月30日 → 10月1日、12月31日 → 1月1日）', () => {
    expect(toDateKey(new Date(2026, 8, 30, 23, 59))).toBe('2026-09-30')
    expect(toDateKey(new Date(2026, 9, 1, 0, 0))).toBe('2026-10-01')
    expect(toDateKey(new Date(2026, 11, 31, 23, 59))).toBe('2026-12-31')
    expect(toDateKey(new Date(2027, 0, 1, 0, 0))).toBe('2027-01-01')
  })
})

describe('nextDailyCount: きょうのお手伝いを1つ増やしたときの数', () => {
  it('同じ日の続きなら、いまの数に1を足す（3 → 4）', () => {
    expect(nextDailyCount(3, '2026-09-20', '2026-09-20')).toBe(4)
  })

  it('日が変わっていたら、前の日の数は使わず、1から数え直す（前の日が 4 でも 1）', () => {
    expect(nextDailyCount(4, '2026-09-19', '2026-09-20')).toBe(1)
  })

  it('まだ一度も数えていない（日付が空）ときは、1になる', () => {
    expect(nextDailyCount(0, '', '2026-09-20')).toBe(1)
  })
})
