import { Problem } from './types'
import { generateSteps, getBoardSnapshot } from './divisionLogic'

export type ChallengeCellKind = 'quotient' | 'product' | 'remainder'

export interface ChallengeCell {
  /** マスの識別子: 商 `q-{列}` / かけ算 `p-{周}-{列}` / ひき算 `r-{周}-{列}` */
  key: string
  kind: ChallengeCellKind
  /** 何周目のマスか（商のマスは 0） */
  round: number
  col: number
  /** 正解の数字。null は「空欄のままが正解」のマス */
  expected: number | null
  /**
   * 完成に必要なマスか。商のすべての桁と、最後のあまり。
   * 途中の式（かけ算・おろした数・途中のひき算）は、書かなくても、答えが合っていれば完成にする。
   */
  required: boolean
}

/**
 * チャレンジの盤面のマスを、表示順（商 → 1周目のかけ算・ひき算 → 2周目 …）に返す。
 * どの問題でも同じ形（周の数は被除数の桁数）にして、マスの数から答えの桁数が分からないようにする。
 */
export function getChallengeCells(problem: Problem): ChallengeCell[] {
  const steps = generateSteps(problem)
  const solved = getBoardSnapshot(problem, steps.length - 1, steps)
  const width = solved.quotientDigits.length
  // 行は [被除数, かけ算, ひき算, かけ算, ひき算, …] の順。最後のひき算の行が、最後のあまり
  const lastRound = (solved.rows.length - 1) / 2 - 1

  const cells: ChallengeCell[] = []
  for (let col = 0; col < width; col++) {
    const expected = solved.quotientDigits[col]
    cells.push({ key: `q-${col}`, kind: 'quotient', round: 0, col, expected, required: expected !== null })
  }
  for (let round = 0; round < width; round++) {
    const productRow = solved.rows[1 + round * 2]
    const remainderRow = solved.rows[2 + round * 2]
    for (let col = 0; col < width; col++) {
      cells.push({ key: `p-${round}-${col}`, kind: 'product', round, col, expected: productRow?.digits[col] ?? null, required: false })
    }
    for (let col = 0; col < width; col++) {
      const expected = remainderRow?.digits[col] ?? null
      cells.push({
        key: `r-${round}-${col}`,
        kind: 'remainder',
        round,
        col,
        expected,
        required: round === lastRound && expected !== null,
      })
    }
  }
  return cells
}

/** 画面読み上げ・テスト用のマスの名前（例: 「かけ算 2かいめ 3れつめ」） */
export function getCellLabel(cell: ChallengeCell): string {
  const col = `${cell.col + 1}れつめ`
  if (cell.kind === 'quotient') return `しょう ${col}`
  const name = cell.kind === 'product' ? 'かけ算' : 'ひき算'
  return `${name} ${cell.round + 1}かいめ ${col}`
}

export function judgeCell(problem: Problem, key: string, digit: number): boolean {
  if (!Number.isInteger(digit) || digit < 0 || digit > 9) {
    throw new RangeError(`入力は 0〜9 の整数にしてください: ${digit}`)
  }
  const cell = getChallengeCells(problem).find(c => c.key === key)
  if (!cell) throw new RangeError(`存在しないマスです: ${key}`)
  return cell.expected === digit
}

/**
 * 商のすべての桁と最後のあまりが書いてあって、書いたマスがすべて正しければ true。
 * 途中の式は、書いていなくても構わない（書いたなら正しくなければならない）。
 */
export function isChallengeSolved(problem: Problem, filled: Record<string, number>): boolean {
  return getChallengeCells(problem).every(cell => {
    if (cell.key in filled && filled[cell.key] !== cell.expected) return false
    return !cell.required || cell.key in filled
  })
}
