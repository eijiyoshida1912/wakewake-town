import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import ShopScreen from './ShopScreen'

afterEach(() => {
  cleanup()
})

const baseProps = { coins: 100, items: [] as string[], purchasedItem: null as string | null }

describe('ShopScreen: 品物', () => {
  it('持っていないアイテムが、安い順に、名前と値段つきで並ぶ', () => {
    render(<ShopScreen {...baseProps} onBuy={() => {}} onBack={() => {}} />)
    const rows = screen.getAllByRole('listitem')
    expect(rows).toHaveLength(8)
    expect(rows[0].textContent).toContain('ぼうし')
    expect(rows[0].textContent).toContain('30')
    expect(rows[7].textContent).toContain('テーブル')
    expect(rows[7].textContent).toContain('100')
  })

  it('持っているアイテムは並ばない', () => {
    render(<ShopScreen {...baseProps} items={['ぼうし', 'いす']} onBuy={() => {}} onBack={() => {}} />)
    expect(screen.getAllByRole('listitem')).toHaveLength(6)
    expect(screen.queryByRole('button', { name: 'ぼうしをかう' })).toBeNull()
  })

  it('持っているコインが表示される', () => {
    render(<ShopScreen {...baseProps} coins={85} onBuy={() => {}} onBack={() => {}} />)
    expect(screen.getByText(/85/)).toBeDefined()
  })
})

describe('ShopScreen: 買う', () => {
  it('コインが足りるアイテムは、「かう」を押すと onBuy(名前) が1回呼ばれる', () => {
    const onBuy = vi.fn()
    render(<ShopScreen {...baseProps} onBuy={onBuy} onBack={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: 'ぼうしをかう' }))
    expect(onBuy).toHaveBeenCalledTimes(1)
    expect(onBuy).toHaveBeenCalledWith('ぼうし')
  })

  it('コインが足りないアイテムは、ボタンが押せず、「あと ○ コイン」と出る（80 のいすに 50）', () => {
    const onBuy = vi.fn()
    render(<ShopScreen {...baseProps} coins={50} onBuy={onBuy} onBack={() => {}} />)
    const button = screen.getByRole('button', { name: 'いすをかう' }) as HTMLButtonElement
    expect(button.disabled).toBe(true)
    expect(button.textContent).toContain('あと 30')
    fireEvent.click(button)
    expect(onBuy).not.toHaveBeenCalled()
  })

  it('ちょうどのコイン（ぼうし 30 に 30）なら押せる（境界値）', () => {
    render(<ShopScreen {...baseProps} coins={30} onBuy={() => {}} onBack={() => {}} />)
    expect((screen.getByRole('button', { name: 'ぼうしをかう' }) as HTMLButtonElement).disabled).toBe(false)
    expect((screen.getByRole('button', { name: 'ぬいぐるみをかう' }) as HTMLButtonElement).disabled).toBe(true)
  })

  it('1コイン足りない（29）と押せず、「あと 1」と出る', () => {
    render(<ShopScreen {...baseProps} coins={29} onBuy={() => {}} onBack={() => {}} />)
    const button = screen.getByRole('button', { name: 'ぼうしをかう' }) as HTMLButtonElement
    expect(button.disabled).toBe(true)
    expect(button.textContent).toContain('あと 1')
  })
})

describe('ShopScreen: 買ったあと・そろったとき・もどる', () => {
  it('買ったばかりのアイテムがあれば「○○をかったよ！」と出る', () => {
    render(<ShopScreen {...baseProps} items={['ぼうし']} purchasedItem="ぼうし" onBuy={() => {}} onBack={() => {}} />)
    expect(screen.getByText(/ぼうしをかったよ！/)).toBeDefined()
  })

  it('買ったばかりでなければ、「かったよ！」は出ない', () => {
    render(<ShopScreen {...baseProps} onBuy={() => {}} onBack={() => {}} />)
    expect(screen.queryByText(/かったよ！/)).toBeNull()
  })

  it('全部持っているときは「ぜんぶそろった」と出て、買うボタンはない', () => {
    const all = ['いす', 'ランプ', 'クッション', '観葉植物', 'ぬいぐるみ', 'ぼうし', 'テーブル', 'フラワーポット']
    render(<ShopScreen {...baseProps} coins={500} items={all} onBuy={() => {}} onBack={() => {}} />)
    expect(screen.getByText(/ぜんぶそろった/)).toBeDefined()
    expect(screen.queryByRole('listitem')).toBeNull()
    expect(screen.queryByRole('button', { name: /をかう/ })).toBeNull()
  })

  it('「もどる」を押すと onBack が呼ばれ、onBuy は呼ばれない', () => {
    const onBuy = vi.fn()
    const onBack = vi.fn()
    render(<ShopScreen {...baseProps} onBuy={onBuy} onBack={onBack} />)
    fireEvent.click(screen.getByRole('button', { name: /もどる/ }))
    expect(onBack).toHaveBeenCalledTimes(1)
    expect(onBuy).not.toHaveBeenCalled()
  })
})
