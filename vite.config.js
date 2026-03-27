import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1600,
  },
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('https://qmesmzkiybnqijuansvb.supabase.co'),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtZXNtemtpeWJucWlqdWFuc3ZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MjAwMjEsImV4cCI6MjA5MDA5NjAyMX0.7-nMwn6JeMQH0tFwpBqtjhy_1q7RjxIp92YY-bezX04'),
  }
})
