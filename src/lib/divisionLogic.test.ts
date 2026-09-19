import { describe, it, expect } from 'vitest'
import { generateSteps, getBoardSnapshot } from './divisionLogic'
import { Problem } from './types'
import { makeProblem } from '@/test/fixtures'

// 期待値はすべて手計算で求めた値を直接書いている（実装の計算式は使わない）
function summarize(problem: Problem) {
  return generateSteps(problem).map(s => [s.type, s.question, s.answer, s.digitCol])
}

describe('generateSteps: 2桁 ÷ 1桁（あまりなし）', () => {
  it('96 ÷ 3 = 32 の8ステップ', () => {
    expect(summarize(makeProblem(96, 3, 32, 0))).toEqual([
      ['tateru', '9 の中に 3 はいくつ入るかな？', 3, 0],
      ['kakeru', '3 × 3 は？', 9, 0],
      ['hiku', '9 − 9 は？', 0, 0],
      ['orosu', '6 をおろそう！', 6, 1],
      ['tateru', '6 の中に 3 はいくつ入るかな？', 2, 1],
      ['kakeru', '2 × 3 は？', 6, 1],
      ['hiku', '6 − 6 は？', 0, 1],
      ['complete', 'かんせい！', 32, 1],
    ])
  })

  it('72 ÷ 6 = 12: くり下がりのある途中の数（7−6=1 に 2 をおろして 12）', () => {
    expect(summarize(makeProblem(72, 6, 12, 0))).toEqual([
      ['tateru', '7 の中に 6 はいくつ入るかな？', 1, 0],
      ['kakeru', '1 × 6 は？', 6, 0],
      ['hiku', '7 − 6 は？', 1, 0],
      ['orosu', '2 をおろそう！', 2, 1],
      ['tateru', '12 の中に 6 はいくつ入るかな？', 2, 1],
      ['kakeru', '2 × 6 は？', 12, 1],
      ['hiku', '12 − 12 は？', 0, 1],
      ['complete', 'かんせい！', 12, 1],
    ])
  })
})

describe('generateSteps: 2桁 ÷ 1桁（あまりあり）', () => {
  it('75 ÷ 4 = 18 あまり 3: 最後のひき算の答えがあまりになる', () => {
    expect(summarize(makeProblem(75, 4, 18, 3))).toEqual([
      ['tateru', '7 の中に 4 はいくつ入るかな？', 1, 0],
      ['kakeru', '1 × 4 は？', 4, 0],
      ['hiku', '7 − 4 は？', 3, 0],
      ['orosu', '5 をおろそう！', 5, 1],
      ['tateru', '35 の中に 4 はいくつ入るかな？', 8, 1],
      ['kakeru', '8 × 4 は？', 32, 1],
      ['hiku', '35 − 32 は？', 3, 1],
      ['complete', 'かんせい！', 18, 1],
    ])
  })
})

describe('generateSteps: 3桁 ÷ 1桁', () => {
  it('749 ÷ 3 = 249 あまり 2: 各位で 立てる→かける→ひく（→おろす）を3周する', () => {
    const steps = summarize(makeProblem(749, 3, 249, 2))
    expect(steps).toEqual([
      ['tateru', '7 の中に 3 はいくつ入るかな？', 2, 0],
      ['kakeru', '2 × 3 は？', 6, 0],
      ['hiku', '7 − 6 は？', 1, 0],
      ['orosu', '4 をおろそう！', 4, 1],
      ['tateru', '14 の中に 3 はいくつ入るかな？', 4, 1],
      ['kakeru', '4 × 3 は？', 12, 1],
      ['hiku', '14 − 12 は？', 2, 1],
      ['orosu', '9 をおろそう！', 9, 2],
      ['tateru', '29 の中に 3 はいくつ入るかな？', 9, 2],
      ['kakeru', '9 × 3 は？', 27, 2],
      ['hiku', '29 − 27 は？', 2, 2],
      ['complete', 'かんせい！', 249, 2],
    ])
  })

  it('259 ÷ 4 = 64 あまり 3: 百の位が割る数より小さいときは最初の2桁（25）で割る', () => {
    expect(summarize(makeProblem(259, 4, 64, 3))).toEqual([
      ['tateru', '25 の中に 4 はいくつ入るかな？', 6, 1],
      ['kakeru', '6 × 4 は？', 24, 1],
      ['hiku', '25 − 24 は？', 1, 1],
      ['orosu', '9 をおろそう！', 9, 2],
      ['tateru', '19 の中に 4 はいくつ入るかな？', 4, 2],
      ['kakeru', '4 × 4 は？', 16, 2],
      ['hiku', '19 − 16 は？', 3, 2],
      ['complete', 'かんせい！', 64, 2],
    ])
  })

  it('604 ÷ 3 = 201 あまり 1: 途中の位で商が 0 になる（0 を立てる）', () => {
    expect(summarize(makeProblem(604, 3, 201, 1))).toEqual([
      ['tateru', '6 の中に 3 はいくつ入るかな？', 2, 0],
      ['kakeru', '2 × 3 は？', 6, 0],
      ['hiku', '6 − 6 は？', 0, 0],
      ['orosu', '0 をおろそう！', 0, 1],
      ['tateru', '0 の中に 3 はいくつ入るかな？', 0, 1],
      ['kakeru', '0 × 3 は？', 0, 1],
      ['hiku', '0 − 0 は？', 0, 1],
      ['orosu', '4 をおろそう！', 4, 2],
      ['tateru', '4 の中に 3 はいくつ入るかな？', 1, 2],
      ['kakeru', '1 × 3 は？', 3, 2],
      ['hiku', '4 − 3 は？', 1, 2],
      ['complete', 'かんせい！', 201, 2],
    ])
  })
})

describe('generateSteps: 境界値', () => {
  it('48 ÷ 6 = 8: 十の位が割る数より小さい2桁は、最初から2桁（48）で割って3ステップ＋完成', () => {
    expect(summarize(makeProblem(48, 6, 8, 0))).toEqual([
      ['tateru', '48 の中に 6 はいくつ入るかな？', 8, 1],
      ['kakeru', '8 × 6 は？', 48, 1],
      ['hiku', '48 − 48 は？', 0, 1],
      ['complete', 'かんせい！', 8, 1],
    ])
  })

  it('割る数が 9 の最大値でも計算できる（100 ÷ 9 = 11 あまり 1、最初の2桁 10 で割る）', () => {
    expect(summarize(makeProblem(100, 9, 11, 1))).toEqual([
      ['tateru', '10 の中に 9 はいくつ入るかな？', 1, 1],
      ['kakeru', '1 × 9 は？', 9, 1],
      ['hiku', '10 − 9 は？', 1, 1],
      ['orosu', '0 をおろそう！', 0, 2],
      ['tateru', '10 の中に 9 はいくつ入るかな？', 1, 2],
      ['kakeru', '1 × 9 は？', 9, 2],
      ['hiku', '10 − 9 は？', 1, 2],
      ['complete', 'かんせい！', 11, 2],
    ])
  })
})

describe('generateSteps: 異常系', () => {
  it('割る数が 0 のときは RangeError', () => {
    expect(() => generateSteps(makeProblem(96, 0, 0, 0))).toThrow(RangeError)
  })

  it('割る数が 10 以上（2桁）のときは RangeError', () => {
    expect(() => generateSteps(makeProblem(96, 12, 8, 0))).toThrow(RangeError)
  })

  it('割る数が小数のときは RangeError', () => {
    expect(() => generateSteps(makeProblem(96, 2.5, 38, 0))).toThrow(RangeError)
  })

  it('被除数が1桁のときは RangeError', () => {
    expect(() => generateSteps(makeProblem(7, 3, 2, 1))).toThrow(RangeError)
  })

  it('被除数が4桁のときは RangeError', () => {
    expect(() => generateSteps(makeProblem(1000, 3, 333, 1))).toThrow(RangeError)
  })

  it('被除数が小数のときは RangeError', () => {
    expect(() => generateSteps(makeProblem(96.5, 3, 32, 0))).toThrow(RangeError)
  })
})

describe('getBoardSnapshot: 72 ÷ 6（2桁）', () => {
  const problem = makeProblem(72, 6, 12, 0)
  const steps = generateSteps(problem)
  const dividendRow = { label: 'dividend', digits: [7, 2], showLine: false }

  it('ステップ0: 被除数だけが表示される', () => {
    expect(getBoardSnapshot(problem, 0, steps)).toEqual({
      quotientDigits: [null, null],
      rows: [dividendRow],
      activeCol: 0,
    })
  })

  it('ステップ1: 十の位の商 1 が立つ', () => {
    expect(getBoardSnapshot(problem, 1, steps)).toEqual({
      quotientDigits: [1, null],
      rows: [dividendRow],
      activeCol: 0,
    })
  })

  it('ステップ2: かけ算の答え 6 が十の位に出る（線つき）', () => {
    expect(getBoardSnapshot(problem, 2, steps)).toEqual({
      quotientDigits: [1, null],
      rows: [dividendRow, { label: 'product', digits: [6, null], showLine: true }],
      activeCol: 0,
    })
  })

  it('ステップ3（おろす前）: ひき算の答え 1 が出る。注目する列は一の位', () => {
    expect(getBoardSnapshot(problem, 3, steps)).toEqual({
      quotientDigits: [1, null],
      rows: [
        dividendRow,
        { label: 'product', digits: [6, null], showLine: true },
        { label: 'remainder', digits: [1, null], showLine: false },
      ],
      activeCol: 1,
    })
  })

  it('ステップ4（おろした後）: 1 の隣に 2 が出て 12 になる', () => {
    expect(getBoardSnapshot(problem, 4, steps).rows[2]).toEqual({
      label: 'remainder',
      digits: [1, 2],
      showLine: false,
    })
  })

  it('ステップ6: 2桁のかけ算の答え 12 は、2つの列に1桁ずつ入る', () => {
    expect(getBoardSnapshot(problem, 6, steps)).toEqual({
      quotientDigits: [1, 2],
      rows: [
        dividendRow,
        { label: 'product', digits: [6, null], showLine: true },
        { label: 'remainder', digits: [1, 2], showLine: false },
        { label: 'product', digits: [1, 2], showLine: true },
      ],
      activeCol: 1,
    })
  })

  it('完成（ステップ7）: 最後のひき算の答え 0 が一の位に出る', () => {
    expect(getBoardSnapshot(problem, 7, steps)).toEqual({
      quotientDigits: [1, 2],
      rows: [
        dividendRow,
        { label: 'product', digits: [6, null], showLine: true },
        { label: 'remainder', digits: [1, 2], showLine: false },
        { label: 'product', digits: [1, 2], showLine: true },
        { label: 'remainder', digits: [null, 0], showLine: false },
      ],
      activeCol: 1,
    })
  })
})

describe('getBoardSnapshot: 75 ÷ 4（あまりあり）', () => {
  it('完成: 2桁のかけ算の答え 32 が2列に入り、あまり 3 が一の位に出る', () => {
    const problem = makeProblem(75, 4, 18, 3)
    const steps = generateSteps(problem)
    expect(getBoardSnapshot(problem, 7, steps)).toEqual({
      quotientDigits: [1, 8],
      rows: [
        { label: 'dividend', digits: [7, 5], showLine: false },
        { label: 'product', digits: [4, null], showLine: true },
        { label: 'remainder', digits: [3, 5], showLine: false },
        { label: 'product', digits: [3, 2], showLine: true },
        { label: 'remainder', digits: [null, 3], showLine: false },
      ],
      activeCol: 1,
    })
  })
})

describe('getBoardSnapshot: 749 ÷ 3（3桁）', () => {
  const problem = makeProblem(749, 3, 249, 2)
  const steps = generateSteps(problem)

  it('ステップ0: 3桁の被除数が表示される', () => {
    expect(getBoardSnapshot(problem, 0, steps)).toEqual({
      quotientDigits: [null, null, null],
      rows: [{ label: 'dividend', digits: [7, 4, 9], showLine: false }],
      activeCol: 0,
    })
  })

  it('ステップ8（2回目のおろした後）: 商は 2 桁目まで、注目列は一の位', () => {
    const snapshot = getBoardSnapshot(problem, 8, steps)
    expect(snapshot.quotientDigits).toEqual([2, 4, null])
    expect(snapshot.activeCol).toBe(2)
    expect(snapshot.rows[4]).toEqual({ label: 'remainder', digits: [null, 2, 9], showLine: false })
  })

  it('完成（ステップ11）: 3周分の筆算がそろう', () => {
    expect(getBoardSnapshot(problem, 11, steps)).toEqual({
      quotientDigits: [2, 4, 9],
      rows: [
        { label: 'dividend', digits: [7, 4, 9], showLine: false },
        { label: 'product', digits: [6, null, null], showLine: true },
        { label: 'remainder', digits: [1, 4, null], showLine: false },
        { label: 'product', digits: [1, 2, null], showLine: true },
        { label: 'remainder', digits: [null, 2, 9], showLine: false },
        { label: 'product', digits: [null, 2, 7], showLine: true },
        { label: 'remainder', digits: [null, null, 2], showLine: false },
      ],
      activeCol: 2,
    })
  })
})

describe('getBoardSnapshot: 259 ÷ 4（商が2桁の3桁割り算）', () => {
  const problem = makeProblem(259, 4, 64, 3)
  const steps = generateSteps(problem)

  it('ステップ1: 商は百の位ではなく十の位に立つ', () => {
    expect(getBoardSnapshot(problem, 1, steps).quotientDigits).toEqual([null, 6, null])
  })

  it('ステップ3（おろす前）: かけ算の答え 24 は百・十の位にまたがり、ひき算の答え 1 は十の位', () => {
    expect(getBoardSnapshot(problem, 3, steps).rows).toEqual([
      { label: 'dividend', digits: [2, 5, 9], showLine: false },
      { label: 'product', digits: [2, 4, null], showLine: true },
      { label: 'remainder', digits: [null, 1, null], showLine: false },
    ])
  })

  it('完成（ステップ7）: 商は [null, 6, 4]、あまり 3 は一の位', () => {
    expect(getBoardSnapshot(problem, 7, steps)).toEqual({
      quotientDigits: [null, 6, 4],
      rows: [
        { label: 'dividend', digits: [2, 5, 9], showLine: false },
        { label: 'product', digits: [2, 4, null], showLine: true },
        { label: 'remainder', digits: [null, 1, 9], showLine: false },
        { label: 'product', digits: [null, 1, 6], showLine: true },
        { label: 'remainder', digits: [null, null, 3], showLine: false },
      ],
      activeCol: 2,
    })
  })
})

describe('getBoardSnapshot: 途中で商が 0 になる 604 ÷ 3', () => {
  it('商 0 のラウンドでも、かけ算の答え 0 とひき算の答え 0 が 1 桁で入る', () => {
    const problem = makeProblem(604, 3, 201, 1)
    const steps = generateSteps(problem)
    expect(getBoardSnapshot(problem, 11, steps)).toEqual({
      quotientDigits: [2, 0, 1],
      rows: [
        { label: 'dividend', digits: [6, 0, 4], showLine: false },
        { label: 'product', digits: [6, null, null], showLine: true },
        { label: 'remainder', digits: [0, 0, null], showLine: false },
        { label: 'product', digits: [null, 0, null], showLine: true },
        { label: 'remainder', digits: [null, 0, 4], showLine: false },
        { label: 'product', digits: [null, null, 3], showLine: true },
        { label: 'remainder', digits: [null, null, 1], showLine: false },
      ],
      activeCol: 2,
    })
  })
})

describe('getBoardSnapshot: 異常系', () => {
  const problem = makeProblem(72, 6, 12, 0)
  const steps = generateSteps(problem)

  it('ステップ番号が負のときは RangeError', () => {
    expect(() => getBoardSnapshot(problem, -1, steps)).toThrow(RangeError)
  })

  it('ステップ番号が最後のステップを超えるときは RangeError', () => {
    expect(() => getBoardSnapshot(problem, steps.length, steps)).toThrow(RangeError)
  })

  it('ステップ番号が小数のときは RangeError', () => {
    expect(() => getBoardSnapshot(problem, 1.5, steps)).toThrow(RangeError)
  })
})
