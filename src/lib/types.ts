export type ResidentId = 'cat' | 'rabbit' | 'bear'

export type Difficulty = 'easy' | 'normal' | 'challenge'

export type StepType = 'tateru' | 'kakeru' | 'hiku' | 'orosu' | 'complete'

export interface DivisionStep {
  type: StepType
  question: string
  answer: number
  hint: string
  digitCol: number
}

export interface Problem {
  id: number
  dividend: number
  divisor: number
  quotient: number
  remainder: number
  difficulty: Difficulty
  residentId: ResidentId
  message: string
  item: string
}

export interface GameState {
  coins: number
  items: string[]
  /** これまでに解いた数（通算） */
  problemsSolved: number
  /** きょう解いた数。solvedDate の日の分だけを数える（日が変わったら、次に解くとき 1 から数え直す） */
  solvedToday: number
  /** solvedToday を数えた日（「2026-09-20」の形。まだ数えていなければ空） */
  solvedDate: string
  screen: 'home' | 'difficulty' | 'request' | 'division' | 'reward' | 'milestone' | 'shop' | 'ranking'
  currentProblem: Problem | null
  /** お祝い画面（reward）で見せる、いまもらったアイテム */
  rewardItem: string | null
  /** お祝いのあとに、節目画面（milestone）を挟むか */
  milestoneAfterReward: boolean
  /** お店で、いま買ったアイテム（「○○をかったよ！」を出す） */
  purchasedItem: string | null
  /** 筆算（division）を解き終わったか。解き終わったら、依頼画面には戻れない */
  divisionSolved: boolean
}

export interface WorkingRow {
  label: 'dividend' | 'product' | 'remainder'
  digits: (number | null)[]
  /** この行の下に横線を引く（かけ算の行に付く） */
  showLine: boolean
}

export interface BoardSnapshot {
  quotientDigits: (number | null)[]
  rows: WorkingRow[]
  activeCol: number
}
