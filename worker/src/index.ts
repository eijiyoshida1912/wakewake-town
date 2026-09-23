import { validateScoreSubmission, clampRankingLimit } from './validate'

export interface Env {
  DB: D1Database
  // 呼び出しを許すフロントのオリジン（カンマ区切り）。wrangler.toml の [vars] で設定する
  ALLOWED_ORIGIN: string
}

interface PlayerRow {
  device_id: string
  nickname: string
  problems_solved: number
  total_coins: number
}

function corsHeaders(env: Env, origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    Vary: 'Origin',
  }
  const allowed = env.ALLOWED_ORIGIN.split(',').map(o => o.trim())
  if (origin && allowed.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin
  }
  return headers
}

function json(data: unknown, status: number, headers: Record<string, string>): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  })
}

async function handleGetRanking(request: Request, env: Env, cors: Record<string, string>): Promise<Response> {
  const url = new URL(request.url)
  const limit = clampRankingLimit(url.searchParams.get('limit'))

  const { results } = await env.DB.prepare(
    'SELECT device_id, nickname, problems_solved, total_coins FROM players ORDER BY total_coins DESC, updated_at ASC LIMIT ?1',
  )
    .bind(limit)
    .all<PlayerRow>()

  const ranking = results.map((row, index) => ({
    rank: index + 1,
    deviceId: row.device_id,
    nickname: row.nickname,
    problemsSolved: row.problems_solved,
    totalCoins: row.total_coins,
  }))
  return json({ ranking }, 200, cors)
}

async function handlePostScore(request: Request, env: Env, cors: Record<string, string>): Promise<Response> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return json({ ok: false, error: 'invalid_body' }, 400, cors)
  }

  const result = validateScoreSubmission(body)
  if (!result.ok) {
    return json({ ok: false, error: result.error }, 400, cors)
  }
  const { deviceId, nickname, problemsSolved, totalCoins } = result.value

  // 自己ベストだけを残す（あとから小さい値で上書きされないよう、解いた数ともらったコインはMAXを取る）。
  // 更新日時は、ポイント（もらったコイン）が実際に伸びたときだけ進める（同着の並び順を、先に到達した順に保つため）
  await env.DB.prepare(
    `INSERT INTO players (device_id, nickname, problems_solved, total_coins, updated_at)
     VALUES (?1, ?2, ?3, ?4, ?5)
     ON CONFLICT(device_id) DO UPDATE SET
       nickname = excluded.nickname,
       problems_solved = MAX(players.problems_solved, excluded.problems_solved),
       total_coins = MAX(players.total_coins, excluded.total_coins),
       updated_at = CASE
         WHEN excluded.total_coins > players.total_coins THEN excluded.updated_at
         ELSE players.updated_at
       END`,
  )
    .bind(deviceId, nickname, problemsSolved, totalCoins, new Date().toISOString())
    .run()

  return json({ ok: true }, 200, cors)
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const cors = corsHeaders(env, request.headers.get('Origin'))

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors })
    }
    if (url.pathname === '/ranking' && request.method === 'GET') {
      return handleGetRanking(request, env, cors)
    }
    if (url.pathname === '/score' && request.method === 'POST') {
      return handlePostScore(request, env, cors)
    }
    return json({ ok: false, error: 'not_found' }, 404, cors)
  },
}
