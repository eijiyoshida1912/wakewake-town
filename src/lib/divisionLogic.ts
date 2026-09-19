import { DivisionStep, Problem, BoardSnapshot, WorkingRow } from './types'

/** 筆算の1周分（立てる → かける → ひく）の値 */
interface Round {
  /** 商の桁が立つ列（割られる数の左から数えた位置） */
  col: number
  /** このラウンドの前におろした数字（最初のラウンドは null） */
  dropped: number | null
  /** 今回割る数（前のあまりに、おろした数字を足したもの） */
  current: number
  quotient: number
  product: number
  remainder: number
}

function assertValidProblem({ dividend, divisor }: Problem) {
  if (!Number.isInteger(divisor) || divisor < 1 || divisor > 9) {
    throw new RangeError(`割る数は 1〜9 の整数にしてください: ${divisor}`)
  }
  if (!Number.isInteger(dividend) || dividend < 10 || dividend > 999) {
    throw new RangeError(`割られる数は 10〜999 の整数にしてください: ${dividend}`)
  }
}

function computeRounds(dividend: number, divisor: number): Round[] {
  const digits = String(dividend).split('').map(Number)

  // 先頭の桁が割る数より小さいときは、最初の2桁をまとめて割る
  const startCol = digits[0] < divisor ? 1 : 0
  const firstValue = startCol === 1 ? digits[0] * 10 + digits[1] : digits[0]

  const rounds: Round[] = []
  for (let col = startCol; col < digits.length; col++) {
    const previous = rounds[rounds.length - 1]
    const dropped = previous ? digits[col] : null
    const current = previous ? previous.remainder * 10 + digits[col] : firstValue
    const quotient = Math.floor(current / divisor)
    const product = quotient * divisor
    rounds.push({ col, dropped, current, quotient, product, remainder: current - product })
  }
  return rounds
}

export function generateSteps(problem: Problem): DivisionStep[] {
  assertValidProblem(problem)
  const { divisor } = problem
  const rounds = computeRounds(problem.dividend, divisor)

  const steps: DivisionStep[] = []
  for (const round of rounds) {
    const { col, dropped, current, quotient, product, remainder } = round
    if (dropped !== null) {
      steps.push({ type: 'orosu', question: `${dropped} をおろそう！`, answer: dropped, hint: '', digitCol: col })
    }
    steps.push({
      type: 'tateru',
      question: `${current} の中に ${divisor} はいくつ入るかな？`,
      answer: quotient,
      hint: `${divisor} のだんの九九を思い出してみよう！`,
      digitCol: col,
    })
    steps.push({
      type: 'kakeru',
      question: `${quotient} × ${divisor} は？`,
      answer: product,
      hint: `${quotient} × ${divisor} の答えは？`,
      digitCol: col,
    })
    steps.push({
      type: 'hiku',
      question: `${current} − ${product} は？`,
      answer: remainder,
      hint: `${current} から ${product} をひこう`,
      digitCol: col,
    })
  }

  steps.push({
    type: 'complete',
    question: 'かんせい！',
    answer: rounds.reduce((quotient, round) => quotient * 10 + round.quotient, 0),
    hint: '',
    digitCol: rounds[rounds.length - 1].col,
  })
  return steps
}

/** value を endCol を右端にして、1桁ずつ複数の列に並べた行を作る */
function placeRow(
  label: WorkingRow['label'],
  value: number,
  endCol: number,
  width: number,
  showLine: boolean,
): WorkingRow {
  const valueDigits = String(value).split('').map(Number)
  const digits: (number | null)[] = Array(width).fill(null)
  const startCol = endCol - valueDigits.length + 1
  valueDigits.forEach((digit, i) => {
    digits[startCol + i] = digit
  })
  return { label, digits, showLine }
}

export function getBoardSnapshot(problem: Problem, stepIndex: number, steps: DivisionStep[]): BoardSnapshot {
  assertValidProblem(problem)
  if (!Number.isInteger(stepIndex) || stepIndex < 0 || stepIndex >= steps.length) {
    throw new RangeError(`ステップ番号は 0〜${steps.length - 1} の整数にしてください: ${stepIndex}`)
  }

  const dividendDigits = String(problem.dividend).split('').map(Number)
  const width = dividendDigits.length
  const rounds = computeRounds(problem.dividend, problem.divisor)

  const quotientDigits: (number | null)[] = Array(width).fill(null)
  const rows: WorkingRow[] = [{ label: 'dividend', digits: dividendDigits, showLine: false }]

  // stepIndex より前のステップは「答え合わせが済んだもの」として盤面に反映する
  let roundIndex = -1
  for (let i = 0; i < stepIndex; i++) {
    const step = steps[i]
    if (step.type === 'tateru') {
      roundIndex++
      quotientDigits[rounds[roundIndex].col] = rounds[roundIndex].quotient
    } else if (step.type === 'kakeru') {
      const { col, product } = rounds[roundIndex]
      rows.push(placeRow('product', product, col, width, true))
    } else if (step.type === 'hiku') {
      const { col, remainder } = rounds[roundIndex]
      rows.push(placeRow('remainder', remainder, col, width, false))
    } else if (step.type === 'orosu') {
      // おろした数字は、直前のあまりの行の右隣に出る
      rows[rows.length - 1].digits[step.digitCol] = step.answer
    }
  }

  return { quotientDigits, rows, activeCol: steps[stepIndex].digitCol }
}
