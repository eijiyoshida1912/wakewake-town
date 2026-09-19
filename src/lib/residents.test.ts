import { describe, it, expect } from 'vitest'
import { PROBLEMS } from './problems'
import { RESIDENTS, FRIEND_EMOJIS } from './residents'

describe('住人', () => {
  it('ネコ・ウサギ・クマの3人で、絵文字と名前が決まっている', () => {
    expect(RESIDENTS.cat).toEqual({ emoji: '🐱', name: 'ネコさん' })
    expect(RESIDENTS.rabbit).toEqual({ emoji: '🐰', name: 'ウサギさん' })
    expect(RESIDENTS.bear).toEqual({ emoji: '🐻', name: 'クマさん' })
  })

  it('問題に出てくる住人は、すべて RESIDENTS にいる', () => {
    for (const problem of PROBLEMS) {
      expect(RESIDENTS[problem.residentId], `問題 ${problem.id} の住人`).toBeDefined()
    }
  })
})

describe('わけわけのなかま', () => {
  it('問題の割る数（最大 9）の人数ぶん、なかまの絵文字がある', () => {
    const maxDivisor = Math.max(...PROBLEMS.map(p => p.divisor))
    expect(FRIEND_EMOJIS.length).toBeGreaterThanOrEqual(maxDivisor)
  })

  it('なかまの絵文字は、重ならない', () => {
    expect(new Set(FRIEND_EMOJIS).size).toBe(FRIEND_EMOJIS.length)
  })

  it('先頭の3人は、ネコ・ウサギ・クマ（町の住人）', () => {
    expect(FRIEND_EMOJIS.slice(0, 3)).toEqual([RESIDENTS.cat.emoji, RESIDENTS.rabbit.emoji, RESIDENTS.bear.emoji])
  })
})
