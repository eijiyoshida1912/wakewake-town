import { ItemCategory } from './items'

export interface DecorationSpot {
  /** 場面の左からの位置（％）。アイテムの真ん中がここに来る */
  x: number
  /** 場面の上からの位置（％） */
  y: number
  /** 大きさ。1 が標準（場面の幅の 8%） */
  size: number
}

export interface DecorationScene {
  /** 場面の名前（タブの下に出る） */
  title: string
  /** アイテムの名前 → 置き場所。お店のアイテム（SHOP_ITEMS）と名前をそろえること */
  spots: Record<string, DecorationSpot>
}

/**
 * 町のかざりの場面。カテゴリごとに、アイテムを飾る場面と、それぞれの置き場所を決める。
 * 奥にあるもの（y が小さい）ほど、先に書いておくと重なりの順が自然になる。
 */
export const DECORATION_SCENES: Record<ItemCategory, DecorationScene> = {
  furniture: {
    title: 'リビング',
    spots: {
      とけい: { x: 58, y: 18, size: 0.9 },
      ラジオ: { x: 11, y: 33, size: 0.9 },
      でんわ: { x: 88, y: 36, size: 0.8 },
      ほんだな: { x: 11, y: 50, size: 1.6 },
      テレビ: { x: 62, y: 52, size: 1.4 },
      ベッド: { x: 83, y: 64, size: 2 },
      ランプ: { x: 50, y: 70, size: 0.8 },
      いす: { x: 31, y: 76, size: 1.3 },
      テーブル: { x: 50, y: 80, size: 1.4 },
      クッション: { x: 17, y: 88, size: 1.5 },
    },
  },
  plants: {
    title: 'にわ',
    spots: {
      もみのき: { x: 10, y: 44, size: 2.2 },
      やしのき: { x: 90, y: 45, size: 2.2 },
      観葉植物: { x: 28, y: 62, size: 1.1 },
      フラワーポット: { x: 72, y: 62, size: 1.1 },
      ひまわり: { x: 20, y: 80, size: 1.3 },
      ハイビスカス: { x: 80, y: 80, size: 1.2 },
      チューリップ: { x: 36, y: 84, size: 1.1 },
      バラ: { x: 64, y: 84, size: 1.1 },
      サボテン: { x: 92, y: 88, size: 1.1 },
      クローバー: { x: 50, y: 92, size: 0.8 },
    },
  },
  toys: {
    title: 'こどもべや',
    spots: {
      ふうせん: { x: 86, y: 20, size: 1.3 },
      ぼうし: { x: 12, y: 26, size: 1 },
      ぼうえんきょう: { x: 58, y: 30, size: 1.2 },
      ピアノ: { x: 80, y: 58, size: 1.8 },
      ギター: { x: 94, y: 60, size: 1.3 },
      ロボット: { x: 14, y: 68, size: 1.5 },
      ゲーム: { x: 50, y: 78, size: 1 },
      ぬいぐるみ: { x: 30, y: 80, size: 1.4 },
      パズル: { x: 70, y: 86, size: 1 },
      ボール: { x: 48, y: 92, size: 0.9 },
    },
  },
  food: {
    title: 'ダイニング',
    spots: {
      いちご: { x: 40, y: 25, size: 0.9 },
      りんご: { x: 50, y: 25, size: 0.9 },
      プリン: { x: 60, y: 25, size: 0.9 },
      ケーキ: { x: 52, y: 49, size: 1.4 },
      アイス: { x: 15, y: 50, size: 1.1 },
      ピザ: { x: 29, y: 52, size: 1.1 },
      ハンバーガー: { x: 77, y: 52, size: 1.1 },
      おにぎり: { x: 40, y: 53, size: 0.9 },
      ドーナツ: { x: 64, y: 53, size: 0.9 },
      スイカ: { x: 86, y: 86, size: 1.5 },
    },
  },
  vehicles: {
    title: 'まちとそら',
    spots: {
      ロケット: { x: 86, y: 14, size: 1.4 },
      ひこうき: { x: 62, y: 14, size: 1.3 },
      ヘリコプター: { x: 26, y: 24, size: 1.2 },
      でんしゃ: { x: 24, y: 54, size: 1.4 },
      バス: { x: 44, y: 68, size: 1.5 },
      くるま: { x: 16, y: 69, size: 1.2 },
      しょうぼうしゃ: { x: 74, y: 69, size: 1.3 },
      きゅうきゅうしゃ: { x: 34, y: 81, size: 1.2 },
      ふね: { x: 86, y: 91, size: 1.2 },
      じてんしゃ: { x: 12, y: 93, size: 1 },
    },
  },
}
