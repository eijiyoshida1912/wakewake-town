import { describe, it, expect } from 'vitest'
import { getChallengeCells, getCellLabel, judgeCell, isChallengeSolved } from './challengeBoard'
import { makeProblem } from '@/test/fixtures'

/** 正解のマス（空欄が正解のマスは含めない）を { key: 数字 } にまとめる */
function expectedDigits(problem: ReturnType<typeof makeProblem>) {
  const result: Record<string, number> = {}
  for (const cell of getChallengeCells(problem)) {
    if (cell.expected !== null) result[cell.key] = cell.expected
  }
  return result
}

describe('getChallengeCells: 749 ÷ 3 = 249 あまり 2（商が3桁）', () => {
  const problem = makeProblem(749, 3, 249, 2)

  it('マスは 商3 + (かけ算3 + ひき算3) × 3周 = 21個で、key が重複しない', () => {
    const cells = getChallengeCells(problem)
    expect(cells).toHaveLength(21)
    expect(new Set(cells.map(c => c.key)).size).toBe(21)
  })

  it('正解のマスと数字が、手で書いた筆算と一致する', () => {
    expect(expectedDigits(problem)).toEqual({
      'q-0': 2,
      'q-1': 4,
      'q-2': 9,
      'p-0-0': 6,
      'r-0-0': 1,
      'r-0-1': 4,
      'p-1-0': 1,
      'p-1-1': 2,
      'r-1-1': 2,
      'r-1-2': 9,
      'p-2-1': 2,
      'p-2-2': 7,
      'r-2-2': 2,
    })
  })
})

describe('getChallengeCells: 259 ÷ 4 = 64 あまり 3（商が2桁）', () => {
  const problem = makeProblem(259, 4, 64, 3)

  it('商の百の位（q-0）は空欄が正解', () => {
    const cell = getChallengeCells(problem).find(c => c.key === 'q-0')
    expect(cell?.expected).toBeNull()
  })

  it('3周目のマスはすべて空欄が正解（2周で終わる問題）', () => {
    const thirdRound = getChallengeCells(problem).filter(c => c.round === 2)
    expect(thirdRound).toHaveLength(6)
    expect(thirdRound.every(c => c.expected === null)).toBe(true)
  })

  it('正解のマスと数字が、手で書いた筆算と一致する', () => {
    expect(expectedDigits(problem)).toEqual({
      'q-1': 6,
      'q-2': 4,
      'p-0-0': 2,
      'p-0-1': 4,
      'r-0-1': 1,
      'r-0-2': 9,
      'p-1-1': 1,
      'p-1-2': 6,
      'r-1-2': 3,
    })
  })
})

describe('getChallengeCells: 0 を書かなくてもよいマス（ひき算の答えが 0 で、次の数をおろす行）', () => {
  const optionalKeys = (problem: ReturnType<typeof makeProblem>) =>
    getChallengeCells(problem)
      .filter(c => c.optional)
      .map(c => c.key)

  it('857 ÷ 4: 8 − 8 = 0 の 0（r-0-0）だけが省略できる', () => {
    expect(optionalKeys(makeProblem(857, 4, 214, 1))).toEqual(['r-0-0'])
  })

  it('965 ÷ 2: 16 − 16 = 0 の 0（r-1-1）が省略できる', () => {
    expect(optionalKeys(makeProblem(965, 2, 482, 1))).toEqual(['r-1-1'])
  })

  it('487 ÷ 6: 48 − 48 = 0 の 0（r-0-1）が省略できる（2桁の割り算の後の 0）', () => {
    expect(optionalKeys(makeProblem(487, 6, 81, 1))).toEqual(['r-0-1'])
  })

  it('604 ÷ 3: 省略できるのは 6 − 6 = 0 と 0 − 0 = 0 の 0 だけ。商の 0・かけ算の 0・おろした 0 は必須', () => {
    const problem = makeProblem(604, 3, 201, 1)
    expect(optionalKeys(problem)).toEqual(['r-0-0', 'r-1-1'])
    const requiredZeros = getChallengeCells(problem)
      .filter(c => c.expected === 0 && !c.optional)
      .map(c => c.key)
    expect(requiredZeros).toEqual(['q-1', 'r-0-1', 'p-1-1'])
  })

  it('最後のひき算の答えが 0（割り切れる）のときは、0 を書くのが必須（96 ÷ 3 の r-1-1）', () => {
    const problem = makeProblem(96, 3, 32, 0)
    const last = getChallengeCells(problem).find(c => c.key === 'r-1-1')
    expect(last?.expected).toBe(0)
    expect(last?.optional).toBe(false)
  })

  it('答えが 0 以外のマスは、どれも省略できない（749 ÷ 3）', () => {
    expect(optionalKeys(makeProblem(749, 3, 249, 2))).toEqual([])
  })
})

describe('getCellLabel', () => {
  const cells = getChallengeCells(makeProblem(749, 3, 249, 2))
  const labelOf = (key: string) => getCellLabel(cells.find(c => c.key === key)!)

  it('商のマスは「しょう ○れつめ」', () => {
    expect(labelOf('q-0')).toBe('しょう 1れつめ')
  })

  it('かけ算・ひき算のマスは「何をするか + ○かいめ + ○れつめ」', () => {
    expect(labelOf('p-1-2')).toBe('かけ算 2かいめ 3れつめ')
    expect(labelOf('r-0-1')).toBe('ひき算 1かいめ 2れつめ')
  })

  it('すべてのマスで、ラベルが重複しない', () => {
    const labels = cells.map(getCellLabel)
    expect(new Set(labels).size).toBe(labels.length)
  })
})

describe('judgeCell', () => {
  const problem = makeProblem(749, 3, 249, 2)

  it('正しい数字なら true', () => {
    expect(judgeCell(problem, 'q-0', 2)).toBe(true)
    expect(judgeCell(problem, 'p-2-2', 7)).toBe(true)
  })

  it('まちがった数字なら false', () => {
    expect(judgeCell(problem, 'q-0', 3)).toBe(false)
    expect(judgeCell(problem, 'p-2-2', 2)).toBe(false)
  })

  it('空欄が正解のマスには、どの数字を入れても false（0 を入れても false）', () => {
    for (let digit = 0; digit <= 9; digit++) {
      expect(judgeCell(problem, 'p-0-1', digit)).toBe(false)
    }
  })

  it('正解が 0 のマスに 0 を入れたら true（0 を「空欄」と混同しない）', () => {
    const zeroProblem = makeProblem(604, 3, 201, 1)
    expect(judgeCell(zeroProblem, 'q-1', 0)).toBe(true)
    expect(judgeCell(zeroProblem, 'p-1-1', 0)).toBe(true)
    expect(judgeCell(zeroProblem, 'r-1-1', 0)).toBe(true)
    expect(judgeCell(zeroProblem, 'q-1', 1)).toBe(false)
  })

  it('存在しない key は RangeError', () => {
    expect(() => judgeCell(problem, 'q-9', 2)).toThrow(RangeError)
    expect(() => judgeCell(problem, 'x-0-0', 2)).toThrow(RangeError)
  })

  it('数字が 0〜9 の整数でないときは RangeError', () => {
    expect(() => judgeCell(problem, 'q-0', 10)).toThrow(RangeError)
    expect(() => judgeCell(problem, 'q-0', -1)).toThrow(RangeError)
    expect(() => judgeCell(problem, 'q-0', 1.5)).toThrow(RangeError)
  })
})

describe('isChallengeSolved', () => {
  const problem = makeProblem(259, 4, 64, 3)

  it('正解のマスがすべて埋まっていれば true', () => {
    expect(isChallengeSolved(problem, expectedDigits(problem))).toBe(true)
  })

  it('何も入力していなければ false', () => {
    expect(isChallengeSolved(problem, {})).toBe(false)
  })

  it('1マスでも足りなければ false（あまりのマスだけ未入力）', () => {
    const filled = expectedDigits(problem)
    delete filled['r-1-2']
    expect(isChallengeSolved(problem, filled)).toBe(false)
  })

  it('空欄が正解のマスに数字が入っていたら false', () => {
    const filled = { ...expectedDigits(problem), 'q-0': 2 }
    expect(isChallengeSolved(problem, filled)).toBe(false)
  })

  it('正解のマスに違う数字が入っていたら false', () => {
    const filled = { ...expectedDigits(problem), 'q-1': 5 }
    expect(isChallengeSolved(problem, filled)).toBe(false)
  })
})

describe('isChallengeSolved: 省略できる 0（857 ÷ 4 の 8 − 8 = 0）', () => {
  const problem = makeProblem(857, 4, 214, 1)

  it('その 0 を書かなくても、ほかがすべて正しければ完成', () => {
    const filled = expectedDigits(problem)
    expect(filled['r-0-0']).toBe(0)
    delete filled['r-0-0']
    expect(isChallengeSolved(problem, filled)).toBe(true)
  })

  it('その 0 を書いても完成', () => {
    expect(isChallengeSolved(problem, expectedDigits(problem))).toBe(true)
  })

  it('その 0 を省略しても、ほかのマスが1つ足りなければ未完成', () => {
    const filled = expectedDigits(problem)
    delete filled['r-0-0']
    delete filled['r-2-2']
    expect(isChallengeSolved(problem, filled)).toBe(false)
  })

  it('そのマスに 0 以外の数字が入っていたら未完成', () => {
    const filled = { ...expectedDigits(problem), 'r-0-0': 5 }
    expect(isChallengeSolved(problem, filled)).toBe(false)
  })

  it('省略できない 0（最後のあまりが 0 の 96 ÷ 3 の r-1-1）を書いていなければ未完成', () => {
    const divisible = makeProblem(96, 3, 32, 0)
    const filled = expectedDigits(divisible)
    delete filled['r-1-1']
    expect(isChallengeSolved(divisible, filled)).toBe(false)
  })

  it('省略できない 0（604 ÷ 3 の商の十の位 q-1）を書いていなければ未完成', () => {
    const zeroQuotient = makeProblem(604, 3, 201, 1)
    const filled = expectedDigits(zeroQuotient)
    delete filled['q-1']
    expect(isChallengeSolved(zeroQuotient, filled)).toBe(false)
  })
})
