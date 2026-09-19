import { describe, it, expect, vi, afterEach } from 'vitest'
import { DIFFICULTIES, DIFFICULTY_ORDER } from './difficulty'
import { PROBLEMS, createProblem, getProblemsByDifficulty, getRandomProblem } from './problems'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('createProblem', () => {
  it('商とあまりを割り算から計算する（75 ÷ 4 = 18 あまり 3）', () => {
    const problem = createProblem({
      id: 100,
      dividend: 75,
      divisor: 4,
      difficulty: 'normal',
      residentId: 'cat',
      message: 'テスト',
      item: 'クッキー',
    })
    expect(problem.quotient).toBe(18)
    expect(problem.remainder).toBe(3)
  })

  it('割り切れる場合はあまりが 0（96 ÷ 3 = 32）', () => {
    const problem = createProblem({
      id: 101,
      dividend: 96,
      divisor: 3,
      difficulty: 'easy',
      residentId: 'bear',
      message: 'テスト',
      item: 'ハチミツ',
    })
    expect(problem.quotient).toBe(32)
    expect(problem.remainder).toBe(0)
  })

  it('渡した id・被除数・除数・難易度・住人・依頼文・アイテムをそのまま保持する', () => {
    const problem = createProblem({
      id: 7,
      dividend: 259,
      divisor: 4,
      difficulty: 'challenge',
      residentId: 'rabbit',
      message: 'にんじんがあるよ',
      item: 'にんじん',
    })
    expect(problem).toMatchObject({
      id: 7,
      dividend: 259,
      divisor: 4,
      difficulty: 'challenge',
      residentId: 'rabbit',
      message: 'にんじんがあるよ',
      item: 'にんじん',
    })
  })

  it('除数が 0 のときは RangeError', () => {
    expect(() =>
      createProblem({
        id: 1,
        dividend: 10,
        divisor: 0,
        difficulty: 'easy',
        residentId: 'cat',
        message: '',
        item: '',
      }),
    ).toThrow(RangeError)
  })
})

describe('問題データ全体', () => {
  it('id が重複していない', () => {
    const ids = PROBLEMS.map(p => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('かんたんの問題は今までの10問と同じ（96÷3, 84÷4, 72÷6, 55÷5, 48÷4, 63÷3, 88÷4, 66÷3, 84÷6, 93÷3）', () => {
    const easy = getProblemsByDifficulty('easy').map(p => [p.id, p.dividend, p.divisor])
    expect(easy).toEqual([
      [1, 96, 3],
      [2, 84, 4],
      [3, 72, 6],
      [4, 55, 5],
      [5, 48, 4],
      [6, 63, 3],
      [7, 88, 4],
      [8, 66, 3],
      [9, 84, 6],
      [10, 93, 3],
    ])
  })
})

describe.each(DIFFICULTY_ORDER)('難易度 %s の問題', difficulty => {
  const config = DIFFICULTIES[difficulty]
  const list = getProblemsByDifficulty(difficulty)

  it('除外指定が働くよう、2問以上ある', () => {
    expect(list.length).toBeGreaterThanOrEqual(2)
  })

  it('全問の difficulty がこの難易度になっている', () => {
    expect(list.every(p => p.difficulty === difficulty)).toBe(true)
  })

  it(`被除数の桁数が設定（${config.digits}桁）と一致する`, () => {
    for (const p of list) {
      expect(String(p.dividend)).toHaveLength(config.digits)
    }
  })

  it('割る数は 2〜9 の1桁', () => {
    for (const p of list) {
      expect(p.divisor).toBeGreaterThanOrEqual(2)
      expect(p.divisor).toBeLessThanOrEqual(9)
    }
  })

  it('商とあまりが実際の割り算の結果と一致する', () => {
    for (const p of list) {
      expect(p.quotient).toBe(Math.floor(p.dividend / p.divisor))
      expect(p.remainder).toBe(p.dividend % p.divisor)
    }
  })

  it(
    config.hasRemainder
      ? 'あまりが必ず 1 以上ある（割り切れる問題は出さない）'
      : 'あまりが必ず 0（割り切れる問題だけ）',
    () => {
      for (const p of list) {
        if (config.hasRemainder) {
          expect(p.remainder).toBeGreaterThanOrEqual(1)
        } else {
          expect(p.remainder).toBe(0)
        }
      }
    },
  )

  it('依頼文とアイテム名が空でない', () => {
    for (const p of list) {
      expect(p.message.trim()).not.toBe('')
      expect(p.item.trim()).not.toBe('')
    }
  })

  if (config.hasRemainder) {
    it('依頼文が「あまり」に触れている', () => {
      for (const p of list) {
        expect(p.message).toMatch(/あまり|余/)
      }
    })
  }
})

describe('かんたん・まあまあの商は必ず2桁（十の位 ÷ 割る数 が 1 以上）', () => {
  it.each(['easy', 'normal'] as const)('%s', difficulty => {
    for (const p of getProblemsByDifficulty(difficulty)) {
      expect(Math.floor(p.dividend / 10)).toBeGreaterThanOrEqual(p.divisor)
      expect(String(p.quotient)).toHaveLength(2)
    }
  })
})

describe('チャレンジの商の幅', () => {
  const list = getProblemsByDifficulty('challenge')

  it('商が3桁の問題を含む（例: 749 ÷ 3 = 249 あまり 2）', () => {
    expect(list.some(p => String(p.quotient).length === 3)).toBe(true)
  })

  it('商が2桁になる問題を含む（百の位が割る数より小さい）', () => {
    expect(list.some(p => String(p.quotient).length === 2)).toBe(true)
  })

  it('商の途中に 0 が立つ問題を含む（例: 604 ÷ 3 = 201 あまり 1）', () => {
    expect(list.some(p => String(p.quotient).slice(1).includes('0'))).toBe(true)
  })

  it('商が2桁の問題は百の位が割る数より小さく、商が3桁の問題は百の位が割る数以上', () => {
    for (const p of list) {
      const hundreds = Math.floor(p.dividend / 100)
      if (String(p.quotient).length === 2) {
        expect(hundreds).toBeLessThan(p.divisor)
      } else {
        expect(hundreds).toBeGreaterThanOrEqual(p.divisor)
      }
    }
  })
})

describe('getProblemsByDifficulty', () => {
  it('3つの難易度の問題を合わせると全問題になる', () => {
    const all = DIFFICULTY_ORDER.flatMap(d => getProblemsByDifficulty(d))
    expect(all).toHaveLength(PROBLEMS.length)
  })
})

describe('getRandomProblem', () => {
  it('指定した難易度の問題だけを返す', () => {
    for (const difficulty of DIFFICULTY_ORDER) {
      for (const r of [0, 0.2, 0.5, 0.8, 0.999999]) {
        vi.spyOn(Math, 'random').mockReturnValue(r)
        expect(getRandomProblem(difficulty).difficulty).toBe(difficulty)
        vi.restoreAllMocks()
      }
    }
  })

  it('乱数が 0 なら先頭、1 に近ければ末尾の問題を返す（境界値）', () => {
    const list = getProblemsByDifficulty('normal')
    vi.spyOn(Math, 'random').mockReturnValue(0)
    expect(getRandomProblem('normal').id).toBe(list[0].id)
    vi.spyOn(Math, 'random').mockReturnValue(0.999999)
    expect(getRandomProblem('normal').id).toBe(list[list.length - 1].id)
  })

  it('excludeId に指定した問題は、どの乱数でも返さない', () => {
    for (const difficulty of DIFFICULTY_ORDER) {
      for (const excluded of getProblemsByDifficulty(difficulty)) {
        for (const r of [0, 0.3, 0.6, 0.999999]) {
          vi.spyOn(Math, 'random').mockReturnValue(r)
          expect(getRandomProblem(difficulty, excluded.id).id).not.toBe(excluded.id)
          vi.restoreAllMocks()
        }
      }
    }
  })

  it('先頭の問題を除外して乱数が 0 のときは、2番目の問題を返す', () => {
    const list = getProblemsByDifficulty('challenge')
    vi.spyOn(Math, 'random').mockReturnValue(0)
    expect(getRandomProblem('challenge', list[0].id).id).toBe(list[1].id)
  })

  it('別の難易度の id を excludeId に渡しても、その難易度の問題を返す', () => {
    const other = getProblemsByDifficulty('easy')[0]
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const problem = getRandomProblem('challenge', other.id)
    expect(problem.difficulty).toBe('challenge')
  })
})
