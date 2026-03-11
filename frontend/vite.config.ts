import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import million from 'million/compiler';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import compression from 'vite-plugin-compression';
import { VitePWA } from 'vite-plugin-pwa';
import { partytownVite } from '@builder.io/partytown/utils';
import Unfonts from 'unplugin-fonts/vite';
import Icons from 'unplugin-icons/vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
        server: {
            port: 3000,
            host: '0.0.0.0',
        },
        plugins: [
            million.vite({ auto: true }),
            react(),
            Unfonts({
                google: {
                    families: ['Inter', 'Montserrat']
                }
            }),
            Icons({
                compiler: 'jsx',
                jsx: 'react',
            }),
            ViteImageOptimizer(),
            compression({ algorithm: 'gzip' }),
            compression({ algorithm: 'brotliCompress', ext: '.br' }),
            VitePWA({ registerType: 'autoUpdate' }),
            partytownVite({
                dest: path.join(__dirname, 'dist', '~partytown')
            })
        ],
        build: {
            cssMinify: 'lightningcss',
            rollupOptions: {
                output: {
                    manualChunks: {
                        'vendor-react': ['react', 'react-dom', 'react-router-dom'],
                        'vendor-motion': ['framer-motion'],
                        'vendor-charts': ['chart.js', 'react-chartjs-2'],
                        'vendor-icons': ['lucide-react']
                    }
                }
            }
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
            dedupe: ['react', 'react-dom']
        }
    };
});
