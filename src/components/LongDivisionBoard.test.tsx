import { describe, it, expect, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import LongDivisionBoard from './LongDivisionBoard'
import { generateSteps, getBoardSnapshot } from '@/lib/divisionLogic'
import { makeProblem } from '@/test/fixtures'

afterEach(() => {
  cleanup()
})

describe('LongDivisionBoard', () => {
  it('3桁の筆算の完成形を、割る数・商・被除数・各行の順にすべて表示する（749 ÷ 3）', () => {
    const problem = makeProblem(749, 3, 249, 2)
    const steps = generateSteps(problem)
    const snapshot = getBoardSnapshot(problem, steps.length - 1, steps)
    const { container } = render(
      <LongDivisionBoard dividend={749} divisor={3} snapshot={snapshot} stepType="complete" />,
    )
    // 割る数 3 / 商 249 / 被除数 749 / かけ算 6, ひき算 14, かけ算 12, ひき算 29, かけ算 27, ひき算 2
    expect(container.textContent).toBe('3' + '249' + '749' + '6' + '14' + '12' + '29' + '27' + '2')
  })

  it('かけ算の答えの上の線は、数字が入っているマスすべてに引かれる（749 ÷ 3: 1 + 2 + 2 = 5マス）', () => {
    const problem = makeProblem(749, 3, 249, 2)
    const steps = generateSteps(problem)
    const snapshot = getBoardSnapshot(problem, steps.length - 1, steps)
    const { container } = render(
      <LongDivisionBoard dividend={749} divisor={3} snapshot={snapshot} stepType="complete" />,
    )
    // 線は「かけ算の行」の数字のマスだけに付く（被除数の行の太い線は border-t-4 で別物）
    expect(container.querySelectorAll('.border-t-2')).toHaveLength(5)
  })

  it('商の行は、被除数の行の括弧と同じ幅の余白を左に持ち、商の桁が被除数の桁の真上に来る', () => {
    const problem = makeProblem(72, 6, 12, 0)
    const steps = generateSteps(problem)
    const snapshot = getBoardSnapshot(problem, steps.length - 1, steps)
    const { container } = render(
      <LongDivisionBoard dividend={72} divisor={6} snapshot={snapshot} stepType="complete" />,
    )
    // 盤面 = [割る数の列, メインの列]、メインの列 = [商の行, 被除数の行, ...]
    const main = container.firstElementChild!.children[1]
    const quotientRow = main.children[0]
    const dividendRow = main.children[1]
    expect(dividendRow.firstElementChild!.className).toContain('w-3') // 括弧
    expect(quotientRow.firstElementChild!.className).toContain('w-3') // 括弧と同じ幅の余白
    expect(quotientRow.children).toHaveLength(dividendRow.children.length)
  })

  it('2桁のかけ算の答えは、1桁ずつ別のマスに表示される（72 ÷ 6 の 12）', () => {
    const problem = makeProblem(72, 6, 12, 0)
    const steps = generateSteps(problem)
    const snapshot = getBoardSnapshot(problem, 6, steps)
    const { container } = render(
      <LongDivisionBoard dividend={72} divisor={6} snapshot={snapshot} stepType="hiku" />,
    )
    const cellTexts = Array.from(container.querySelectorAll('div'))
      .filter(el => el.children.length === 0)
      .map(el => el.textContent)
    expect(cellTexts).toContain('1')
    expect(cellTexts).toContain('2')
    expect(cellTexts).not.toContain('12')
  })

  it('商が2桁になる3桁割り算では、使わない百の位の商のマスは空のまま（259 ÷ 4）', () => {
    const problem = makeProblem(259, 4, 64, 3)
    const steps = generateSteps(problem)
    const snapshot = getBoardSnapshot(problem, steps.length - 1, steps)
    const { container } = render(
      <LongDivisionBoard dividend={259} divisor={4} snapshot={snapshot} stepType="complete" />,
    )
    expect(container.textContent).toBe('4' + '64' + '259' + '24' + '19' + '16' + '3')
  })
})
