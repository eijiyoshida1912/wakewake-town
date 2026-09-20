import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, cleanup } from '@testing-library/react'
import { useBrowserBack } from './useBrowserBack'

/** ブラウザの「戻る」を押した。戻った先（ホームの履歴）には、こちらの目印はない */
function pressBack() {
  act(() => {
    window.dispatchEvent(new PopStateEvent('popstate', { state: { __NA: true } }))
  })
}

let pushState: ReturnType<typeof vi.spyOn>
let back: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  pushState = vi.spyOn(window.history, 'pushState')
  // jsdom の history.back() は、あとから popstate を起こすので、呼ばれたことだけ確認する
  back = vi.spyOn(window.history, 'back').mockImplementation(() => {})
})

afterEach(() => {
  // 前のテストのフックが残っていると、あとのテストの popstate に反応してしまう
  cleanup()
  vi.restoreAllMocks()
})

describe('useBrowserBack: 履歴を積む・戻す', () => {
  it('ホームのあいだ（active=false）は、履歴を積まない', () => {
    renderHook(() => useBrowserBack(false, null))
    expect(pushState).not.toHaveBeenCalled()
    expect(back).not.toHaveBeenCalled()
  })

  it('ホーム以外の画面になると、履歴を1つだけ積む。再描画しても増えない', () => {
    const { rerender } = renderHook(({ active }) => useBrowserBack(active, null), {
      initialProps: { active: false },
    })
    rerender({ active: true })
    expect(pushState).toHaveBeenCalledTimes(1)
    rerender({ active: true })
    rerender({ active: true })
    expect(pushState).toHaveBeenCalledTimes(1)
  })

  it('積んだ履歴には目印が付き、URL は変えない（リロードしても画面と食い違わない）', () => {
    renderHook(() => useBrowserBack(true, null))
    const [state, , url] = pushState.mock.calls[0]
    expect(state).toMatchObject({ wakewakeTownBack: true })
    expect(url).toBeUndefined()
  })

  it('画面の中のボタンでホームに戻ったら（active が false に戻ったら）、積んだ履歴を1つ戻す', () => {
    const { rerender } = renderHook(({ active }) => useBrowserBack(active, null), {
      initialProps: { active: true },
    })
    expect(back).not.toHaveBeenCalled()
    rerender({ active: false })
    expect(back).toHaveBeenCalledTimes(1)
    rerender({ active: false })
    expect(back).toHaveBeenCalledTimes(1)
  })

  it('戻した履歴で起きる popstate では、onBack を呼ばず、履歴も積み直さない', () => {
    const onBack = vi.fn()
    const { rerender } = renderHook(({ active }) => useBrowserBack(active, onBack), {
      initialProps: { active: true },
    })
    rerender({ active: false })
    pressBack()
    expect(onBack).not.toHaveBeenCalled()
    expect(pushState).toHaveBeenCalledTimes(1)
  })

  it('ホームで戻るを押しても、何もしない（アプリを離れるのはブラウザの普通の動き）', () => {
    const onBack = vi.fn()
    renderHook(() => useBrowserBack(false, onBack))
    pressBack()
    expect(onBack).not.toHaveBeenCalled()
    expect(pushState).not.toHaveBeenCalled()
  })
})

describe('useBrowserBack: 戻るを押したとき', () => {
  it('ホーム以外の画面で戻るを押すと、onBack が1回呼ばれる', () => {
    const onBack = vi.fn()
    renderHook(() => useBrowserBack(true, onBack))
    pressBack()
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('戻った先もホーム以外の画面なら、履歴を積み直す（次の戻るも受け止められる）', () => {
    const onBack = vi.fn()
    const { rerender } = renderHook(() => useBrowserBack(true, onBack))
    pressBack()
    expect(pushState).toHaveBeenCalledTimes(1)
    // onBack で画面が変わって再描画された
    rerender()
    expect(pushState).toHaveBeenCalledTimes(2)
    pressBack()
    expect(onBack).toHaveBeenCalledTimes(2)
  })

  it('戻った先がホームなら、履歴は積み直さない（もう一度戻るとアプリを離れられる）', () => {
    const onBack = vi.fn()
    const { rerender } = renderHook(({ active }) => useBrowserBack(active, onBack), {
      initialProps: { active: true },
    })
    pressBack()
    // onBack で画面がホームになって再描画された
    rerender({ active: false })
    expect(pushState).toHaveBeenCalledTimes(1)
    expect(back).not.toHaveBeenCalled()
  })

  it('戻れない画面（onBack が null）では、onBack を呼ばず、その場で履歴を積み直す', () => {
    const { rerender } = renderHook(() => useBrowserBack(true, null))
    expect(pushState).toHaveBeenCalledTimes(1)
    pressBack()
    expect(pushState).toHaveBeenCalledTimes(2)
    // 何度押しても、その場にとどまる
    pressBack()
    pressBack()
    expect(pushState).toHaveBeenCalledTimes(4)
    rerender()
    expect(pushState).toHaveBeenCalledTimes(4)
  })

  it('再描画で onBack が差し替わっても、最新の onBack が呼ばれる', () => {
    const first = vi.fn()
    const second = vi.fn()
    const { rerender } = renderHook(({ onBack }) => useBrowserBack(true, onBack), {
      initialProps: { onBack: first },
    })
    rerender({ onBack: second })
    pressBack()
    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledTimes(1)
  })
})

describe('useBrowserBack: 「進む」で積んだ履歴に戻ってきたとき', () => {
  const arriveAtOwnEntry = () => {
    act(() => {
      window.dispatchEvent(new PopStateEvent('popstate', { state: { wakewakeTownBack: true, __NA: true } }))
    })
  }

  it('ホーム以外の画面のままなら、onBack は呼ばず、履歴も増やさない', () => {
    const onBack = vi.fn()
    renderHook(() => useBrowserBack(true, onBack))
    arriveAtOwnEntry()
    expect(onBack).not.toHaveBeenCalled()
    expect(pushState).toHaveBeenCalledTimes(1)
  })

  it('ホームなのに積んだ履歴に来てしまったときは、その履歴を1つ戻して片づける', () => {
    const onBack = vi.fn()
    renderHook(() => useBrowserBack(false, onBack))
    arriveAtOwnEntry()
    expect(onBack).not.toHaveBeenCalled()
    expect(back).toHaveBeenCalledTimes(1)
  })
})

describe('useBrowserBack: 後始末', () => {
  it('画面を閉じたあと（unmount）は、戻るを押しても onBack は呼ばれない', () => {
    const onBack = vi.fn()
    const { unmount } = renderHook(() => useBrowserBack(true, onBack))
    unmount()
    pressBack()
    expect(onBack).not.toHaveBeenCalled()
  })
})
