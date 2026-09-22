import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    }
  },
  server: {
    port: 3000,
    open: true,
    // 监听所有网卡：支持企业内网/VPN同事直连访问
    host: '0.0.0.0',
    // 允许公网隧道域名（localhost.run / cloudflared 等）访问，便于分享原型
    allowedHosts: true
  }
})