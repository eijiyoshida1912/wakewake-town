import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    environment: 'jsdom',
    // ボタンを何十回も押す画面のテストは、全体を並列で流すと遅くなる。5 秒だと不安定なので余裕を持たせる
    testTimeout: 15000,
  },
})
