import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: [
      'enterprise-restaurant-management-system.onrender.com',
      'enterprise-restaurant-management-system-2.onrender.com',
      '.onrender.com',
      'localhost',
      '127.0.0.1'
    ],
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: [
      'enterprise-restaurant-management-system.onrender.com',
      'enterprise-restaurant-management-system-2.onrender.com',
      '.onrender.com',
      'localhost',
      '127.0.0.1'
    ],
  },
});
