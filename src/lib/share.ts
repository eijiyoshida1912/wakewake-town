export interface ShareState {
  /** 1人分（みんな同じ数ずつ） */
  each: number
  /** 手元にのこっている数 */
  left: number
}

/**
 * 「dividend 個を divisor 人に同じ数ずつ配る」途中の様子を返す。
 * progress は 0（まだ配っていない）〜 1（配りおわった）。範囲の外は端に丸める。
 * どの進み具合でも「1人分 × 人数 + のこり = 全部」になり、
 * 配りおわり（1）では 1人分 = 商、のこり = あまり になる。
 */
export function getShareState(dividend: number, divisor: number, progress: number): ShareState {
  if (!Number.isInteger(dividend) || dividend < 0) {
    throw new RangeError(`割られる数は 0 以上の整数にしてください: ${dividend}`)
  }
  if (!Number.isInteger(divisor) || divisor < 1) {
    throw new RangeError(`割る数は 1 以上の整数にしてください: ${divisor}`)
  }
  if (Number.isNaN(progress)) {
    throw new RangeError('進み具合が数ではありません')
  }
  const clamped = Math.min(1, Math.max(0, progress))
  const quotient = Math.floor(dividend / divisor)
  const each = Math.floor(quotient * clamped)
  return { each, left: dividend - each * divisor }
}
