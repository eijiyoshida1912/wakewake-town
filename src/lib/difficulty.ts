import { Difficulty } from './types'

export interface DifficultyConfig {
  id: Difficulty
  label: string
  /** クリアしたときにもらえるコイン */
  coins: number
  /** 割られる数の桁数 */
  digits: 2 | 3
  /** あまりのある問題を出すか */
  hasRemainder: boolean
  /** 手順の指示・ヒントつきで解くか（false なら盤面のマスに直接入力） */
  assisted: boolean
}

export const DIFFICULTY_ORDER: Difficulty[] = ['easy', 'normal', 'challenge']

export const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  easy: { id: 'easy', label: 'かんたん', coins: 10, digits: 2, hasRemainder: false, assisted: true },
  normal: { id: 'normal', label: 'まあまあ', coins: 15, digits: 2, hasRemainder: true, assisted: true },
  challenge: { id: 'challenge', label: 'チャレンジ', coins: 30, digits: 3, hasRemainder: true, assisted: false },
}
