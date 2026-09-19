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
  problemsSolved: number
  screen: 'home' | 'difficulty' | 'request' | 'division' | 'milestone'
  currentProblem: Problem | null
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
