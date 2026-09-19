import { ResidentId } from './types'

export const RESIDENTS: Record<ResidentId, { emoji: string; name: string }> = {
  cat: { emoji: '🐱', name: 'ネコさん' },
  rabbit: { emoji: '🐰', name: 'ウサギさん' },
  bear: { emoji: '🐻', name: 'クマさん' },
}
