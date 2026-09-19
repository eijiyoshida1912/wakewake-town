import { describe, it, expect } from 'vitest'
import { PROBLEMS } from './problems'
import { RESIDENTS } from './residents'

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
