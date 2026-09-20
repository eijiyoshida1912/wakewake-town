'use client'

import { useCallback, useEffect, useRef } from 'react'

// 自分で積んだ履歴だと見分けるための目印
const MARKER = 'wakewakeTownBack'

/**
 * ブラウザの「戻る」を、アプリの画面の「もどる」につなぐ。
 *
 * 画面はURLではなく状態で切り替えているので、そのままだと履歴が積まれず、
 * 戻るを押すとアプリごと離れてしまう。そこで、ホーム以外の画面にいるあいだだけ、
 * 目印つきの履歴を1つ積んでおく。戻るが押されると、その1つが消えるので、
 * かわりに onBack で画面を戻し、まだホーム以外なら積み直す。
 *
 * - active: いまの画面がホーム以外か
 * - onBack: 戻るを押されたときに画面を戻す処理。戻れない画面では null
 *   （その場にとどまるよう、積み直すだけにする）
 */
export function useBrowserBack(active: boolean, onBack: (() => void) | null) {
  const activeRef = useRef(active)
  const onBackRef = useRef(onBack)
  // 積んだ履歴が、いま残っているか
  const hasEntryRef = useRef(false)

  // 履歴を、いまの画面に合わせる
  const sync = useCallback(() => {
    if (activeRef.current && !hasEntryRef.current) {
      // URL は変えない。変えると、リロードしたときに画面と食い違う
      window.history.pushState({ [MARKER]: true }, '')
      hasEntryRef.current = true
    } else if (!activeRef.current && hasEntryRef.current) {
      // 画面の中のボタンでホームに戻った。積んだ履歴は、ここで片づける。
      // 先に印を外しておくので、このとき起きる popstate は無視される
      hasEntryRef.current = false
      window.history.back()
    }
  }, [])

  // 再描画のたびに合わせる（onBack のあとの積み直しも、ここで行われる）
  useEffect(() => {
    activeRef.current = active
    onBackRef.current = onBack
    sync()
  })

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // 「進む」で、積んだ履歴に来た
      if (event.state?.[MARKER]) {
        hasEntryRef.current = true
        sync()
        return
      }
      // 自分で戻したとき（積んだ履歴がない）は、何もしない
      if (!hasEntryRef.current) return
      // 積んだ履歴が消えた = ユーザーが戻るを押した
      hasEntryRef.current = false
      const back = onBackRef.current
      if (activeRef.current && back) back()
      else sync()
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [sync])
}
