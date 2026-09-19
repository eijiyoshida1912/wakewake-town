import { Difficulty, Problem, ResidentId } from './types'

interface ProblemSeed {
  id: number
  dividend: number
  divisor: number
  difficulty: Difficulty
  residentId: ResidentId
  message: string
  item: string
}

/** 商とあまりは割り算から計算する（手書きの値とずれないようにするため） */
export function createProblem(seed: ProblemSeed): Problem {
  if (!Number.isInteger(seed.divisor) || seed.divisor < 1) {
    throw new RangeError(`割る数は 1 以上の整数にしてください: ${seed.divisor}`)
  }
  return {
    ...seed,
    quotient: Math.floor(seed.dividend / seed.divisor),
    remainder: seed.dividend % seed.divisor,
  }
}

export const PROBLEMS: Problem[] = [
  // かんたん: 2桁 ÷ 1桁、あまりなし
  createProblem({ id: 1, dividend: 96, divisor: 3, difficulty: 'easy', residentId: 'cat', message: 'キャンディが96個あるんだ。\n3人で同じ数ずつ分けたいな！', item: 'キャンディ' }),
  createProblem({ id: 2, dividend: 84, divisor: 4, difficulty: 'easy', residentId: 'rabbit', message: 'クッキーが84まい焼けたよ！\n4人にわけてあげたいんだ。', item: 'クッキー' }),
  createProblem({ id: 3, dividend: 72, divisor: 6, difficulty: 'easy', residentId: 'bear', message: 'どんぐりが72こ集まったよ！\n6ひきで同じ数ずつ分けようよ。', item: 'どんぐり' }),
  createProblem({ id: 4, dividend: 55, divisor: 5, difficulty: 'easy', residentId: 'cat', message: 'おだんごが55こあるよ。\n5人でわけたらいくつになるかな？', item: 'おだんご' }),
  createProblem({ id: 5, dividend: 48, divisor: 4, difficulty: 'easy', residentId: 'rabbit', message: 'どんぐりパンが48こ！\n4ひきで同じ数ずつ食べたいよ。', item: 'どんぐりパン' }),
  createProblem({ id: 6, dividend: 63, divisor: 3, difficulty: 'easy', residentId: 'bear', message: 'ハチミツが63びん！\n3びきで同じ数ずつ分けようか。', item: 'ハチミツ' }),
  createProblem({ id: 7, dividend: 88, divisor: 4, difficulty: 'easy', residentId: 'cat', message: 'おかし袋が88こあるよ！\n4人にわけてあげてほしいな。', item: 'おかし袋' }),
  createProblem({ id: 8, dividend: 66, divisor: 3, difficulty: 'easy', residentId: 'rabbit', message: 'にんじんが66本あるよ！\n3びきで同じ数ずつ分けたいな。', item: 'にんじん' }),
  createProblem({ id: 9, dividend: 84, divisor: 6, difficulty: 'easy', residentId: 'bear', message: 'くりが84こ！\n6ひきで同じ数ずつわけようよ。', item: 'くり' }),
  createProblem({ id: 10, dividend: 93, divisor: 3, difficulty: 'easy', residentId: 'cat', message: 'ポップコーンが93こあるよ！\n3人で同じ数ずつ食べようよ。', item: 'ポップコーン' }),

  // まあまあ: 2桁 ÷ 1桁、あまりあり
  createProblem({ id: 11, dividend: 75, divisor: 4, difficulty: 'normal', residentId: 'cat', message: 'キャンディが75個あるよ！\n4人で同じ数ずつ分けたら、あまりはいくつかな？', item: 'キャンディ' }),
  createProblem({ id: 12, dividend: 83, divisor: 5, difficulty: 'normal', residentId: 'rabbit', message: 'にんじんが83本とれたよ！\n5ひきで同じ数ずつ分けると、あまりが出るかな？', item: 'にんじん' }),
  createProblem({ id: 13, dividend: 92, divisor: 7, difficulty: 'normal', residentId: 'bear', message: 'ハチミツのびんが92こ！\n7ひきで分けると、あまりはいくつ？', item: 'ハチミツ' }),
  createProblem({ id: 14, dividend: 67, divisor: 3, difficulty: 'normal', residentId: 'cat', message: 'おさかなが67ひきとれたよ。\n3人で同じ数ずつ分けたら、あまりはどうなる？', item: 'おさかな' }),
  createProblem({ id: 15, dividend: 59, divisor: 4, difficulty: 'normal', residentId: 'rabbit', message: 'クッキーが59まい焼けたよ！\n4人で分けると、あまりはいくつかな？', item: 'クッキー' }),
  createProblem({ id: 16, dividend: 85, divisor: 6, difficulty: 'normal', residentId: 'bear', message: 'どんぐりが85こ集まったよ。\n6ひきで同じ数ずつ分けると、あまりは？', item: 'どんぐり' }),
  createProblem({ id: 17, dividend: 97, divisor: 8, difficulty: 'normal', residentId: 'cat', message: 'おだんごが97こあるよ！\n8人で分けたら、あまりはいくつになる？', item: 'おだんご' }),
  createProblem({ id: 18, dividend: 78, divisor: 5, difficulty: 'normal', residentId: 'rabbit', message: 'くりが78こひろえたよ。\n5ひきで同じ数ずつ分けて、あまりを教えてね！', item: 'くり' }),

  // チャレンジ: 3桁 ÷ 1桁、あまりあり（商が3桁 / 商が2桁 / 商の途中に0 を含む）
  createProblem({ id: 21, dividend: 749, divisor: 3, difficulty: 'challenge', residentId: 'bear', message: 'どんぐりが749こも集まったよ！\n3びきで同じ数ずつ分けたら、あまりはいくつになる？', item: 'どんぐり' }),
  createProblem({ id: 22, dividend: 857, divisor: 4, difficulty: 'challenge', residentId: 'cat', message: 'おかしが857こあるんだ。\n4人で同じ数ずつ分けて、あまりを教えてね！', item: 'おかし' }),
  createProblem({ id: 23, dividend: 965, divisor: 2, difficulty: 'challenge', residentId: 'rabbit', message: 'にんじんが965本とれたよ！\n2ひきで分けると、あまりはいくつ？', item: 'にんじん' }),
  createProblem({ id: 24, dividend: 638, divisor: 5, difficulty: 'challenge', residentId: 'bear', message: 'ハチミツが638こ！\n5ひきで同じ数ずつ分けたら、あまりはどうなる？', item: 'ハチミツ' }),
  createProblem({ id: 25, dividend: 815, divisor: 6, difficulty: 'challenge', residentId: 'cat', message: 'ビーズが815こあるよ。\n6人で同じ数ずつ分けると、あまりはいくつかな？', item: 'ビーズ' }),
  createProblem({ id: 26, dividend: 259, divisor: 4, difficulty: 'challenge', residentId: 'rabbit', message: 'クッキーが259まい焼けたよ！\n4人で同じ数ずつ分けて、あまりも数えてね。', item: 'クッキー' }),
  createProblem({ id: 27, dividend: 487, divisor: 6, difficulty: 'challenge', residentId: 'bear', message: 'くりが487こひろえたよ。\n6ひきで同じ数ずつ分けたら、あまりはいくつ？', item: 'くり' }),
  createProblem({ id: 28, dividend: 375, divisor: 8, difficulty: 'challenge', residentId: 'cat', message: 'おだんごが375こ作れたよ！\n8人で分けると、あまりはいくつかな？', item: 'おだんご' }),
  createProblem({ id: 29, dividend: 604, divisor: 3, difficulty: 'challenge', residentId: 'rabbit', message: 'キャベツが604こ収穫できたよ！\n3びきで同じ数ずつ分けて、あまりを教えてね。', item: 'キャベツ' }),
  createProblem({ id: 30, dividend: 907, divisor: 3, difficulty: 'challenge', residentId: 'bear', message: 'どんぐりパンが907こ焼けたよ！\n3びきで分けたら、あまりはいくつ？', item: 'どんぐりパン' }),
]

export function getProblemsByDifficulty(difficulty: Difficulty): Problem[] {
  return PROBLEMS.filter(p => p.difficulty === difficulty)
}

export function getRandomProblem(difficulty: Difficulty, excludeId?: number): Problem {
  const available = getProblemsByDifficulty(difficulty).filter(p => p.id !== excludeId)
  return available[Math.floor(Math.random() * available.length)]
}
