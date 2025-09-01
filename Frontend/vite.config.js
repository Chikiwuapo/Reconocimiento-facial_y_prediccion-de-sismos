import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@components': path.resolve(__dirname, './src/components'),
            '@types': path.resolve(__dirname, './src/types'),
            '@hooks': path.resolve(__dirname, './src/hooks'),
            '@styles': path.resolve(__dirname, './src/styles'),
        },
    },
    server: {
        port: 3000,
        open: true,
        host: true,
        proxy: {
            '/auth': {
                target: 'http://localhost:8001',
                changeOrigin: true,
                secure: false,
            },
        },
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom'],
                    charts: ['recharts'],
                    icons: ['lucide-react'],
                    maps: ['react-leaflet', 'leaflet'],
                },
            },
        },
    },
    optimizeDeps: {
        include: ['react', 'react-dom', 'recharts', 'lucide-react', 'react-leaflet', 'leaflet'],
    },
});
