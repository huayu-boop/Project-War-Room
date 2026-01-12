import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  base: './', // 💡 重要：這能確保 GitHub Pages 的路徑正確
})
