import { describe, it, expect } from 'vitest'
import { DIFFICULTIES, DIFFICULTY_ORDER } from './difficulty'

describe('難易度の設定', () => {
  it('選択画面の並び順は かんたん → まあまあ → チャレンジ', () => {
    expect(DIFFICULTY_ORDER).toEqual(['easy', 'normal', 'challenge'])
    expect(DIFFICULTY_ORDER.map(d => DIFFICULTIES[d].label)).toEqual([
      'かんたん',
      'まあまあ',
      'チャレンジ',
    ])
  })

  it('もらえるコインは かんたん10 / まあまあ15 / チャレンジ30', () => {
    expect(DIFFICULTIES.easy.coins).toBe(10)
    expect(DIFFICULTIES.normal.coins).toBe(15)
    expect(DIFFICULTIES.challenge.coins).toBe(30)
  })

  it('割られる数の桁数は かんたん・まあまあが2桁、チャレンジが3桁', () => {
    expect(DIFFICULTIES.easy.digits).toBe(2)
    expect(DIFFICULTIES.normal.digits).toBe(2)
    expect(DIFFICULTIES.challenge.digits).toBe(3)
  })

  it('あまりがあるのは まあまあ・チャレンジだけ', () => {
    expect(DIFFICULTIES.easy.hasRemainder).toBe(false)
    expect(DIFFICULTIES.normal.hasRemainder).toBe(true)
    expect(DIFFICULTIES.challenge.hasRemainder).toBe(true)
  })

  it('補助があるのは かんたん・まあまあだけ（チャレンジは補助なし）', () => {
    expect(DIFFICULTIES.easy.assisted).toBe(true)
    expect(DIFFICULTIES.normal.assisted).toBe(true)
    expect(DIFFICULTIES.challenge.assisted).toBe(false)
  })

  it('各設定の id がキーと一致している', () => {
    for (const d of DIFFICULTY_ORDER) {
      expect(DIFFICULTIES[d].id).toBe(d)
    }
  })
})
