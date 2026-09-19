import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import ShopScreen from './ShopScreen'
import { ITEMS, SHOP_ITEMS } from '@/lib/items'

afterEach(() => {
  cleanup()
})

const baseProps = {
  coins: 100,
  items: [] as string[],
  purchasedItem: null as string | null,
  onDismissPurchase: () => {},
}
const rows = () => screen.getAllByRole('listitem')
const openTab = (label: string) => fireEvent.click(screen.getByRole('tab', { name: new RegExp(`^${label} `) }))

describe('ShopScreen: タブと品物', () => {
  it('5つのタブが並び、最初のタブ（かぐ）が選ばれていて、10個が安い順に出る', () => {
    render(<ShopScreen {...baseProps} onBuy={() => {}} onBack={() => {}} />)
    const tabs = screen.getAllByRole('tab')
    expect(tabs).toHaveLength(5)
    expect(tabs[0].getAttribute('aria-selected')).toBe('true')
    expect(rows()).toHaveLength(10)
    // かぐ: いちばん安いのは でんわ（40）、いちばん高いのは テレビ（150）
    expect(rows()[0].textContent).toContain('でんわ')
    expect(rows()[0].textContent).toContain('40')
    expect(rows()[9].textContent).toContain('テレビ')
    expect(rows()[9].textContent).toContain('150')
  })

  it('タブを切り替えると、そのカテゴリの品物が出る（おもちゃ: ぼうし 30 がいちばん安い）', () => {
    render(<ShopScreen {...baseProps} onBuy={() => {}} onBack={() => {}} />)
    openTab('おもちゃ')
    expect(rows()).toHaveLength(10)
    expect(rows().some(r => r.textContent?.includes('ぼうし'))).toBe(true)
    expect(rows().some(r => r.textContent?.includes('でんわ'))).toBe(false)
    expect(screen.getByRole('tab', { name: /^おもちゃ / }).getAttribute('aria-selected')).toBe('true')
  })

  it('タブには、まだ買っていない数が出る（かぐ のこり 10）', () => {
    render(<ShopScreen {...baseProps} items={['ぼうし', 'ぬいぐるみ']} onBuy={() => {}} onBack={() => {}} />)
    expect(screen.getByRole('tab', { name: 'かぐ のこり 10' })).toBeDefined()
    expect(screen.getByRole('tab', { name: 'おもちゃ のこり 8' })).toBeDefined()
  })

  it('持っているアイテムは並ばない', () => {
    render(<ShopScreen {...baseProps} items={['いす', 'テーブル']} onBuy={() => {}} onBack={() => {}} />)
    expect(rows()).toHaveLength(8)
    expect(screen.queryByRole('button', { name: 'いすをかう' })).toBeNull()
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
    fireEvent.click(screen.getByRole('button', { name: 'いすをかう' }))
    expect(onBuy).toHaveBeenCalledTimes(1)
    expect(onBuy).toHaveBeenCalledWith('いす')
  })

  it('コインが足りないアイテムは、ボタンが押せず、「あと ○」と出る（100 のテーブルに 50）', () => {
    const onBuy = vi.fn()
    render(<ShopScreen {...baseProps} coins={50} onBuy={onBuy} onBack={() => {}} />)
    const button = screen.getByRole('button', { name: 'テーブルをかう' }) as HTMLButtonElement
    expect(button.disabled).toBe(true)
    expect(button.textContent).toContain('あと 50')
    fireEvent.click(button)
    expect(onBuy).not.toHaveBeenCalled()
  })

  it('ちょうどのコイン（でんわ 40 に 40）なら押せて、1つ足りない（39）と押せない（境界値）', () => {
    render(<ShopScreen {...baseProps} coins={40} onBuy={() => {}} onBack={() => {}} />)
    expect((screen.getByRole('button', { name: 'でんわをかう' }) as HTMLButtonElement).disabled).toBe(false)
    cleanup()
    render(<ShopScreen {...baseProps} coins={39} onBuy={() => {}} onBack={() => {}} />)
    const short = screen.getByRole('button', { name: 'でんわをかう' }) as HTMLButtonElement
    expect(short.disabled).toBe(true)
    expect(short.textContent).toContain('あと 1')
  })

  it('別のタブの品物も買える（おもちゃ: ぼうし）', () => {
    const onBuy = vi.fn()
    render(<ShopScreen {...baseProps} onBuy={onBuy} onBack={() => {}} />)
    openTab('おもちゃ')
    fireEvent.click(screen.getByRole('button', { name: 'ぼうしをかう' }))
    expect(onBuy).toHaveBeenCalledWith('ぼうし')
  })
})

describe('ShopScreen: 買ったあと・そろったとき・もどる', () => {
  it('1つのカテゴリをそろえると、そのタブに「このコーナーはぜんぶそろったよ」と出て、ほかのタブは買える', () => {
    const furniture = SHOP_ITEMS.filter(i => i.category === 'furniture').map(i => i.name)
    render(<ShopScreen {...baseProps} coins={500} items={furniture} onBuy={() => {}} onBack={() => {}} />)
    expect(screen.getByText(/このコーナーはぜんぶそろったよ/)).toBeDefined()
    expect(screen.queryAllByRole('listitem')).toHaveLength(0)
    expect(screen.getByRole('tab', { name: 'かぐ のこり 0' })).toBeDefined()
    openTab('しょくぶつ')
    expect(rows()).toHaveLength(10)
    expect(screen.queryByText(/このコーナーはぜんぶそろったよ/)).toBeNull()
  })

  it('50個ぜんぶ持っているときは「ぜんぶそろった」と出て、タブも買うボタンもない', () => {
    render(<ShopScreen {...baseProps} coins={500} items={[...ITEMS]} onBuy={() => {}} onBack={() => {}} />)
    expect(screen.getByText(/ぜんぶそろったよ！町がにぎやかになったね/)).toBeDefined()
    expect(screen.queryAllByRole('tab')).toHaveLength(0)
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

describe('ShopScreen: 買ったときのモーダル', () => {
  const bought = { ...baseProps, items: ['ぼうし'], purchasedItem: 'ぼうし' }

  it('買ったばかりのアイテムがあれば、「○○をかったよ！」のモーダルが出る', () => {
    render(<ShopScreen {...bought} onBuy={() => {}} onBack={() => {}} />)
    expect(screen.getByRole('dialog', { name: /ぼうしをかったよ！/ })).toBeDefined()
  })

  it('買ったばかりでなければ、モーダルは出ない', () => {
    render(<ShopScreen {...baseProps} onBuy={() => {}} onBack={() => {}} />)
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.queryByText(/かったよ！/)).toBeNull()
  })

  it('「かったよ！」は、うしろの画面には重ねて出さず、モーダルの1か所だけ', () => {
    render(<ShopScreen {...bought} onBuy={() => {}} onBack={() => {}} />)
    expect(screen.getAllByText(/ぼうしをかったよ！/)).toHaveLength(1)
  })

  it('「やったー！」を押すと、onDismissPurchase が1回呼ばれる', () => {
    const onDismissPurchase = vi.fn()
    render(<ShopScreen {...bought} onDismissPurchase={onDismissPurchase} onBuy={() => {}} onBack={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: /やったー/ }))
    expect(onDismissPurchase).toHaveBeenCalledTimes(1)
  })

  it('モーダルが開いている間、うしろのお店は操作できない（inert）。閉じていれば操作できる', () => {
    const { container, rerender } = render(<ShopScreen {...bought} onBuy={() => {}} onBack={() => {}} />)
    const inert = container.querySelector('[inert]')
    expect(inert).not.toBeNull()
    expect(inert?.textContent).toContain('もどる')
    expect(screen.getByRole('dialog').closest('[inert]')).toBeNull()

    rerender(<ShopScreen {...baseProps} onBuy={() => {}} onBack={() => {}} />)
    expect(container.querySelector('[inert]')).toBeNull()
  })
})
