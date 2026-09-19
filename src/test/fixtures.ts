import { Problem } from '@/lib/types'

/**
 * テスト用の問題を作る。商とあまりは、テストを書く人が手計算した値を
 * そのまま渡す（実装の計算式を使うと、実装の誤りを見逃してしまうため）。
 */
export function makeProblem(dividend: number, divisor: number, quotient: number, remainder: number): Problem {
  return {
    id: 0,
    dividend,
    divisor,
    quotient,
    remainder,
    difficulty: 'normal',
    residentId: 'cat',
    message: 'テスト',
    item: 'テスト',
  }
}
