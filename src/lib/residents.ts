import { ResidentId } from './types'

export const RESIDENTS: Record<ResidentId, { emoji: string; name: string }> = {
  cat: { emoji: '🐱', name: 'ネコさん' },
  rabbit: { emoji: '🐰', name: 'ウサギさん' },
  bear: { emoji: '🐻', name: 'クマさん' },
}

/** わけわけのなかま。割る数（最大 9）の人数ぶん、先頭から使う。先頭の3人は町の住人 */
export const FRIEND_EMOJIS = ['🐱', '🐰', '🐻', '🐶', '🐼', '🦊', '🐸', '🐷', '🐵']
