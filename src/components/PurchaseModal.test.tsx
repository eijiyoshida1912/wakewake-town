import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import PurchaseModal from './PurchaseModal'

afterEach(() => {
  cleanup()
})

describe('PurchaseModal: 表示', () => {
  it('ダイアログ（モーダル）として、「○○をかったよ！」を見出しにして出る', () => {
    render(<PurchaseModal name="ぼうし" onClose={() => {}} />)
    const dialog = screen.getByRole('dialog', { name: 'ぼうしをかったよ！' })
    expect(dialog.getAttribute('aria-modal')).toBe('true')
  })

  it('アイテムの大きな絵文字が出る（ぼうし 🎩）', () => {
    render(<PurchaseModal name="ぼうし" onClose={() => {}} />)
    expect(screen.getByText('🎩')).toBeDefined()
  })

  it('どのカテゴリの町のかざりにかざったかが分かる（ぼうし → おもちゃ）', () => {
    render(<PurchaseModal name="ぼうし" onClose={() => {}} />)
    expect(screen.getByRole('dialog').textContent).toContain('「おもちゃ」にかざったよ')
  })

  it('ほかのカテゴリでも同じ（ロケット → のりもの）', () => {
    render(<PurchaseModal name="ロケット" onClose={() => {}} />)
    expect(screen.getByRole('dialog').textContent).toContain('「のりもの」にかざったよ')
    expect(screen.getByText('🚀')).toBeDefined()
  })

  it('お店にない名前でも壊れず、📦 で出て、カテゴリの案内は出さない', () => {
    render(<PurchaseModal name="ふしぎなもの" onClose={() => {}} />)
    expect(screen.getByRole('dialog', { name: 'ふしぎなものをかったよ！' })).toBeDefined()
    expect(screen.getByText('📦')).toBeDefined()
    expect(screen.getByRole('dialog').textContent).not.toContain('にかざったよ')
  })

  it('開いたとき、「やったー！」ボタンにフォーカスが移る', () => {
    render(<PurchaseModal name="ぼうし" onClose={() => {}} />)
    expect(document.activeElement).toBe(screen.getByRole('button', { name: /やったー/ }))
  })
})

describe('PurchaseModal: 閉じ方', () => {
  it('「やったー！」を押すと、onClose が1回呼ばれる', () => {
    const onClose = vi.fn()
    render(<PurchaseModal name="ぼうし" onClose={onClose} />)
    expect(onClose).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: /やったー/ }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('Escape キーでも閉じる', () => {
    const onClose = vi.fn()
    render(<PurchaseModal name="ぼうし" onClose={onClose} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('Escape 以外のキーでは閉じない', () => {
    const onClose = vi.fn()
    render(<PurchaseModal name="ぼうし" onClose={onClose} />)
    fireEvent.keyDown(document, { key: 'Enter' })
    fireEvent.keyDown(document, { key: 'a' })
    expect(onClose).not.toHaveBeenCalled()
  })

  it('うしろの暗い部分を押しても閉じない（連続タップでモーダルを見逃さないため）', () => {
    const onClose = vi.fn()
    render(<PurchaseModal name="ぼうし" onClose={onClose} />)
    const backdrop = screen.getByRole('dialog').parentElement!
    fireEvent.click(backdrop)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('モーダルの中の文字を押しても閉じない', () => {
    const onClose = vi.fn()
    render(<PurchaseModal name="ぼうし" onClose={onClose} />)
    fireEvent.click(screen.getByText('ぼうしをかったよ！'))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('閉じたあと（アンマウント後）は、Escape を押しても onClose は呼ばれない', () => {
    const onClose = vi.fn()
    const { unmount } = render(<PurchaseModal name="ぼうし" onClose={onClose} />)
    unmount()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).not.toHaveBeenCalled()
  })
})
