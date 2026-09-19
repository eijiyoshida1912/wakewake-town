export type ResidentId = 'cat' | 'rabbit' | 'bear'

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
  residentId: ResidentId
  message: string
  item: string
}

export interface GameState {
  coins: number
  items: string[]
  problemsSolved: number
  screen: 'home' | 'request' | 'division' | 'milestone'
  currentProblem: Problem | null
}

export interface WorkingRow {
  label: 'dividend' | 'product' | 'remainder'
  digits: (number | null)[]
  showLine: boolean
}

export interface BoardSnapshot {
  quotientDigits: (number | null)[]
  rows: WorkingRow[]
  activeCol: number
}
