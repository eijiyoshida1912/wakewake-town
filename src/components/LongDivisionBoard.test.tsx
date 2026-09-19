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

  it('かけ算の答えの下の線は、数字が入っているマスすべてに引かれる（749 ÷ 3: 1 + 2 + 2 = 5マス）', () => {
    const problem = makeProblem(749, 3, 249, 2)
    const steps = generateSteps(problem)
    const snapshot = getBoardSnapshot(problem, steps.length - 1, steps)
    const { container } = render(
      <LongDivisionBoard dividend={749} divisor={3} snapshot={snapshot} stepType="complete" />,
    )
    // 線は「かけ算の行」の数字のマスだけに付く（被除数の行の太い線は border-t-4 で別物）
    expect(container.querySelectorAll('.border-t-2')).toHaveLength(5)
  })

  it('横線はかけ算の答えの「下」に引かれ、被除数の直下には引かれない（259 ÷ 4 の 24 と 16 の下）', () => {
    const problem = makeProblem(259, 4, 64, 3)
    const steps = generateSteps(problem)
    const snapshot = getBoardSnapshot(problem, steps.length - 1, steps)
    const { container } = render(
      <LongDivisionBoard dividend={259} divisor={4} snapshot={snapshot} stepType="complete" />,
    )
    // 盤面 = [割る数の列, メインの列]、メインの列 = [商の行, 被除数の行, 各行のまとまり]
    const main = container.firstElementChild!.children[1]
    const groups = Array.from(main.children[2].children) // 24, 19, 16, 3 の順
    expect(groups).toHaveLength(4)
    const [product0, remainder0, product1, remainder1] = groups
    const lineCells = (el: Element) => el.querySelectorAll('.border-t-2').length

    // かけ算の行のまとまりは [数字の行, 線の行]。数字の行（=被除数の直下）には線がない
    for (const [product, digits] of [[product0, '24'], [product1, '16']] as const) {
      expect(product.children).toHaveLength(2)
      expect(product.children[0].textContent).toBe(digits)
      expect(lineCells(product.children[0])).toBe(0)
      expect(lineCells(product.children[1])).toBe(2) // 2桁のマスの下に線
    }
    // ひき算の行には線がない
    for (const remainder of [remainder0, remainder1]) {
      expect(remainder.children).toHaveLength(1)
      expect(lineCells(remainder)).toBe(0)
    }
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
