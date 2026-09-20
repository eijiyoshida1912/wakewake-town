/**
 * 日付を「2026-09-20」の形にする。日付の区切りは、その端末の時刻（夜の12時）で決める。
 * toISOString() は世界標準時になり、日本では朝の9時に日付が変わってしまうので使わない
 */
export function toDateKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

/**
 * きょうのお手伝いを1つ増やしたときの数。
 * 同じ日の続きなら足し、日が変わっていたら（前の日の数は使わず）1から数え直す
 */
export function nextDailyCount(count: number, countedDate: string, today: string): number {
  return countedDate === today ? count + 1 : 1
}
