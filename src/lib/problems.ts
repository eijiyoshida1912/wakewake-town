import { Problem } from './types'

export const PROBLEMS: Problem[] = [
  { id: 1, dividend: 96, divisor: 3, quotient: 32, residentId: 'cat', message: 'キャンディが96個あるんだ。\n3人で同じ数ずつ分けたいな！', item: 'キャンディ' },
  { id: 2, dividend: 84, divisor: 4, quotient: 21, residentId: 'rabbit', message: 'クッキーが84まい焼けたよ！\n4人にわけてあげたいんだ。', item: 'クッキー' },
  { id: 3, dividend: 72, divisor: 6, quotient: 12, residentId: 'bear', message: 'どんぐりが72こ集まったよ！\n6ひきで同じ数ずつ分けようよ。', item: 'どんぐり' },
  { id: 4, dividend: 55, divisor: 5, quotient: 11, residentId: 'cat', message: 'おだんごが55こあるよ。\n5人でわけたらいくつになるかな？', item: 'おだんご' },
  { id: 5, dividend: 48, divisor: 4, quotient: 12, residentId: 'rabbit', message: 'どんぐりパンが48こ！\n4ひきで同じ数ずつ食べたいよ。', item: 'どんぐりパン' },
  { id: 6, dividend: 63, divisor: 3, quotient: 21, residentId: 'bear', message: 'ハチミツが63びん！\n3びきで同じ数ずつ分けようか。', item: 'ハチミツ' },
  { id: 7, dividend: 88, divisor: 4, quotient: 22, residentId: 'cat', message: 'おかし袋が88こあるよ！\n4人にわけてあげてほしいな。', item: 'おかし袋' },
  { id: 8, dividend: 66, divisor: 3, quotient: 22, residentId: 'rabbit', message: 'にんじんが66本あるよ！\n3びきで同じ数ずつ分けたいな。', item: 'にんじん' },
  { id: 9, dividend: 84, divisor: 6, quotient: 14, residentId: 'bear', message: 'くりが84こ！\n6ひきで同じ数ずつわけようよ。', item: 'くり' },
  { id: 10, dividend: 93, divisor: 3, quotient: 31, residentId: 'cat', message: 'ポップコーンが93こあるよ！\n3人で同じ数ずつ食べようよ。', item: 'ポップコーン' },
]

export const ITEMS = ['いす', 'ランプ', 'クッション', '観葉植物', 'ぬいぐるみ', 'ぼうし', 'テーブル', 'フラワーポット']

export function getRandomProblem(excludeId?: number): Problem {
  const available = excludeId !== undefined ? PROBLEMS.filter(p => p.id !== excludeId) : PROBLEMS
  return available[Math.floor(Math.random() * available.length)]
}
