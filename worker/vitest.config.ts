import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // ここでテストするのは純粋なバリデーション関数だけ（D1へのアクセスはしない）ので、
    // jsdom は不要で node 環境で十分
    environment: 'node',
  },
})
