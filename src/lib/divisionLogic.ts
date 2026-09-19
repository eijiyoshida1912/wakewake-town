import { DivisionStep, Problem, BoardSnapshot, WorkingRow } from './types'

export function generateSteps(problem: Problem): DivisionStep[] {
  const { dividend, divisor } = problem
  const tensDigit = Math.floor(dividend / 10)
  const unitsDigit = dividend % 10

  const q0 = Math.floor(tensDigit / divisor)
  const product0 = q0 * divisor
  const remainder0 = tensDigit - product0
  const combined = remainder0 * 10 + unitsDigit
  const q1 = Math.floor(combined / divisor)
  const product1 = q1 * divisor
  const remainder1 = combined - product1

  return [
    {
      type: 'tateru',
      question: `${tensDigit} の中に ${divisor} はいくつ入るかな？`,
      answer: q0,
      hint: `${divisor} のだんの九九を思い出してみよう！`,
      digitCol: 0,
    },
    {
      type: 'kakeru',
      question: `${q0} × ${divisor} は？`,
      answer: product0,
      hint: `${q0} × ${divisor} の答えは？`,
      digitCol: 0,
    },
    {
      type: 'hiku',
      question: `${tensDigit} − ${product0} は？`,
      answer: remainder0,
      hint: `${tensDigit} から ${product0} をひこう`,
      digitCol: 0,
    },
    {
      type: 'orosu',
      question: `${unitsDigit} をおろそう！`,
      answer: unitsDigit,
      hint: '',
      digitCol: 1,
    },
    {
      type: 'tateru',
      question: `${combined} の中に ${divisor} はいくつ入るかな？`,
      answer: q1,
      hint: `${divisor} のだんの九九を思い出してみよう！`,
      digitCol: 1,
    },
    {
      type: 'kakeru',
      question: `${q1} × ${divisor} は？`,
      answer: product1,
      hint: `${q1} × ${divisor} の答えは？`,
      digitCol: 1,
    },
    {
      type: 'hiku',
      question: `${combined} − ${product1} は？`,
      answer: remainder1,
      hint: `${combined} から ${product1} をひこう`,
      digitCol: 1,
    },
    {
      type: 'complete',
      question: 'かんせい！',
      answer: problem.quotient,
      hint: '',
      digitCol: 1,
    },
  ]
}

export function getBoardSnapshot(problem: Problem, stepIndex: number, steps: DivisionStep[]): BoardSnapshot {
  const { dividend, divisor } = problem
  const tensDigit = Math.floor(dividend / 10)
  const unitsDigit = dividend % 10

  const q0 = Math.floor(tensDigit / divisor)
  const product0 = q0 * divisor
  const remainder0 = tensDigit - product0
  const combined = remainder0 * 10 + unitsDigit
  const q1 = Math.floor(combined / divisor)
  const product1 = q1 * divisor
  const remainder1 = combined - product1

  const quotientDigits: (number | null)[] = [null, null]
  const rows: WorkingRow[] = []

  // Dividend row always shown
  rows.push({ label: 'dividend', digits: [tensDigit, unitsDigit], showLine: false })

  if (stepIndex >= 1) quotientDigits[0] = q0

  if (stepIndex >= 2) {
    rows.push({ label: 'product', digits: [product0, null], showLine: true })
  }

  if (stepIndex >= 3) {
    rows.push({ label: 'remainder', digits: [remainder0, null], showLine: false })
  }

  if (stepIndex >= 4) {
    // orosu: show the dropped digit next to remainder
    const lastIdx = rows.length - 1
    if (rows[lastIdx]?.label === 'remainder') {
      rows[lastIdx] = { label: 'remainder', digits: [remainder0, unitsDigit], showLine: false }
    }
  }

  if (stepIndex >= 5) quotientDigits[1] = q1

  if (stepIndex >= 6) {
    rows.push({ label: 'product', digits: [null, product1], showLine: true })
  }

  if (stepIndex >= 7) {
    rows.push({ label: 'remainder', digits: [null, remainder1], showLine: false })
  }

  const currentStep = steps[stepIndex]
  const activeCol = currentStep?.digitCol ?? 1

  return { quotientDigits, rows, activeCol }
}
