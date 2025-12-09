import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        port: 8080,
        open: true,
        proxy: {
            '/api/osrm': {
                target: 'https://router.project-osrm.org',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/osrm/, '')
            }
        }
    }
});
